# System Design Document — Last-Mile Delivery Tracker

## 1. Executive Summary
The Last-Mile Delivery Tracker is a enterprise-grade logistics platform designed for high transparency, accurate rate estimation, automated agent dispatch, immutable shipment auditing, and resilient failed-delivery rescheduling.

---

## 2. Rate Calculation & Pricing Engine
Pricing is completely dynamic, database-driven, and decoupled from presentation logic inside `RateCalculationService`.

### Step 1: Zone Detection & Area Resolution
Every delivery order specifies a `pickupAreaId` and `dropAreaId`. The system resolves:
- `pickupArea` $\rightarrow$ `pickupZone`
- `dropArea` $\rightarrow$ `dropZone`

If `pickupZone == dropZone`, the route is classified as `INTRA_ZONE`. Otherwise, it is classified as `INTER_ZONE`.

### Step 2: Volumetric Weight Calculation
Package dimensions (Length $L$, Breadth $B$, Height $H$ in centimeters) are converted to volumetric weight:
$$\text{Volumetric Weight (kg)} = \frac{L \times B \times H}{5000}$$

Chargeable weight is calculated dynamically without pre-comparison rounding:
$$\text{Chargeable Weight} = \max(\text{Actual Weight}, \text{Volumetric Weight})$$

### Step 3: Rate Card Selection & Base Charge
The service queries active `RateCard` database records using four parameters:
1. `orderType` (`B2B` vs `B2C`)
2. `pricingType` (`INTRA_ZONE` vs `INTER_ZONE`)
3. `sourceZoneId`
4. `destinationZoneId`

Delivery Charge is calculated using the configured base and per-kg rates:
$$\text{Delivery Charge} = \text{Base Rate} + \left( \max(\text{Chargeable Weight}, \text{Minimum Weight}) \times \text{Per Kg Rate} \right)$$

### Step 4: Cash-on-Delivery (COD) Surcharge
If `paymentType == COD`, the system fetches active rules from `CODConfiguration` matched by `orderType`:
- **FLAT**: $\text{COD Surcharge} = \text{Surcharge Value}$
- **PERCENTAGE**: $\text{COD Surcharge} = \text{Delivery Charge} \times \frac{\text{Surcharge Value}}{100}$

Total Charge is:
$$\text{Total Charge} = \text{Delivery Charge} + \text{COD Surcharge}$$

---

## 3. Agent Auto-Assignment Algorithm
Automated agent dispatch occurs via `AutoAssignmentService` using a multi-tier deterministic prioritization pipeline:

1. **Availability Filter**: Select agents with `availabilityStatus == AVAILABLE`.
2. **Zone Preference**: Filter agents currently stationed in `pickupZoneId`.
3. **Geographical Proximity (Haversine Formula)**:
   When agent coordinates $(lat_1, lon_1)$ and pickup location coordinates $(lat_2, lon_2)$ are present, calculate distance $d$:
   $$d = 2r \arcsin \left( \sqrt{\sin^2\left(\frac{\Delta lat}{2}\right) + \cos(lat_1)\cos(lat_2)\sin^2\left(\frac{\Delta lon}{2}\right)} \right)$$
   where $r = 6371\text{ km}$.
4. **Ranking & Tie-Breaker**: Sort candidate agents by shortest distance. In case of identical distance, select deterministic minimum `agentId`.
5. **Execution**: Set agent status to `BUSY`, assign to `Order`, log append-only tracking event, and trigger async notifications.

---

## 4. Immutable Tracking Audit Log
To preserve an audit trail required in enterprise logistics, tracking records in `TrackingEvent` are strictly **append-only**.
- No `UPDATE` or `DELETE` operations are exposed or permitted via application APIs.
- Every state transition logs `previousStatus`, `newStatus`, `actorId`, `actorRole`, `timestamp`, `remarks`, and GPS metrics.

---

## 5. Failed Delivery & Rescheduling Architecture
When a delivery attempt fails (`OUT_FOR_DELIVERY` $\rightarrow$ `FAILED`):
1. The agent logs a mandatory `failureReason` (e.g., `CUSTOMER_UNAVAILABLE`, `WRONG_ADDRESS`).
2. A `DeliveryAttempt` record is saved recording the attempt number, timestamp, and agent.
3. The assigned agent's status is reset to `AVAILABLE`.
4. Upon customer rescheduling (`POST /api/orders/:id/reschedule`), the order transitions to `RESCHEDULED`, records a new target date, and immediately invokes `AutoAssignmentService` to assign a **new suitable delivery agent**.

---

## 6. Notification System Architecture
`NotificationService` utilizes a provider-pattern interface (`INotificationProvider`).
- **Email Provider**: Resend / SendGrid / Mock Dev Logger.
- **SMS Provider**: Twilio / Brevo / Mock Dev Logger.
All dispatched messages log to the `Notification` table with status (`PENDING`, `SENT`, `FAILED`) to provide full operational visibility.

---

## 7. Containerization & Docker Topology
The platform uses multi-stage Docker builds:
- **`postgres` container**: Persistent PostgreSQL database mapped to volume `postgres_data` with standard healthchecks.
- **`backend` container**: Node.js 18 TypeScript service running Express API, automated database migrations (`prisma migrate deploy`), and database seeding (`prisma db seed`).
- **`frontend` container**: Next.js production build served over port 3000.
All services communicate over an isolated Docker network `lastmile_net`.

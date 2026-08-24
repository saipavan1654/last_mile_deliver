# Last-Mile Delivery Tracker — Full-Stack Production Application

An enterprise logistics management platform for rate calculation, automated agent assignment, immutable tracking audit history, failed-delivery rescheduling, role-based authorization, and multi-portal dashboard administration.

---

## 🌟 Features

- **Decoupled Architecture**: Modular Express TypeScript backend following `Controller` → `Validation (Zod)` → `Service (Business Rules)` → `Repository/Prisma` → `PostgreSQL`.
- **Dynamic Pricing Engine**: Zone detection via pincodes/areas, volumetric weight formula $(L \times B \times H)/5000$, chargeable weight selection $\max(\text{actual}, \text{volumetric})$, B2B/B2C intra/inter zone rate cards, and flat/percentage COD surcharges.
- **Agent Auto-Assignment**: Deterministic algorithm prioritizing `AVAILABLE` agents in the pickup zone, ranked by Haversine geographical distance.
- **Immutable Tracking Audit Trail**: Append-only `TrackingEvent` logging for all status transitions with actor, previous status, new status, timestamp, remarks, and GPS coordinates.
- **Failed Delivery Rescheduling**: Capture failure reasons, log `DeliveryAttempt` records, transition order to `RESCHEDULED`, clear previous assignment, and automatically assign a **new available agent**.
- **Luxury Black & Gold UI**: Next.js 14 frontend styled in deep black (`#050505`) with gold (`#D4AF37`) accents, thin gold divider lines, and dark card panels.
- **Multi-Role Portals**: Dedicated portals for Customers, Delivery Agents, and System Administrators.
- **Containerized Ecosystem**: Multi-stage Docker Compose setup (`postgres`, `backend`, `frontend`) with healthchecks and persistent volumes.
- **Automated Tests**: Unit & integration test suite covering pricing calculations, status state machine, auto-assignment, and rescheduling logic.

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL, Zod, JWT, bcryptjs, Jest.
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, React Hook Form.
- **Infrastructure**: Docker, Docker Compose, PostgreSQL 15 container.

---

## 🔐 Default Development Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@lastmile.com` | `Password123!` | Full admin management access |
| **Customer** | `customer@lastmile.com` | `Password123!` | Standard customer account |
| **Delivery Agent 1** | `agent1@lastmile.com` | `Password123!` | Zone A Agent (`AGT-001`) |
| **Delivery Agent 2** | `agent2@lastmile.com` | `Password123!` | Zone C Agent (`AGT-002`) |

---

## 🚀 Quick Start with Docker Compose

Run the entire full-stack application (PostgreSQL + Backend REST API + Frontend Next.js app) using Docker Compose:

```bash
# 1. Clone repository & enter workspace
git clone <repository_url>
cd last_mile_deliver

# 2. Copy environment file
cp .env.example .env

# 3. Launch container stack
docker compose up --build -d

# 4. Access applications:
# Frontend Web App: http://localhost:3000
# Backend REST API: http://localhost:5000/api
# PostgreSQL DB: localhost:5432
```

To stop containers:
```bash
docker compose down
```

---

## 💻 Local Development Setup (Manual)

If you prefer running services locally without Docker:

### 1. Start PostgreSQL
Ensure PostgreSQL is running locally on port `5432` with database name `last_mile_db`.

### 2. Backend Setup
```bash
cd backend
npm install

# Run database migrations & seeding
npx prisma migrate dev --name init
npx prisma db seed

# Run backend development server
npm run dev
# Server listens on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Run Next.js development server
npm run dev
# Frontend listens on http://localhost:3000
```

---

## 🧪 Running Automated Tests

Run backend unit and integration tests using Jest:

```bash
cd backend
npm test
```

Test coverage includes:
- **`rateCalculation.test.ts`**: Actual vs Volumetric weight selection, B2B/B2C Intra/Inter zone rate cards, COD flat & percentage surcharges, minimum chargeable weight.
- **`orderLifecycle.test.ts`**: Legal state machine transitions, invalid transition rejection, admin override tracking.
- **`autoAssignment.test.ts`**: Pickup zone preference, Haversine distance ranking, tie-breaker handling, `NO_AVAILABLE_AGENT` error propagation.
- **`reschedule.test.ts`**: Reschedule validation on `FAILED` orders, creation of `DeliveryAttempt`, status update to `RESCHEDULED`, and re-assignment trigger.

---

## 📐 Business Rules & Formulas

1. **Volumetric Weight**:
   $$\text{Volumetric Weight (kg)} = \frac{\text{Length} \times \text{Breadth} \times \text{Height}}{5000}$$
2. **Chargeable Weight**:
   $$\text{Chargeable Weight} = \max(\text{Actual Weight}, \text{Volumetric Weight})$$
3. **Route Pricing Type**:
   If $\text{pickupZone} == \text{dropZone} \rightarrow \text{INTRA\_ZONE}$, else $\text{INTER\_ZONE}$.
4. **Delivery Charge**:
   $$\text{Delivery Charge} = \text{Base Rate} + (\max(\text{Chargeable Weight}, \text{Min Weight}) \times \text{Per Kg Rate})$$
5. **COD Surcharge**:
   If Payment Type == COD, apply Flat or Percentage Surcharge. If Prepaid, COD Surcharge = 0.

---

## 🔄 Order Status Lifecycle State Machine

```
CREATED
   ↓
CONFIRMED
   ↓
ASSIGNED (Agent Auto/Manual Dispatched)
   ↓
PICKED_UP (Agent retrieves parcel)
   ↓
IN_TRANSIT (Hub transfer)
   ↓
OUT_FOR_DELIVERY (Final leg dispatch)
   ├───► DELIVERED (Terminal successful state)
   └───► FAILED (Requires failure reason)
            ↓
         RESCHEDULED (Customer selects new date)
            ↓
         ASSIGNED (Automatic re-assignment to NEW agent)
            ↓
         PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
```

---

## 🔔 Notification Configuration

The backend implements `NotificationService` with a flexible provider abstraction (`INotificationProvider`).
- **Email Provider**: Integrates with external email gateways (e.g., Resend, SendGrid, Brevo).
- **SMS Provider**: Integrates with Twilio / Brevo.
- **Development Fallback**: When external keys are omitted, the mock provider logs all dispatched alerts to structured server logs and saves persistent records to the PostgreSQL `Notification` table.

---

## 🚀 Deployment Instructions

The application is prepared for deployment to modern cloud platforms:

- **Docker / Render / Railway / AWS EC2**: Use the root `docker-compose.yml` file to spin up PostgreSQL, the Express API, and the Next.js frontend in containerized environments.
- **Vercel (Frontend)**: Deploy the `frontend/` directory directly to Vercel, pointing `NEXT_PUBLIC_API_URL` to your production backend API.
- **Render / Railway (Backend & DB)**: Deploy `backend/` as a Web Service running Node.js and attach a PostgreSQL database instance.

---

## 🔮 Known Limitations & Future Improvements

1. **Live GPS WebSocket Tracking**: The current MVP utilizes periodic location polling (`PATCH /api/agents/me/location`). Future iterations can integrate WebSockets / Socket.io for real-time live map tracking.
2. **Third-Party Geocoding API**: Address-to-area resolution currently uses database pincode lookup. Future enhancement can add Google Maps Geocoding API.
3. **Capacity Constraints**: Future agent assignment rules can enforce maximum concurrently active orders per agent.

---

## 📚 Documentation Links

- [REST API Specification](file:///c:/Users/saipa/OneDrive/Desktop/last_mile_deliver/docs/API.md)
- [Database Schema & ERD Documentation](file:///c:/Users/saipa/OneDrive/Desktop/last_mile_deliver/docs/DATABASE.md)
- [System Architecture & Engineering Design](file:///c:/Users/saipa/OneDrive/Desktop/last_mile_deliver/docs/SYSTEM_DESIGN.md)

---

## 📁 Project Structure

```
last_mile_deliver/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── tests/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── Dockerfile
│   ├── jest.config.js
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   ├── agent/
│   │   ├── customer/
│   │   ├── login/
│   │   ├── register/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   ├── types/
│   ├── Dockerfile
│   ├── next.config.js
│   ├── package.json
│   └── tailwind.config.js
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   └── SYSTEM_DESIGN.md
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

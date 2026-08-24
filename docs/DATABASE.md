# Database Schema & Entity Relationships — Last-Mile Delivery Tracker

The database is built on **PostgreSQL** using **Prisma ORM**.

## Entity Relationship Overview

```
User (1) ──── (0..1) CustomerProfile
User (1) ──── (0..1) DeliveryAgent

Zone (1) ──── (0..*) Area
Zone (1) ──── (0..*) Order [PickupZone]
Zone (1) ──── (0..*) Order [DropZone]

DeliveryAgent (1) ──── (0..*) Order [AssignedAgent]

Order (1) ──── (0..*) TrackingEvent (Append-Only Audit Log)
Order (1) ──── (0..*) DeliveryAttempt
Order (1) ──── (0..*) Notification

RateCard (Configurable B2B/B2C Intra/Inter Pricing Rules)
CODConfiguration (Configurable B2B/B2C Flat/Percentage Surcharge Rules)
```

---

## Model Descriptions

### `User`
Stores core user authentication & credentials.
- `id` (UUID, PK)
- `name` (String)
- `email` (String, Unique Index)
- `phone` (String)
- `passwordHash` (String)
- `role` (Enum: `CUSTOMER`, `DELIVERY_AGENT`, `ADMIN`)
- `createdAt`, `updatedAt`

### `CustomerProfile`
Links user account to customer activity.
- `id` (UUID, PK)
- `userId` (FK -> User.id)

### `DeliveryAgent`
Contains agent operational state and GPS metrics.
- `id` (UUID, PK)
- `userId` (FK -> User.id)
- `employeeCode` (String, Unique)
- `phone` (String)
- `availabilityStatus` (Enum: `AVAILABLE`, `BUSY`, `OFFLINE`)
- `currentLatitude` (Float, Nullable)
- `currentLongitude` (Float, Nullable)
- `currentZoneId` (FK -> Zone.id, Nullable)

### `Zone` & `Area`
Geographic breakdown for pricing & routing.
- **Zone**: `id`, `name`, `code`, `description`, `active`
- **Area**: `id`, `name`, `zoneId` (FK -> Zone.id), `pincode` (Index), `active`

### `RateCard`
Configurable pricing engine rulebook.
- `id` (UUID, PK)
- `orderType` (Enum: `B2B`, `B2C`)
- `pricingType` (Enum: `INTRA_ZONE`, `INTER_ZONE`)
- `sourceZoneId` (FK -> Zone.id)
- `destinationZoneId` (FK -> Zone.id)
- `baseRate` (Float)
- `perKgRate` (Float)
- `minimumChargeableWeight` (Float)
- `active` (Boolean)

### `CODConfiguration`
Cash-on-Delivery surcharge policies.
- `id` (UUID, PK)
- `orderType` (Enum: `B2B`, `B2C`)
- `surchargeType` (Enum: `FLAT`, `PERCENTAGE`)
- `surchargeValue` (Float)
- `active` (Boolean)

### `Order`
Main shipment tracking record.
- `id` (UUID, PK)
- `orderNumber` (String, Unique Index)
- `customerId` (FK -> User.id)
- `pickupAddress`, `pickupAreaId` (FK), `pickupZoneId` (FK)
- `dropAddress`, `dropAreaId` (FK), `dropZoneId` (FK)
- `length`, `breadth`, `height`, `actualWeight`, `volumetricWeight`, `chargeableWeight`
- `orderType` (`B2B`, `B2C`), `paymentType` (`PREPAID`, `COD`)
- `baseDeliveryCharge`, `weightCharge`, `codSurcharge`, `totalCharge`
- `currentStatus` (Enum: `CREATED`, `CONFIRMED`, `ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`, `RESCHEDULED`, `CANCELLED`)
- `assignedAgentId` (FK -> DeliveryAgent.id, Nullable)
- `scheduledDeliveryDate` (DateTime)

### `TrackingEvent` (Append-Only Log)
Critical immutable audit trail.
- `id` (UUID, PK)
- `orderId` (FK -> Order.id)
- `previousStatus` (String)
- `status` (String)
- `actorId` (FK -> User.id)
- `actorRole` (String)
- `remarks` (String, Nullable)
- `latitude`, `longitude` (Float, Nullable)
- `createdAt` (DateTime)

### `DeliveryAttempt`
Tracks failed deliveries and rescheduling count.
- `id` (UUID, PK)
- `orderId` (FK -> Order.id)
- `attemptNumber` (Int)
- `agentId` (FK -> DeliveryAgent.id)
- `scheduledDate` (DateTime)
- `result` (String)
- `failureReason` (String, Nullable)

### `Notification`
Dispatched alerts log.
- `id` (UUID, PK)
- `orderId` (FK -> Order.id)
- `customerId` (FK -> User.id)
- `channel` (Enum: `EMAIL`, `SMS`)
- `recipient` (String)
- `message` (String)
- `status` (Enum: `PENDING`, `SENT`, `FAILED`)

---

## Important Indexes
1. `Order(orderNumber)` — Quick order tracking lookups.
2. `Order(customerId)` — Rapid customer order history listing.
3. `Order(assignedAgentId, currentStatus)` — Agent dashboard queries.
4. `Area(pincode)` — High-speed pincode to area & zone resolution.
5. `TrackingEvent(orderId, createdAt)` — Fast chronological timeline generation.

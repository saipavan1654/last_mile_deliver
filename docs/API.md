# REST API Documentation — Last-Mile Delivery Tracker

Base URL: `/api`  
All protected endpoints require the HTTP Header: `Authorization: Bearer <JWT_TOKEN>`

## Standard API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "INVALID_STATUS_TRANSITION",
    "message": "Order cannot be moved from DELIVERED to IN_TRANSIT"
  }
}
```

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /api/auth/register`
Creates a new customer account.
- **Request Body**:
  ```json
  {
    "name": "Jane Customer",
    "email": "jane@example.com",
    "password": "Password123!",
    "phone": "+19876543210",
    "role": "CUSTOMER"
  }
  ```
- **Response**: `201 Created` with User data and JWT token.

### `POST /api/auth/login`
Authenticates a user and returns a bearer token.
- **Request Body**:
  ```json
  {
    "email": "admin@lastmile.com",
    "password": "AdminPassword123!"
  }
  ```
- **Response**: `200 OK` with user profile and token.

### `GET /api/auth/me`
Fetches authenticated user context.
- **Headers**: `Authorization: Bearer <JWT>`
- **Response**: `200 OK` with current user, profile / agent details.

---

## 2. Order & Pricing Endpoints (`/api/orders`)

### `POST /api/orders/calculate-price`
Calculates delivery price without creating an order.
- **Request Body**:
  ```json
  {
    "pickupAreaId": "area_a_id",
    "dropAreaId": "area_c_id",
    "length": 50,
    "breadth": 40,
    "height": 30,
    "actualWeight": 8,
    "orderType": "B2C",
    "paymentType": "COD"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "pickupZone": "Zone A",
      "dropZone": "Zone C",
      "pricingType": "INTER_ZONE",
      "orderType": "B2C",
      "actualWeight": 8,
      "volumetricWeight": 12,
      "chargeableWeight": 12,
      "baseCharge": 100,
      "weightCharge": 120,
      "codSurcharge": 30,
      "totalCharge": 250
    }
  }
  ```

### `POST /api/orders`
Creates a new delivery order (Customer or Admin).
- **Request Body**:
  ```json
  {
    "pickupAddress": "123 Tech Park, Area A",
    "pickupAreaId": "area_a_id",
    "dropAddress": "456 Residence Ave, Area C",
    "dropAreaId": "area_c_id",
    "length": 50,
    "breadth": 40,
    "height": 30,
    "actualWeight": 8,
    "orderType": "B2C",
    "paymentType": "COD",
    "scheduledDeliveryDate": "2026-08-25T10:00:00.000Z"
  }
  ```
- **Response**: `201 Created` with created Order record & initial tracking event.

### `GET /api/orders`
Retrieves orders for the authenticated customer or assigned agent.

### `GET /api/orders/:id`
Returns details of a specific order.

### `GET /api/orders/:id/tracking`
Returns complete tracking history and delivery timeline for an order.

### `PATCH /api/orders/:id/status`
Updates order status (Delivery Agent or Admin).
- **Request Body**:
  ```json
  {
    "status": "FAILED",
    "remarks": "Customer phone unanswered",
    "failureReason": "CUSTOMER_UNAVAILABLE",
    "latitude": 12.9716,
    "longitude": 77.5946
  }
  ```

### `POST /api/orders/:id/reschedule`
Reschedules a failed delivery attempt (Customer or Admin).
- **Request Body**:
  ```json
  {
    "newScheduledDate": "2026-08-26T14:00:00.000Z"
  }
  ```

---

## 3. Agent Endpoints (`/api/agents`)

### `GET /api/agents/me`
Gets current delivery agent profile and assigned orders.

### `PATCH /api/agents/me/availability`
Updates availability state (`AVAILABLE`, `BUSY`, `OFFLINE`).

### `PATCH /api/agents/me/location`
Updates current GPS coordinates and zone for proximity auto-assignment.

---

## 4. Admin Management Endpoints (`/api/admin`)

### `GET /api/admin/dashboard`
Returns analytics metrics, revenue summaries, and status distributions.

### `GET /api/admin/orders`
Paginated search and filtering across all system orders.

### `POST /api/orders/:id/assign`
Manually assigns a specific agent or triggers auto-assignment.
- **Request Body**:
  ```json
  {
    "agentId": "optional_agent_id",
    "autoAssign": true
  }
  ```

### `POST /api/admin/zones` & `POST /api/admin/areas`
Creates and manages geographic zones and pincode areas.

### `POST /api/admin/rate-cards` & `POST /api/admin/cod-configs`
Configures base rates, per-kg pricing, and COD surcharges.

export type Role = 'CUSTOMER' | 'DELIVERY_AGENT' | 'ADMIN';

export type AgentAvailability = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export type OrderType = 'B2B' | 'B2C';

export type PricingType = 'INTRA_ZONE' | 'INTER_ZONE';

export type PaymentType = 'PREPAID' | 'COD';

export type OrderStatus =
  | 'CREATED'
  | 'CONFIRMED'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'RESCHEDULED'
  | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  agentId?: string;
}

export interface Zone {
  id: string;
  name: string;
  code: string;
  description?: string;
  active: boolean;
  areas?: Area[];
}

export interface Area {
  id: string;
  name: string;
  pincode: string;
  zoneId: string;
  zone?: Zone;
}

export interface RateCard {
  id: string;
  orderType: OrderType;
  sourceZoneId: string;
  sourceZone?: Zone;
  destinationZoneId: string;
  destinationZone?: Zone;
  pricingType: PricingType;
  baseRate: number;
  perKgRate: number;
  minimumChargeableWeight: number;
  active: boolean;
}

export interface CODConfig {
  id: string;
  orderType: OrderType;
  surchargeType: 'FLAT' | 'PERCENTAGE';
  surchargeValue: number;
  active: boolean;
}

export interface TrackingEvent {
  id: string;
  orderId: string;
  previousStatus?: string;
  status: OrderStatus;
  actorId: string;
  actorRole: string;
  actor?: { name: string; role: string };
  remarks?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface DeliveryAttempt {
  id: string;
  attemptNumber: number;
  agentId: string;
  agent?: { user: { name: string } };
  scheduledDate: string;
  completedAt?: string;
  result: string;
  failureReason?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: { id: string; name: string; email: string; phone: string };
  pickupAddress: string;
  pickupAreaId: string;
  pickupArea?: Area;
  pickupZoneId: string;
  pickupZone?: Zone;
  dropAddress: string;
  dropAreaId: string;
  dropArea?: Area;
  dropZoneId: string;
  dropZone?: Zone;
  length: number;
  breadth: number;
  height: number;
  actualWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  orderType: OrderType;
  paymentType: PaymentType;
  baseDeliveryCharge: number;
  weightCharge: number;
  codSurcharge: number;
  totalCharge: number;
  currentStatus: OrderStatus;
  assignedAgentId?: string;
  assignedAgent?: { id: string; employeeCode: string; phone: string; user: { name: string; phone: string } };
  scheduledDeliveryDate: string;
  createdAt: string;
  updatedAt: string;
  trackingEvents?: TrackingEvent[];
  deliveryAttempts?: DeliveryAttempt[];
}

export interface PriceBreakdown {
  pickupZoneId: string;
  pickupZoneName: string;
  dropZoneId: string;
  dropZoneName: string;
  pricingType: PricingType;
  orderType: OrderType;
  actualWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  baseCharge: number;
  weightCharge: number;
  codSurcharge: number;
  totalCharge: number;
}

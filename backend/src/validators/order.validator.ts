import { z } from 'zod';
import { OrderType, PaymentType, OrderStatus } from '@prisma/client';

export const calculatePriceSchema = z.object({
  pickupAreaId: z.string().uuid('Invalid pickup area ID'),
  dropAreaId: z.string().uuid('Invalid drop area ID'),
  length: z.number().positive('Length must be greater than 0'),
  breadth: z.number().positive('Breadth must be greater than 0'),
  height: z.number().positive('Height must be greater than 0'),
  actualWeight: z.number().positive('Actual weight must be greater than 0'),
  orderType: z.nativeEnum(OrderType),
  paymentType: z.nativeEnum(PaymentType),
});

export const createOrderSchema = calculatePriceSchema.extend({
  pickupAddress: z.string().min(5, 'Pickup address is required'),
  dropAddress: z.string().min(5, 'Drop address is required'),
  scheduledDeliveryDate: z.string().datetime().or(z.date()).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  remarks: z.string().optional(),
  failureReason: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const rescheduleOrderSchema = z.object({
  newScheduledDate: z.string().datetime().or(z.date()),
});

export const assignAgentSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID').optional(),
  autoAssign: z.boolean().optional(),
});

export type CalculatePriceInput = z.infer<typeof calculatePriceSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type RescheduleOrderInput = z.infer<typeof rescheduleOrderSchema>;
export type AssignAgentInput = z.infer<typeof assignAgentSchema>;

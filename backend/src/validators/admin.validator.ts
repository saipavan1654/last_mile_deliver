import { z } from 'zod';
import { OrderType, PricingType, CODSurchargeType } from '@prisma/client';

export const createZoneSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  description: z.string().optional(),
});

export const createAreaSchema = z.object({
  name: z.string().min(2),
  pincode: z.string().min(3),
  zoneId: z.string().uuid(),
});

export const createRateCardSchema = z.object({
  orderType: z.nativeEnum(OrderType),
  sourceZoneId: z.string().uuid(),
  destinationZoneId: z.string().uuid(),
  pricingType: z.nativeEnum(PricingType),
  baseRate: z.number().nonnegative(),
  perKgRate: z.number().nonnegative(),
  minimumChargeableWeight: z.number().positive().default(1.0),
});

export const createCODConfigSchema = z.object({
  orderType: z.nativeEnum(OrderType),
  surchargeType: z.nativeEnum(CODSurchargeType),
  surchargeValue: z.number().nonnegative(),
  active: z.boolean().optional().default(true),
});

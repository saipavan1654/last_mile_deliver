import { prisma } from './prisma';
import { OrderType, PricingType, CODSurchargeType } from '@prisma/client';

export class RateCardRepository {
  static async findMatchingRateCard(
    orderType: OrderType,
    sourceZoneId: string,
    destinationZoneId: string,
    pricingType: PricingType
  ) {
    // Exact zone match
    const exact = await prisma.rateCard.findFirst({
      where: {
        orderType,
        sourceZoneId,
        destinationZoneId,
        active: true,
      },
    });

    if (exact) return exact;

    // Fallback to pricingType generic match if specific zone route isn't explicitly overridden
    return prisma.rateCard.findFirst({
      where: {
        orderType,
        pricingType,
        active: true,
      },
    });
  }

  static async findCODConfig(orderType: OrderType) {
    return prisma.cODConfiguration.findFirst({
      where: {
        orderType,
        active: true,
      },
    });
  }

  static async findAllRateCards() {
    return prisma.rateCard.findMany({
      include: {
        sourceZone: true,
        destinationZone: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findAllCODConfigs() {
    return prisma.cODConfiguration.findMany({
      orderBy: { orderType: 'asc' },
    });
  }

  static async createRateCard(data: {
    orderType: OrderType;
    sourceZoneId: string;
    destinationZoneId: string;
    pricingType: PricingType;
    baseRate: number;
    perKgRate: number;
    minimumChargeableWeight: number;
  }) {
    return prisma.rateCard.create({
      data,
      include: {
        sourceZone: true,
        destinationZone: true,
      },
    });
  }

  static async updateRateCard(id: string, data: Partial<{
    baseRate: number;
    perKgRate: number;
    minimumChargeableWeight: number;
    active: boolean;
  }>) {
    return prisma.rateCard.update({
      where: { id },
      data,
      include: {
        sourceZone: true,
        destinationZone: true,
      },
    });
  }

  static async upsertCODConfig(data: {
    orderType: OrderType;
    surchargeType: CODSurchargeType;
    surchargeValue: number;
    active?: boolean;
  }) {
    return prisma.cODConfiguration.upsert({
      where: { orderType: data.orderType },
      update: {
        surchargeType: data.surchargeType,
        surchargeValue: data.surchargeValue,
        active: data.active ?? true,
      },
      create: {
        orderType: data.orderType,
        surchargeType: data.surchargeType,
        surchargeValue: data.surchargeValue,
        active: data.active ?? true,
      },
    });
  }
}

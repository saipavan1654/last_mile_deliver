import { RateCardRepository } from '../repositories/rateCard.repository';
import { OrderType, PricingType, CODSurchargeType } from '@prisma/client';

export class RateCardService {
  static async getAllRateCards() {
    return RateCardRepository.findAllRateCards();
  }

  static async getAllCODConfigs() {
    return RateCardRepository.findAllCODConfigs();
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
    return RateCardRepository.createRateCard(data);
  }

  static async updateRateCard(id: string, data: Partial<{
    baseRate: number;
    perKgRate: number;
    minimumChargeableWeight: number;
    active: boolean;
  }>) {
    return RateCardRepository.updateRateCard(id, data);
  }

  static async upsertCODConfig(data: {
    orderType: OrderType;
    surchargeType: CODSurchargeType;
    surchargeValue: number;
    active?: boolean;
  }) {
    return RateCardRepository.upsertCODConfig(data);
  }
}

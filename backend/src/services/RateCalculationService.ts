import { ZoneRepository } from '../repositories/zone.repository';
import { RateCardRepository } from '../repositories/rateCard.repository';
import { CalculatePriceInput } from '../validators/order.validator';
import { NotFoundError, AppError } from '../utils/errors';
import { PricingType, PaymentType, CODSurchargeType } from '@prisma/client';

export interface PriceBreakdown {
  pickupZoneId: string;
  pickupZoneName: string;
  dropZoneId: string;
  dropZoneName: string;
  pricingType: PricingType;
  orderType: string;
  actualWeight: number;
  volumetricWeight: number;
  chargeableWeight: number;
  baseCharge: number;
  weightCharge: number;
  codSurcharge: number;
  totalCharge: number;
}

export class RateCalculationService {
  static async calculatePrice(input: CalculatePriceInput): Promise<PriceBreakdown> {
    // 1. Resolve Areas & Zones
    const pickupArea = await ZoneRepository.findAreaById(input.pickupAreaId);
    if (!pickupArea || !pickupArea.zone) {
      throw new NotFoundError('Pickup area or associated zone not found', 'AREA_NOT_FOUND');
    }

    const dropArea = await ZoneRepository.findAreaById(input.dropAreaId);
    if (!dropArea || !dropArea.zone) {
      throw new NotFoundError('Drop area or associated zone not found', 'AREA_NOT_FOUND');
    }

    const pickupZone = pickupArea.zone;
    const dropZone = dropArea.zone;

    // 2. Determine Pricing Type (Intra vs Inter)
    const pricingType: PricingType =
      pickupZone.id === dropZone.id ? PricingType.INTRA_ZONE : PricingType.INTER_ZONE;

    // 3. Calculate Volumetric & Chargeable Weight
    // Dimensions in cm, Volumetric Weight = L * B * H / 5000
    const rawVolumetricWeight = (input.length * input.breadth * input.height) / 5000;
    const volumetricWeight = Math.round(rawVolumetricWeight * 100) / 100;
    const chargeableWeight = Math.max(input.actualWeight, volumetricWeight);

    // 4. Rate Card Selection
    const rateCard = await RateCardRepository.findMatchingRateCard(
      input.orderType,
      pickupZone.id,
      dropZone.id,
      pricingType
    );

    if (!rateCard) {
      throw new NotFoundError(
        `No rate card configured for ${input.orderType} ${pricingType} from ${pickupZone.name} to ${dropZone.name}`,
        'RATE_CARD_NOT_FOUND'
      );
    }

    // 5. Delivery Charge Calculation
    const effectiveWeight = Math.max(chargeableWeight, rateCard.minimumChargeableWeight);
    const baseCharge = Math.round(rateCard.baseRate * 100) / 100;
    const weightCharge = Math.round(effectiveWeight * rateCard.perKgRate * 100) / 100;
    const deliveryCharge = baseCharge + weightCharge;

    // 6. COD Surcharge Calculation
    let codSurcharge = 0;
    if (input.paymentType === PaymentType.COD) {
      const codConfig = await RateCardRepository.findCODConfig(input.orderType);
      if (codConfig) {
        if (codConfig.surchargeType === CODSurchargeType.PERCENTAGE) {
          codSurcharge = Math.round((deliveryCharge * (codConfig.surchargeValue / 100)) * 100) / 100;
        } else {
          codSurcharge = Math.round(codConfig.surchargeValue * 100) / 100;
        }
      }
    }

    const totalCharge = Math.round((deliveryCharge + codSurcharge) * 100) / 100;

    return {
      pickupZoneId: pickupZone.id,
      pickupZoneName: pickupZone.name,
      dropZoneId: dropZone.id,
      dropZoneName: dropZone.name,
      pricingType,
      orderType: input.orderType,
      actualWeight: input.actualWeight,
      volumetricWeight,
      chargeableWeight,
      baseCharge,
      weightCharge,
      codSurcharge,
      totalCharge,
    };
  }
}

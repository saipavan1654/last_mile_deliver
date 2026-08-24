import { RateCalculationService } from '../services/RateCalculationService';
import { ZoneRepository } from '../repositories/zone.repository';
import { RateCardRepository } from '../repositories/rateCard.repository';
import { OrderType, PricingType, PaymentType, CODSurchargeType } from '@prisma/client';

jest.mock('../repositories/zone.repository');
jest.mock('../repositories/rateCard.repository');

describe('RateCalculationService', () => {
  const mockPickupArea = {
    id: 'pickup_area_id',
    name: 'Pickup Area A',
    zone: { id: 'zone_a_id', name: 'Zone A', code: 'ZONE-A' },
  };

  const mockDropAreaC = {
    id: 'drop_area_c_id',
    name: 'Drop Area C',
    zone: { id: 'zone_c_id', name: 'Zone C', code: 'ZONE-C' },
  };

  const mockDropAreaA = {
    id: 'drop_area_a_id',
    name: 'Drop Area A',
    zone: { id: 'zone_a_id', name: 'Zone A', code: 'ZONE-A' },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Volumetric > Actual Weight selection (L:50, B:40, H:30 = 12kg vs Actual 8kg)', async () => {
    (ZoneRepository.findAreaById as jest.Mock)
      .mockResolvedValueOnce(mockPickupArea)
      .mockResolvedValueOnce(mockDropAreaC);

    (RateCardRepository.findMatchingRateCard as jest.Mock).mockResolvedValue({
      id: 'rc_1',
      baseRate: 100,
      perKgRate: 10,
      minimumChargeableWeight: 1,
    });

    (RateCardRepository.findCODConfig as jest.Mock).mockResolvedValue({
      surchargeType: CODSurchargeType.FLAT,
      surchargeValue: 30,
    });

    const result = await RateCalculationService.calculatePrice({
      pickupAreaId: 'pickup_area_id',
      dropAreaId: 'drop_area_c_id',
      length: 50,
      breadth: 40,
      height: 30,
      actualWeight: 8,
      orderType: OrderType.B2C,
      paymentType: PaymentType.COD,
    });

    expect(result.volumetricWeight).toBe(12);
    expect(result.chargeableWeight).toBe(12);
    expect(result.pricingType).toBe(PricingType.INTER_ZONE);
    expect(result.baseCharge).toBe(100);
    expect(result.weightCharge).toBe(120); // 12 * 10
    expect(result.codSurcharge).toBe(30);
    expect(result.totalCharge).toBe(250); // 100 + 120 + 30
  });

  test('Actual > Volumetric Weight selection (L:10, B:10, H:10 = 0.2kg vs Actual 15kg)', async () => {
    (ZoneRepository.findAreaById as jest.Mock)
      .mockResolvedValueOnce(mockPickupArea)
      .mockResolvedValueOnce(mockDropAreaC);

    (RateCardRepository.findMatchingRateCard as jest.Mock).mockResolvedValue({
      id: 'rc_1',
      baseRate: 100,
      perKgRate: 10,
      minimumChargeableWeight: 1,
    });

    const result = await RateCalculationService.calculatePrice({
      pickupAreaId: 'pickup_area_id',
      dropAreaId: 'drop_area_c_id',
      length: 10,
      breadth: 10,
      height: 10,
      actualWeight: 15,
      orderType: OrderType.B2C,
      paymentType: PaymentType.PREPAID,
    });

    expect(result.volumetricWeight).toBe(0.2);
    expect(result.chargeableWeight).toBe(15);
    expect(result.codSurcharge).toBe(0); // Prepaid => COD surcharge 0
    expect(result.totalCharge).toBe(250); // 100 + (15 * 10) = 250
  });

  test('Intra-Zone Pricing Detection (Same Zone A -> Zone A)', async () => {
    (ZoneRepository.findAreaById as jest.Mock)
      .mockResolvedValueOnce(mockPickupArea)
      .mockResolvedValueOnce(mockDropAreaA);

    (RateCardRepository.findMatchingRateCard as jest.Mock).mockResolvedValue({
      id: 'rc_intra',
      baseRate: 80,
      perKgRate: 15,
      minimumChargeableWeight: 1,
    });

    const result = await RateCalculationService.calculatePrice({
      pickupAreaId: 'pickup_area_id',
      dropAreaId: 'drop_area_a_id',
      length: 20,
      breadth: 20,
      height: 20,
      actualWeight: 2,
      orderType: OrderType.B2B,
      paymentType: PaymentType.PREPAID,
    });

    expect(result.pricingType).toBe(PricingType.INTRA_ZONE);
    expect(result.baseCharge).toBe(80);
  });

  test('Percentage COD Surcharge Calculation', async () => {
    (ZoneRepository.findAreaById as jest.Mock)
      .mockResolvedValueOnce(mockPickupArea)
      .mockResolvedValueOnce(mockDropAreaC);

    (RateCardRepository.findMatchingRateCard as jest.Mock).mockResolvedValue({
      id: 'rc_1',
      baseRate: 100,
      perKgRate: 10,
      minimumChargeableWeight: 1,
    });

    (RateCardRepository.findCODConfig as jest.Mock).mockResolvedValue({
      surchargeType: CODSurchargeType.PERCENTAGE,
      surchargeValue: 10, // 10%
    });

    const result = await RateCalculationService.calculatePrice({
      pickupAreaId: 'pickup_area_id',
      dropAreaId: 'drop_area_c_id',
      length: 10,
      breadth: 10,
      height: 10,
      actualWeight: 10,
      orderType: OrderType.B2C,
      paymentType: PaymentType.COD,
    });

    // Delivery charge = 100 + (10 * 10) = 200
    // 10% COD surcharge = 20
    expect(result.codSurcharge).toBe(20);
    expect(result.totalCharge).toBe(220);
  });
});

import { PrismaClient, Role, AgentAvailability, OrderType, PricingType, PaymentType, CODSurchargeType, OrderStatus, NotificationChannel, NotificationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.deliveryAttempt.deleteMany();
  await prisma.trackingEvent.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cODConfiguration.deleteMany();
  await prisma.rateCard.deleteMany();
  await prisma.area.deleteMany();
  await prisma.deliveryAgent.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Create Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@lastmile.com',
      phone: '+18005550199',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      name: 'Alex Mercer',
      email: 'customer@lastmile.com',
      phone: '+18005550100',
      passwordHash,
      role: Role.CUSTOMER,
      customerProfile: {
        create: {},
      },
    },
  });

  const b2bCustomerUser = await prisma.user.create({
    data: {
      name: 'Acme Logistics Corp',
      email: 'b2b@acme.com',
      phone: '+18005550188',
      passwordHash,
      role: Role.CUSTOMER,
      customerProfile: {
        create: {},
      },
    },
  });

  // 2. Create Zones
  const zoneA = await prisma.zone.create({
    data: {
      name: 'Zone A - North Tech District',
      code: 'ZONE-A',
      description: 'Northern technological hub and industrial parks',
    },
  });

  const zoneB = await prisma.zone.create({
    data: {
      name: 'Zone B - Central Business District',
      code: 'ZONE-B',
      description: 'Downtown commercial financial center',
    },
  });

  const zoneC = await prisma.zone.create({
    data: {
      name: 'Zone C - South Suburbs',
      code: 'ZONE-C',
      description: 'Southern residential and retail sectors',
    },
  });

  // 3. Create Areas (with pincodes)
  const areaA1 = await prisma.area.create({
    data: {
      name: 'Area A - Tech Park',
      pincode: '560001',
      zoneId: zoneA.id,
    },
  });

  const areaA2 = await prisma.area.create({
    data: {
      name: 'Area A2 - Industrial Zone',
      pincode: '560002',
      zoneId: zoneA.id,
    },
  });

  const areaB1 = await prisma.area.create({
    data: {
      name: 'Area B - Financial District',
      pincode: '560034',
      zoneId: zoneB.id,
    },
  });

  const areaC1 = await prisma.area.create({
    data: {
      name: 'Area C - Residential Outer',
      pincode: '560064',
      zoneId: zoneC.id,
    },
  });

  // 4. Create Delivery Agents
  const agent1User = await prisma.user.create({
    data: {
      name: 'Arun Kumar',
      email: 'agent1@lastmile.com',
      phone: '+18005550201',
      passwordHash,
      role: Role.DELIVERY_AGENT,
    },
  });

  const agent1 = await prisma.deliveryAgent.create({
    data: {
      userId: agent1User.id,
      employeeCode: 'AGT-001',
      phone: '+18005550201',
      availabilityStatus: AgentAvailability.AVAILABLE,
      currentLatitude: 12.9716,
      currentLongitude: 77.5946,
      currentZoneId: zoneA.id,
    },
  });

  const agent2User = await prisma.user.create({
    data: {
      name: 'David Miller',
      email: 'agent2@lastmile.com',
      phone: '+18005550202',
      passwordHash,
      role: Role.DELIVERY_AGENT,
    },
  });

  const agent2 = await prisma.deliveryAgent.create({
    data: {
      userId: agent2User.id,
      employeeCode: 'AGT-002',
      phone: '+18005550202',
      availabilityStatus: AgentAvailability.AVAILABLE,
      currentLatitude: 12.9352,
      currentLongitude: 77.6245,
      currentZoneId: zoneC.id,
    },
  });

  const agent3User = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'agent3@lastmile.com',
      phone: '+18005550203',
      passwordHash,
      role: Role.DELIVERY_AGENT,
    },
  });

  await prisma.deliveryAgent.create({
    data: {
      userId: agent3User.id,
      employeeCode: 'AGT-003',
      phone: '+18005550203',
      availabilityStatus: AgentAvailability.OFFLINE,
      currentLatitude: 13.0352,
      currentLongitude: 77.5645,
      currentZoneId: zoneB.id,
    },
  });

  // 5. Create Rate Cards
  // B2B Intra (Zone A -> Zone A)
  await prisma.rateCard.create({
    data: {
      orderType: OrderType.B2B,
      pricingType: PricingType.INTRA_ZONE,
      sourceZoneId: zoneA.id,
      destinationZoneId: zoneA.id,
      baseRate: 100,
      perKgRate: 20,
      minimumChargeableWeight: 1,
    },
  });

  // B2B Inter (Zone A -> Zone B)
  await prisma.rateCard.create({
    data: {
      orderType: OrderType.B2B,
      pricingType: PricingType.INTER_ZONE,
      sourceZoneId: zoneA.id,
      destinationZoneId: zoneB.id,
      baseRate: 150,
      perKgRate: 25,
      minimumChargeableWeight: 1,
    },
  });

  // B2C Intra (Zone A -> Zone A)
  await prisma.rateCard.create({
    data: {
      orderType: OrderType.B2C,
      pricingType: PricingType.INTRA_ZONE,
      sourceZoneId: zoneA.id,
      destinationZoneId: zoneA.id,
      baseRate: 80,
      perKgRate: 18,
      minimumChargeableWeight: 1,
    },
  });

  // B2C Inter (Zone A -> Zone C) — Custom matched to demo formula: Base 100 + (12kg * 10/kg) = 220 + 30 COD = 250
  await prisma.rateCard.create({
    data: {
      orderType: OrderType.B2C,
      pricingType: PricingType.INTER_ZONE,
      sourceZoneId: zoneA.id,
      destinationZoneId: zoneC.id,
      baseRate: 100,
      perKgRate: 10,
      minimumChargeableWeight: 1,
    },
  });

  // B2C Inter (Zone A -> Zone B)
  await prisma.rateCard.create({
    data: {
      orderType: OrderType.B2C,
      pricingType: PricingType.INTER_ZONE,
      sourceZoneId: zoneA.id,
      destinationZoneId: zoneB.id,
      baseRate: 120,
      perKgRate: 22,
      minimumChargeableWeight: 1,
    },
  });

  // 6. Create COD Configurations
  await prisma.cODConfiguration.create({
    data: {
      orderType: OrderType.B2C,
      surchargeType: CODSurchargeType.FLAT,
      surchargeValue: 30,
    },
  });

  await prisma.cODConfiguration.create({
    data: {
      orderType: OrderType.B2B,
      surchargeType: CODSurchargeType.FLAT,
      surchargeValue: 50,
    },
  });

  // 7. Create Demo Sample Orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-0001',
      customerId: customerUser.id,
      pickupAddress: '100 Innovation Way, Area A',
      pickupAreaId: areaA1.id,
      pickupZoneId: zoneA.id,
      dropAddress: '500 Palm Grove, Area C',
      dropAreaId: areaC1.id,
      dropZoneId: zoneC.id,
      length: 50,
      breadth: 40,
      height: 30,
      actualWeight: 8,
      volumetricWeight: 12,
      chargeableWeight: 12,
      orderType: OrderType.B2C,
      paymentType: PaymentType.COD,
      baseDeliveryCharge: 100,
      weightCharge: 120,
      codSurcharge: 30,
      totalCharge: 250,
      currentStatus: OrderStatus.OUT_FOR_DELIVERY,
      assignedAgentId: agent1.id,
      scheduledDeliveryDate: new Date(),
    },
  });

  // Initial Tracking Events for Order 1
  await prisma.trackingEvent.createMany({
    data: [
      {
        orderId: order1.id,
        previousStatus: undefined,
        status: OrderStatus.CREATED,
        actorId: customerUser.id,
        actorRole: 'CUSTOMER',
        remarks: 'Order placed by customer',
      },
      {
        orderId: order1.id,
        previousStatus: OrderStatus.CREATED,
        status: OrderStatus.CONFIRMED,
        actorId: adminUser.id,
        actorRole: 'ADMIN',
        remarks: 'Payment terms confirmed',
      },
      {
        orderId: order1.id,
        previousStatus: OrderStatus.CONFIRMED,
        status: OrderStatus.ASSIGNED,
        actorId: adminUser.id,
        actorRole: 'SYSTEM',
        remarks: `Assigned agent ${agent1User.name} via zone proximity`,
      },
      {
        orderId: order1.id,
        previousStatus: OrderStatus.ASSIGNED,
        status: OrderStatus.PICKED_UP,
        actorId: agent1User.id,
        actorRole: 'DELIVERY_AGENT',
        remarks: 'Parcel picked up from warehouse',
      },
      {
        orderId: order1.id,
        previousStatus: OrderStatus.PICKED_UP,
        status: OrderStatus.IN_TRANSIT,
        actorId: agent1User.id,
        actorRole: 'DELIVERY_AGENT',
        remarks: 'Parcel in transit to destination hub',
      },
      {
        orderId: order1.id,
        previousStatus: OrderStatus.IN_TRANSIT,
        status: OrderStatus.OUT_FOR_DELIVERY,
        actorId: agent1User.id,
        actorRole: 'DELIVERY_AGENT',
        remarks: 'Agent on the way for final drop-off',
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('🔑 Credentials summary:');
  console.log('   Admin:    admin@lastmile.com / Password123!');
  console.log('   Customer: customer@lastmile.com / Password123!');
  console.log('   Agent 1:  agent1@lastmile.com / Password123!');
  console.log('   Agent 2:  agent2@lastmile.com / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

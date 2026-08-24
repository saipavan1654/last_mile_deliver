import { prisma } from './prisma';
import { OrderStatus, Prisma } from '@prisma/client';

export class OrderRepository {
  static async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        pickupArea: true,
        pickupZone: true,
        dropArea: true,
        dropZone: true,
        assignedAgent: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
        trackingEvents: {
          orderBy: { createdAt: 'asc' },
          include: { actor: { select: { name: true, role: true } } },
        },
        deliveryAttempts: {
          orderBy: { attemptNumber: 'asc' },
          include: { agent: { include: { user: { select: { name: true } } } } },
        },
      },
    });
  }

  static async findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        pickupArea: true,
        pickupZone: true,
        dropArea: true,
        dropZone: true,
        assignedAgent: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
        trackingEvents: {
          orderBy: { createdAt: 'asc' },
          include: { actor: { select: { name: true, role: true } } },
        },
        deliveryAttempts: {
          orderBy: { attemptNumber: 'asc' },
        },
      },
    });
  }

  static async createOrderWithTracking(
    orderData: Prisma.OrderCreateInput,
    actorId: string,
    actorRole: string
  ) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: orderData,
        include: {
          pickupZone: true,
          dropZone: true,
          pickupArea: true,
          dropArea: true,
        },
      });

      await tx.trackingEvent.create({
        data: {
          orderId: order.id,
          previousStatus: undefined,
          status: OrderStatus.CREATED,
          actorId,
          actorRole,
          remarks: 'Delivery order created',
        },
      });

      return order;
    });
  }

  static async updateOrderStatusWithTracking(
    orderId: string,
    previousStatus: OrderStatus,
    newStatus: OrderStatus,
    actorId: string,
    actorRole: string,
    remarks?: string,
    latitude?: number,
    longitude?: number
  ) {
    return prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { currentStatus: newStatus },
      });

      await tx.trackingEvent.create({
        data: {
          orderId,
          previousStatus,
          status: newStatus,
          actorId,
          actorRole,
          remarks: remarks || `Status changed to ${newStatus}`,
          latitude,
          longitude,
        },
      });

      return updatedOrder;
    });
  }

  static async assignAgentToOrder(
    orderId: string,
    agentId: string,
    actorId: string,
    actorRole: string,
    agentName: string
  ) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      const previousStatus = order?.currentStatus || OrderStatus.CONFIRMED;

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          assignedAgentId: agentId,
          currentStatus: OrderStatus.ASSIGNED,
        },
        include: {
          assignedAgent: {
            include: { user: { select: { name: true, phone: true } } },
          },
        },
      });

      await tx.deliveryAgent.update({
        where: { id: agentId },
        data: { availabilityStatus: 'BUSY' },
      });

      await tx.trackingEvent.create({
        data: {
          orderId,
          previousStatus,
          status: OrderStatus.ASSIGNED,
          actorId,
          actorRole,
          remarks: `Assigned to delivery agent ${agentName}`,
        },
      });

      return updatedOrder;
    });
  }

  static async recordFailedAttemptAndReleaseAgent(
    orderId: string,
    agentId: string,
    failureReason: string,
    actorId: string,
    actorRole: string,
    remarks?: string,
    latitude?: number,
    longitude?: number
  ) {
    return prisma.$transaction(async (tx) => {
      const existingAttempts = await tx.deliveryAttempt.count({
        where: { orderId },
      });

      await tx.deliveryAttempt.create({
        data: {
          orderId,
          attemptNumber: existingAttempts + 1,
          agentId,
          scheduledDate: new Date(),
          completedAt: new Date(),
          result: 'FAILED',
          failureReason,
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { currentStatus: OrderStatus.FAILED },
      });

      await tx.deliveryAgent.update({
        where: { id: agentId },
        data: { availabilityStatus: 'AVAILABLE' },
      });

      await tx.trackingEvent.create({
        data: {
          orderId,
          previousStatus: OrderStatus.OUT_FOR_DELIVERY,
          status: OrderStatus.FAILED,
          actorId,
          actorRole,
          remarks: remarks || `Delivery failed: ${failureReason}`,
          latitude,
          longitude,
        },
      });

      return updatedOrder;
    });
  }

  static async rescheduleOrder(
    orderId: string,
    newScheduledDate: Date,
    actorId: string,
    actorRole: string
  ) {
    return prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          currentStatus: OrderStatus.RESCHEDULED,
          scheduledDeliveryDate: newScheduledDate,
          assignedAgentId: null, // Clear old agent assignment for reschedule
        },
      });

      await tx.trackingEvent.create({
        data: {
          orderId,
          previousStatus: OrderStatus.FAILED,
          status: OrderStatus.RESCHEDULED,
          actorId,
          actorRole,
          remarks: `Delivery rescheduled for ${newScheduledDate.toISOString().split('T')[0]}`,
        },
      });

      return updatedOrder;
    });
  }

  static async findCustomerOrders(customerId: string) {
    return prisma.order.findMany({
      where: { customerId },
      include: {
        pickupArea: true,
        dropArea: true,
        assignedAgent: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findAgentOrders(agentId: string) {
    return prisma.order.findMany({
      where: { assignedAgentId: agentId },
      include: {
        customer: { select: { name: true, phone: true } },
        pickupArea: true,
        pickupZone: true,
        dropArea: true,
        dropZone: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findAllOrdersPaginated(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrderStatus;
    zoneId?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};

    if (params.status) {
      where.currentStatus = params.status;
    }

    if (params.zoneId) {
      where.OR = [
        { pickupZoneId: params.zoneId },
        { dropZoneId: params.zoneId },
      ];
    }

    if (params.search) {
      where.OR = [
        { orderNumber: { contains: params.search, mode: 'insensitive' } },
        { pickupAddress: { contains: params.search, mode: 'insensitive' } },
        { dropAddress: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: { select: { name: true, email: true } },
          pickupZone: true,
          dropZone: true,
          assignedAgent: { include: { user: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getDashboardMetrics() {
    const [totalOrders, statusCounts, revenue, availableAgents] = await Promise.all([
      prisma.order.count(),
      prisma.order.groupBy({
        by: ['currentStatus'],
        _count: { _all: true },
      }),
      prisma.order.aggregate({
        _sum: { totalCharge: true },
      }),
      prisma.deliveryAgent.count({
        where: { availabilityStatus: 'AVAILABLE' },
      }),
    ]);

    const countsMap = statusCounts.reduce((acc, curr) => {
      acc[curr.currentStatus] = curr._count._all;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders,
      pending: (countsMap['CREATED'] || 0) + (countsMap['CONFIRMED'] || 0) + (countsMap['RESCHEDULED'] || 0),
      inTransit: (countsMap['PICKED_UP'] || 0) + (countsMap['IN_TRANSIT'] || 0),
      outForDelivery: countsMap['OUT_FOR_DELIVERY'] || 0,
      delivered: countsMap['DELIVERED'] || 0,
      failed: countsMap['FAILED'] || 0,
      availableAgents,
      totalRevenue: revenue._sum.totalCharge || 0,
      statusBreakdown: countsMap,
    };
  }
}

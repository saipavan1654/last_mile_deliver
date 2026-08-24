import { OrderRepository } from '../repositories/order.repository';
import { RateCalculationService } from './RateCalculationService';
import { AutoAssignmentService } from './AutoAssignmentService';
import { NotificationService } from './NotificationService';
import { CreateOrderInput, UpdateOrderStatusInput } from '../validators/order.validator';
import { NotFoundError, InvalidStatusTransitionError, ForbiddenError } from '../utils/errors';
import { OrderStatus, Role } from '@prisma/client';
import { logger } from '../utils/logger';

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.CREATED]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
  [OrderStatus.ASSIGNED]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
  [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT, OrderStatus.CANCELLED],
  [OrderStatus.IN_TRANSIT]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.FAILED, OrderStatus.CANCELLED],
  [OrderStatus.FAILED]: [OrderStatus.RESCHEDULED],
  [OrderStatus.RESCHEDULED]: [OrderStatus.ASSIGNED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export class OrderService {
  static async createOrder(input: CreateOrderInput, customerId: string, actorRole: string) {
    // 1. Price Breakdown calculation
    const pricing = await RateCalculationService.calculatePrice({
      pickupAreaId: input.pickupAreaId,
      dropAreaId: input.dropAreaId,
      length: input.length,
      breadth: input.breadth,
      height: input.height,
      actualWeight: input.actualWeight,
      orderType: input.orderType,
      paymentType: input.paymentType,
    });

    const orderNumber = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderData = {
      orderNumber,
      customer: { connect: { id: customerId } },
      pickupAddress: input.pickupAddress,
      pickupArea: { connect: { id: input.pickupAreaId } },
      pickupZone: { connect: { id: pricing.pickupZoneId } },
      dropAddress: input.dropAddress,
      dropArea: { connect: { id: input.dropAreaId } },
      dropZone: { connect: { id: pricing.dropZoneId } },
      length: input.length,
      breadth: input.breadth,
      height: input.height,
      actualWeight: input.actualWeight,
      volumetricWeight: pricing.volumetricWeight,
      chargeableWeight: pricing.chargeableWeight,
      orderType: input.orderType,
      paymentType: input.paymentType,
      baseDeliveryCharge: pricing.baseCharge,
      weightCharge: pricing.weightCharge,
      codSurcharge: pricing.codSurcharge,
      totalCharge: pricing.totalCharge,
      currentStatus: OrderStatus.CREATED,
      scheduledDeliveryDate: input.scheduledDeliveryDate ? new Date(input.scheduledDeliveryDate) : new Date(Date.now() + 86400000),
    };

    const order = await OrderRepository.createOrderWithTracking(orderData, customerId, actorRole);

    // Auto transition to CONFIRMED for active workflow simulation
    const confirmedOrder = await OrderRepository.updateOrderStatusWithTracking(
      order.id,
      OrderStatus.CREATED,
      OrderStatus.CONFIRMED,
      customerId,
      actorRole,
      'Order confirmed and ready for dispatch'
    );

    // Trigger Notification
    await NotificationService.sendNotification({
      orderId: confirmedOrder.id,
      customerId,
      channel: 'EMAIL',
      notificationType: 'ORDER_CREATED',
      recipient: customerId,
      message: `Order ${orderNumber} created successfully. Total amount: ₹${pricing.totalCharge}`,
    });

    return confirmedOrder;
  }

  static async updateOrderStatus(
    orderId: string,
    input: UpdateOrderStatusInput,
    actorId: string,
    actorRole: Role
  ) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    const currentStatus = order.currentStatus;
    const newStatus = input.status;

    // Validate Status Transition
    const isAllowedTransition = VALID_TRANSITIONS[currentStatus]?.includes(newStatus);

    // Admin override exception
    if (!isAllowedTransition && actorRole !== Role.ADMIN) {
      throw new InvalidStatusTransitionError(
        `Cannot transition order status from ${currentStatus} to ${newStatus}`
      );
    }

    const remarks = actorRole === Role.ADMIN && !isAllowedTransition
      ? `ADMIN OVERRIDE: ${input.remarks || 'Status overridden by administrator'}`
      : input.remarks;

    // Handle FAILED delivery attempt state
    if (newStatus === OrderStatus.FAILED) {
      if (!input.failureReason) {
        throw new InvalidStatusTransitionError('Failure reason is mandatory when marking delivery as FAILED');
      }
      if (!order.assignedAgentId) {
        throw new InvalidStatusTransitionError('Order has no assigned agent to record failed attempt against');
      }

      const failedOrder = await OrderRepository.recordFailedAttemptAndReleaseAgent(
        order.id,
        order.assignedAgentId,
        input.failureReason,
        actorId,
        actorRole,
        remarks,
        input.latitude,
        input.longitude
      );

      await NotificationService.sendNotification({
        orderId: order.id,
        customerId: order.customerId,
        channel: 'EMAIL',
        notificationType: 'DELIVERY_FAILED',
        recipient: order.customer.email,
        message: `Delivery attempt for order ${order.orderNumber} failed. Reason: ${input.failureReason}. You can reschedule via your portal.`,
      });

      return failedOrder;
    }

    // Standard Status Update
    const updatedOrder = await OrderRepository.updateOrderStatusWithTracking(
      order.id,
      currentStatus,
      newStatus,
      actorId,
      actorRole,
      remarks,
      input.latitude,
      input.longitude
    );

    // Release agent if order reaches terminal state DELIVERED
    if (newStatus === OrderStatus.DELIVERED && order.assignedAgentId) {
      await OrderRepository.updateOrderStatusWithTracking(
        order.id,
        newStatus,
        newStatus,
        actorId,
        actorRole,
        'Agent released after successful delivery'
      );
    }

    // Trigger Notification
    await NotificationService.sendNotification({
      orderId: order.id,
      customerId: order.customerId,
      channel: 'EMAIL',
      notificationType: `STATUS_${newStatus}`,
      recipient: order.customer.email,
      message: `Your order ${order.orderNumber} is now ${newStatus}.`,
    });

    return updatedOrder;
  }

  static async getOrderDetails(orderId: string, userId: string, userRole: Role) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    if (userRole === Role.CUSTOMER && order.customerId !== userId) {
      throw new ForbiddenError('You can only view your own orders');
    }

    return order;
  }

  static async getTrackingHistory(orderId: string) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    return {
      orderNumber: order.orderNumber,
      currentStatus: order.currentStatus,
      scheduledDeliveryDate: order.scheduledDeliveryDate,
      pickupAddress: order.pickupAddress,
      dropAddress: order.dropAddress,
      assignedAgent: order.assignedAgent ? {
        name: order.assignedAgent.user.name,
        phone: order.assignedAgent.user.phone,
        employeeCode: order.assignedAgent.employeeCode,
      } : null,
      trackingEvents: order.trackingEvents,
      deliveryAttempts: order.deliveryAttempts,
    };
  }

  static async assignAgentManuallyOrAuto(
    orderId: string,
    agentId?: string,
    autoAssign?: boolean,
    actorId?: string,
    actorRole?: string
  ) {
    if (autoAssign) {
      return AutoAssignmentService.autoAssignAgent(orderId, actorId || '', actorRole || 'ADMIN');
    }

    if (!agentId) {
      throw new InvalidStatusTransitionError('Agent ID is required for manual assignment');
    }

    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    return OrderRepository.assignAgentToOrder(
      order.id,
      agentId,
      actorId || '',
      actorRole || 'ADMIN',
      'Manual Agent Assignment'
    );
  }
}

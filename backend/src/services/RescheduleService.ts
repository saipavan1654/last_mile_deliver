import { OrderRepository } from '../repositories/order.repository';
import { AutoAssignmentService } from './AutoAssignmentService';
import { NotificationService } from './NotificationService';
import { NotFoundError, InvalidStatusTransitionError } from '../utils/errors';
import { OrderStatus } from '@prisma/client';
import { logger } from '../utils/logger';

export class RescheduleService {
  static async rescheduleFailedOrder(
    orderId: string,
    newScheduledDate: Date,
    actorId: string,
    actorRole: string
  ) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    if (order.currentStatus !== OrderStatus.FAILED) {
      throw new InvalidStatusTransitionError(
        `Only FAILED orders can be rescheduled. Current status is ${order.currentStatus}`,
        'INVALID_RESCHEDULE'
      );
    }

    // 1. Transition order to RESCHEDULED and clear old agent
    const rescheduledOrder = await OrderRepository.rescheduleOrder(
      order.id,
      newScheduledDate,
      actorId,
      actorRole
    );

    logger.info(`Order ${order.orderNumber} successfully rescheduled for ${newScheduledDate.toISOString()}`);

    // 2. Trigger Notification
    await NotificationService.sendNotification({
      orderId: order.id,
      customerId: order.customerId,
      channel: 'EMAIL',
      notificationType: 'ORDER_RESCHEDULED',
      recipient: order.customer.email,
      message: `Your order ${order.orderNumber} has been rescheduled for ${newScheduledDate.toDateString()}. A new delivery agent is being assigned.`,
    });

    // 3. Automatically assign a NEW suitable delivery agent
    let reassignedOrder = rescheduledOrder;
    try {
      reassignedOrder = await AutoAssignmentService.autoAssignAgent(
        order.id,
        actorId,
        actorRole
      );
      logger.info(`Re-assigned new agent to rescheduled order ${order.orderNumber}`);
    } catch (autoAssignErr) {
      logger.warn(`Could not immediately auto-assign agent to rescheduled order ${order.orderNumber}: ${(autoAssignErr as Error).message}`);
    }

    return reassignedOrder;
  }
}

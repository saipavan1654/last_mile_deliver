import { prisma } from '../repositories/prisma';
import { NotificationChannel, NotificationStatus } from '@prisma/client';
import { logger } from '../utils/logger';

export interface SendNotificationPayload {
  orderId: string;
  customerId: string;
  channel: NotificationChannel;
  notificationType: string;
  recipient: string;
  message: string;
}

export class NotificationService {
  static async sendNotification(payload: SendNotificationPayload) {
    try {
      // Create pending record
      const notification = await prisma.notification.create({
        data: {
          orderId: payload.orderId,
          customerId: payload.customerId,
          channel: payload.channel,
          notificationType: payload.notificationType,
          recipient: payload.recipient,
          message: payload.message,
          status: NotificationStatus.PENDING,
        },
      });

      // Dispatch via mock notification provider (dev/prod abstraction)
      logger.info(`[NOTIFICATION DISPATCH - ${payload.channel}] To: ${payload.recipient} | Type: ${payload.notificationType} | Message: ${payload.message}`);

      // Mark sent
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });

      return notification;
    } catch (error) {
      logger.error(`Failed to send notification to ${payload.recipient}`, { error });
      return null;
    }
  }
}

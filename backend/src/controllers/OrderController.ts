import { Request, Response, NextFunction } from 'express';
import { RateCalculationService } from '../services/RateCalculationService';
import { OrderService } from '../services/OrderService';
import { RescheduleService } from '../services/RescheduleService';
import { OrderRepository } from '../repositories/order.repository';
import {
  calculatePriceSchema,
  createOrderSchema,
  updateOrderStatusSchema,
  rescheduleOrderSchema,
  assignAgentSchema,
} from '../validators/order.validator';
import { Role } from '@prisma/client';

export class OrderController {
  static async calculatePrice(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = calculatePriceSchema.parse(req.body);
      const priceBreakdown = await RateCalculationService.calculatePrice(validated);
      res.status(200).json({
        success: true,
        data: priceBreakdown,
        message: 'Price calculated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createOrderSchema.parse(req.body);
      const customerId = req.user!.id;
      const order = await OrderService.createOrder(validated, customerId, req.user!.role);
      res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;

      if (userRole === Role.DELIVERY_AGENT && req.user!.agentId) {
        const orders = await OrderRepository.findAgentOrders(req.user!.agentId);
        return res.status(200).json({ success: true, data: orders });
      }

      const orders = await OrderRepository.findCustomerOrders(userId);
      return res.status(200).json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await OrderService.getOrderDetails(id, req.user!.id, req.user!.role);
      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTracking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tracking = await OrderService.getTrackingHistory(id);
      res.status(200).json({
        success: true,
        data: tracking,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = updateOrderStatusSchema.parse(req.body);
      const order = await OrderService.updateOrderStatus(
        id,
        validated,
        req.user!.id,
        req.user!.role
      );
      res.status(200).json({
        success: true,
        data: order,
        message: `Order status updated to ${validated.status}`,
      });
    } catch (error) {
      next(error);
    }
  }

  static async rescheduleOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = rescheduleOrderSchema.parse(req.body);
      const newDate = new Date(validated.newScheduledDate);
      const order = await RescheduleService.rescheduleFailedOrder(
        id,
        newDate,
        req.user!.id,
        req.user!.role
      );
      res.status(200).json({
        success: true,
        data: order,
        message: 'Order rescheduled and reassigned successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async assignAgent(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = assignAgentSchema.parse(req.body);
      const order = await OrderService.assignAgentManuallyOrAuto(
        id,
        validated.agentId,
        validated.autoAssign,
        req.user!.id,
        req.user!.role
      );
      res.status(200).json({
        success: true,
        data: order,
        message: 'Agent assigned to order successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

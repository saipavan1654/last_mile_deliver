import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/AdminService';
import { AgentService } from '../services/AgentService';
import { OrderStatus } from '@prisma/client';

export class AdminController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getDashboardData();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const search = req.query.search as string;
      const status = req.query.status as OrderStatus;
      const zoneId = req.query.zoneId as string;

      const result = await AdminService.getAllOrders({ page, limit, search, status, zoneId });
      res.status(200).json({ success: true, data: result.orders, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await AdminService.getAllCustomers();
      res.status(200).json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  }

  static async getAgents(req: Request, res: Response, next: NextFunction) {
    try {
      const agents = await AgentService.getAllAgents();
      res.status(200).json({ success: true, data: agents });
    } catch (error) {
      next(error);
    }
  }
}

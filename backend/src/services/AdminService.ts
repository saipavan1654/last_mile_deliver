import { OrderRepository } from '../repositories/order.repository';
import { UserRepository } from '../repositories/user.repository';
import { OrderStatus } from '@prisma/client';

export class AdminService {
  static async getDashboardData() {
    return OrderRepository.getDashboardMetrics();
  }

  static async getAllOrders(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: OrderStatus;
    zoneId?: string;
  }) {
    return OrderRepository.findAllOrdersPaginated(params);
  }

  static async getAllCustomers() {
    return UserRepository.findAllCustomers();
  }
}

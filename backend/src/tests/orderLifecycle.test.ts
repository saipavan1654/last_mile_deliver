import { OrderService } from '../services/OrderService';
import { OrderRepository } from '../repositories/order.repository';
import { OrderStatus, Role } from '@prisma/client';
import { InvalidStatusTransitionError } from '../utils/errors';

jest.mock('../repositories/order.repository');
jest.mock('../services/NotificationService');

describe('OrderService - Status Transition State Machine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Valid Transition: ASSIGNED -> PICKED_UP', async () => {
    (OrderRepository.findById as jest.Mock).mockResolvedValue({
      id: 'ord_1',
      currentStatus: OrderStatus.ASSIGNED,
      customerId: 'cust_1',
      customer: { email: 'cust@test.com' },
    });

    (OrderRepository.updateOrderStatusWithTracking as jest.Mock).mockResolvedValue({
      id: 'ord_1',
      currentStatus: OrderStatus.PICKED_UP,
    });

    const result = await OrderService.updateOrderStatus(
      'ord_1',
      { status: OrderStatus.PICKED_UP, remarks: 'Parcel picked up' },
      'agent_1',
      Role.DELIVERY_AGENT
    );

    expect(result.currentStatus).toBe(OrderStatus.PICKED_UP);
  });

  test('Invalid Transition: DELIVERED -> PICKED_UP (Rejected)', async () => {
    (OrderRepository.findById as jest.Mock).mockResolvedValue({
      id: 'ord_1',
      currentStatus: OrderStatus.DELIVERED,
      customerId: 'cust_1',
      customer: { email: 'cust@test.com' },
    });

    await expect(
      OrderService.updateOrderStatus(
        'ord_1',
        { status: OrderStatus.PICKED_UP },
        'agent_1',
        Role.DELIVERY_AGENT
      )
    ).rejects.toThrow(InvalidStatusTransitionError);
  });

  test('Admin Override: DELIVERED -> IN_TRANSIT allowed with tracking log', async () => {
    (OrderRepository.findById as jest.Mock).mockResolvedValue({
      id: 'ord_1',
      currentStatus: OrderStatus.DELIVERED,
      customerId: 'cust_1',
      customer: { email: 'cust@test.com' },
    });

    (OrderRepository.updateOrderStatusWithTracking as jest.Mock).mockResolvedValue({
      id: 'ord_1',
      currentStatus: OrderStatus.IN_TRANSIT,
    });

    const result = await OrderService.updateOrderStatus(
      'ord_1',
      { status: OrderStatus.IN_TRANSIT, remarks: 'Admin status override' },
      'admin_1',
      Role.ADMIN
    );

    expect(result.currentStatus).toBe(OrderStatus.IN_TRANSIT);
    expect(OrderRepository.updateOrderStatusWithTracking).toHaveBeenCalledWith(
      'ord_1',
      OrderStatus.DELIVERED,
      OrderStatus.IN_TRANSIT,
      'admin_1',
      Role.ADMIN,
      'ADMIN OVERRIDE: Admin status override',
      undefined,
      undefined
    );
  });
});

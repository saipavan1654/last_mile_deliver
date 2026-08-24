import { RescheduleService } from '../services/RescheduleService';
import { OrderRepository } from '../repositories/order.repository';
import { AutoAssignmentService } from '../services/AutoAssignmentService';
import { OrderStatus } from '@prisma/client';
import { InvalidStatusTransitionError } from '../utils/errors';

jest.mock('../repositories/order.repository');
jest.mock('../services/AutoAssignmentService');
jest.mock('../services/NotificationService');

describe('RescheduleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Reschedule succeeds for FAILED order and triggers new auto-assignment', async () => {
    const newDate = new Date('2026-08-26');

    (OrderRepository.findById as jest.Mock).mockResolvedValue({
      id: 'ord_failed',
      orderNumber: 'ORD-500',
      currentStatus: OrderStatus.FAILED,
      customerId: 'cust_1',
      customer: { email: 'cust@test.com' },
    });

    (OrderRepository.rescheduleOrder as jest.Mock).mockResolvedValue({
      id: 'ord_failed',
      currentStatus: OrderStatus.RESCHEDULED,
      scheduledDeliveryDate: newDate,
    });

    (AutoAssignmentService.autoAssignAgent as jest.Mock).mockResolvedValue({
      id: 'ord_failed',
      currentStatus: OrderStatus.ASSIGNED,
      assignedAgentId: 'new_agent_id',
    });

    const result = await RescheduleService.rescheduleFailedOrder(
      'ord_failed',
      newDate,
      'cust_1',
      'CUSTOMER'
    );

    expect(OrderRepository.rescheduleOrder).toHaveBeenCalledWith(
      'ord_failed',
      newDate,
      'cust_1',
      'CUSTOMER'
    );
    expect(AutoAssignmentService.autoAssignAgent).toHaveBeenCalledWith(
      'ord_failed',
      'cust_1',
      'CUSTOMER'
    );
    expect(result.assignedAgentId).toBe('new_agent_id');
  });

  test('Reschedule fails for non-FAILED order (e.g. IN_TRANSIT)', async () => {
    (OrderRepository.findById as jest.Mock).mockResolvedValue({
      id: 'ord_transit',
      orderNumber: 'ORD-600',
      currentStatus: OrderStatus.IN_TRANSIT,
    });

    await expect(
      RescheduleService.rescheduleFailedOrder(
        'ord_transit',
        new Date(),
        'cust_1',
        'CUSTOMER'
      )
    ).rejects.toThrow(InvalidStatusTransitionError);
  });
});

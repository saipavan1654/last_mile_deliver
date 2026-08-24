import { AutoAssignmentService } from '../services/AutoAssignmentService';
import { AgentRepository } from '../repositories/agent.repository';
import { OrderRepository } from '../repositories/order.repository';
import { NoAvailableAgentError } from '../utils/errors';
import { AgentAvailability } from '@prisma/client';

jest.mock('../repositories/agent.repository');
jest.mock('../repositories/order.repository');
jest.mock('../services/NotificationService');

describe('AutoAssignmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Auto-assign prioritizes same pickup zone AVAILABLE agent', async () => {
    (OrderRepository.findById as jest.Mock).mockResolvedValue({
      id: 'ord_1',
      orderNumber: 'ORD-100',
      pickupZoneId: 'zone_a',
      customerId: 'cust_1',
      customer: { email: 'cust@test.com' },
    });

    const agentInZoneA = {
      id: 'agent_a',
      employeeCode: 'AGT-A',
      currentZoneId: 'zone_a',
      availabilityStatus: AgentAvailability.AVAILABLE,
      currentLatitude: 12.97,
      currentLongitude: 77.59,
      user: { name: 'Agent Zone A', phone: '123' },
    };

    const agentInZoneB = {
      id: 'agent_b',
      employeeCode: 'AGT-B',
      currentZoneId: 'zone_b',
      availabilityStatus: AgentAvailability.AVAILABLE,
      currentLatitude: 12.93,
      currentLongitude: 77.62,
      user: { name: 'Agent Zone B', phone: '456' },
    };

    (AgentRepository.findAvailableAgents as jest.Mock).mockResolvedValue([
      agentInZoneB,
      agentInZoneA,
    ]);

    (OrderRepository.assignAgentToOrder as jest.Mock).mockResolvedValue({
      id: 'ord_1',
      assignedAgentId: 'agent_a',
    });

    const result = await AutoAssignmentService.autoAssignAgent('ord_1', 'admin_1', 'ADMIN');

    expect(OrderRepository.assignAgentToOrder).toHaveBeenCalledWith(
      'ord_1',
      'agent_a',
      'admin_1',
      'ADMIN',
      'Agent Zone A'
    );
    expect(result.assignedAgentId).toBe('agent_a');
  });

  test('Throws NoAvailableAgentError if no agents are AVAILABLE', async () => {
    (OrderRepository.findById as jest.Mock).mockResolvedValue({
      id: 'ord_1',
      orderNumber: 'ORD-100',
      pickupZoneId: 'zone_a',
    });

    (AgentRepository.findAvailableAgents as jest.Mock).mockResolvedValue([]);

    await expect(
      AutoAssignmentService.autoAssignAgent('ord_1', 'admin_1', 'ADMIN')
    ).rejects.toThrow(NoAvailableAgentError);
  });
});

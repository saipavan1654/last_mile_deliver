import { AgentRepository } from '../repositories/agent.repository';
import { OrderRepository } from '../repositories/order.repository';
import { NotFoundError } from '../utils/errors';
import { AgentAvailability } from '@prisma/client';

export class AgentService {
  static async getAgentProfile(userId: string) {
    const agent = await AgentRepository.findByUserId(userId);
    if (!agent) {
      throw new NotFoundError('Agent profile not found for current user', 'AGENT_NOT_FOUND');
    }
    return agent;
  }

  static async getAssignedOrders(agentId: string) {
    return OrderRepository.findAgentOrders(agentId);
  }

  static async updateAvailability(agentId: string, status: AgentAvailability) {
    return AgentRepository.updateStatus(agentId, status);
  }

  static async updateLocation(
    agentId: string,
    latitude: number,
    longitude: number,
    zoneId?: string
  ) {
    return AgentRepository.updateLocation(agentId, { latitude, longitude, zoneId });
  }

  static async getAllAgents() {
    return AgentRepository.findAllAgents();
  }
}

import { AgentRepository } from '../repositories/agent.repository';
import { OrderRepository } from '../repositories/order.repository';
import { NoAvailableAgentError, NotFoundError } from '../utils/errors';
import { calculateHaversineDistance } from '../utils/distance';
import { logger } from '../utils/logger';
import { NotificationService } from './NotificationService';

export class AutoAssignmentService {
  static async autoAssignAgent(orderId: string, actorId: string, actorRole: string) {
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found', 'ORDER_NOT_FOUND');
    }

    // 1. Fetch all AVAILABLE agents
    const availableAgents = await AgentRepository.findAvailableAgents();
    if (availableAgents.length === 0) {
      logger.warn(`Auto-assignment failed for order ${order.orderNumber}: No AVAILABLE agents found`);
      throw new NoAvailableAgentError();
    }

    // 2. Prioritization Pipeline
    // Priority Score Breakdown:
    // - Zone Match: Score +1000
    // - Distance: Score + (100 - min(distance, 100))
    // - Tie breaker: Agent ID comparison
    const rankedAgents = availableAgents.map((agent) => {
      let score = 0;

      // Rule: Prefer agents in pickup zone
      if (agent.currentZoneId === order.pickupZoneId) {
        score += 1000;
      }

      // Rule: Haversine geographical distance if agent coordinates exist
      if (agent.currentLatitude !== null && agent.currentLongitude !== null) {
        // Fallback coordinates if pickup zone default location is used
        const pickupLat = 12.9716; // Standard pickup zone reference lat
        const pickupLon = 77.5946; // Standard pickup zone reference lon
        const distance = calculateHaversineDistance(
          agent.currentLatitude,
          agent.currentLongitude,
          pickupLat,
          pickupLon
        );
        score += Math.max(0, 100 - distance);
      }

      return { agent, score };
    });

    // Sort descending by score, tie-breaker by agent ID
    rankedAgents.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.agent.id.localeCompare(b.agent.id);
    });

    const selectedAgent = rankedAgents[0].agent;

    // 3. Assign Agent to Order
    const updatedOrder = await OrderRepository.assignAgentToOrder(
      order.id,
      selectedAgent.id,
      actorId,
      actorRole,
      selectedAgent.user.name
    );

    // 4. Trigger Notifications
    await NotificationService.sendNotification({
      orderId: order.id,
      customerId: order.customerId,
      channel: 'EMAIL',
      notificationType: 'AGENT_ASSIGNED',
      recipient: order.customer.email,
      message: `Your order ${order.orderNumber} has been assigned to delivery agent ${selectedAgent.user.name} (${selectedAgent.phone}).`,
    });

    logger.info(`Successfully assigned order ${order.orderNumber} to agent ${selectedAgent.user.name} (${selectedAgent.employeeCode})`);

    return updatedOrder;
  }
}

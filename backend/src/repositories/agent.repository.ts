import { prisma } from './prisma';
import { AgentAvailability } from '@prisma/client';

export class AgentRepository {
  static async findById(id: string) {
    return prisma.deliveryAgent.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        currentZone: true,
      },
    });
  }

  static async findByUserId(userId: string) {
    return prisma.deliveryAgent.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        currentZone: true,
      },
    });
  }

  static async findAvailableAgents() {
    return prisma.deliveryAgent.findMany({
      where: {
        availabilityStatus: AgentAvailability.AVAILABLE,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        currentZone: true,
      },
    });
  }

  static async updateStatus(agentId: string, status: AgentAvailability) {
    return prisma.deliveryAgent.update({
      where: { id: agentId },
      data: { availabilityStatus: status },
    });
  }

  static async updateLocation(
    agentId: string,
    data: { latitude: number; longitude: number; zoneId?: string }
  ) {
    return prisma.deliveryAgent.update({
      where: { id: agentId },
      data: {
        currentLatitude: data.latitude,
        currentLongitude: data.longitude,
        ...(data.zoneId ? { currentZoneId: data.zoneId } : {}),
      },
      include: { currentZone: true },
    });
  }

  static async findAllAgents() {
    return prisma.deliveryAgent.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        currentZone: true,
        _count: {
          select: { assignedOrders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

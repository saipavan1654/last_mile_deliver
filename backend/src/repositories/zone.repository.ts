import { prisma } from './prisma';

export class ZoneRepository {
  static async findAllZones() {
    return prisma.zone.findMany({
      include: {
        areas: true,
        _count: {
          select: { pickupOrders: true, dropOrders: true, agentsInZone: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  static async findZoneById(id: string) {
    return prisma.zone.findUnique({
      where: { id },
      include: { areas: true },
    });
  }

  static async findAreaById(id: string) {
    return prisma.area.findUnique({
      where: { id },
      include: { zone: true },
    });
  }

  static async findAreaByPincode(pincode: string) {
    return prisma.area.findUnique({
      where: { pincode },
      include: { zone: true },
    });
  }

  static async createZone(data: { name: string; code: string; description?: string }) {
    return prisma.zone.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        description: data.description,
      },
    });
  }

  static async updateZone(id: string, data: { name?: string; code?: string; description?: string; active?: boolean }) {
    return prisma.zone.update({
      where: { id },
      data,
    });
  }

  static async createArea(data: { name: string; pincode: string; zoneId: string }) {
    return prisma.area.create({
      data: {
        name: data.name,
        pincode: data.pincode,
        zoneId: data.zoneId,
      },
      include: { zone: true },
    });
  }

  static async updateAreaZone(areaId: string, zoneId: string) {
    return prisma.area.update({
      where: { id: areaId },
      data: { zoneId },
      include: { zone: true },
    });
  }
}

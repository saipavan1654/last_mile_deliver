import { ZoneRepository } from '../repositories/zone.repository';

export class ZoneService {
  static async getAllZones() {
    return ZoneRepository.findAllZones();
  }

  static async createZone(data: { name: string; code: string; description?: string }) {
    return ZoneRepository.createZone(data);
  }

  static async updateZone(id: string, data: { name?: string; code?: string; description?: string; active?: boolean }) {
    return ZoneRepository.updateZone(id, data);
  }

  static async createArea(data: { name: string; pincode: string; zoneId: string }) {
    return ZoneRepository.createArea(data);
  }

  static async updateAreaZone(areaId: string, zoneId: string) {
    return ZoneRepository.updateAreaZone(areaId, zoneId);
  }
}

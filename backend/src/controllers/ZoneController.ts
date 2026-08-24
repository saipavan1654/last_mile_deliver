import { Request, Response, NextFunction } from 'express';
import { ZoneService } from '../services/ZoneService';
import { createZoneSchema, createAreaSchema } from '../validators/admin.validator';

export class ZoneController {
  static async getZones(req: Request, res: Response, next: NextFunction) {
    try {
      const zones = await ZoneService.getAllZones();
      res.status(200).json({ success: true, data: zones });
    } catch (error) {
      next(error);
    }
  }

  static async createZone(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createZoneSchema.parse(req.body);
      const zone = await ZoneService.createZone(validated);
      res.status(201).json({ success: true, data: zone, message: 'Zone created successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async updateZone(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const zone = await ZoneService.updateZone(id, req.body);
      res.status(200).json({ success: true, data: zone, message: 'Zone updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async createArea(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createAreaSchema.parse(req.body);
      const area = await ZoneService.createArea(validated);
      res.status(201).json({ success: true, data: area, message: 'Area created successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async updateAreaZone(req: Request, res: Response, next: NextFunction) {
    try {
      const { areaId } = req.params;
      const { zoneId } = req.body;
      const area = await ZoneService.updateAreaZone(areaId, zoneId);
      res.status(200).json({ success: true, data: area, message: 'Area assigned to new zone' });
    } catch (error) {
      next(error);
    }
  }
}

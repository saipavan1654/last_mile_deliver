import { Request, Response, NextFunction } from 'express';
import { AgentService } from '../services/AgentService';
import { updateAgentAvailabilitySchema, updateAgentLocationSchema } from '../validators/agent.validator';

export class AgentController {
  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const agent = await AgentService.getAgentProfile(req.user!.id);
      res.status(200).json({ success: true, data: agent });
    } catch (error) {
      next(error);
    }
  }

  static async updateAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateAgentAvailabilitySchema.parse(req.body);
      const agent = await AgentService.getAgentProfile(req.user!.id);
      const updated = await AgentService.updateAvailability(agent.id, validated.availabilityStatus);
      res.status(200).json({
        success: true,
        data: updated,
        message: `Availability updated to ${validated.availabilityStatus}`,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateAgentLocationSchema.parse(req.body);
      const agent = await AgentService.getAgentProfile(req.user!.id);
      const updated = await AgentService.updateLocation(
        agent.id,
        validated.latitude,
        validated.longitude,
        validated.zoneId
      );
      res.status(200).json({
        success: true,
        data: updated,
        message: 'Agent location updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

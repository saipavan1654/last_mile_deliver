import { Request, Response, NextFunction } from 'express';
import { RateCardService } from '../services/RateCardService';
import { createRateCardSchema, createCODConfigSchema } from '../validators/admin.validator';

export class RateCardController {
  static async getRateCards(req: Request, res: Response, next: NextFunction) {
    try {
      const rateCards = await RateCardService.getAllRateCards();
      res.status(200).json({ success: true, data: rateCards });
    } catch (error) {
      next(error);
    }
  }

  static async getCODConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      const codConfigs = await RateCardService.getAllCODConfigs();
      res.status(200).json({ success: true, data: codConfigs });
    } catch (error) {
      next(error);
    }
  }

  static async createRateCard(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createRateCardSchema.parse(req.body);
      const card = await RateCardService.createRateCard(validated);
      res.status(201).json({ success: true, data: card, message: 'Rate card created successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async updateRateCard(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const card = await RateCardService.updateRateCard(id, req.body);
      res.status(200).json({ success: true, data: card, message: 'Rate card updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async upsertCODConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createCODConfigSchema.parse(req.body);
      const config = await RateCardService.upsertCODConfig(validated);
      res.status(200).json({ success: true, data: config, message: 'COD configuration updated' });
    } catch (error) {
      next(error);
    }
  }
}

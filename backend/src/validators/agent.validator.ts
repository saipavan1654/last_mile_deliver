import { z } from 'zod';
import { AgentAvailability } from '@prisma/client';

export const updateAgentAvailabilitySchema = z.object({
  availabilityStatus: z.nativeEnum(AgentAvailability),
});

export const updateAgentLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  zoneId: z.string().uuid().optional(),
});

export type UpdateAgentAvailabilityInput = z.infer<typeof updateAgentAvailabilitySchema>;
export type UpdateAgentLocationInput = z.infer<typeof updateAgentLocationSchema>;

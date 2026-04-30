import { z } from 'zod';

export const SpaceTypeEnum = z.enum(['office', 'gym', 'library', 'other']);

export const CreateSpaceSchema = z.object({
  name: z.string().min(2).max(100),
  type: SpaceTypeEnum,
  address: z.string().max(255).optional(),
});

export const JoinSpaceSchema = z.object({
  inviteCode: z.string().length(6),
});

export const UpdateSpaceSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  address: z.string().max(255).optional(),
});

export const UpdateMemberRoleSchema = z.object({
  role: z.enum(['member', 'manager']),
});

export type SpaceType = z.infer<typeof SpaceTypeEnum>;
export type CreateSpaceInput = z.infer<typeof CreateSpaceSchema>;
export type JoinSpaceInput = z.infer<typeof JoinSpaceSchema>;
export type UpdateSpaceInput = z.infer<typeof UpdateSpaceSchema>;
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleSchema>;

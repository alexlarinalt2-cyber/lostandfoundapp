import { z } from 'zod';

export const ClaimStatusEnum = z.enum(['pending', 'approved', 'rejected']);

export const CreateClaimSchema = z.object({
  message: z.string().min(10).max(500),
});

export const UpdateClaimSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export type ClaimStatus = z.infer<typeof ClaimStatusEnum>;
export type CreateClaimInput = z.infer<typeof CreateClaimSchema>;
export type UpdateClaimInput = z.infer<typeof UpdateClaimSchema>;

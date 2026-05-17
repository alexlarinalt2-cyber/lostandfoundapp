import { z } from 'zod';

export const ClaimStatusEnum = z.enum(['pending', 'approved', 'rejected']);

const IdentifyingMarkSchema = z.object({
  label: z.string(),
  detail: z.string().optional(),
  checked: z.boolean(),
});

export const CreateClaimSchema = z.object({
  message: z.string().min(10).max(1000),
  identifyingMarks: z.preprocess(
    (val) => {
      if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
      return val ?? [];
    },
    z.array(IdentifyingMarkSchema).optional().default([])
  ),
  pickupMethod: z.preprocess(
    (val) => val ?? 'in_person',
    z.enum(['in_person', 'email']).default('in_person')
  ),
  phone: z.string().max(30).optional(),
  availability: z.string().max(100).optional(),
});

export const UpdateClaimSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export type ClaimStatus = z.infer<typeof ClaimStatusEnum>;
export type CreateClaimInput = z.infer<typeof CreateClaimSchema>;
export type UpdateClaimInput = z.infer<typeof UpdateClaimSchema>;

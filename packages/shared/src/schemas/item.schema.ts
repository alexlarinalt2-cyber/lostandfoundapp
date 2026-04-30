import { z } from 'zod';

export const ItemTypeEnum = z.enum(['lost', 'found']);
export const ItemStatusEnum = z.enum(['open', 'claimed', 'resolved', 'expired']);
export const ItemCategoryEnum = z.enum([
  'clothing',
  'electronics',
  'keys',
  'bags',
  'jewelry',
  'documents',
  'glasses',
  'sports',
  'other',
]);

export const CreateItemSchema = z.object({
  type: ItemTypeEnum,
  title: z.string().min(3).max(120),
  description: z.string().max(1000).optional(),
  category: ItemCategoryEnum,
  locationLabel: z.string().max(200).optional(),
  dateOccurred: z.string().datetime().optional(),
});

export const UpdateItemSchema = z.object({
  title: z.string().min(3).max(120).optional(),
  description: z.string().max(1000).optional(),
  category: ItemCategoryEnum.optional(),
  locationLabel: z.string().max(200).optional(),
  status: ItemStatusEnum.optional(),
  dateOccurred: z.string().datetime().optional(),
});

export const ListItemsQuerySchema = z.object({
  type: ItemTypeEnum.optional(),
  category: ItemCategoryEnum.optional(),
  status: ItemStatusEnum.optional(),
  search: z.string().max(100).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export type ItemType = z.infer<typeof ItemTypeEnum>;
export type ItemStatus = z.infer<typeof ItemStatusEnum>;
export type ItemCategory = z.infer<typeof ItemCategoryEnum>;
export type CreateItemInput = z.infer<typeof CreateItemSchema>;
export type UpdateItemInput = z.infer<typeof UpdateItemSchema>;
export type ListItemsQuery = z.infer<typeof ListItemsQuerySchema>;

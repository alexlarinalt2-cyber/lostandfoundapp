import type { ItemCategory, ItemStatus, ItemType } from '../schemas/item.schema';

export interface ItemPhoto {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  displayOrder: number;
}

export interface Item {
  id: string;
  spaceId: string;
  reportedBy: string;
  reporterName: string;
  type: ItemType;
  status: ItemStatus;
  title: string;
  description: string | null;
  category: ItemCategory;
  locationLabel: string | null;
  dateReported: string;
  dateOccurred: string | null;
  expiresAt: string | null;
  photos: ItemPhoto[];
  claimCount: number;
}

export interface PaginatedItems {
  items: Item[];
  nextCursor: string | null;
  total: number;
}

import { apiClient } from './client';
import type { CreateItemInput, UpdateItemInput, ListItemsQuery, Item, ItemPhoto } from '@laf/shared';

function mapPhoto(p: Record<string, unknown>): ItemPhoto {
  return {
    id: p.id as string,
    url: p.url as string,
    thumbnailUrl: (p.thumbnail_url ?? p.thumbnailUrl ?? null) as string | null,
    displayOrder: (p.display_order ?? p.displayOrder ?? 0) as number,
  };
}

function mapItem(row: Record<string, unknown>): Item {
  return {
    id: row.id as string,
    spaceId: (row.space_id ?? row.spaceId) as string,
    reportedBy: (row.reported_by ?? row.reportedBy) as string,
    reporterName: (row.reporter_name ?? row.reporterName) as string,
    type: row.type as Item['type'],
    status: row.status as Item['status'],
    title: row.title as string,
    description: (row.description ?? null) as string | null,
    category: row.category as Item['category'],
    locationLabel: (row.location_label ?? row.locationLabel ?? null) as string | null,
    dateReported: (row.date_reported ?? row.dateReported) as string,
    dateOccurred: (row.date_occurred ?? row.dateOccurred ?? null) as string | null,
    expiresAt: (row.expires_at ?? row.expiresAt ?? null) as string | null,
    photos: ((row.photos ?? []) as Record<string, unknown>[]).map(mapPhoto),
    claimCount: Number(row.claim_count ?? row.claimCount ?? 0),
  };
}

export async function listItems(spaceId: string, query: Partial<ListItemsQuery> = {}) {
  const { data } = await apiClient.get(`/spaces/${spaceId}/items`, { params: query });
  const raw = data.data;
  return { items: (raw.items as Record<string, unknown>[]).map(mapItem), nextCursor: raw.nextCursor ?? null };
}

export async function getItem(id: string) {
  const { data } = await apiClient.get(`/items/${id}`);
  return mapItem(data.data as Record<string, unknown>);
}

export async function createItem(spaceId: string, input: CreateItemInput, photos: File[]) {
  const form = new FormData();
  Object.entries(input).forEach(([k, v]) => { if (v !== undefined) form.append(k, String(v)); });
  photos.forEach((f) => form.append('photos', f));
  const { data } = await apiClient.post(`/spaces/${spaceId}/items`, form);
  return data.data;
}

export async function updateItem(id: string, input: UpdateItemInput) {
  const { data } = await apiClient.patch(`/items/${id}`, input);
  return data.data;
}

export async function deleteItem(id: string) {
  await apiClient.delete(`/items/${id}`);
}

import { apiClient } from './client';
import type { CreateItemInput, UpdateItemInput, ListItemsQuery } from '@laf/shared';

export async function listItems(spaceId: string, query: Partial<ListItemsQuery> = {}) {
  const { data } = await apiClient.get(`/spaces/${spaceId}/items`, { params: query });
  return data.data;
}

export async function getItem(id: string) {
  const { data } = await apiClient.get(`/items/${id}`);
  return data.data;
}

export async function createItem(spaceId: string, input: CreateItemInput, photos: File[]) {
  const form = new FormData();
  Object.entries(input).forEach(([k, v]) => { if (v !== undefined) form.append(k, String(v)); });
  photos.forEach((f) => form.append('photos', f));
  const { data } = await apiClient.post(`/spaces/${spaceId}/items`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function updateItem(id: string, input: UpdateItemInput) {
  const { data } = await apiClient.patch(`/items/${id}`, input);
  return data.data;
}

export async function deleteItem(id: string) {
  await apiClient.delete(`/items/${id}`);
}

import { apiClient } from './client';
import type { CreateClaimInput } from '@laf/shared';

export async function listClaims(itemId: string) {
  const { data } = await apiClient.get(`/items/${itemId}/claims`);
  return data.data;
}

export async function createClaim(itemId: string, input: CreateClaimInput) {
  const { data } = await apiClient.post(`/items/${itemId}/claims`, input);
  return data.data;
}

export async function updateClaim(itemId: string, claimId: string, status: 'approved' | 'rejected') {
  const { data } = await apiClient.patch(`/items/${itemId}/claims/${claimId}`, { status });
  return data.data;
}

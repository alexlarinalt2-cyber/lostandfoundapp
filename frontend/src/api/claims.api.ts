import { apiClient } from './client';

export async function getMyClaim(itemId: string) {
  const { data } = await apiClient.get(`/items/${itemId}/my-claim`);
  return data.data as { id: string; status: string } | null;
}

export async function listClaims(itemId: string) {
  const { data } = await apiClient.get(`/items/${itemId}/claims`);
  return data.data;
}

export async function getClaim(itemId: string, claimId: string) {
  const { data } = await apiClient.get(`/items/${itemId}/claims/${claimId}`);
  return data.data;
}

export async function createClaim(itemId: string, input: Record<string, unknown>, photos?: File[]) {
  if (photos && photos.length > 0) {
    const fd = new FormData();
    Object.entries(input).forEach(([k, v]) => {
      fd.append(k, typeof v === 'string' ? v : JSON.stringify(v));
    });
    photos.forEach(f => fd.append('photos', f));
    const { data } = await apiClient.post(`/items/${itemId}/claims`, fd);
    return data.data;
  }
  const { data } = await apiClient.post(`/items/${itemId}/claims`, input);
  return data.data;
}

export async function updateClaim(itemId: string, claimId: string, status: 'approved' | 'rejected') {
  const { data } = await apiClient.patch(`/items/${itemId}/claims/${claimId}`, { status });
  return data.data;
}

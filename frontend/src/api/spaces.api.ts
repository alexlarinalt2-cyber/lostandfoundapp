import { apiClient } from './client';
import type { CreateSpaceInput, JoinSpaceInput } from '@laf/shared';

export async function listSpaces() {
  const { data } = await apiClient.get('/spaces');
  return data.data;
}

export async function createSpace(input: CreateSpaceInput) {
  const { data } = await apiClient.post('/spaces', input);
  return data.data;
}

export async function joinSpace(input: JoinSpaceInput) {
  const { data } = await apiClient.post('/spaces/join', input);
  return data.data;
}

export async function getSpace(id: string) {
  const { data } = await apiClient.get(`/spaces/${id}`);
  return data.data;
}

export async function listMembers(spaceId: string) {
  const { data } = await apiClient.get(`/spaces/${spaceId}/members`);
  return data.data;
}

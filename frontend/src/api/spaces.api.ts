import { apiClient } from './client';
import type { CreateSpaceInput, JoinSpaceInput, UpdateSpaceInput, UpdateMemberRoleInput } from '@laf/shared';

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

export async function updateSpace(spaceId: string, input: UpdateSpaceInput) {
  const { data } = await apiClient.patch(`/spaces/${spaceId}`, input);
  return data.data;
}

export async function updateMemberRole(spaceId: string, userId: string, input: UpdateMemberRoleInput) {
  const { data } = await apiClient.patch(`/spaces/${spaceId}/members/${userId}`, input);
  return data.data;
}

export async function removeMember(spaceId: string, userId: string) {
  const { data } = await apiClient.delete(`/spaces/${spaceId}/members/${userId}`);
  return data.data;
}

export async function leaveSpace(spaceId: string) {
  const { data } = await apiClient.delete(`/spaces/${spaceId}/leave`);
  return data.data;
}

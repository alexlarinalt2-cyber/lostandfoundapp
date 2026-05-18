import { apiClient } from './client';

export async function getConversationByClaim(claimId: string) {
  const { data } = await apiClient.get(`/conversations/by-claim/${claimId}`);
  return data.data;
}

export async function listMessages(convId: string) {
  const { data } = await apiClient.get(`/conversations/${convId}/messages`);
  return data.data;
}

export async function sendMessage(convId: string, content: string) {
  const { data } = await apiClient.post(`/conversations/${convId}/messages`, { content });
  return data.data;
}

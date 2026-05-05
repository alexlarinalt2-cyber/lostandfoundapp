import type { Request, Response } from 'express';
import * as spacesRepo from './spaces.repository';

async function requireMembership(spaceId: string, userId: string, role?: 'manager') {
  const membership = await spacesRepo.getMembership(spaceId, userId);
  if (!membership) return null;
  if (role && membership.role !== role) return null;
  return membership;
}

export async function listSpaces(req: Request, res: Response) {
  const spaces = await spacesRepo.findByUser(req.user!.userId);
  res.json({ success: true, data: spaces });
}

export async function createSpace(req: Request, res: Response) {
  const space = await spacesRepo.create({ ...req.body, createdBy: req.user!.userId });
  res.status(201).json({ success: true, data: space });
}

export async function joinSpace(req: Request, res: Response) {
  const space = await spacesRepo.findByInviteCode(req.body.inviteCode);
  if (!space) return res.status(404).json({ success: false, error: { message: 'Invalid invite code' } });
  await spacesRepo.addMember(space.id, req.user!.userId);
  res.json({ success: true, data: space });
}

export async function getSpace(req: Request, res: Response) {
  const membership = await requireMembership(req.params.id, req.user!.userId);
  if (!membership) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
  const space = await spacesRepo.findById(req.params.id, req.user!.userId);
  res.json({ success: true, data: space });
}

export async function leaveSpace(req: Request, res: Response) {
  const membership = await requireMembership(req.params.id, req.user!.userId);
  if (!membership) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
  await spacesRepo.leave(req.params.id, req.user!.userId);
  res.json({ success: true, data: null });
}

export async function updateSpace(req: Request, res: Response) {
  const membership = await requireMembership(req.params.id, req.user!.userId, 'manager');
  if (!membership) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
  const space = await spacesRepo.update(req.params.id, req.body);
  res.json({ success: true, data: space });
}

export async function listMembers(req: Request, res: Response) {
  const membership = await requireMembership(req.params.id, req.user!.userId, 'manager');
  if (!membership) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
  const members = await spacesRepo.getMembers(req.params.id);
  res.json({ success: true, data: members });
}

export async function updateMemberRole(req: Request, res: Response) {
  const membership = await requireMembership(req.params.id, req.user!.userId, 'manager');
  if (!membership) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
  await spacesRepo.updateMemberRole(req.params.id, req.params.userId, req.body.role);
  res.json({ success: true, data: null });
}

export async function removeMember(req: Request, res: Response) {
  const membership = await requireMembership(req.params.id, req.user!.userId, 'manager');
  if (!membership) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
  await spacesRepo.removeMember(req.params.id, req.params.userId);
  res.json({ success: true, data: null });
}

export async function deleteSpace(req: Request, res: Response) {
  const membership = await requireMembership(req.params.id, req.user!.userId, 'manager');
  if (!membership) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
  await spacesRepo.deleteSpace(req.params.id);
  res.json({ success: true, data: null });
}

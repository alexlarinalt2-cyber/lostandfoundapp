import type { Request, Response } from 'express';
import * as spacesRepo from './spaces.repository';
import { pool } from '../../config/db';

async function requireMembership(spaceId: string, userId: string, role?: 'manager') {
  const membership = await spacesRepo.getMembership(spaceId, userId);
  if (!membership) return null;
  if (role && membership.role !== role) return null;
  return membership;
}

export async function lookupSpace(req: Request, res: Response) {
  const code = ((req.query.code as string) ?? '').toUpperCase();
  if (!code) return res.status(400).json({ success: false, error: { message: 'code required' } });
  const space = await spacesRepo.findByInviteCode(code);
  if (!space) return res.status(404).json({ success: false, error: { message: 'Invalid invite code' } });
  // Return minimal info — don't leak full space data before joining
  res.json({ success: true, data: { id: space.id, name: space.name, type: space.type, member_count: space.member_count ?? 0 } });
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
  const space = await spacesRepo.findByInviteCode((req.body.inviteCode as string).toUpperCase());
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

export async function regenerateInviteCode(req: Request, res: Response) {
  const membership = await requireMembership(req.params.id, req.user!.userId, 'manager');
  if (!membership) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
  const space = await spacesRepo.regenerateInviteCode(req.params.id);
  res.json({ success: true, data: space });
}

export async function listSpaceClaims(req: Request, res: Response) {
  const membership = await requireMembership(req.params.id, req.user!.userId, 'manager');
  if (!membership) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });

  const { rows } = await pool.query(
    `SELECT c.*, u.display_name as claimant_name, u.email as claimant_email
     FROM claims c
     JOIN items i ON i.id = c.item_id
     JOIN users u ON u.id = c.claimant_id
     WHERE i.space_id = $1
     ORDER BY c.created_at DESC`,
    [req.params.id],
  );
  res.json({ success: true, data: rows });
}

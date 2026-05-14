import type { Request, Response } from 'express';
import * as itemsRepo from './items.repository';
import * as spacesRepo from '../spaces/spaces.repository';
import { uploadImage } from '../../services/storage.service';
import { emitToSpace } from '../../services/socket.service';
import type { CreateItemInput, UpdateItemInput, ListItemsQuery } from '@laf/shared';

async function requireSpaceMembership(spaceId: string, userId: string) {
  return spacesRepo.getMembership(spaceId, userId);
}

export async function listItems(req: Request, res: Response) {
  const { spaceId } = req.params;
  const membership = await requireSpaceMembership(spaceId, req.user!.userId);
  if (!membership) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });

  const result = await itemsRepo.listItems(spaceId, req.query as unknown as ListItemsQuery);
  res.json({ success: true, data: result });
}

export async function createItem(req: Request, res: Response) {
  const { spaceId } = req.params;
  const membership = await requireSpaceMembership(spaceId, req.user!.userId);
  if (!membership) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });

  const item = await itemsRepo.create(spaceId, req.user!.userId, req.body as CreateItemInput);

  try {
    const files = (req.files as Express.Multer.File[]) ?? [];
    if (files.length > 0 && env.CLOUDINARY_CLOUD_NAME) {
      const uploaded = await Promise.all(
        files.map((f, i) =>
          uploadImage(f.buffer, `lostandfound/${spaceId}`).then((r) => ({
            url: r.url,
            thumbnailUrl: r.thumbnailUrl,
            order: i,
          })),
        ),
      );
      await itemsRepo.addPhotos(item.id, uploaded);
    }
  } catch (err) {
    console.error('Photo upload failed, item saved without photos:', err);
  }

  let full = item;
  try {
    full = await itemsRepo.findById(item.id);
    emitToSpace(spaceId, 'item:new', full);
  } catch (err) {
    console.error('Post-creation fetch/emit failed:', err);
  }

  res.status(201).json({ success: true, data: full });
}

export async function getItem(req: Request, res: Response) {
  const item = await itemsRepo.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: { message: 'Item not found' } });
  const membership = await requireSpaceMembership(item.space_id, req.user!.userId);
  if (!membership) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });
  res.json({ success: true, data: item });
}

export async function updateItem(req: Request, res: Response) {
  const item = await itemsRepo.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: { message: 'Item not found' } });

  const membership = await requireSpaceMembership(item.space_id, req.user!.userId);
  if (!membership) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });

  const isOwnerOrManager = item.reported_by === req.user!.userId || membership.role === 'manager';
  if (!isOwnerOrManager) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });

  const updated = await itemsRepo.update(req.params.id, req.body as UpdateItemInput);
  emitToSpace(item.space_id, 'item:updated', updated);
  res.json({ success: true, data: updated });
}

export async function deleteItem(req: Request, res: Response) {
  const item = await itemsRepo.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, error: { message: 'Item not found' } });

  const membership = await requireSpaceMembership(item.space_id, req.user!.userId);
  if (!membership) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });

  const isOwnerOrManager = item.reported_by === req.user!.userId || membership.role === 'manager';
  if (!isOwnerOrManager) return res.status(403).json({ success: false, error: { message: 'Forbidden' } });

  await itemsRepo.remove(req.params.id);
  res.json({ success: true, data: null });
}

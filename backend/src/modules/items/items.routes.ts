import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../middleware/async.middleware';
import { upload } from '../../middleware/upload.middleware';
import { CreateItemSchema, UpdateItemSchema, ListItemsQuerySchema } from '@laf/shared';
import { listItems, createItem, getItem, updateItem, deleteItem } from './items.controller';

export const itemsRouter = Router();

itemsRouter.use(authenticate);
itemsRouter.get('/:spaceId/items', validate(ListItemsQuerySchema, 'query'), asyncHandler(listItems));
itemsRouter.post('/:spaceId/items', upload.array('photos', 3), validate(CreateItemSchema), asyncHandler(createItem));

export const itemDetailRouter = Router();
itemDetailRouter.use(authenticate);
itemDetailRouter.get('/:id', asyncHandler(getItem));
itemDetailRouter.patch('/:id', validate(UpdateItemSchema), asyncHandler(updateItem));
itemDetailRouter.delete('/:id', asyncHandler(deleteItem));

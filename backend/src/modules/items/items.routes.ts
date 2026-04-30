import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { upload } from '../../middleware/upload.middleware';
import { CreateItemSchema, UpdateItemSchema, ListItemsQuerySchema } from '@laf/shared';
import { listItems, createItem, getItem, updateItem, deleteItem } from './items.controller';

export const itemsRouter = Router();

itemsRouter.use(authenticate);
itemsRouter.get('/:spaceId/items', validate(ListItemsQuerySchema, 'query'), listItems);
itemsRouter.post('/:spaceId/items', upload.array('photos', 3), validate(CreateItemSchema), createItem);
itemsRouter.get('/items/:id', getItem);
itemsRouter.patch('/items/:id', validate(UpdateItemSchema), updateItem);
itemsRouter.delete('/items/:id', deleteItem);

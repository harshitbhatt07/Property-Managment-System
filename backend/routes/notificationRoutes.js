import { Router } from 'express';
import { list, remove } from '../controllers/notificationController.js';
import { adminOnly, protect } from '../middleware/auth.js';
const router=Router();router.use(protect,adminOnly);router.get('/',list);router.delete('/:id',remove);export default router;

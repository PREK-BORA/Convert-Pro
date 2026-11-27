import{Router}from'express';import{downloadNotFound}from'../controllers/downloadController.js';const router=Router();router.get('/:id',downloadNotFound);export default router;

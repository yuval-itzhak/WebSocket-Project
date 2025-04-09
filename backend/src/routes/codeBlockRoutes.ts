import express from 'express';
import { getAllCodeBlocks, getCodeBlockById } from '../controllers/codeBlockController';

const router = express.Router();

router.get('/codeBlocks', getAllCodeBlocks);
router.get('/codeBlocks/:id', getCodeBlockById);

export default router;

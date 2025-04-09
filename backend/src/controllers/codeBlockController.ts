import { Request, Response } from 'express';
import CodeBlock from '../models/CodeBlock';

export const getAllCodeBlocks = async (req: Request, res: Response) :Promise<any> => {
  try {
    const codeBlocks = await CodeBlock.find();
    res.json(codeBlocks);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

export const getCodeBlockById = async (req: Request, res: Response) :Promise<any> => {
  try {
    const codeBlock = await CodeBlock.findById(req.params.id);
    if (!codeBlock) {
      return res.status(404).send('Code block not found');
    }
    res.json(codeBlock);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

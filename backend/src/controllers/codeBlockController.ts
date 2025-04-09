import { Request, Response } from 'express';
import CodeBlock from '../models/CodeBlock';

//route to get all code blocks
export const getAllCodeBlocks = async (req: Request, res: Response) :Promise<any> => {
  try {
    const codeBlocks = await CodeBlock.find();
    res.json(codeBlocks);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

//route to get a code block by code block id
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

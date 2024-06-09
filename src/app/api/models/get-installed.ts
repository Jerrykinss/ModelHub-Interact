import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const modelDirectory = process.env.MODEL_DIRECTORY;
    const models = fs.readdirSync(modelDirectory).filter(file => fs.statSync(path.join(modelDirectory, file)).isDirectory());
    res.status(200).json(models);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get installed models', error });
  }
}

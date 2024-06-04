import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const modelsDirectory = path.join(process.cwd(), "models");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const files = fs.readdirSync(modelsDirectory);
    const folders = files.filter((file) => {
      return fs.statSync(path.join(modelsDirectory, file)).isDirectory();
    });
    res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ error: "Failed to read models directory" });
  }
}

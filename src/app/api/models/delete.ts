import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { modelName } = req.query;

  if (!modelName) {
    return res.status(400).json({ message: "Model name is required" });
  }

  try {
    const modelDirectory = process.env.MODEL_DIRECTORY;
    const modelPath = path.join(modelDirectory, modelName);
    if (fs.existsSync(modelPath)) {
      fs.rmdirSync(modelPath, { recursive: true });
      res.status(200).json({ message: "Model deleted successfully" });
    } else {
      res.status(404).json({ message: "Model not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to delete model", error });
  }
}

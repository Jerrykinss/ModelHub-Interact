import { NextApiRequest, NextApiResponse } from "next";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const getInitValue = (modelName, key) => {
  const modelDirectory = process.env.MODEL_DIRECTORY; // Set this in your .env.local
  const initFilePath = path.join(modelDirectory, modelName, "init/init.json");
  const init = JSON.parse(fs.readFileSync(initFilePath, "utf-8"));
  return init[key];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { modelName } = req.query;

  if (!modelName) {
    return res.status(400).json({ message: "Model name is required" });
  }

  try {
    const imageName = getInitValue(modelName as string, "docker_id");
    let containerId = null;
    for (let i = 0; i < 5; i++) {
      const dockerPsCommand = `docker ps -q --filter ancestor=${imageName}`;
      containerId = execSync(dockerPsCommand).toString().trim();
      if (containerId) break;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    if (containerId) {
      res.status(200).json({ containerId });
    } else {
      res.status(404).json({ message: "Container not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to get container ID", error });
  }
}

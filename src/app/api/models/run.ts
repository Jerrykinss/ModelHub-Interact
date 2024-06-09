import { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { modelName } = req.query;

  if (!modelName) {
    return res.status(400).json({ message: "Model name is required" });
  }

  try {
    const modelDirectory = process.env.MODEL_DIRECTORY; // Set this in your .env.local
    const command = `modelhub-run ${modelName}`;
    const options = { cwd: modelDirectory };

    const process = exec(command, options, (error, stdout, stderr) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Failed to run model", error, stdout, stderr });
      }
      res.status(200).json({ message: "Model is running", stdout, stderr });
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to run model", error });
  }
}

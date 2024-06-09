import { NextApiRequest, NextApiResponse } from "next";
import { execSync } from "child_process";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { containerId } = req.query;

  if (!containerId) {
    return res.status(400).json({ message: "Container ID is required" });
  }

  try {
    const dockerStopCommand = `docker stop ${containerId}`;
    execSync(dockerStopCommand);
    res.status(200).json({ message: "Model stopped successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to stop model", error });
  }
}

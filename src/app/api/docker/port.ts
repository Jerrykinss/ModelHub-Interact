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
    const dockerInspectCommand = `docker inspect ${containerId}`;
    const stdout = execSync(dockerInspectCommand).toString();
    const containerInfo = JSON.parse(stdout);
    const ports = containerInfo[0].NetworkSettings.Ports;

    let hostPort = null;
    for (const containerPort in ports) {
      if (ports[containerPort]) {
        hostPort = ports[containerPort][0].HostPort;
        break;
      }
    }

    if (!hostPort) {
      throw new Error("No port bindings found for the Docker container");
    }

    res.status(200).json({ port: `http://localhost:${hostPort}` });
  } catch (error) {
    res.status(500).json({ message: "Failed to get Docker port", error });
  }
}

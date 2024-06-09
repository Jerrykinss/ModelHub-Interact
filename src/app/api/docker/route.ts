import { NextApiRequest, NextApiResponse } from "next";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Function to get container ID
const getContainerId = (modelName: string) => {
  const modelDirectory = process.env.MODEL_DIRECTORY;
  const initFilePath = path.join(modelDirectory, modelName, "init/init.json");
  const init = JSON.parse(fs.readFileSync(initFilePath, "utf-8"));
  const imageName = init["docker_id"];

  let containerId = null;
  for (let i = 0; i < 5; i++) {
    const dockerPsCommand = `docker ps -q --filter ancestor=${imageName}`;
    containerId = execSync(dockerPsCommand).toString().trim();
    if (containerId) break;
  }
  return containerId;
};

// Function to get Docker port
const getDockerPort = (containerId: string) => {
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

  return `http://localhost:${hostPort}`;
};

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  const { action, modelName, containerId } = req.query;

  if (action === "getContainerId") {
    if (!modelName) {
      return res.status(400).json({ message: "Model name is required" });
    }
    try {
      const id = getContainerId(modelName as string);
      res.status(200).json({ containerId: id });
    } catch (error) {
      res.status(500).json({ message: "Failed to get container ID", error });
    }
  } else if (action === "getDockerPort") {
    if (!containerId) {
      return res.status(400).json({ message: "Container ID is required" });
    }
    try {
      const port = getDockerPort(containerId as string);
      res.status(200).json({ port });
    } catch (error) {
      res.status(500).json({ message: "Failed to get Docker port", error });
    }
  } else {
    res.status(400).json({ message: "Invalid action" });
  }
}

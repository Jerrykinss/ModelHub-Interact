import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { exec, execSync } from "child_process";

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

const getModelIndex = async () => {
  const indexUrl =
    "https://raw.githubusercontent.com/modelhub-ai/modelhub/master/models.json";
  const response = await axios.get(indexUrl);
  return response.data;
};

const listModels = async () => {
  const modelIndex = (await getModelIndex()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const modelList = {};
  modelIndex.forEach((element) => {
    modelList[element.name] = element.task_extended;
  });
  return modelList;
};

// Function to get installed models
const getInstalledModels = () => {
  const modelDirectory = process.env.MODEL_DIRECTORY;
  if (!modelDirectory) {
    throw new Error("MODEL_DIRECTORY environment variable is not set");
  }
  return fs
    .readdirSync(modelDirectory)
    .filter((file) =>
      fs.statSync(path.join(modelDirectory, file)).isDirectory(),
    );
};

// Function to delete a model
const deleteModel = (modelName: string) => {
  const modelDirectory = process.env.MODEL_DIRECTORY;
  if (!modelDirectory) {
    throw new Error("MODEL_DIRECTORY environment variable is not set");
  }
  const modelPath = path.join(modelDirectory, modelName);
  if (fs.existsSync(modelPath)) {
    fs.rmdirSync(modelPath, { recursive: true });
    return true;
  }
  return false;
};

// Function to run a model
const runModel = (modelName: string) => {
  const modelDirectory = process.env.MODEL_DIRECTORY;
  if (!modelDirectory) {
    throw new Error("MODEL_DIRECTORY environment variable is not set");
  }
  const command = `modelhub-run ${modelName}`;
  const options = { cwd: modelDirectory };

  return exec(command, options);
};

// Function to stop a model
const stopModel = (containerId: string) => {
  const dockerStopCommand = `docker stop ${containerId}`;
  execSync(dockerStopCommand);
};

// Function to get model info from index
const getModelInfoFromIndex = async (modelName: string) => {
  const models = await getModelIndex();
  return models.find((model) => model.name === modelName);
};

// Function to get init value (mock implementation)
const getInitValue = (modelName: string, key: string) => {
  // Mock implementation, replace with actual logic to retrieve init values
  return [];
};

const convertToGithubApiContentsReq = (srcDirUrl: string, branchId: string) => {
  const apiUrl = srcDirUrl.replace(
    "https://github.com",
    "https://api.github.com/repos",
  );
  return `${apiUrl}/contents?ref=${branchId}`;
};

const downloadGithubDir = async (
  srcDirUrl: string,
  branchId: string,
  destDir: string,
) => {
  const requestUrl = convertToGithubApiContentsReq(srcDirUrl, branchId);
  const response = await axios.get(requestUrl);

  if (!fs.existsSync(destDir)) {
    await mkdir(destDir, { recursive: true });
  }

  for (const element of response.data) {
    if (element.type === "file") {
      const srcFileUrl = element.download_url;
      const destFilePath = path.join(destDir, element.name);
      console.log(`${srcFileUrl} \n--> ${destFilePath}`);
      const fileResponse = await axios.get(srcFileUrl, {
        responseType: "arraybuffer",
      });
      await writeFile(destFilePath, fileResponse.data);
    } else if (element.type === "dir") {
      const nextSrcDirUrl = `${srcDirUrl}/${element.name}`;
      const nextDestDir = path.join(destDir, element.name);
      await downloadGithubDir(nextSrcDirUrl, branchId, nextDestDir);
    }
  }
};

const downloadExternalFiles = async (
  externalFiles: any[],
  modelDir: string,
) => {
  for (const element of externalFiles) {
    const srcFileUrl = element.src_url;
    const destFilePath = path.join(modelDir, element.dest_file_path.trim("/"));
    if (!fs.existsSync(path.dirname(destFilePath))) {
      await mkdir(path.dirname(destFilePath), { recursive: true });
    }
    console.log(`${srcFileUrl} \n--> ${destFilePath}`);
    const fileResponse = await axios.get(srcFileUrl, {
      responseType: "arraybuffer",
    });
    await writeFile(destFilePath, fileResponse.data);
  }
};

const downloadModel = async (modelName: string, destDir: string) => {
  const modelInfo = await getModelInfoFromIndex(modelName);
  const githubUrl = modelInfo.github;
  const githubBranchId = modelInfo.github_branch;
  await downloadGithubDir(githubUrl, githubBranchId, destDir);
  const externalContribFiles = getInitValue(
    modelName,
    "external_contrib_files",
  );
  await downloadExternalFiles(externalContribFiles, destDir);
};

export async function GET(req: NextRequest) {
  try {
    const models = await listModels();
    const installedModels = getInstalledModels();
    return NextResponse.json({ models, installedModels });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { message: "Failed to fetch model index", error },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const modelName = searchParams.get("modelName");

  if (!modelName) {
    return NextResponse.json(
      { message: "Model name is required" },
      { status: 400 },
    );
  }

  try {
    const success = deleteModel(modelName);
    if (success) {
      return NextResponse.json({ message: "Model deleted successfully" });
    } else {
      return NextResponse.json({ message: "Model not found" }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete model", error },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const { action, modelName, containerId } = await req.json();

  if (!modelName || !action) {
    return NextResponse.json(
      { message: "Model name and action are required" },
      { status: 400 },
    );
  }

  try {
    if (action === "run") {
      const process = runModel(modelName);
      return NextResponse.json({
        message: "Model is running",
        stdout: process.stdout,
        stderr: process.stderr,
      });
    } else if (action === "stop") {
      if (!containerId) {
        return NextResponse.json(
          { message: "Container ID is required to stop the model" },
          { status: 400 },
        );
      }
      stopModel(containerId);
      return NextResponse.json({ message: "Model stopped successfully" });
    } else if (action === "install") {
      const modelDirectory = process.env.MODEL_DIRECTORY;
      if (!modelDirectory) {
        throw new Error("MODEL_DIRECTORY environment variable is not set");
      }
      await downloadModel(modelName, modelDirectory);
      return NextResponse.json({ message: "Model installed successfully" });
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { message: `Failed to ${action} model`, error },
      { status: 500 },
    );
  }
}

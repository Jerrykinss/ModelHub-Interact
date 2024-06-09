import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { exec, execSync } from "child_process";

const getModelIndex = async () => {
  const indexUrl =
    "https://raw.githubusercontent.com/modelhub-ai/modelhub/master/models.json";
  const response = await fetch(indexUrl);
  const data = await response.json();
  return data;
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
  return fs
    .readdirSync(modelDirectory)
    .filter((file) =>
      fs.statSync(path.join(modelDirectory, file)).isDirectory(),
    );
};

// Function to delete a model
const deleteModel = (modelName: string) => {
  const modelDirectory = process.env.MODEL_DIRECTORY;
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
  const command = `modelhub-run ${modelName}`;
  const options = { cwd: modelDirectory };

  return exec(command, options);
};

// Function to stop a model
const stopModel = (containerId: string) => {
  const dockerStopCommand = `docker stop ${containerId}`;
  execSync(dockerStopCommand);
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

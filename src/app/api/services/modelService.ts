import axios from "axios";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { exec, execSync } from "child_process";

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

export const getModelIndex = async () => {
  const indexUrl =
    "https://raw.githubusercontent.com/modelhub-ai/modelhub/master/models.json";
  const response = await axios.get(indexUrl);
  return response.data;
};

export const listModels = async () => {
  const modelIndex = (await getModelIndex()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const modelList: { [key: string]: string } = {};
  modelIndex.forEach((element) => {
    modelList[element.name] = element.task_extended;
  });
  return modelList;
};

export const getInstalledModels = () => {
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

export const deleteModel = (modelName: string) => {
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

export const runModel = (modelName: string) => {
  const modelDirectory = process.env.MODEL_DIRECTORY;
  if (!modelDirectory) {
    throw new Error("MODEL_DIRECTORY environment variable is not set");
  }
  const command = `modelhub-run ${modelName}`;
  const options = { cwd: modelDirectory };

  return exec(command, options);
};

export const stopModel = (containerId: string) => {
  const dockerStopCommand = `docker stop ${containerId}`;
  execSync(dockerStopCommand);
};

export const getModelInfoFromIndex = async (modelName: string) => {
  const models = await getModelIndex();
  return models.find((model) => model.name === modelName);
};

export const getInitValue = (modelName: string, key: string) => {
  // Mock implementation, replace with actual logic to retrieve init values
  return [];
};

export const convertToGithubApiContentsReq = (
  srcDirUrl: string,
  branchId: string,
) => {
  const apiUrl = srcDirUrl.replace(
    "https://github.com",
    "https://api.github.com/repos",
  );
  return `${apiUrl}/contents?ref=${branchId}`;
};

export const downloadGithubDir = async (
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

export const downloadExternalFiles = async (
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

export const downloadModel = async (modelName: string, destDir: string) => {
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

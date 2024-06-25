import axios from "axios";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { exec, execSync } from "child_process";

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);

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

  const port = "-p 80:80 -p 8080:8080";
  const modelPath = path.join(modelDirectory, modelName);
  const contribSrcPath = path.resolve(modelPath, "contrib_src");
  const contribSrc = `-v "${contribSrcPath.replace(/\\/g, "/")}:/contrib_src"`;
  const dockerId = getInitValue(modelName, "docker_id", modelDirectory);

  const command = `docker run --rm ${port} ${contribSrc} ${dockerId}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

export const stopModel = (containerId: string) => {
  const dockerStopCommand = `docker stop ${containerId}`;
  execSync(dockerStopCommand);
};


export const convertToGithubApiContentsReq = (url: string, branchId: string): string => {
  const urlSplit = url.split("github.com");
  const repoParts = urlSplit[1].trim().split("/");

  let request = `${urlSplit[0]}api.github.com/repos/${repoParts[1]}/${repoParts[2]}/contents`;

  if (repoParts.length > 3) {
      const pathParts = repoParts.slice(3).join("/");
      request += `/${pathParts}`;
  }
  return request;
};

export const downloadGithubDir = async (srcDirUrl: string, branchId: string, destDir: string) => {
  const requestUrl = convertToGithubApiContentsReq(srcDirUrl, branchId);
  const response = await axios.get(requestUrl);
  const elements = response.data;

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  for (const element of elements) {
    if (element.type === "file") {
      const srcFileUrl = element.download_url;
      const destFilePath = path.join(destDir, element.name);
      console.log(`${srcFileUrl} --> ${destFilePath}`);
      const fileResponse = await axios.get(srcFileUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(destFilePath, fileResponse.data);
    } 
    else if (element.type === "dir") {
      const nextSrcDirUrl = `${srcDirUrl}/${element.name}`;
      const nextDestDir = path.join(destDir, element.name);
      await downloadGithubDir(nextSrcDirUrl, branchId, nextDestDir);
    }
  }
};

export const getModelIndex = async (): Promise<any[]> => {
  const indexUrl = "https://raw.githubusercontent.com/modelhub-ai/modelhub/master/models.json";
  try {
      const response = await axios.get(indexUrl);
      return response.data;
  } catch (error) {
      console.error(`Error fetching model index:`, error);
      throw error;
  }
};

export const getModelInfoFromIndex = async (modelName: string): Promise<any> => {
  try {
      const modelIndex = await getModelIndex();
      for (const element of modelIndex) {
          if (element.name === modelName) {
              return element;
          }
      }
      throw new Error(`Model "${modelName}" not found in online model index`);
  } catch (error) {
      console.error(`Error retrieving model info:`, error);
      throw error;
  }
};

export const getInitValue = (modelName: string, key: string, modelDir: string): any => {
  const initFilePath = path.join(modelDir, modelName, 'init/init.json');
  const fileContent = fs.readFileSync(initFilePath, 'utf-8');
  const init = JSON.parse(fileContent);
  return init[key];
};

interface ExternalFile {
  src_url: string;
  dest_file_path: string;
}

export const downloadExternalFiles = async (externalFiles: ExternalFile[], modelDir: string): Promise<void> => {
  for (const element of externalFiles) {
      const srcFileUrl = element.src_url;
      const destFilePath = path.join(modelDir, element.dest_file_path.trim());

      // Ensure the directory exists
      const destDir = path.dirname(destFilePath);
      if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
      }

      console.log(`${srcFileUrl} \n--> ${destFilePath}`);

      // Download the file and save it
      try {
          const response = await axios.get(srcFileUrl, { responseType: 'arraybuffer' });
          fs.writeFileSync(destFilePath, response.data);
      } catch (error) {
          console.error(`Error downloading file from ${srcFileUrl}:`, error);
          throw error; // Re-throw the error or handle it as needed
      }
  }
};

export const downloadModel = async (modelName: string, modelDir: string): Promise<void> => {
  try {
      const destDir = path.join(modelDir, modelName);
      const modelInfo = await getModelInfoFromIndex(modelName);
      const githubUrl = modelInfo.github;
      const githubBranchId = modelInfo.github_branch;

      await downloadGithubDir(githubUrl, githubBranchId, destDir);
      console.log("Done Github Files");

      const externalContribFiles: ExternalFile[] = getInitValue(modelName, 'external_contrib_files', modelDir);
      await downloadExternalFiles(externalContribFiles, destDir);
  } catch (error) {
      console.error(`Error downloading model ${modelName}:`, error);
      throw error; // Re-throw the error or handle it as needed
  }
};

import axios from "axios";
import fs from "fs";
import path from "path";
import { exec, execSync } from "child_process";
import { getModelInfoFromIndex } from '../utils/model-index';
import { getInitValue } from '../utils/model-init-value';
import { readModelDataFile, writeModelDataFile } from '@/utils/local-model-data-manager';

interface ExternalFile {
  src_url: string;
  dest_file_path: string;
}

export const getInstalledModels = () => {
    const modelData = readModelDataFile();
    return Object.keys(modelData);
};

export const deleteModel = (modelName: string) => {
    const modelDirectory = process.env.MODEL_DIRECTORY;
    if (!modelDirectory) {
        throw new Error("MODEL_DIRECTORY environment variable is not set");
    }
    const modelPath = path.join(modelDirectory, modelName);
    if (fs.existsSync(modelPath)) {
        fs.rmSync(modelPath, { recursive: true });
    }

    // Remove the model from the JSON file
    const modelData = readModelDataFile();
    if (modelData[modelName]) {
        delete modelData[modelName];
        writeModelDataFile(modelData);
    }
};

export const installModel = async (modelName: string, modelDir: string): Promise<void> => {
    const modelData = readModelDataFile();
    try {
        modelData[modelName] = { status: 'Downloading files' };
        writeModelDataFile(modelData);

        await installModelFiles(modelName, modelDir);

        modelData[modelName].status = 'Pulling Docker image';
        writeModelDataFile(modelData);

        await pullModelImage(modelName);

        modelData[modelName].status = 'Ready';
        writeModelDataFile(modelData);
    } catch (error) {
        console.error(`Error installing model ${modelName}:`, error);
        modelData[modelName].status = 'Install failed';
        throw error; // Re-throw the error or handle it as needed
    }
};

const installModelFiles = async (modelName: string, modelDir: string): Promise<void> => {
    const destDir = path.join(modelDir, modelName);
    const modelInfo = await getModelInfoFromIndex(modelName);
    const githubUrl = modelInfo.github;
    const githubBranchId = modelInfo.github_branch;

    await downloadGithubDir(githubUrl, githubBranchId, destDir);
    console.log("Done Github Files");

    const externalContribFiles: ExternalFile[] = getInitValue(modelName, 'external_contrib_files', modelDir);
    await downloadExternalFiles(externalContribFiles, destDir);
};

const downloadGithubDir = async (srcDirUrl: string, branchId: string, destDir: string) => {
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
            const fileResponse = await axios.get(srcFileUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(destFilePath, fileResponse.data);
        } else if (element.type === "dir") {
            const nextSrcDirUrl = `${srcDirUrl}/${element.name}`;
            const nextDestDir = path.join(destDir, element.name);
            await downloadGithubDir(nextSrcDirUrl, branchId, nextDestDir);
        }
    }
};

const convertToGithubApiContentsReq = (url: string, branchId: string): string => {
    const urlSplit = url.split("github.com");
    const repoParts = urlSplit[1].trim().split("/");

    let request = `${urlSplit[0]}api.github.com/repos/${repoParts[1]}/${repoParts[2]}/contents`;

    if (repoParts.length > 3) {
        const pathParts = repoParts.slice(3).join("/");
        request += `/${pathParts}`;
    }
    return request;
};

const downloadExternalFiles = async (externalFiles: ExternalFile[], modelDir: string): Promise<void> => {
    for (const element of externalFiles) {
        const srcFileUrl = element.src_url;
        const destFilePath = path.join(modelDir, element.dest_file_path.trim());

        // Ensure the directory exists
        const destDir = path.dirname(destFilePath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

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

const pullModelImage = (modelName: string) => {
    const modelDirectory = process.env.MODEL_DIRECTORY;
    if (!modelDirectory) {
        throw new Error("MODEL_DIRECTORY environment variable is not set");
    }

    const dockerId = getInitValue(modelName, "docker_id", modelDirectory);

    const command = `docker pull ${dockerId}`;

    return new Promise<void>((resolve, reject) => {
        console.log(`Executing command: ${command}`); // Log the command
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${stderr}`); // Log stderr
                reject(stderr);
            } else {
                console.log(`Command output: ${stdout}`); // Log stdout
                console.log(`Docker image pulled successfully`);
                resolve(); // Resolve the promise indicating success
            }
        });
    });
};

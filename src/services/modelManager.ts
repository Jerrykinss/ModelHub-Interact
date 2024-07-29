import path from "path";
import { exec, execSync } from "child_process";
import { getInitValue } from "../utils/model-init-value";
import { readModelDataFile, writeModelDataFile } from '@/utils/local-model-data-manager';;

export const startModel = (modelName: string) => {
    const modelDirectory = process.env.MODEL_DIRECTORY;
    if (!modelDirectory) {
        throw new Error("MODEL_DIRECTORY environment variable is not set");
    }

    const port = "-p 80:80 -p 8080:8080";
    const modelPath = path.join(modelDirectory, modelName);
    const contribSrcPath = path.resolve(modelPath, "contrib_src");
    const contribSrc = `-v "${contribSrcPath.replace(/\\/g, "/")}:/contrib_src"`;
    const dockerId = getInitValue(modelName, "docker_id", modelDirectory);

    const command = `docker run -d --rm ${port} ${contribSrc} ${dockerId}`;

    return new Promise<void>((resolve, reject) => {
        console.log(`Executing command: ${command}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${stderr}`);
                reject(stderr);
            } else {
                console.log(`Command output: ${stdout}`);
                const containerId = stdout.trim();
                console.log(`Container started with ID: ${containerId}`);
                
                const modelData = readModelDataFile();
                modelData[modelName].containerID = containerId;
                writeModelDataFile(modelData);
                
                resolve();
            }
        });
    });
};

export const stopModel = (modelName: string) => {
    const modelData = readModelDataFile();
    const modelInfo = modelData[modelName];

    if (!modelInfo || !modelInfo.containerID) {
        throw new Error(`No container ID found for model ${modelName}. Make sure the model is running.`);
    }
    
    const dockerStopCommand = `docker stop ${modelInfo.containerID}`;
    execSync(dockerStopCommand);
    
    delete modelInfo.containerID;
    writeModelDataFile(modelData);
};

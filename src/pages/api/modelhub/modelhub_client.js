const fetch = require('node-fetch');
const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = require('express')();

const getModelIndex = async () => {
    const indexUrl = "https://raw.githubusercontent.com/modelhub-ai/modelhub/master/models.json";
    const response = await fetch(indexUrl);
    const data = await response.json();
    return data;
};

const listModels = async () => {
    const modelIndex = (await getModelIndex()).sort((a, b) => a.name.localeCompare(b.name));
    const modelList = {};
    modelIndex.forEach(element => {
        modelList[element.name] = element.task_extended;
    });
    return modelList;
};

const getInitValue = (modelName, key) => {
    const modelDirectory = app.get('MODEL_DIRECTORY');
    const initFilePath = path.join(modelDirectory, modelName, 'init/init.json');
    const init = JSON.parse(fs.readFileSync(initFilePath, 'utf-8'));
    return init[key];
};

const getContainerId = async (modelName) => {
    const imageName = getInitValue(modelName, 'docker_id');
    for (let i = 0; i < 5; i++) {
        const dockerPsCommand = `docker ps -q --filter ancestor=${imageName}`;
        const containerId = execSync(dockerPsCommand).toString().trim();
        if (containerId) {
            return containerId;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    return null;
};

const getDockerPort = (containerId) => {
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

        return `http://localhost:${hostPort}`;
    } catch (error) {
        console.error(`Error getting Docker container info: ${error}`);
        return null;
    }
};

const runModelhubModel = async (modelName) => {
    try {
        const modelDirectory = app.get('MODEL_DIRECTORY');
        const command = `modelhub-run ${modelName}`;
        const options = { cwd: modelDirectory };

        const process = exec(command, options);
        return process;
    } catch (error) {
        return {
            error: error.message,
            stdout: error.stdout,
            stderr: error.stderr,
            exit_code: error.code
        };
    }
};

const stopModelhubModel = async (process, containerId) => {
    try {
        const dockerStopCommand = `docker stop ${containerId}`;
        execSync(dockerStopCommand);

        const stdout = process.stdout.read().toString();
        const stderr = process.stderr.read().toString();

        return {
            stdout: stdout,
            stderr: stderr,
            exit_code: process.exitCode
        };
    } catch (error) {
        return {
            error: error.message,
            stdout: error.stdout,
            stderr: error.stderr,
            exit_code: error.code
        };
    }
};

const predict = async (port, filepath) => {
    try {
        const apiUrl = `${port}/api/predict?fileurl=${filepath}`;
        const response = await fetch(apiUrl);
        if (response.ok) {
            return await response.json();
        } else {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error making prediction: ${error}`);
        throw error;
    }
};
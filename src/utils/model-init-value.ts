import fs from 'fs';
import path from 'path';

export const getInitValue = (modelName: string, key: string, modelDir: string): any => {
    const initFilePath = path.join(modelDir, modelName, 'init/init.json');
    const fileContent = fs.readFileSync(initFilePath, 'utf-8');
    const init = JSON.parse(fileContent);
    return init[key];
  };
import fs from 'fs';

const modelDataFilePath = './public/local-model-data.json';

// Helper function to read JSON file
export const readModelDataFile = () => {
    try {
        const data = fs.readFileSync(modelDataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {}; // Return an empty object if the file doesn't exist or there's an error
    }
};

// Helper function to write JSON file
export const writeModelDataFile = (data) => {
    fs.writeFileSync(modelDataFilePath, JSON.stringify(data, null, 2), 'utf8');
};
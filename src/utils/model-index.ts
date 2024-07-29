import axios from "axios";

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
            if (element.name === modelName.toLowerCase()) {
                return element;
            }
        }
        throw new Error(`Model "${modelName}" not found in online model index`);
    } catch (error) {
        console.error(`Error retrieving model info:`, error);
        throw error;
    }
};
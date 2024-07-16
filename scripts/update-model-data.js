const fs = require('fs');
const axios = require('axios');

console.log('Script started');
const filePath = './public/model-data.json';

// Function to get model index
const getModelIndex = async () => {
  const indexUrl = "https://raw.githubusercontent.com/modelhub-ai/modelhub/master/models.json";
  try {
    const response = await axios.get(indexUrl);
    const data = response.data.sort((a, b) => a.name.localeCompare(b.name));
    return data;
  } catch (error) {
    console.error(`Error fetching model index:`, error);
    throw error;
  }
};

// Function to get model data
const getModelData = async (model) => {
  const github = model.github;
  const githubUrlSplit = github.split("github.com");
  const repoParts = githubUrlSplit[1].trim().split("/");

  let url = `${githubUrlSplit[0]}api.github.com/repos/${repoParts[1]}/${repoParts[2]}/contents/contrib_src/model/config.json`;
  try {
    const response = await fetch(url);
    const responseData = await response.json();

    const content = Buffer.from(responseData.content, 'base64').toString('utf8');
    const configData = JSON.parse(content);

    return configData;
  } catch (error) {
    console.log(error);
    return ["", ""];
  }
};

// Main function to update the data file
const updateModelData = async () => {
  if (fs.existsSync(filePath)) {
    const jsonData = fs.readFileSync(filePath, 'utf8');
    let data = JSON.parse(jsonData);

    try {
      const models = await getModelIndex();
      for (const model of models) {
        if (!data.hasOwnProperty(model.name)) {
          const configData = await getModelData(model);
          data[model.name] = {
            configData
          };
        }
      }

      // Write the updated data back to the file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log('Data file checked and updated.');
    } catch (error) {
      console.error('Error updating model data:', error);
    }
  } else {
    console.error('Data file does not exist.');
  }
};

// Execute the update
updateModelData();

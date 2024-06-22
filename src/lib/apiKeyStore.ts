let apiKey = "";

export const setApiKey = (key: string) => {
  apiKey = key;
};

export const getApiKey = () => {
  return apiKey;
};

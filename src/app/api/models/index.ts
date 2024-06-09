import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

const getModelIndex = async () => {
  const indexUrl =
    "https://raw.githubusercontent.com/modelhub-ai/modelhub/master/models.json";
  const response = await fetch(indexUrl);
  const data = await response.json();
  return data;
};

const listModels = async () => {
  const modelIndex = (await getModelIndex()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const modelList = {};
  modelIndex.forEach((element) => {
    modelList[element.name] = element.task_extended;
  });
  return modelList;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    console.log("Request method:", req.method);
    if (req.method === "GET") {
      const models = await listModels();
      res.status(200).json(models);
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch model index", error });
  }
}

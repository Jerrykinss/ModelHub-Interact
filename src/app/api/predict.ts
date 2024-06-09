import { NextApiRequest, NextApiResponse } from "next";
import fetch from "node-fetch";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { port, filepath } = req.query;

  if (!port || !filepath) {
    return res.status(400).json({ message: "Port and filepath are required" });
  }

  try {
    const apiUrl = `${port}/api/predict?fileurl=${filepath}`;
    const response = await fetch(apiUrl);
    if (response.ok) {
      const data = await response.json();
      res.status(200).json(data);
    } else {
      res
        .status(response.status)
        .json({ message: `Error: ${response.statusText}` });
    }
  } catch (error) {
    res.status(500).json({ message: "Error making prediction", error });
  }
}

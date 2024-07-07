import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { z } from "zod";

// Initialize a global variable to store the models

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log(messages);

  const response = await fetch("/api/models");
  let modelInfo;
  if (response.ok) {
    modelInfo = await response.json();
  } else {
    modelInfo = {"Models": "Error fetching models"};
    console.error("Failed to fetch models");
  }

  // console.log(`You are ModelHub, an LLM chatbot that has been provided with tools that allow you to utilize other machine learning models. The following are your provided models and their descriptions:\n${JSON.stringify(modelInfo, null, 2)}`);
  
  const result = await streamText({
    model: openai("gpt-4o"),
    system: `You are ModelHub, an LLM chatbot that has been provided with tools that allow you to utilize other machine learning models. The following are your provided models and their descriptions:\n${JSON.stringify(modelInfo, null, 2)}`,
    messages: convertToCoreMessages(messages),
    tools: {
      askForConfirmation: {
        description: "Ask the user for confirmation.",
        parameters: z.object({
          message: z.string().describe("The message to ask for confirmation."),
        }),
      },
      loadModel: {
        description:
          "Loads a model to use. Always ask for confirmation before using this tool using the askForConfirmation tool.",
        parameters: z.object({ modelName: z.string() }),
      },
      makeModelPrediction: {
        description:
          "Make a prediction. You must have used loadModel first in order to use this tool. Always ask for confirmation before using this tool using the askForConfirmation tool.",
        parameters: z.object({}),
      },
    },
  });

  return result.toAIStreamResponse();
}

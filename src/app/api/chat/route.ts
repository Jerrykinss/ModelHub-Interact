import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { listModels } from "../services/modelService";
import { z } from "zod";

// Initialize a global variable to store the models
let cachedModels = null;

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  console.log(messages);

  // Check if models are already loaded
  if (!cachedModels) {
    cachedModels = await listModels();
  }

  // console.log(`You are ModelHub, an LLM chatbot that has been provided with tools that allow you to utilize other machine learning models. The following are your provided models and their descriptions:\n${JSON.stringify(cachedModels, null, 2)}`);
  
  const result = await streamText({
    model: openai("gpt-4o"),
    system: `You are ModelHub, an LLM chatbot that has been provided with tools that allow you to utilize other machine learning models. The following are your provided models and their descriptions:\n${JSON.stringify(cachedModels, null, 2)}`,
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

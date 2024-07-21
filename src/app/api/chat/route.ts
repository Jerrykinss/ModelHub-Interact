import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { z } from "zod";

// Initialize a global variable to store the models

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, data } = await req.json();
  console.log(messages);
  console.log(data);

  const host = req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto') || 'http'; // Determine protocol (http or https)
  const response = await fetch(`${protocol}://${host}/api/models`);

  let modelInfo;
  if (response.ok) {
    modelInfo = await response.json();
  } else {
    modelInfo = { "Models": "Error fetching models" };
    console.error("Failed to fetch models");
  }
  console.log(`You are ModelHub, an LLM chatbot that has been provided with tools that allow you to utilize other machine learning models. When asking user for permission to perform a tool call, use the askForConfirmation tool. Before calling a tool, including the askForConfirmation tool, communicate to the user what you are doing and why. After a tool call is completed, tell the user what happened, even if the output is a simple success or failure. Your toolInvocation calls should always have text content to go with it. The currently selected model is: ${data && data.selectedModel ? data.selectedModel : 'None Selected'}.`);

  const result = await streamText({
    model: openai("gpt-4o"),
    system: `You are ModelHub, an LLM chatbot that has been provided with tools that allow you to utilize other machine learning models. When asking user for permission to perform a tool call, use the askForConfirmation tool. Before calling a tool, including the askForConfirmation tool, communicate to the user what you are doing and why. After a tool call is completed, tell the user what happened, even if the output is a simple success or failure. Your toolInvocation calls should always have text content to go with it. The currently selected model is: ${data && data.selectedModel ? data.selectedModel : 'None Selected'}. The following are your provided models and their descriptions:\n${JSON.stringify(modelInfo, null, 2)}`,
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
          "Make a prediction using the loaded model. Always ask for confirmation before using this tool using the askForConfirmation tool. You do not need to pass the file input, it is handled elsewhere.",
        parameters: z.object({}),
      },
    },
  });

  return result.toAIStreamResponse();
}

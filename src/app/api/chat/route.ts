import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";
import { z } from "zod";

// Simple in-memory cache for storing the model info
let cachedModelInfo: any = null;

const getModelInfo = async (req: Request) => {
  if (cachedModelInfo) {
    return cachedModelInfo;
  }

  const host = req.headers.get('host');
  const protocol = req.headers.get('x-forwarded-proto') || 'http'; // Determine protocol (http or https)
  const response = await fetch(`${protocol}://${host}/api/model-data`);

  if (response.ok) {
    cachedModelInfo = await response.json();

    for (const modelKey in cachedModelInfo) {
      const model = cachedModelInfo[modelKey];

      if (model.configData) {
        delete model.configData.id;
        if (model.configData.meta) {
          delete model.configData.meta.data_source;
        }
        if (model.configData.publication) {
          delete model.configData.publication.url;
          delete model.configData.publication.google_scholar;
          delete model.configData.publication.bibtex;
        }
        if (model.configData.model) {
          delete model.configData.model.provenance;
          delete model.configData.model.io;
        }
        delete model.configData.modelhub;
      }
    }

    return cachedModelInfo;
  } else {
    console.error("Failed to fetch models");
    return { "Models": "Error fetching models" };
  }
};

export async function POST(req: Request) {
  const { messages, data } = await req.json();

  // Fetch model information, using cached version if available
  const modelInfo = await getModelInfo(req);
  const systemPrompt = `You are ModelHub, an LLM chatbot that has been provided with tools that allow you to utilize other machine learning models. Before all toolCalls, you must get permission from the user by using the askForConfirmation tool first. Do not ask in your message for permission, you must use your tool call. Never call two or more tools at a time. Confirmation cannot be received by user message, but must be from result of the askForConfirmation tool call. Before calling a tool, including the askForConfirmation tool, communicate to the user what you are doing and why. After a tool call is completed, tell the user what happened, even if the output is a simple success or failure. Your toolInvocation calls should always have text content to go with it. The currently selected model is: ${data && data.selectedModel ? data.selectedModel : 'None Selected'}. If a tool call was just made rather than a use message, this field will display 'None Selected' regardless if a model is loaded. Attached files by the user are the following:\n\n${data && data.attachedFiles ? JSON.stringify(data.attachedFiles, null, 2) : "No files attached."}\n The following are your provided models and their descriptions:\n${JSON.stringify(modelInfo, null, 2)}`

  console.log(JSON.stringify(messages, null, 2));
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }

  const result = await streamText({
    model: openai("gpt-4o-mini"),
    system: systemPrompt,
    messages: convertToCoreMessages(messages),
    tools: {
      askForConfirmation: {
        description: "Ask the user for confirmation.",
        parameters: z.object({
          message: z.string().describe("The message to ask for confirmation. Always use this before using other tools."),
        }),
      },
      loadModel: {
        description:
          "Loads a model to use. Always ask for confirmation using the askForConfirmation tool before using this tool.",
        parameters: z.object({ modelName: z.string() }),
      },
      stopModel: {
        description:
          "Stops a model from running. Always ask for confirmation using the askForConfirmation tool before using this tool .",
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

"use client";

import { ChatLayout } from "@/components/chat/chat-layout";
import { Message, useChat } from "ai/react";
import React, { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import UserForm from "@/components/windows/user-form";
import { useToast } from '@/components/ui/use-toast';

export default function Home() {
  const {
    messages = [],
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    setMessages,
    setInput,
    addToolResult,
  } = useChat({
    maxToolRoundtrips: 5,
    onResponse: (response) => {
      if (response) {
        setLoadingSubmit(false);
      }
    },
    onError: (error) => {
      setLoadingSubmit(false);
      toast( { description: "An error occurred. Please try again." });
    },
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === "loadModel") {
        console.log(toolCall);
        return loadOrInstallModel(toolCall);
      }
      if (toolCall.toolName === "makeModelPrediction") {
        console.log(toolCall);
        return predict(toolCall);
      }
      if (toolCall.toolName === "stopModel") {
        console.log(toolCall);
        return stopModel(toolCall);
      }
    },
  });

  const { toast } = useToast();
  const [chatId, setChatId] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [open, setOpen] = useState(false); // Default to false
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  useEffect(() => {
    toast({ description: "Test Toast..." });
  }, []);

  useEffect(() => {
    if (messages.length < 1) {
      console.log("Generating chat id");
      const id = uuidv4();
      setChatId(id);
    }
  }, [messages]);

  useEffect(() => {
    // Check if the dialog has been shown during this session
    const dialogShown = sessionStorage.getItem('dialogShown');
    if (!dialogShown) {
      setOpen(true); // Show the dialog if not shown
      sessionStorage.setItem('dialogShown', 'true'); // Set the flag in sessionStorage
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !error && chatId && messages.length > 0) {
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
      window.dispatchEvent(new Event("storage"));
    }
  }, [chatId, isLoading, error]);

  useEffect(() => {
    const fetchInstalledModels = async () => {
      try {
        const installedResponse = await fetch("/api/installed-models");
        if (installedResponse.ok) {
          const installedModels = await installedResponse.json();
          setInstalledModels(installedModels);
        } else {
          console.error("Failed to fetch models");
        }
      } catch (error) {
        console.error("Error fetching installed models");
      }
    };

    fetchInstalledModels();
  }, []);

  const onOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  const loadOrInstallModel = async (toolCall: any) => {
    if (toolCall.args) {
      const modelName = toolCall.args.modelName;
      if (!installedModels.includes(modelName)) {
        return installModel(modelName);
      }
      else { 
        return loadModels(modelName);
      }
    }
  };

  const loadModels = async (modelName: string) => {
    try {
      console.log("Loading Model");
      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "run", modelName }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Error: ${error.message}`);
      }

      setSelectedModel(modelName);
      const result = await response.json();
      console.log("Model loaded successfully:", result.result);
      return "Model installed successfully. Respond to user.";
    } catch (error) {
      console.error("Error:", error);
      return "Model failed to install. Respond to user.";
    }
  }

  const installModel = async (modelName: string) => {
    try {
      console.log("Installing Model:", modelName);
      installModelFiles(modelName);
      monitorModelStatus(modelName);
      return "Model was not downloaded. Model begun installation. Respond to user.";
    } catch (error) {
      console.error("Error:", error);
      return "Model was not downloaded. Model failed to install. Respond to user.";
    }
  }

  const installModelFiles = async (modelName: string) => {
    const response = await fetch("/api/installed-models", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ modelName: modelName }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to install model");
    }

    const result = await response.json();
    console.log("Model finished file installations:", result.result);
  };

  const checkModelStatus = async (modelName: string) => {
    const response = await fetch(`/api/model-status?modelName=${modelName}`);
    const data = await response.json();
  
    if (response.ok) {
      return { status: data.status };
    } else {
      return { error: data.error };
    }
  };
  
  const monitorModelStatus = async (modelName: string) => {
    let actionTakenForDownloading = false;
    let actionTakenForPulling = false;

    const checkStatus = async () => {
        const result = await checkModelStatus(modelName);

        if (result.error) {
            toast({ description: result.error });
            clearInterval(intervalId);
            return result.error;
        }

        const status = result.status;

        if (status === 'Downloading files' && !actionTakenForDownloading) {
            toast({ description: `Downloading files for ${modelName}...` });
            actionTakenForDownloading = true;
        } else if (status === 'Pulling Docker image' && !actionTakenForPulling) {
            toast({ description: `Pulling Docker image for ${modelName}...` });
            actionTakenForPulling = true;
        } else if (status === 'Ready') {
            toast({ description: `Model ${modelName} is now ready` });
            clearInterval(intervalId);
        } else if (status === 'Install failed') {
            toast({ description: `Model ${modelName} install failed` });
            clearInterval(intervalId);
        }
    };

    // Perform the first check immediately
    await checkStatus();

    // Set up the interval for subsequent checks
    const intervalId = setInterval(checkStatus, 5000);
};

  const predict = async (toolCall: any) => {
    console.log(attachedFiles);
    if (!selectedModel) {
      return "No models loaded";
    }
    if (!attachedFiles) {
      return "No files attached";
    }
    try {
      console.log("Predicting");
      const formData = new FormData();
      formData.append('file', attachedFiles[0]);
      console.log("Form data:", formData);
      const res = await fetch(`http://localhost:80/api/predict`, {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      console.log("Prediction result:", result);
      setAttachedFiles([]);
      return `The following is the results. Interpret it and provide your findings to the user:\n\n${JSON.stringify(result["output"])}`;
    } catch (error) {
      console.error("Error:", error);
      return "Failed to predict. Respond to user.";
    }
  }

  const stopModel = async (toolCall: any) => {
    if (!selectedModel) {
      return "No models loaded";
    }
    try {
      console.log("Stopping Model");
      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "stop", modelName: selectedModel }),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Error: ${error.message}`);
      }
  
      setSelectedModel("");
      const result = await response.json();
      console.log("Model stopped successfully:", result.result);
      return "Model stopped successfully. Respond to user.";
    } catch (error) {
      console.error("Error:", error);
      return "Model failed to stop. Respond to user.";
    }
  }

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center ">
      <Dialog open={open} onOpenChange={onOpenChange}>
        <ChatLayout
          chatId={chatId}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          messages={messages}
          input={input}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          loadingSubmit={loadingSubmit}
          error={error}
          stop={stop}
          formRef={formRef}
          setInput={setInput}
          setMessages={setMessages}
          addToolResult={addToolResult}
          installedModels={installedModels}
          setInstalledModels={setInstalledModels}
          attachedFiles={attachedFiles}
          setAttachedFiles={setAttachedFiles}
        />
        <DialogContent className="flex flex-col space-y-4">
          <DialogHeader className="space-y-2">
            <DialogTitle>Welcome to ModelHub!</DialogTitle>
            <UserForm setOpen={setOpen} />
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
}

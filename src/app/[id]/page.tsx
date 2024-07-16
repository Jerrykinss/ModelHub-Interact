"use client";

import { ChatLayout } from "@/components/chat/chat-layout";
import { Message, useChat } from "ai/react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Page({ params }: { params: { id: string } }) {
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
      toast.error("An error occurred. Please try again.");
    },
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === "loadModel") {
        console.log(toolCall);
        return loadModels(toolCall);
      }
      if (toolCall.toolName === "makeModelPrediction") {
        console.log(toolCall);
        return predict(toolCall);
      }
    },
  });

  const [chatId, setChatId] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  React.useEffect(() => {
    if (!isLoading && !error && chatId && messages.length > 0) {
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
      window.dispatchEvent(new Event("storage"));
    }
  }, [chatId, isLoading, error]);

  React.useEffect(() => {
    if (params.id) {
      const item = localStorage.getItem(`chat_${params.id}`);
      if (item) {
        setMessages(JSON.parse(item));
      }
    }
  }, []);

  const loadModels = async (toolCall: any) => {
    if (toolCall.args) {
      try {
        const modelName = toolCall.args.modelName;
        if (!installedModels.includes(modelName)) {
          console.log("Installing Model");
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
          const data = await response.json();
          setInstalledModels([...installedModels, modelName]);
          console.log("Model installed successfully:", data.message);
        }

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
        console.log("Model installed successfully:", result.result);
        return "Model installed successfully. Response to user.";
      } catch (error) {
        console.error("Error:", error);
        return "Model failed to install. Response to user.";
      }
    }
  }

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
      return JSON.stringify(result["output"]);
    } catch (error) {
      console.error("Error:", error);
      return "Failure";
    }
  }

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center ">
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
    </main>
  );
}

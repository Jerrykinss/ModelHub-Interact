"use client";

import { ChatLayout } from "@/components/chat/chat-layout";
import { Message, useChat } from "ai/react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import UserForm from "@/components/windows/user-form";

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
        if (toolCall.args) {
          try {
            const modelName = toolCall.args.modelName;
            if (!installedModels.includes(modelName)) {
              console.log("Installing Model");
              const response = await fetch("/api/models", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: "install", modelName }),
              });
        
              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to install model");
              }
        
              const data = await response.json();
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
            return "Success";
          } catch (error) {
            console.error("Error:", error);
            return "Failure";
          }
        }
      }
    },
  });
  const [chatId, setChatId] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [open, setOpen] = useState(true);
  const env = process.env.NODE_ENV;
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [installedModels, setInstalledModels] = useState<string[]>([]);

  useEffect(() => {
    if (messages.length < 1) {
      console.log("Generating chat id");
      const id = uuidv4();
      setChatId(id);
    }
  }, [messages]);

  React.useEffect(() => {
    if (!isLoading && !error && chatId && messages.length > 0) {
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
      window.dispatchEvent(new Event("storage"));
    }
  }, [chatId, isLoading, error]);

  const onOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

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
          open={open}
          setOpen={setOpen}
          addToolResult={addToolResult}
          installedModels={installedModels}
          setInstalledModels={setInstalledModels}
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

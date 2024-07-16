import React, { useState, useEffect, use } from "react";
import ChatTopbar from "./chat-topbar";
import ChatList from "./chat-list";
import ChatBottombar from "./chat-bottombar";
import { Message } from "ai/react";
import { ChatRequestOptions } from "ai";
import Sidebar from "../sidebar/sidebar";

export interface ChatProps {
  chatId: string;
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  messages: Message[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  isLoading: boolean;
  loadingSubmit?: boolean;
  error: undefined | Error;
  stop: () => void;
  formRef: React.RefObject<HTMLFormElement>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setMessages: (messages: Message[]) => void
  addToolResult: (result: { toolCallId: string; result: any }) => void;
  installedModels: string[];
  setInstalledModels: (models: string[]) => void;
  attachedFiles: File[];
  setAttachedFiles: (files: File[]) => void;
}

export function ChatLayout({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  error,
  stop,
  selectedModel,
  setSelectedModel,
  chatId,
  loadingSubmit,
  formRef,
  setInput,
  setMessages,
  addToolResult,
  installedModels,
  setInstalledModels,
  attachedFiles,
  setAttachedFiles,
}: ChatProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatListCollapsed, setIsChatListCollapsed] = useState(false);
  const [models, setModels] = React.useState<string[]>([]);


  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const modelsResponse = await fetch("/api/models");
        if (modelsResponse.ok) {
          const modelInfo = await modelsResponse.json();
          setModels(Object.keys(modelInfo));
        } else {
          console.error("Failed to fetch models");
        }
      } catch (error) {
        console.error("Error fetching models");
      }
    };

    fetchModels();
  }, []);

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


  return (
    <div className="relative flex h-full w-full">
      <div
        className={`fixed top-0 left-0 h-full transition-transform duration-200 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-[175px] lg:w-[275px]`}
      >
        <Sidebar
          chatId={chatId}
          isSidebarCollapsed={false}
          isChatListCollapsed={isChatListCollapsed}
          setIsChatListCollapsed={setIsChatListCollapsed}
          models={models}
          setMessages={setMessages}
          installedModels={installedModels}
          setInstalledModels={setInstalledModels}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
      </div>
      <div
        className={`flex flex-col justify-between w-full h-full transition-all duration-200 ${
          isSidebarOpen ? "ml-[175px] lg:ml-[275px]" : "ml-0"
        }`}
      >
        <div className="w-full px-0 md:px-6 mx-auto">
          <ChatTopbar
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            isLoading={isLoading}
            toggleSidebar={toggleSidebar}
            models={models}
            installedModels={installedModels}
            setInstalledModels={setInstalledModels}
          />
        </div>
        <div className="flex flex-col justify-between w-full max-w-4xl h-full mx-auto overflow-hidden">
          <ChatList
            messages={messages}
            handleInputChange={handleInputChange}
            isLoading={isLoading}
            loadingSubmit={loadingSubmit}
            formRef={formRef}
            addToolResult={addToolResult}
          />
          <ChatBottombar
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            setInput={setInput}
            selectedModel={selectedModel}
            attachedFiles={attachedFiles}
            setAttachedFiles={setAttachedFiles}
          />
        </div>
      </div>
    </div>
  );
}

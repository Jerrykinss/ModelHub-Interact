import React, { useState, useEffect } from "react";
import ChatTopbar from "./chat-topbar";
import ChatList from "./chat-list";
import ChatBottombar from "./chat-bottombar";
import { Message } from "ai/react";
import { ChatRequestOptions } from "ai";
import Sidebar from "../sidebar/sidebar";

export interface ChatProps {
  chatId?: string;
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
  setInput?: React.Dispatch<React.SetStateAction<string>>;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
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
  open,
  setOpen,
}: ChatProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatListCollapsed, setIsChatListCollapsed] = useState(false);
  const [isModelListCollapsed, setIsModelListCollapsed] = useState(true);
  const [models, setModels] = React.useState<string[]>([]);
  const [installedModels, setInstalledModels] = useState<string[]>([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("/api/models");
        if (response.ok) {
          const data = await response.json();
          const retrievedModels = Object.keys(data["models"]);
          const retrievedInstalledModels = data["installedModels"];
          setModels(retrievedModels);
          setInstalledModels(retrievedInstalledModels);
        } else {
          console.error("Failed to fetch models");
        }
      } catch (error) {
        console.error("Error fetching models");
      }
    };

    fetchModels();
  }, [isModelListCollapsed]);

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
          isModelListCollapsed={isModelListCollapsed}
          setIsModelListCollapsed={setIsModelListCollapsed}
          models={models}
          setMessages={setMessages}
          installedModels={installedModels}
          setInstalledModels={setInstalledModels}
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
            chatId={chatId}
            messages={messages}
            setMessages={setMessages}
            toggleSidebar={toggleSidebar}
            open={open}
            setOpen={setOpen}
          />
        </div>
        <div className="flex flex-col justify-between w-full max-w-4xl h-full mx-auto overflow-hidden">
          <ChatList
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
          />
          <ChatBottombar
            setSelectedModel={setSelectedModel}
            messages={messages}
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            stop={stop}
            formRef={formRef}
            setInput={setInput}
          />
        </div>
      </div>
    </div>
  );
}

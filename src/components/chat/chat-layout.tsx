import React, { useState, useEffect } from "react";
import ChatTopbar from "./chat-topbar";
import ChatList from "./chat-list";
import ChatBottombar from "./chat-bottombar";
import { Message } from "ai/react";
import { ChatRequestOptions } from "ai";
import Sidebar from "../sidebar/sidebar";

export interface ChatProps {
  chatId?: string;
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
}

export function ChatLayout({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  error,
  stop,
  setSelectedModel,
  chatId,
  loadingSubmit,
  formRef,
  setInput,
  setMessages,
}: ChatProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatListCollapsed, setIsChatListCollapsed] = useState(false);
  const [isModelListCollapsed, setIsModelListCollapsed] = useState(true);
  const [models, setModels] = React.useState<string[]>([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchAndSetModels = async () => {
      const models = await fetchModels();
      setModels(models);
    };

    fetchAndSetModels();
  }, []);

  const getModelIndex = async () => {
    const indexUrl =
      "https://raw.githubusercontent.com/modelhub-ai/modelhub/master/models.json";
    const response = await fetch(indexUrl);
    const data = await response.json();
    return data;
  };

  const fetchModels = async () => {
    const modelIndex = (await getModelIndex()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    const modelNames = modelIndex.map((element) => element.name);
    return modelNames;
  };

  return (
    <div className="relative flex h-full w-full">
      <div
        className={`fixed top-0 left-0 h-full transition-transform duration-200 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-[275px]`}
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
        />
      </div>
      <div
        className={`flex flex-col justify-between w-full h-full transition-all duration-200 ${
          isSidebarOpen ? "ml-[275px]" : "ml-0"
        }`}
      >
        <div className="w-full max-w-9xl mx-auto">
          <ChatTopbar
            setSelectedModel={setSelectedModel}
            isLoading={isLoading}
            chatId={chatId}
            messages={messages}
            setMessages={setMessages}
            toggleSidebar={toggleSidebar}
            models={models}
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

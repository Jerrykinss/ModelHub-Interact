"use client";

import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { Button } from "../ui/button";
import { CaretSortIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Sidebar } from "../sidebar";
import { Message } from "ai/react";
import { getSelectedModel } from "@/lib/model-helper";

interface ChatTopbarProps {
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  chatId?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<string>>;
}

export default function ChatTopbar({
  setSelectedModel,
  isLoading,
  chatId,
  setMessages,
}: ChatTopbarProps) {
  const [models, setModels] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [currentModel, setCurrentModel] = React.useState<string | null>(null);
  const [isChatListCollapsed, setIsChatListCollapsed] = useState(false);
  const [isModelListCollapsed, setIsModelListCollapsed] = useState(true);

  useEffect(() => {
    const fetchAndSetModels = async () => {
      setCurrentModel(getSelectedModel());
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

  const handleModelChange = (model: string) => {
    setCurrentModel(model);
    setSelectedModel(model);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedModel", model);
    }
    setOpen(false);
  };

  return (
    <div className="w-full flex px-4 py-6  items-center justify-between lg:justify-center ">
      <Sheet>
        <SheetTrigger>
          <HamburgerMenuIcon className="lg:hidden w-5 h-5" />
        </SheetTrigger>
        <SheetContent side="left">
          <Sidebar
            chatId={chatId || ""}
            isSidebarCollapsed={false}
            isChatListCollapsed={isChatListCollapsed}
            setIsChatListCollapsed={setIsChatListCollapsed}
            isModelListCollapsed={isModelListCollapsed}
            setIsModelListCollapsed={setIsModelListCollapsed}
            models={models}
            setMessages={setMessages}
          />
        </SheetContent>
      </Sheet>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            disabled={isLoading}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[300px] justify-between"
          >
            {currentModel || "Select model"}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-1 max-h-[200px] overflow-y-auto">
          {models.length > 0 ? (
            models.map((model) => (
              <Button
                key={model}
                variant="ghost"
                className="w-full"
                onClick={() => {
                  handleModelChange(model);
                }}
              >
                {model}
              </Button>
            ))
          ) : (
            <Button variant="ghost" disabled className=" w-full">
              No models available
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

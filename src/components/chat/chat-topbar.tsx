"use client";

import React, { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "../ui/button";
import { CaretSortIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import { Message } from "ai/react";
import { getSelectedModel } from "@/lib/model-helper";

interface ChatTopbarProps {
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  chatId?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<string>>;
  toggleSidebar: () => void;
  models: string[];
}

export default function ChatTopbar({
  setSelectedModel,
  isLoading,
  toggleSidebar,
  models,
}: ChatTopbarProps) {
  const [open, setOpen] = React.useState(false);
  const [currentModel, setCurrentModel] = React.useState<string | null>(null);

  const handleModelChange = (model: string) => {
    setCurrentModel(model);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedModel", model);
    }
    setOpen(false);
  };

  return (
    <div className="w-full flex px-4 py-6 items-center justify-between">
      <button onClick={toggleSidebar}>
        <HamburgerMenuIcon className="w-5 h-5" />
      </button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            disabled={isLoading}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[250px] justify-between"
          >
            {currentModel || "No model loaded"}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-1 max-h-[200px] overflow-y-auto">
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

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatTopbarProps {
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  chatId?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<string>>;
  toggleSidebar: () => void;
  models: string[];
}

export default function ChatTopbar({
  selectedModel,
  setSelectedModel,
  isLoading,
  toggleSidebar,
}: ChatTopbarProps) {
  const [open, setOpen] = React.useState(false);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedModel", model);
    }
    setOpen(false);
  };

  const handleStopModel = async () => {
    if (!selectedModel) return;
    try {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "stop",
          modelName: selectedModel,
          // Ensure you provide the containerId if required
          containerId: "your-container-id", // Replace with actual container ID
        }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Model stopped successfully", result);
        setSelectedModel(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("selectedModel");
        }
      } else {
        console.error("Failed to stop model", result);
      }
    } catch (error) {
      console.error("Error stopping model", error);
    }
  };

  return (
    <div className="w-full flex px-4 py-6 items-center justify-between">
      <button onClick={toggleSidebar}>
        <HamburgerMenuIcon className="w-5 h-5" />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={isLoading}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[250px] justify-between"
          >
            {selectedModel || "No model loaded"}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[250px] p-2">
          <DropdownMenuItem onSelect={handleStopModel}>
            Stop Model
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex justify-start gap-3 w-[200px] h-14 text-base font-normal items-center "
          >
            <Avatar className="flex justify-start items-center overflow-hidden">
              <AvatarImage
                src=""
                alt="AI"
                width={4}
                height={4}
                className="object-contain"
              />
              <AvatarFallback>
                {name && name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-xs truncate">
              {isLoading ? (
                <Skeleton className="w-20 h-4" />
              ) : (
                name || "Anonymous"
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    </div>
  );
}

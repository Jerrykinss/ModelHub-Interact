import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { CaretSortIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GearIcon } from "@radix-ui/react-icons";
import UserForm from "@/components/windows/user-form";
import ModelList from "@/components/windows/modellist";

interface ChatTopbarProps {
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  toggleSidebar: () => void;
  models: string[];
  installedModels: string[];
  setInstalledModels: (models: string[]) => void;
}

export default function ChatTopbar({
  selectedModel,
  setSelectedModel,
  isLoading,
  toggleSidebar,
  models,
  installedModels,
  setInstalledModels,
}: ChatTopbarProps) {
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedModel", model);
    }
  };

  useEffect(() => {
    localStorage.setItem("selectedModel", "alexnet");
    const fetchName = () => {
      const username = localStorage.getItem("user");
      if (username) {
        setName(username);
      }
    };
    fetchName();
    window.addEventListener("storage", fetchName);

    return () => {
      window.removeEventListener("storage", fetchName);
    };
  }, []);

  const onOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
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
          modelName: selectedModel
        }),
      });

      const result = await response.json();
      if (response.ok) {
        console.log("Model stopped successfully", result);
        setSelectedModel("");
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
      <div className="md:pr-[116px]">
        <Button
          variant="ghost"
          onClick={toggleSidebar}
          className="w-12 h-10 p-2 rounded-full flex items-center justify-center"
        >
          <HamburgerMenuIcon className="w-5 h-5" />
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={isLoading}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[250px] h-9 justify-between"
          >
            {selectedModel || "No model loaded"}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[250px]">
          {selectedModel ? (
            <DropdownMenuItem onSelect={handleStopModel}>
              <div className="flex w-full gap-2 p-1 h-4 items-center cursor-pointer">
                Stop Model
              </div>
            </DropdownMenuItem>
          ) : (
            <Dialog>
              <DialogTrigger className="w-full">
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <div className="flex w-full gap-2 p-1 h-4 items-center cursor-pointer">
                    Load Model
                  </div>
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader className="space-y-2">
                  <DialogTitle>Available Models</DialogTitle>
                  <ModelList
                    models={models}
                    installedModels={installedModels}
                    setInstalledModels={setInstalledModels}
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                  />
                </DialogHeader>
              </DialogContent>
            </Dialog>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex justify-start gap-3 w-[180px] h-14 text-base font-normal items-center "
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
            <div className="text-xs truncate">{name || "Anonymous"}</div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 p-2">
          <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger className="w-full">
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <div className="flex w-full gap-2 p-1 items-center cursor-pointer">
                  <GearIcon className="w-4 h-4" />
                  Settings
                </div>
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader className="space-y-4">
                <DialogTitle>Settings</DialogTitle>
                <UserForm setOpen={setOpen} />
              </DialogHeader>
            </DialogContent>
          </Dialog>
          <Dialog></Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

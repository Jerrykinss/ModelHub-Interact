import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GearIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import ModelList from "@/components/windows/modellist";

interface ModelBarProps {
  models: string[];
  installedModels: string[];
  setInstalledModels: (models: string[]) => void;
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
  installModelFiles: (modelName: string) => Promise<void>;
  monitorModelStatus: (modelName: string) => void;
}

export default function ModelBar({
  models,
  installedModels,
  setInstalledModels,
  selectedModel,
  setSelectedModel,
  installModelFiles,
  monitorModelStatus
}: ModelBarProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-xs flex justify-start gap-3 w-full h-14 font-normal items-center "
        >
          <Loader2 className="shrink-0 w-4 h-4 text-s" />
          Model List
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 p-2">
        <Dialog>
          <DialogTrigger className="w-full">
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <div className="flex w-full gap-2 p-1 items-center cursor-pointer">
                <GearIcon className="w-4 h-4" />
                Settings
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
                installModelFiles={installModelFiles}
                monitorModelStatus={monitorModelStatus}
              />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

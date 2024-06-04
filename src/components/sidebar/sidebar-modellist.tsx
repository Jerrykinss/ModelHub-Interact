import React, { useState } from "react";
import { GetServerSideProps } from "next";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import fs from "fs";
import path from "path";

interface ModelListProps {
  models: string[];
  selectedChatId: string;
  isModelListCollapsed: boolean;
  setIsModelListCollapsed: (isCollapsed: boolean) => void;
}

export default function ModelList({
  models,
  selectedChatId,
  isModelListCollapsed,
  setIsModelListCollapsed,
}: ModelListProps) {
  const [downloadedModels, setDownloadedModels] = useState<string[]>(models);
  console.log(downloadedModels);

  const handleUninstallModel = (model: string) => {
    const dirPath = path.join("@/models", model);
  };

  return (
    <div className="flex flex-col pt-10 gap-2">
      <div className="flex justify-between items-center">
        <p className="pl-4 text-sm text-muted-foreground">Models</p>
        <Button
          variant="ghost"
          className="flex items-center"
          onClick={() => setIsModelListCollapsed(!isModelListCollapsed)}
        >
          {isModelListCollapsed ? (
            <ChevronDown size={15} />
          ) : (
            <ChevronUp size={15} />
          )}
        </Button>
      </div>
      {!isModelListCollapsed && (
        <div>
          {models.length > 0 ? (
            models.map((model, index) => (
              <div
                key={index}
                className={cn(
                  {
                    [buttonVariants({ variant: "secondaryLink" })]:
                      model === selectedChatId,
                    [buttonVariants({ variant: "ghost" })]:
                      model !== selectedChatId,
                  },
                  "flex justify-between w-full h-10 text-base font-normal items-center",
                )}
              >
                <div className="flex gap-3 items-center truncate">
                  <div className="flex flex-col">
                    <span className="text-xs font-normal">{model}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex justify-end items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal size={15} className="shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full flex gap-2 hover:text-red-500 text-red-500 justify-start items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="shrink-0 w-4 h-4" />
                          Uninstall model
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader className="space-y-4">
                          <DialogTitle>Delete chat?</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to uninstall this model?
                          </DialogDescription>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline">Cancel</Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDeleteChat(chatId)}
                            >
                              Uninstall
                            </Button>
                          </div>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          ) : (
            <Button variant="ghost" disabled className="w-full">
              No models available
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

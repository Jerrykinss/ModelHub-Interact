import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, ArrowUpFromLine } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

interface InstalledModelListProps {
  models: string[];
  installedModels: string[];
  setInstalledModels: (models: string[]) => void;
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
}

export default function InstalledModelList({
  models,
  installedModels,
  setInstalledModels,
  selectedModel,
  setSelectedModel,
}: InstalledModelListProps) {
  const [modelToDelete, setModelToDelete] = useState<string>("");
  const [modelToLoad, setModelToLoad] = useState<string>("");

  const handleDeleteModel = async () => {
    try {
      const response = await fetch(`/api/models?modelName=${modelToDelete}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete model");
      }
      const data = await response.json();
      console.log("Model deleted successfully:", data.message);
      setInstalledModels(
        installedModels.filter((model) => model !== modelToDelete),
      );
      return data;
    } catch (error) {
      console.error("Error deleting model:", error);
      throw error;
    }
  };

  const handleLoadModel = async () => {
    const response = await fetch("/api/models", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "run", modelName: modelToLoad }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error: ${error.message}`);
    }

    setSelectedModel(modelToLoad);
    const data = await response.json();
    return data;
  };


  return (
    <>
      {installedModels.map((model, index) => (
        <div
          key={index}
          className="flex justify-between w-full h-10 text-base font-normal items-center"
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
                    className="w-full flex gap-2 justify-start items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModelToLoad(model);
                    }}
                  >
                    <ArrowUpFromLine className="shrink-0 w-4 h-4" />
                    Load model
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader className="space-y-4">
                    <DialogTitle>Load model?</DialogTitle>
                    <DialogDescription>
                      Load this model to use?
                    </DialogDescription>
                    <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="secondary" onClick={handleLoadModel}>
                        Load
                      </Button>
                    </DialogClose>
                    </div>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full flex gap-2 hover:text-red-500 text-red-500 justify-start items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      setModelToDelete(model);
                    }}
                  >
                    <Trash2 className="shrink-0 w-4 h-4" />
                    Uninstall model
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader className="space-y-4">
                    <DialogTitle>Delete model?</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to uninstall this model?
                    </DialogDescription>
                    <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="secondary" onClick={handleDeleteModel}>
                        Uninstall
                      </Button>
                    </DialogClose>
                    </div>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </>
  );
}

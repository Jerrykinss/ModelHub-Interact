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
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);

  const handleDeleteModel = async (modelName: string) => {
    try {
      const response = await fetch(`/api/models?modelName=${modelName}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete model");
      }
      const data = await response.json();
      console.log("Model deleted successfully:", data.message);
      setInstalledModels(
        installedModels.filter((model) => model !== modelName),
      );
      return data;
    } catch (error) {
      console.error("Error deleting model:", error);
      throw error;
    }
  };

  const handleLoadModel = async (modelName: string) => {
    const response = await fetch("/api/models", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "run", modelName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error: ${error.message}`);
    }

    const data = await response.json();
    return data;
  };

  const openDeleteDialog = (modelName: string) => {
    setModelToDelete(modelName);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setModelToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const confirmDeleteModel = async () => {
    if (modelToDelete) {
      await handleDeleteModel(modelToDelete);
      closeDeleteDialog();
    }
  };

  const openLoadDialog = (modelName: string) => {
    setSelectedModel(modelName);
    setIsLoadDialogOpen(true);
  };

  const closeLoadDialog = () => {
    setSelectedModel("");
    setIsLoadDialogOpen(false);
  };

  const confirmLoadModel = async () => {
    if (selectedModel) {
      await handleLoadModel(selectedModel);
      closeLoadDialog();
    }
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
              <Dialog
                open={isLoadDialogOpen}
                onOpenChange={setIsLoadDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full flex gap-2 justify-start items-center"
                    onClick={() => openLoadDialog(model)}
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
                      <Button variant="outline" onClick={closeLoadDialog}>
                        Cancel
                      </Button>
                      <Button variant="secondary" onClick={confirmLoadModel}>
                        Load
                      </Button>
                    </div>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
              <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full flex gap-2 hover:text-red-500 text-red-500 justify-start items-center"
                    onClick={() => openDeleteDialog(model)}
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
                      <Button variant="outline" onClick={closeDeleteDialog}>
                        Cancel
                      </Button>
                      <Button variant="secondary" onClick={confirmDeleteModel}>
                        Uninstall
                      </Button>
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

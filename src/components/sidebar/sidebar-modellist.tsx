import React, { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Trash2,
  Download,
} from "lucide-react";
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

interface ModelListProps {
  models: string[];
  selectedChatId: string;
  isModelListCollapsed: boolean;
  setIsModelListCollapsed: (isCollapsed: boolean) => void;
  installedModels: string[];
  setInstalledModels: (models: string[]) => void;
}

export default function ModelList({
  models,
  selectedChatId,
  isModelListCollapsed,
  setIsModelListCollapsed,
  installedModels,
  setInstalledModels,
}: ModelListProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<string | null>(null);
  const [modelToInstall, setModelToInstall] = useState<string | null>(null);

  const handleInstallModel = async (modelName: string): Promise<void> => {
    try {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "install", modelName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to install model");
      }

      const data = await response.json();
      console.log("Model installed successfully:", data.message);
    } catch (error) {
      console.error("Error installing model:", error);
    }
  };

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

  const openInstallDialog = (modelName: string) => {
    setModelToInstall(modelName);
    setIsInstallDialogOpen(true);
  };

  const closeInstallDialog = () => {
    setModelToInstall(null);
    setIsInstallDialogOpen(false);
  };

  const confirmInstallModel = async () => {
    if (modelToInstall) {
      await handleInstallModel(modelToInstall);
      closeInstallDialog();
    }
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
                    "text-muted-foreground": !installedModels.includes(model),
                  },
                  "flex justify-between w-full h-10 text-base font-normal items-center",
                )}
              >
                <div className="flex gap-3 items-center truncate">
                  <div className="flex flex-col">
                    <span className="text-xs font-normal">{model}</span>
                  </div>
                </div>
                {installedModels.includes(model) ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex justify-end items-center pr-0 pl-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal size={15} className="shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
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
                              <Button
                                variant="outline"
                                onClick={closeDeleteDialog}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={confirmDeleteModel}
                              >
                                Uninstall
                              </Button>
                            </div>
                          </DialogHeader>
                        </DialogContent>
                      </Dialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Dialog
                    open={isInstallDialogOpen}
                    onOpenChange={setIsInstallDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex justify-end items-center pr-0 pl-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download size={15} className="shrink-0" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader className="space-y-4">
                        <DialogTitle>Install model?</DialogTitle>
                        <DialogDescription>
                          Install this model and it's required files?
                        </DialogDescription>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={closeInstallDialog}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={confirmInstallModel}
                          >
                            Download
                          </Button>
                        </div>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                )}
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

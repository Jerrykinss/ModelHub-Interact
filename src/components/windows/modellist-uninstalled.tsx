import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UninstalledModelListProps {
  models: string[];
  installedModels: string[];
}

export default function UninstalledModelList({
  models,
  installedModels,
}: UninstalledModelListProps) {
  const [isInstallDialogOpen, setIsInstallDialogOpen] = useState(false);
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
    <>
      {models
        .filter((model) => !installedModels.includes(model))
        .map((model, index) => (
          <div
            key={index}
            className="flex justify-between w-full h-10 text-base font-normal items-center"
          >
            <div className="flex gap-3 items-center truncate">
              <div className="flex flex-col">
                <span className="text-xs font-normal text-muted-foreground">
                  {model}
                </span>
              </div>
            </div>
            <Dialog
              open={isInstallDialogOpen}
              onOpenChange={setIsInstallDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex justify-end items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={15} className="shrink-0" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader className="space-y-4">
                  <DialogTitle>Install model?</DialogTitle>
                  <DialogDescription>
                    Install this model and its required files?
                  </DialogDescription>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={closeInstallDialog}>
                      Cancel
                    </Button>
                    <Button variant="secondary" onClick={confirmInstallModel}>
                      Download
                    </Button>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        ))}
    </>
  );
}

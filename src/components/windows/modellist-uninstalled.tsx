import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose
} from "@/components/ui/dialog";

interface UninstalledModelListProps {
  models: string[];
  installedModels: string[];
  setInstalledModels: (models: string[]) => void;
}

export default function UninstalledModelList({
  models,
  installedModels,
  setInstalledModels,
}: UninstalledModelListProps) {
  const [modelToInstall, setModelToInstall] = useState<string>("");

  const handleInstallModel = async () => {
    try {
      const response = await fetch("/api/installed-models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "install", modelName: modelToInstall }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to install model");
      }
      setInstalledModels([...installedModels, modelToInstall]);

      const data = await response.json();
      console.log("Model installed successfully:", data.message);
    } catch (error) {
      console.error("Error installing model:", error);
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
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex justify-end items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModelToInstall(model);
                  }}
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
                    <DialogClose asChild>
                      <Button variant="outline">
                        Cancel
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="secondary" onClick={handleInstallModel}>
                        Download
                      </Button>
                    </DialogClose>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        ))}
    </>
  );
}

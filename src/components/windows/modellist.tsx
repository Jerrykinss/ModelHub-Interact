import React, { useState } from "react";
import InstalledModelList from "./modellist-installed";
import UninstalledModelList from "./modellist-uninstalled";
import { Button } from "@/components/ui/button";

interface ModelListProps {
  models: string[];
  installedModels: string[];
  setInstalledModels: (models: string[]) => void;
  selectedModel: string;
  setSelectedModel: React.Dispatch<React.SetStateAction<string>>;
}

export default function ModelList({
  models,
  installedModels,
  setInstalledModels,
  selectedModel,
  setSelectedModel,
}: ModelListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showInstalledOnly, setShowInstalledOnly] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredModels = models.filter(
    (model) =>
      model.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (!showInstalledOnly || installedModels.includes(model)),
  );

  return (
    <div className="flex flex-col pt-10 gap-2">
      <input
        type="text"
        placeholder="Search models"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-0 p-2 border text-sm text-muted-foreground rounded-md bg-accent"
      />
      <div className="mb-1 flex items-center p-2 pl-4 text-xs">
        <input
          type="checkbox"
          id="showInstalledOnly"
          checked={showInstalledOnly}
          onChange={(e) => setShowInstalledOnly(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="showInstalledOnly">Show installed models only</label>
      </div>
      <div
        style={{ maxHeight: "400px", minHeight: "300px", overflowY: "auto" }}
      >
        {filteredModels.length > 0 ? (
          <>
            <InstalledModelList
              models={filteredModels}
              installedModels={installedModels}
              setInstalledModels={setInstalledModels}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
            />
            <UninstalledModelList
              models={filteredModels}
              installedModels={installedModels}
              setInstalledModels={setInstalledModels}
            />
          </>
        ) : (
          <Button variant="ghost" disabled className="w-full">
            No models available
          </Button>
        )}
      </div>
    </div>
  );
}

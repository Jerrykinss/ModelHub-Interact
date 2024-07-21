"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "../ui/button";
import TextareaAutosize from "react-textarea-autosize";
import { StopIcon } from "@radix-ui/react-icons";
import { Mic, SendHorizonal, Paperclip, X } from "lucide-react";

export interface ChatBottombarProps {
  selectedModel: string;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  isLoading: boolean;
  stop: () => void;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  attachedFiles: File[];
  setAttachedFiles: (files: File[]) => void;
}

export default function ChatBottombar({
  selectedModel,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  setInput,
  attachedFiles,
  setAttachedFiles,
}: ChatBottombarProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const updatedInputRef = useRef('');

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files);
    setAttachedFiles((prevFiles: File[]) => [...prevFiles, ...files]);
  };

  const handleDetachFile = (fileName) => {
    setAttachedFiles((prevFiles) =>
      prevFiles.filter((file) => file.name !== fileName),
    );
  };

  useEffect(() => {
    console.log(attachedFiles);
  }, [attachedFiles]);

  const handleButtonClick = () => {
    document.getElementById("fileInput")?.click();
  };

  useEffect(() => {
    if (updatedInputRef.current !== '') {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>, { data: { selectedModel, attachedFiles } });
      setInput('');
      updatedInputRef.current = '';
    }
  }, [input]);
  
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit(e, { data: { selectedModel, attachedFiles } });
    setInput('');
  };

  return (
    <div className="p-4 pb-7 flex flex-col justify-between w-full items-center gap-2">
      <div className="w-full flex flex-col relative gap-2">
        {attachedFiles.length > 0 && (
          <div className="w-full flex flex-col gap-1 text-sm max-h-24 py-[4px] items-center resize-none overflow-x-hiden overflow-y-auto">
            {attachedFiles.map((file) => (
              <div
                key={file.name}
                className="w-full flex justify-center items-center gap-1"
              >
                <p className="text-blue-500 underline">{file.name}</p>
                <Button
                  className="shrink-0 rounded-full p-1"
                  variant="ghost"
                  size="iconSm"
                  onClick={() => handleDetachFile(file.name)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <form
          onSubmit={handleFormSubmit}
          className="w-full items-center flex relative gap-2"
        >
          <div className="absolute left-3 z-10">
            <Button
              className="shrink-0 rounded-full"
              variant="ghost"
              size="icon"
              onClick={handleButtonClick}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              style={{ display: "none" }}
              multiple
            />
          </div>
          <TextareaAutosize
            autoComplete="off"
            ref={inputRef}
            onKeyDown={handleKeyPress}
            onChange={handleInputChange}
            value={input}
            name="message"
            placeholder="Enter your prompt here"
            className="max-h-48 px-16 bg-accent py-[22px] text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full rounded-md flex items-center h-16 resize-none overflow-w-hidden overflow-y-auto"
          />
          {!isLoading ? (
            <div className="flex absolute right-3 items-center">
              <Button
                className="shrink-0 rounded-full"
                variant="ghost"
                size="icon"
                type="submit"
                disabled={isLoading || !input.trim()}
              >
                <SendHorizonal className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <div className="flex absolute right-3 items-center">
              <Button
                className="shrink-0 rounded-full"
                variant="ghost"
                size="icon"
                type="button"
                disabled
              >
                <Mic className="w-5 h-5" />
              </Button>
              <Button
                className="shrink-0 rounded-full"
                variant="ghost"
                size="icon"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  stop();
                }}
              >
                <StopIcon className="w-5 h-5" />
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

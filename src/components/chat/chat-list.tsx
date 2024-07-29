import { Message } from "ai/react";
import { ToolInvocation } from "ai";
import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { INITIAL_QUESTIONS } from "@/utils/initial-questions";
import { Button } from "../ui/button";
import ReactMarkdown from 'react-markdown';


interface ChatListProps {
  messages: Message[];
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  loadingSubmit?: boolean;
  formRef: React.RefObject<HTMLFormElement>;
  addToolResult: (result: { toolCallId: string; result: any }) => void;
}

export default function ChatList({
  messages,
  handleInputChange,
  isLoading,
  loadingSubmit,
  formRef,
  addToolResult,
}: ChatListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [name, setName] = React.useState<string>("");
  const [localStorageIsLoading, setLocalStorageIsLoading] =
    React.useState(true);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const username = localStorage.getItem("user");
    if (username) {
      setName(username);
      setLocalStorageIsLoading(false);
    }
  }, []);

  if (messages.length === 0) {
    return (
      <div className="w-full h-full flex justify-center items-center">
        <div className="relative flex flex-col gap-4 items-center justify-center w-full h-full">
          <div></div>
          <div className="flex flex-col gap-4 items-center">
            <p className="text-center text-lg text-muted-foreground">
              How can I help you today?
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="scroller"
      className="w-full overflow-y-auto overflow-x-hidden h-full justify-end"
    >
      <div className="w-full flex flex-col overflow-x-hidden overflow-y-hidden justify-end">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            layout
            className={cn(
              "flex flex-col gap-2 p-4 whitespace-pre-wrap",
              message.role === "user" ? "items-end" : "items-start",
            )}
          >
            <div className="flex gap-3 items-center">
              {message.role === "user" && (
                <div className="flex items-end gap-3">
                  <span className="bg-accent p-3 rounded-md max-w-xs sm:max-w-2xl overflow-x-auto">
                    {message.content}
                  </span>
                  <Avatar className="flex justify-start items-center overflow-hidden">
                    <AvatarImage
                      src="/"
                      alt="user"
                      width={6}
                      height={6}
                      className="object-contain"
                    />
                    <AvatarFallback>
                      {name && name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              {message.role === "assistant" && (
                <div className="flex items-end gap-2">
                  <Avatar className="flex justify-start items-center">
                    <AvatarImage
                      src="/"
                      alt="AI"
                      width={6}
                      height={6}
                      className="object-contain dark:invert"
                    />
                  </Avatar>
                  <div className="flex flex-col gap-2 bg-accent p-3 rounded-md max-w-xs sm:max-w-2xl overflow-x-auto">
                    <span>
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                      {isLoading && messages.indexOf(message) === messages.length - 1 && (
                        <span className="animate-pulse" aria-label="Typing">
                          ...
                        </span>
                      )}
                    </span>
                    {message.toolInvocations?.map((toolInvocation: ToolInvocation) => {
                      const toolCallId = toolInvocation.toolCallId;

                      // Render confirmation tool (client-side tool with user interaction)
                      if (toolInvocation.toolName === "askForConfirmation") {
                        return (
                          <div key={toolCallId} className="text-muted-foreground">
                            {toolInvocation.args.message}
                            <div className="flex flex-col gap-2 mt-4">
                              {"result" in toolInvocation ? (
                                <b>{toolInvocation.result}</b>
                              ) : (
                                <div className="flex gap-2">
                                  <Button
                                    className="px-4 py-2 font-bold"
                                    variant="secondary"
                                    onClick={() =>
                                      addToolResult({
                                        toolCallId,
                                        result: "Yes, confirmed.",
                                      })
                                    }
                                  >
                                    Yes
                                  </Button>
                                  <Button
                                    className="px-4 py-2 font-bold"
                                    variant="outline"
                                    onClick={() =>
                                      addToolResult({
                                        toolCallId,
                                        result: "No, denied.",
                                      })
                                    }
                                  >
                                    No
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // Other tools:
                      return "result" in toolInvocation ? (
                        <div key={toolCallId} className="text-muted-foreground">
                          Tool call {`${toolInvocation.toolName}: Complete`}
                        </div>
                      ) : (
                        <div key={toolCallId} className="text-muted-foreground">
                          Calling {toolInvocation.toolName}...
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {loadingSubmit && (
          <div className="flex pl-4 pb-4 gap-2 items-center">
            <Avatar className="flex justify-start items-center">
              <AvatarImage
                src="/ollama.png"
                alt="AI"
                width={6}
                height={6}
                className="object-contain dark:invert"
              />
            </Avatar>
            <div className="bg-accent p-3 rounded-md max-w-xs sm:max-w-2xl overflow-x-auto">
              <div className="flex gap-1">
                <span className="size-1.5 rounded-full bg-slate-700 motion-safe:animate-[bounce_1s_ease-in-out_infinite] dark:bg-slate-300"></span>
                <span className="size-1.5 rounded-full bg-slate-700 motion-safe:animate-[bounce_0.5s_ease-in-out_infinite] dark:bg-slate-300"></span>
                <span className="size-1.5 rounded-full bg-slate-700 motion-safe:animate-[bounce_1s_ease-in-out_infinite] dark:bg-slate-300"></span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div id="anchor" ref={bottomRef}></div>
    </div>
  );
}

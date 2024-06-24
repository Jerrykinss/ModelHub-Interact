import { Message } from "ai/react";
import { ToolInvocation } from "ai";
import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { INITIAL_QUESTIONS } from "@/utils/initial-questions";
import { Button } from "../ui/button";

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
  const [initialQuestions, setInitialQuestions] = React.useState<Message[]>([]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const username = localStorage.getItem("ollama_user");
    if (username) {
      setName(username);
      setLocalStorageIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch 4 initial questions
    if (messages.length === 0) {
      setInitialQuestions(
        INITIAL_QUESTIONS.sort(() => Math.random() - 0.5)
          .slice(0, 2)
          .map((message) => {
            return {
              id: "1",
              role: "user",
              content: message.content,
            };
          }),
      );
    }
  }, [messages.length]);

  const onClickQuestion = (value: string, e: React.MouseEvent) => {
    e.preventDefault();

    handleInputChange({
      target: { value },
    } as React.ChangeEvent<HTMLTextAreaElement>);

    setTimeout(() => {
      formRef.current?.dispatchEvent(
        new Event("submit", {
          cancelable: true,
          bubbles: true,
        }),
      );
    }, 1);
  };

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

          <div className="absolute bottom-3 w-full px-4 sm:max-w-3xl grid gap-2 sm:grid-cols-2 sm:gap-4 text-sm">
            {/* Only display 4 random questions */}
            {initialQuestions.length > 0 &&
              initialQuestions.map((message) => {
                return (
                  <Button
                    key={message.content}
                    type="button"
                    variant="outline"
                    className="sm:text-start px-4 py-8 flex w-full justify-center sm:justify-start items-center text-sm whitespace-pre-wrap"
                    onClick={(e) => onClickQuestion(message.content, e)}
                  >
                    {message.content}
                  </Button>
                );
              })}
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
                  <span className="bg-accent p-3 rounded-md max-w-xs sm:max-w-2xl overflow-x-auto">
                    {message.content}
                    {isLoading &&
                      messages.indexOf(message) === messages.length - 1 && (
                        <span className="animate-pulse" aria-label="Typing">
                          ...
                        </span>
                      )}
                  </span>
                  {message.toolInvocations?.map(
                    (toolInvocation: ToolInvocation) => {
                      const toolCallId = toolInvocation.toolCallId;

                      // render confirmation tool (client-side tool with user interaction)
                      if (toolInvocation.toolName === "askForConfirmation") {
                        return (
                          <div key={toolCallId} className="text-gray-500">
                            {toolInvocation.args.message}
                            <div className="flex gap-2">
                              {"result" in toolInvocation ? (
                                <b>{toolInvocation.result}</b>
                              ) : (
                                <>
                                  <button
                                    className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700"
                                    onClick={() =>
                                      addToolResult({
                                        toolCallId,
                                        result: "Yes, confirmed.",
                                      })
                                    }
                                  >
                                    Yes
                                  </button>
                                  <button
                                    className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700"
                                    onClick={() =>
                                      addToolResult({
                                        toolCallId,
                                        result: "No, denied",
                                      })
                                    }
                                  >
                                    No
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // other tools:
                      return "result" in toolInvocation ? (
                        <div key={toolCallId} className="text-gray-500">
                          Tool call {`${toolInvocation.toolName}: `}
                          {toolInvocation.result}
                        </div>
                      ) : (
                        <div key={toolCallId} className="text-gray-500">
                          Calling {toolInvocation.toolName}...
                        </div>
                      );
                    },
                  )}
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

"use client";

import { ChatLayout } from "@/components/chat/chat-layout";
import { getSelectedModel } from "@/lib/model-helper";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import { ChatRequestOptions } from "ai";
import { Message, useChat } from "ai/react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const {
    messages = [],
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
    setMessages,
    setInput,
  } = useChat({
    onResponse: (response) => {
      if (response) {
        setLoadingSubmit(false);
      }
    },
    onError: (error) => {
      setLoadingSubmit(false);
      toast.error("An error occurred. Please try again.");
    },
  });
  const [chatId, setChatId] = React.useState<string>("");
  const [selectedModel, setSelectedModel] =
    React.useState<string>(getSelectedModel());
  const [open, setOpen] = React.useState(false);
  const [ollama, setOllama] = useState<ChatOllama>();
  const env = process.env.NODE_ENV;
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (messages.length < 1) {
      // Generate a random id for the chat
      console.log("Generating chat id");
      const id = uuidv4();
      setChatId(id);
    }
  }, [messages]);

  React.useEffect(() => {
    if (!isLoading && !error && chatId && messages.length > 0) {
      // Save messages to local storage
      localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
      // Trigger the storage event to update the sidebar component
      window.dispatchEvent(new Event("storage"));
    }
  }, [chatId, isLoading, error]);

  useEffect(() => {
    if (env === "production") {
      const newOllama = new ChatOllama({
        baseUrl: process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434",
        model: selectedModel,
      });
      setOllama(newOllama);
    }

    if (!localStorage.getItem("ollama_user")) {
      setOpen(true);
    }
  }, [selectedModel]);

  const addMessage = (Message: any) => {
    messages.push(Message);
    window.dispatchEvent(new Event("storage"));
    setMessages([...messages]);
  };

  // Function to handle chatting with Ollama in production (client side)
  const handleSubmitProduction = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    addMessage({ role: "user", content: input, id: chatId });
    setInput("");

    if (ollama) {
      try {
        const parser = new BytesOutputParser();

        const stream = await ollama
          .pipe(parser)
          .stream(
            (messages as Message[]).map((m) =>
              m.role == "user"
                ? new HumanMessage(m.content)
                : new AIMessage(m.content),
            ),
          );

        const decoder = new TextDecoder();

        let responseMessage = "";
        for await (const chunk of stream) {
          const decodedChunk = decoder.decode(chunk);
          responseMessage += decodedChunk;
          setLoadingSubmit(false);
          setMessages([
            ...messages,
            { role: "assistant", content: responseMessage, id: chatId },
          ]);
        }
        addMessage({ role: "assistant", content: responseMessage, id: chatId });
        setMessages([...messages]);

        localStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
        // Trigger the storage event to update the sidebar component
        window.dispatchEvent(new Event("storage"));
      } catch (error) {
        toast.error("An error occurred. Please try again.");
        setLoadingSubmit(false);
      }
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingSubmit(true);

    setMessages([...messages]);

    // Prepare the options object with additional body data, to pass the model.
    const requestOptions: ChatRequestOptions = {
      options: {
        body: {
          selectedModel: selectedModel,
        },
      },
    };

    if (env === "production") {
      handleSubmitProduction(e);
    } else {
      // Call the handleSubmit function with the options
      handleSubmit(e, requestOptions);
    }
  };

  const getLocalstorageChats = (): String[] => {
    const chats = Object.keys(localStorage).filter((key) =>
      key.startsWith("chat_"),
    );
    return chats;
  };

  useEffect(() => {
    if (getLocalstorageChats().length < 2 && messages.length < 2) {
      console.log("print messages");
      addMessage({
        role: "user",
        content: "userMessage\n\n\n\n\n\n\n\n\\n\n\n\n\n\n\n\n\n",
        id: chatId,
      });
      addMessage({
        role: "assistant",
        content: "responseMessage\n\n\n\n\n\n\n\n\\n\n\n\n\n\n\n\n\n",
        id: chatId,
      });
    }
  }, []);

  return (
    <main className="flex h-[calc(100dvh)] flex-col items-center ">
      <ChatLayout
        chatId={chatId}
        setSelectedModel={setSelectedModel}
        messages={messages}
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        loadingSubmit={loadingSubmit}
        error={error}
        stop={stop}
        formRef={formRef}
        setInput={setInput}
        setMessages={setMessages}
      />
    </main>
  );
}

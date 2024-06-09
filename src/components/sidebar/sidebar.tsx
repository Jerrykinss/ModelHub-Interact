import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ChatList from "./sidebar-chatlist";
import ModelList from "./sidebar-modellist";
import { SquarePen } from "lucide-react";

interface SidebarProps {
  isSidebarCollapsed: boolean;
  chatId: string;
  setMessages: (messages: Message[]) => void;
  isChatListCollapsed: boolean;
  setIsChatListCollapsed: (isCollapsed: boolean) => void;
  isModelListCollapsed: boolean;
  setIsModelListCollapsed: (isCollapsed: boolean) => void;
  models: string[];
  installedModels: string[];
  setInstalledModels: (models: string[]) => void;
}

export default function Sidebar({
  isSidebarCollapsed,
  chatId,
  setMessages,
  isChatListCollapsed,
  setIsChatListCollapsed,
  isModelListCollapsed,
  setIsModelListCollapsed,
  models,
  installedModels,
  setInstalledModels,
}: SidebarProps) {
  const router = useRouter();
  const [localChats, setLocalChats] = useState<
    { chatId: string; messages: Message[] }[]
  >([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    if (chatId) {
      setSelectedChatId(chatId);
    }

    setLocalChats(getLocalStorageChats());
    const handleStorageChange = () => {
      setLocalChats(getLocalStorageChats());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const getLocalStorageChats = (): {
    chatId: string;
    messages: Message[];
  }[] => {
    const chats = Object.keys(localStorage).filter((key) =>
      key.startsWith("chat_"),
    );

    const chatObjects = chats.map((chat) => {
      const item = localStorage.getItem(chat);
      return item
        ? { chatId: chat, messages: JSON.parse(item) }
        : { chatId: "", messages: [] };
    });

    chatObjects.sort((a, b) => {
      const aDate = new Date(a.messages[0].createdAt);
      const bDate = new Date(b.messages[0].createdAt);
      return bDate.getTime() - aDate.getTime();
    });

    return chatObjects;
  };

  return (
    <div
      data-collapsed={isSidebarCollapsed}
      className="relative justify-between group bg-card flex flex-col h-full gap-4 p-2 data-[collapsed=true]:p-2"
    >
      <div className="flex flex-col justify-between p-2 max-h-fit overflow-y-auto">
        <Button
          onClick={() => {
            router.push("/");
            setMessages([]);
          }}
          variant="ghost"
          className="flex justify-between w-full h-14 text-sm xl:text-lg font-normal items-center"
        >
          <div className="flex gap-3 items-center">New chat</div>
          <SquarePen size={18} className="shrink-0 w-4 h-4" />
        </Button>

        <ChatList
          localChats={localChats}
          selectedChatId={chatId}
          isChatListCollapsed={isChatListCollapsed}
          setIsChatListCollapsed={setIsChatListCollapsed}
          setLocalChats={setLocalChats}
          getLocalStorageChats={getLocalStorageChats}
        />

        <ModelList
          models={models}
          selectedChatId={chatId}
          isModelListCollapsed={isModelListCollapsed}
          setIsModelListCollapsed={setIsModelListCollapsed}
          installedModels={installedModels}
          setInstalledModels={setInstalledModels}
        />
      </div>
    </div>
  );
}

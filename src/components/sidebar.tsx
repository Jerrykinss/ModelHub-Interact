import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  SquarePen,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Message } from "ai/react";
import { useLocalStorageData } from "@/app/hooks/useLocalStorageData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface SidebarProps {
  isSidebarCollapsed: boolean;
  messages: Message[];
  onClick?: () => void;
  isMobile: boolean;
  chatId: string;
  setMessages: (messages: Message[]) => void;
  isChatListCollapsed: boolean;
  setIsChatListCollapsed: (isSidebarCollapsed: boolean) => void;
  isModelListCollapsed: boolean;
  setIsModelListCollapsed: (isSidebarCollapsed: boolean) => void;
  models: string[];
}

export function Sidebar({
  isSidebarCollapsed,
  chatId,
  setMessages,
  isChatListCollapsed,
  setIsChatListCollapsed,
  isModelListCollapsed,
  setIsModelListCollapsed,
  models,
}: SidebarProps) {
  const [localChats, setLocalChats] = useState<
    { chatId: string; messages: Message[] }[]
  >([]);
  const localChatss = useLocalStorageData("chat_", []);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (chatId) {
      setSelectedChatId(chatId);
    }

    setLocalChats(getLocalstorageChats());
    const handleStorageChange = () => {
      setLocalChats(getLocalstorageChats());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (chatId) {
      setSelectedChatId(chatId);
    }

    setLocalChats(getLocalstorageChats());
    const handleStorageChange = () => {
      setLocalChats(getLocalstorageChats());
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const getLocalstorageChats = (): {
    chatId: string;
    messages: Message[];
  }[] => {
    const chats = Object.keys(localStorage).filter((key) =>
      key.startsWith("chat_"),
    );

    if (chats.length === 0) {
      setIsLoading(false);
    }

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

    setIsLoading(false);
    return chatObjects;
  };

  const handleDeleteChat = (chatId: string) => {
    localStorage.removeItem(chatId);
    setLocalChats(getLocalstorageChats());
  };

  return (
    <div
      data-collapsed={isSidebarCollapsed}
      className="relative justify-between group lg:bg-accent/20 lg:dark:bg-card/35 flex flex-col h-full gap-4 p-2 data-[collapsed=true]:p-2 "
    >
      <div className="flex flex-col justify-between p-2 max-h-fit overflow-y-auto">
        <Button
          onClick={() => {
            router.push("/");
            setMessages([]);
          }}
          variant="ghost"
          className="flex justify-between w-full h-14 text-sm xl:text-lg font-normal items-center "
        >
          <div className="flex gap-3 items-center">New chat</div>
          <SquarePen size={18} className="shrink-0 w-4 h-4" />
        </Button>

        <div className="flex flex-col pt-10 gap-2">
          <div className="flex justify-between items-center">
            <p className="pl-4 text-sm text-muted-foreground">Your chats</p>
            <Button
              variant="ghost"
              className="flex items-center"
              onClick={() => setIsChatListCollapsed(!isChatListCollapsed)}
            >
              {isChatListCollapsed ? (
                <ChevronDown size={15} />
              ) : (
                <ChevronUp size={15} />
              )}
            </Button>
          </div>
          {!isChatListCollapsed && (
            <div>
              {localChats.length > 0 ? (
                localChats.map(({ chatId, messages }, index) => (
                  <Link
                    key={index}
                    href={`/${chatId.substr(5)}`}
                    className={cn(
                      {
                        [buttonVariants({ variant: "secondaryLink" })]:
                          chatId.substring(5) === selectedChatId,
                        [buttonVariants({ variant: "ghost" })]:
                          chatId.substring(5) !== selectedChatId,
                      },
                      "flex justify-between w-full h-14 text-base font-normal items-center ",
                    )}
                  >
                    <div className="flex gap-3 items-center truncate">
                      <div className="flex flex-col">
                        <span className="text-xs font-normal ">
                          {messages.length > 0 ? messages[0].content : ""}
                        </span>
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
                      <DropdownMenuContent className=" ">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full flex gap-2 hover:text-red-500 text-red-500 justify-start items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="shrink-0 w-4 h-4" />
                              Delete chat
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader className="space-y-4">
                              <DialogTitle>Delete chat?</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete this chat? This
                                action cannot be undone.
                              </DialogDescription>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">Cancel</Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDeleteChat(chatId)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </DialogHeader>
                          </DialogContent>
                        </Dialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Link>
                ))
              ) : (
                <Button variant="ghost" disabled className="w-full">
                  No chats available
                </Button>
              )}
            </div>
          )}
        </div>
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
                      },
                      "flex justify-between w-full h-14 text-base font-normal items-center",
                    )}
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
                      <DropdownMenuContent className=" ">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="w-full flex gap-2 hover:text-red-500 text-red-500 justify-start items-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="shrink-0 w-4 h-4" />
                              Uninstall model
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
      </div>
    </div>
  );
}

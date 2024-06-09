import React, { useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronDown, ChevronUp, MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
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
import { Message } from "ai/react";

interface ChatListProps {
  localChats: { chatId: string; messages: Message[] }[];
  selectedChatId: string;
  isChatListCollapsed: boolean;
  setIsChatListCollapsed: (isCollapsed: boolean) => void;
  getLocalStorageChats: () => Chat[];
  setLocalChats: (localChats: string[]) => void;
}

export default function ChatList({
  localChats,
  selectedChatId,
  isChatListCollapsed,
  setIsChatListCollapsed,
  setLocalChats,
  getLocalStorageChats,
}: ChatListProps) {
  const handleDeleteChat = (chatId: string) => {
    localStorage.removeItem(chatId);
    setLocalChats(getLocalStorageChats());
  };

  useEffect(() => {
    if (localChats && localChats[0]) {
      console.log("local chats: " + localChats[0].chatId);
      console.log("Selected Chat: " + selectedChatId);
    }
  }, [localChats, selectedChatId]);

  return (
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
                  "flex justify-between w-full h-10 text-base font-normal items-center",
                )}
              >
                <div className="flex gap-3 items-center truncate">
                  <div className="flex flex-col">
                    <span className="text-xs font-normal">
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
                  <DropdownMenuContent>
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
  );
}

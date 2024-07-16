import React, { useEffect, useState } from "react";
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const handleDeleteChat = (chatId: string) => {
    localStorage.removeItem(chatId);
    setLocalChats(getLocalStorageChats());
  };

  const openDeleteDialog = (chatName: string) => {
    setChatToDelete(chatName);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setChatToDelete(null);
    setIsDeleteDialogOpen(false);
    setDropdownOpen(null);
  };

  const confirmDeleteChat = async () => {
    if (chatToDelete) {
      await handleDeleteChat(chatToDelete);
      closeDeleteDialog();
    }
  };

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
                href={`/${chatId.slice(5)}`}
                className={cn(
                  {
                    [buttonVariants({ variant: "secondaryLink" })]:
                      chatId.substring(5) === selectedChatId,
                    [buttonVariants({ variant: "ghost" })]:
                      chatId.substring(5) !== selectedChatId,
                  },
                  "flex justify-between w-full h-10 text-base font-normal items-center pr-0",
                )}
                onClick={(e) => {
                  // Check if the target is the dropdown button and stop propagation if so
                  if (e.target.closest('button')) {
                    e.preventDefault();
                  }
                }}
              >
                <div className="flex gap-3 items-center truncate">
                  <div className="flex flex-col">
                    <span className="text-xs font-normal">
                      {messages.length > 0 ? messages[0].content : ""}
                    </span>
                  </div>
                </div>
                <DropdownMenu open={dropdownOpen === chatId} onOpenChange={(isOpen) => setDropdownOpen(isOpen ? chatId : null)}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex justify-content-center align-items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal size={15} className="shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <Dialog
                      open={isDeleteDialogOpen}
                      onOpenChange={setIsDeleteDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full flex gap-2 hover:text-red-500 text-red-500 justify-start items-center"
                          onClick={() => openDeleteDialog(chatId)}
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
                            <Button
                              variant="outline"
                              onClick={closeDeleteDialog}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={confirmDeleteChat}
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

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { chatService, Message } from "@/services/communication/chat.service";
import { toast } from "sonner";
import {
  Send,
  Paperclip,
  CheckCheck,
  Loader2,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Pin,
  Info,
  X,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { socketService } from "@/services/socket.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ChatInterfaceProps {
  chatGroupId: string;
  chatGroupType?: "BatchChatGroup" | "CourseChatGroup" | "group" | "direct";
  initialMessages?: Message[];
  canPin?: boolean;
}

export function ChatInterface({
  chatGroupId,
  chatGroupType = "group",
  initialMessages = [],
  canPin = true,
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(initialMessages.length === 0);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Action States
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(
    null,
  );

  // Sidebar States
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [infoTab, setInfoTab] = useState("pinned");
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [mediaMessages, setMediaMessages] = useState<Message[]>([]);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (chatGroupId) {
      setLoading(true);
      fetchMessages();

      // Socket Connection - use 'chat' type for chat socket
      const socket = socketService.connect("chat");
      socket.emit("join_chat", chatGroupId);

      socket.on("new_message", (message: Message) => {
        if (message.chatGroupId === chatGroupId) {
          setMessages((prev) => {
            // Ensure we compare IDs correctly (handle potential _id vs id mismatch if any, though backend should send id now)
            const msgId = message.id || (message as any)._id;
            if (prev.some((m) => (m.id || (m as any)._id) === msgId))
              return prev;
            return [...prev, message];
          });
          // Scroll to bottom on new message
          setTimeout(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollIntoView({ behavior: "smooth" });
            }
          }, 100);
        }
      });
      socket.on("message_updated", (updatedMessage: Message) => {
        if (updatedMessage.chatGroupId === chatGroupId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === updatedMessage.id
                ? { ...m, ...updatedMessage, sender: m.sender }
                : m,
            ),
          );
        }
      });

      socket.on("message_deleted", ({ messageId }: { messageId: string }) => {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      });

      socket.on("message_pinned", (pinnedMessage: Message) => {
        if (pinnedMessage.chatGroupId === chatGroupId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === pinnedMessage.id
                ? { ...m, isPinned: pinnedMessage.isPinned }
                : m,
            ),
          );
          // Refresh pinned list if open
          if (isInfoOpen && infoTab === "pinned") fetchInfoMessages();
        }
      });

      socket.on("message_reaction", (reactedMessage: Message) => {
        if (reactedMessage.chatGroupId === chatGroupId) {
          // Update reactions logic here if implemented
        }
      });

      socket.on("typing", (typingUser: { id: string; fullName: string }) => {
        setTypingUsers((prev) => {
          if (prev.includes(typingUser.fullName)) return prev;
          return [...prev, typingUser.fullName];
        });
      });

      socket.on(
        "stop_typing",
        (typingUser: { id: string; fullName: string }) => {
          setTypingUsers((prev) =>
            prev.filter((name) => name !== typingUser.fullName),
          );
        },
      );

      return () => {
        socket.emit("leave_chat", chatGroupId);
        socket.off("new_message");
        socket.off("message_updated");
        socket.off("message_deleted");
        socket.off("message_pinned");
        socket.off("message_reaction");
        socket.off("typing");
        socket.off("stop_typing");
      };
    }
  }, [chatGroupId]);

  useEffect(() => {
    // Only scroll to bottom if not searching/filtering
    if (!searchQuery && !editingMessageId) {
      scrollToBottom();
    }
  }, [messages, searchQuery, editingMessageId]);

  useEffect(() => {
    if (isInfoOpen) {
      fetchInfoMessages();
    }
  }, [isInfoOpen, infoTab, chatGroupId]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchMessages = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await chatService.getMessages(
        chatGroupId,
        50,
        0,
        searchQuery,
      );
      setMessages(data.reverse());
    } catch (error) {
      console.error("Fetch messages error:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchInfoMessages = async () => {
    setLoadingInfo(true);
    try {
      if (infoTab === "pinned") {
        const data = await chatService.getMessages(
          chatGroupId,
          50,
          0,
          "",
          "pinned",
        );
        setPinnedMessages(data);
      } else {
        const data = await chatService.getMessages(
          chatGroupId,
          50,
          0,
          "",
          "media",
        );
        setMediaMessages(data);
      }
    } catch (error) {
      console.error("Fetch info error:", error);
    } finally {
      setLoadingInfo(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMessages();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (socketService.getSocket("chat")) {
      socketService.getSocket("chat")?.emit("typing", {
        chatGroupId,
        user: {
          id: user?.id || user?._id,
          fullName: user?.fullName || "Someone",
        },
      });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socketService.getSocket("chat")?.emit("stop_typing", {
          chatGroupId,
          user: {
            id: user?.id || user?._id,
            fullName: user?.fullName || "Someone",
          },
        });
      }, 2000);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    // Stop typing immediately when sending
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketService.getSocket("chat")?.emit("stop_typing", {
      chatGroupId,
      user: {
        id: user?.id || user?._id,
        fullName: user?.fullName || "Someone",
      },
    });

    try {
      if (editingMessageId) {
        await chatService.editMessage(editingMessageId, newMessage);
        toast.success("Message updated");
        setEditingMessageId(null);
      } else {
        const msg = await chatService.sendMessage({
          chatGroupId,
          chatGroupType,
          content: newMessage,
        });
        // Optimistic update - check for duplicates in socket listener
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      setNewMessage("");
      // fetchMessages(false); // Removed: Socket handles updates
    } catch (error) {
      console.error("Send/Edit message error:", error);
      toast.error(
        editingMessageId
          ? "Failed to update message"
          : "Failed to send message",
      );
    } finally {
      setSending(false);
    }
  };

  const handlePinMessage = async (messageId: string) => {
    try {
      await chatService.pinMessage(messageId);
      toast.success("Message pin updated");
      // fetchMessages(false); // Removed: Socket handles updates
      // if (isInfoOpen && infoTab === 'pinned') fetchInfoMessages(); // Socket handles this too via useEffect dependency or event
    } catch (error) {
      toast.error("Failed to pin message");
    }
  };

  const startEditing = (msg: Message) => {
    setNewMessage(msg.content);
    setEditingMessageId(msg.id);
    // Focus input? standard Input auto focus might not work, but user can click
  };

  const cancelEditing = () => {
    setNewMessage("");
    setEditingMessageId(null);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);
      toast.success("Message deleted");
      setDeletingMessageId(null);
      // fetchMessages(false); // Removed: Socket handles updates
    } catch (error) {
      toast.error("Failed to delete message");
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Header / Search Bar */}
      <div className="px-4 py-2 bg-white border-b flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <form onSubmit={handleSearch} className="flex-1">
            <Input
              placeholder="Search messages..."
              className="border-none focus-visible:ring-0 pl-2 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <Sheet open={isInfoOpen} onOpenChange={setIsInfoOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
            >
              <Info className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Chat Info</SheetTitle>
            </SheetHeader>
            <Tabs
              defaultValue="pinned"
              value={infoTab}
              onValueChange={setInfoTab}
              className="mt-4 h-full flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pinned">Pinned</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
              </TabsList>
              <TabsContent
                value="pinned"
                className="flex-1 overflow-auto mt-4 px-1"
              >
                {loadingInfo ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-muted-foreground" />
                  </div>
                ) : pinnedMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 text-sm">
                    No pinned messages
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pinnedMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className="bg-slate-50 p-3 rounded-lg border text-sm"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-xs">
                            {msg.sender?.fullName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                          </span>
                        </div>
                        <p className="text-slate-700 line-clamp-3">
                          {msg.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent
                value="media"
                className="flex-1 overflow-auto mt-4 px-1"
              >
                {loadingInfo ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-muted-foreground" />
                  </div>
                ) : mediaMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 text-sm">
                    No media files
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {/* Placeholder for media rendering - as backend service implies attachments exist */}
                    {mediaMessages.map((msg) =>
                      msg.attachments?.map((att, i) => (
                        <div
                          key={`${msg.id}-${i}`}
                          className="aspect-square bg-slate-100 rounded-md flex items-center justify-center border"
                        >
                          <ImageIcon className="h-8 w-8 text-slate-300" />
                          {/* If we had real URLs, we'd use <img src={att} /> */}
                        </div>
                      )),
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-full px-4 py-4">
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-10 opacity-50">
                {searchQuery
                  ? "No messages found matching your search."
                  : "No messages yet. Start the conversation!"}
              </div>
            ) : (
              messages.map((msg, idx) => {
                const userId = user?.id || user?._id;
                const isMe = msg.senderId === userId;
                const isContinuous =
                  idx > 0 && messages[idx - 1].senderId === msg.senderId;
                const isDeleting = deletingMessageId === msg.id;

                // Check if message is editable (within 15 minutes)
                const messageTime = msg.createdAt
                  ? new Date(msg.createdAt).getTime()
                  : Date.now();
                const currentTime = Date.now();
                const isEditable =
                  isMe && currentTime - messageTime < 15 * 60 * 1000;

                const hasActions = canPin || isEditable;

                return (
                  <div
                    key={msg.id || idx}
                    className={`flex gap-3 group ${
                      isMe ? "justify-end" : "justify-start"
                    } ${isContinuous ? "mt-1" : "mt-4"}`}
                  >
                    {!isMe && !isContinuous && (
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                          {msg.sender?.fullName
                            ?.substring(0, 2)
                            .toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {isContinuous && !isMe && <div className="w-8" />}{" "}
                    {/* Spacer */}
                    <div
                      className={`flex flex-col ${
                        isMe ? "items-end" : "items-start"
                      } max-w-[85%] md:max-w-[70%]`}
                    >
                      {/* Message Bubble or Delete Confirmation */}
                      {isDeleting ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200">
                          <p className="text-xs text-red-800 font-medium">
                            Delete this message?
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="xs"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700 hover:bg-red-100"
                              onClick={() => setDeletingMessageId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="xs"
                              variant="destructive"
                              onClick={() => handleDeleteMessage(msg.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`relative px-4 py-2 shadow-sm ${
                            isMe
                              ? "bg-[#1a3d32] text-white rounded-2xl rounded-tr-none"
                              : "bg-white border text-slate-800 rounded-2xl rounded-tl-none"
                          } ${msg.isPinned ? "border-amber-400 border-2" : ""}`}
                        >
                          {msg.isPinned && (
                            <Pin className="h-3 w-3 absolute -top-2 -right-2 text-amber-500 fill-amber-500 bg-white rounded-full p-0.5 shadow-sm" />
                          )}

                          {!isMe && !isContinuous && (
                            <p className="text-xs font-bold mb-1 opacity-70">
                              {msg.sender?.fullName}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                          <div
                            className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                              isMe ? "text-white/70" : "text-muted-foreground"
                            }`}
                          >
                            {format(new Date(msg.createdAt), "h:mm a")}
                            {msg.id === editingMessageId && (
                              <span className="italic ml-1">(editing)</span>
                            )}
                            {isMe && <CheckCheck className="h-3 w-3" />}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Actions Dropdown */}
                    {!isDeleting && hasActions && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity self-center"
                          >
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isMe ? "end" : "start"}>
                          {canPin && (
                            <DropdownMenuItem
                              onClick={() => handlePinMessage(msg.id)}
                            >
                              <Pin className="h-4 w-4 mr-2" />{" "}
                              {msg.isPinned ? "Unpin" : "Pin"}
                            </DropdownMenuItem>
                          )}
                          {isEditable && (
                            <>
                              <DropdownMenuItem
                                onClick={() => startEditing(msg)}
                              >
                                <Pencil className="h-4 w-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => setDeletingMessageId(msg.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Editing Overlay Indicator (Optional, but good for UX) */}
        {editingMessageId && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t px-4 py-2 flex justify-between items-center text-xs text-amber-700 z-10">
            <span className="font-semibold flex items-center gap-2">
              <Pencil className="h-3 w-3" /> Editing Message
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEditing}
              className="h-6 w-6 p-0 hover:bg-slate-200 rounded-full"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        className={`p-4 bg-white border-t transition-colors ${
          editingMessageId ? "bg-amber-50/50" : ""
        }`}
      >
        {typingUsers.length > 0 && (
          <div className="text-xs text-muted-foreground mb-2 animate-pulse px-2">
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"}{" "}
            typing...
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-slate-100 rounded-full"
            disabled={!!editingMessageId} // Disable attachment during edit
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            placeholder={
              editingMessageId ? "Edit your message..." : "Type a message..."
            }
            value={newMessage}
            onChange={handleInputChange}
            className={`flex-1 rounded-full border-slate-200 py-5 ${
              editingMessageId
                ? "focus-visible:ring-amber-500 border-amber-200"
                : "focus-visible:ring-[#1a3d32]"
            }`}
            disabled={sending}
          />
          <Button
            type="submit"
            size="icon"
            className={`rounded-full w-12 h-10 ${
              editingMessageId
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-[#1a3d32] hover:bg-[#142e26]"
            }`}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : editingMessageId ? (
              <CheckCheck className="h-5 w-5 ml-0.5" />
            ) : (
              <Send className="h-5 w-5 ml-0.5" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

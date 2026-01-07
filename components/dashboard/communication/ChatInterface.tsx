"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Smile,
  Reply,
  MessageSquare,
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
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { motion, AnimatePresence } from "framer-motion";

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
  const theme = useDashboardTheme();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(initialMessages.length === 0);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Context colors
  const accentPrimary = theme.colors.accent.primary;
  const accentSecondary = theme.colors.accent.secondary;
  const accentBgSubtle = accentPrimary.replace('text-', 'bg-') + '/5';

  // Action States
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);

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

      const socket = socketService.connect("chat");
      socket.emit("join_chat", chatGroupId);

      socket.on("new_message", (message: Message) => {
        if (message.chatGroupId === chatGroupId) {
          setMessages((prev) => {
            const msgId = message.id || (message as any)._id;
            if (prev.some((m) => (m.id || (m as any)._id) === msgId)) return prev;
            return [...prev, message];
          });
          setTimeout(scrollToBottom, 100);
        }
      });

      socket.on("message_updated", (updatedMessage: Message) => {
        if (updatedMessage.chatGroupId === chatGroupId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === updatedMessage.id
                ? { ...m, ...updatedMessage, sender: m.sender }
                : m
            )
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
                : m
            )
          );
          if (isInfoOpen && infoTab === "pinned") fetchInfoMessages();
        }
      });

      socket.on("typing", (typingUser: { id: string; fullName: string }) => {
        setTypingUsers((prev) => {
          if (prev.includes(typingUser.fullName)) return prev;
          return [...prev, typingUser.fullName];
        });
      });

      socket.on("stop_typing", (typingUser: { id: string; fullName: string }) => {
        setTypingUsers((prev) => prev.filter((name) => name !== typingUser.fullName));
      });

      return () => {
        socket.emit("leave_chat", chatGroupId);
        socket.off("new_message");
        socket.off("message_updated");
        socket.off("message_deleted");
        socket.off("message_pinned");
        socket.off("typing");
        socket.off("stop_typing");
      };
    }
  }, [chatGroupId]);

  useEffect(() => {
    if (!searchQuery && !editingMessageId) {
      scrollToBottom();
    }
  }, [messages, searchQuery, editingMessageId]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const fetchMessages = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await chatService.getMessages(chatGroupId, 100, 0, searchQuery);
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
        const data = await chatService.getMessages(chatGroupId, 50, 0, "", "pinned");
        setPinnedMessages(data);
      } else {
        const data = await chatService.getMessages(chatGroupId, 50, 0, "", "media");
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
        user: { id: user?.id || user?._id, fullName: user?.fullName || "Teacher" },
      });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketService.getSocket("chat")?.emit("stop_typing", {
          chatGroupId,
          user: { id: user?.id || user?._id, fullName: user?.fullName || "Teacher" },
        });
      }, 2000);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socketService.getSocket("chat")?.emit("stop_typing", {
      chatGroupId,
      user: { id: user?.id || user?._id, fullName: user?.fullName || "Teacher" },
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
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      setNewMessage("");
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(editingMessageId ? "Failed to update" : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handlePinMessage = async (messageId: string) => {
    try {
      await chatService.pinMessage(messageId);
      toast.success("Pin status updated");
    } catch (error) {
      toast.error("Failed to pin message");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);
      toast.success("Message deleted");
      setDeletingMessageId(null);
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className={`h-10 w-10 animate-spin ${accentPrimary}`} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#fdfdff]">
      {/* Contextual Search/Info Bar */}
      <div className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between z-20">
        <div className="flex items-center gap-3 flex-1 max-w-md group">
          <Search className={`h-4 w-4 text-slate-300 group-focus-within:${accentPrimary} transition-colors`} />
          <form onSubmit={handleSearch} className="flex-1">
            <Input
              placeholder="Find something in history..."
              className="border-none bg-transparent focus-visible:ring-0 px-0 h-8 font-medium text-sm placeholder:text-slate-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="flex items-center gap-2">
          <Sheet open={isInfoOpen} onOpenChange={setIsInfoOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:bg-slate-50">
                <Info className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="rounded-l-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
              <div className="h-full flex flex-col">
                <SheetHeader className="p-8 bg-slate-50 border-b border-slate-100 text-left">
                  <SheetTitle className="text-2xl font-black text-slate-900 leading-tight">Conversation Info</SheetTitle>
                  <p className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-1">Resources & Important Pins</p>
                </SheetHeader>
                <div className="p-6 flex-1 flex flex-col overflow-hidden">
                  <Tabs defaultValue="pinned" value={infoTab} onValueChange={setInfoTab} className="h-full flex flex-col">
                    <TabsList className="bg-slate-100/50 p-1 rounded-2xl border border-slate-200/60 mb-6">
                      <TabsTrigger value="pinned" className={`rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-wider data-[state=active]:${accentSecondary} data-[state=active]:text-white data-[state=active]:shadow-lg transition-all flex-1`}>
                        Pinned
                      </TabsTrigger>
                      <TabsTrigger value="media" className={`rounded-xl px-6 py-2.5 font-bold text-xs uppercase tracking-wider data-[state=active]:${accentSecondary} data-[state=active]:text-white data-[state=active]:shadow-lg transition-all flex-1`}>
                        Media
                      </TabsTrigger>
                    </TabsList>

                    <ScrollArea className="flex-1 -mx-2 px-2">
                      <AnimatePresence mode="wait">
                        {loadingInfo ? (
                          <div className="flex justify-center py-20">
                            <Loader2 className={`h-8 w-8 animate-spin ${accentPrimary}`} />
                          </div>
                        ) : (
                          <TabsContent value={infoTab} className="mt-0 focus-visible:outline-none">
                            {infoTab === "pinned" ? (
                              pinnedMessages.length === 0 ? (
                                <div className="text-center text-slate-400 py-20 italic text-sm">No pins yet</div>
                              ) : (
                                <div className="space-y-4">
                                  {pinnedMessages.map(msg => (
                                    <div key={msg.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600">{msg.sender?.fullName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-black text-xs text-slate-900">{msg.sender?.fullName}</span>
                                      </div>
                                      <p className="text-xs text-slate-600 italic leading-relaxed">{msg.content}</p>
                                    </div>
                                  ))}
                                </div>
                              )
                            ) : (
                              mediaMessages.length === 0 ? (
                                <div className="text-center text-slate-400 py-20 italic text-sm">No media shared</div>
                              ) : (
                                <div className="grid grid-cols-2 gap-3">
                                  {mediaMessages.map(msg => msg.attachments?.map((att, i) => (
                                    <div key={`${msg.id}-${i}`} className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 group hover:border-indigo-200 transition-all cursor-pointer">
                                      <ImageIcon className="h-8 w-8 text-slate-200 group-hover:text-indigo-400 transition-colors" />
                                    </div>
                                  )))}
                                </div>
                              )
                            )}
                          </TabsContent>
                        )}
                      </AnimatePresence>
                    </ScrollArea>
                  </Tabs>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-6 py-6">
          <div className="space-y-6 pb-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-4">
                <MessageSquare className="h-16 w-16 text-slate-300" />
                <p className="text-sm font-black uppercase tracking-widest text-slate-400">Beginning of Discussion</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const userId = user?.id || user?._id;
                const isMe = msg.senderId === userId;
                const isContinuous = idx > 0 && messages[idx - 1].senderId === msg.senderId;
                const isDeleting = deletingMessageId === msg.id;

                const messageTime = msg.createdAt ? new Date(msg.createdAt).getTime() : Date.now();
                const isEditable = isMe && (Date.now() - messageTime < 15 * 60 * 1000);

                return (
                  <div key={msg.id || idx} className={`flex gap-3 group ${isMe ? "justify-end" : "justify-start"} ${isContinuous ? "mt-1.5" : "mt-6"}`}>
                    {!isMe && !isContinuous && (
                      <Avatar className="h-10 w-10 mt-1 border-2 border-white shadow-sm ring-1 ring-slate-100">
                        <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">
                          {msg.sender?.fullName?.substring(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {isContinuous && !isMe && <div className="w-10" />}

                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] md:max-w-[70%]`}>
                      {isDeleting ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 border border-red-100 rounded-[1.5rem] p-4 flex flex-col gap-3 shadow-sm">
                          <p className="text-xs text-red-700 font-bold uppercase tracking-wider">Permantly delete this message?</p>
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" className="text-slate-500 font-bold h-8 rounded-xl" onClick={() => setDeletingMessageId(null)}>Cancel</Button>
                            <Button size="sm" variant="destructive" className="font-bold h-8 rounded-xl px-4 shadow-lg shadow-red-100" onClick={() => handleDeleteMessage(msg.id)}>Delete</Button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className={`relative px-5 py-3 shadow-sm transition-all duration-200 ${isMe ? `${accentSecondary} text-white rounded-[1.8rem] rounded-tr-[0.5rem] shadow-indigo-200/20` : "bg-white border border-slate-100 text-slate-800 rounded-[1.8rem] rounded-tl-[0.5rem]"
                          } ${msg.isPinned ? "border-indigo-200 border-2 ring-2 ring-indigo-50" : ""}`}>

                          {msg.isPinned && (
                            <div className="absolute -top-3 -right-3 h-7 w-7 bg-white rounded-full border border-indigo-100 shadow-md flex items-center justify-center z-10">
                              <Pin className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500" />
                            </div>
                          )}

                          {!isMe && !isContinuous && (
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${accentPrimary} opacity-90`}>
                              {msg.sender?.fullName}
                            </p>
                          )}

                          <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                            {msg.content}
                          </p>

                          <div className={`text-[9px] font-black uppercase tracking-widest mt-1.5 flex items-center justify-end gap-1.5 ${isMe ? "text-white/60" : "text-slate-400"}`}>
                            {format(new Date(msg.createdAt), "h:mm a")}
                            {msg.id === editingMessageId && <span className="italic ml-1">(editing)</span>}
                            {isMe && <CheckCheck className="h-3 w-3" />}
                          </div>
                        </div>
                      )}
                    </div>

                    {!isDeleting && (isEditable || canPin) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl hover:bg-slate-100 self-center">
                            <MoreVertical className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isMe ? "end" : "start"} className="rounded-2xl border-slate-100 shadow-xl p-2 min-w-[140px]">
                          {canPin && (
                            <DropdownMenuItem className="rounded-xl px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-700" onClick={() => handlePinMessage(msg.id)}>
                              <Pin className="h-4 w-4 mr-2 text-slate-400" /> {msg.isPinned ? "Unpin Message" : "Pin Message"}
                            </DropdownMenuItem>
                          )}
                          {isEditable && (
                            <>
                              <DropdownMenuItem className="rounded-xl px-4 py-2 font-bold text-xs uppercase tracking-wider text-slate-700" onClick={() => setEditingMessageId(msg.id)}>
                                <Pencil className="h-4 w-4 mr-2 text-slate-400" /> Edit Message
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl px-4 py-2 font-bold text-xs uppercase tracking-wider text-red-600 focus:text-red-700 focus:bg-red-50" onClick={() => setDeletingMessageId(msg.id)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete Message
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
      </div>

      {/* Input Ecosystem */}
      <div className={`px-6 py-6 bg-white border-t border-slate-100 safe-bottom transition-all duration-300 ${editingMessageId ? 'bg-indigo-50/20 ring-4 ring-inset ring-indigo-500/5' : ''}`}>
        <div className="max-w-4xl mx-auto flex flex-col gap-3">
          <AnimatePresence>
            {editingMessageId && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center justify-between px-4 py-2 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-200">
                <div className="flex items-center gap-2">
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Rewriting Message</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setEditingMessageId(null); setNewMessage(""); }} className="h-6 w-6 text-white hover:bg-white/20 rounded-full">
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {typingUsers.length > 0 && (
            <div className="flex items-center gap-1.5 px-4">
              <div className="flex space-x-1">
                <div className="h-1 w-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1 w-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1 w-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-400/70">
                {typingUsers[0]} matches your frequency...
              </span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            <div className="flex-1 relative group">
              <Input
                placeholder={editingMessageId ? "Refine your words..." : "Cast your message..."}
                value={newMessage}
                onChange={handleInputChange}
                className={`w-full min-h-[56px] pl-6 pr-14 py-4 bg-slate-50 border-transparent rounded-[2rem] focus-visible:bg-white focus-visible:ring-indigo-600 focus-visible:shadow-xl transition-all duration-300 font-medium text-slate-800 shadow-inner ${editingMessageId ? 'ring-2 ring-indigo-500 bg-white' : ''}`}
                disabled={sending}
              />
              <div className="absolute right-4 bottom-3 flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-slate-600 rounded-xl">
                  <Paperclip className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              size="icon"
              disabled={!newMessage.trim() || sending}
              className={`h-[56px] w-[56px] rounded-[1.8rem] flex items-center justify-center shadow-xl transition-all active:scale-95 ${editingMessageId ? 'bg-indigo-600 text-white shadow-indigo-200' : `${accentSecondary} text-white shadow-indigo-600/10`}`}
            >
              {sending ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : editingMessageId ? (
                <CheckCheck className="h-6 w-6" />
              ) : (
                <Send className="h-6 w-6 ml-1" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

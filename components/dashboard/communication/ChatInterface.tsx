"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { chatService, Message } from "@/services/communication/chat.service";
import { toast } from "sonner";
import {
  Send,
  Plus,
  ArrowRight,
  BookOpen,
  Users,
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
  Download,
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { getImageUrl } from "@/lib/utils";
import EmojiPicker, { Theme as EmojiTheme } from "emoji-picker-react";

interface ChatInterfaceProps {
  chatGroupId: string;
  chatGroupType?: "BatchChatGroup" | "CourseChatGroup" | "group" | "direct";
  initialMessages?: Message[];
  canPin?: boolean;
  title?: string;
  subtitle?: string;
  courseCode?: string;
  onBack?: () => void;
}

export function ChatInterface({
  chatGroupId,
  chatGroupType = "group",
  initialMessages = [],
  canPin = true,
  title,
  subtitle,
  courseCode,
  onBack,
}: ChatInterfaceProps) {
  const { user } = useAuth();
  const theme = useDashboardTheme();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(initialMessages.length === 0);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Context colors
  const accentPrimary = theme.colors.accent.primary;
  const accentSecondary = theme.colors.accent.secondary;
  const accentBgSubtle = accentPrimary.replace('text-', 'bg-') + '/5';

  // Action States
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [pendingAttachment, setPendingAttachment] = useState<{ url: string; filename: string; mimetype: string } | null>(null);

  // Sidebar States
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [infoTab, setInfoTab] = useState("pinned");
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([]);
  const [mediaMessages, setMediaMessages] = useState<Message[]>([]);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Pinned Banner State
  const [activePinnedMessage, setActivePinnedMessage] = useState<Message | null>(null);
  const [showPinnedBanner, setShowPinnedBanner] = useState(true);

  const handleEmojiClick = (emojiData: any) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  useEffect(() => {
    if (chatGroupId) {
      setLoading(true);
      fetchMessages();
      fetchActivePinnedMessage();

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

          if (pinnedMessage.isPinned) {
            setActivePinnedMessage(pinnedMessage);
            setShowPinnedBanner(true);
          } else if (activePinnedMessage?.id === pinnedMessage.id) {
            // If the currently shown pinned message is unpinned, fetch the next one
            fetchActivePinnedMessage();
          }

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

  useEffect(() => {
    if (isInfoOpen) {
      fetchInfoMessages();
    }
  }, [isInfoOpen, infoTab, chatGroupId]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
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

  const fetchActivePinnedMessage = async () => {
    try {
      const data = await chatService.getMessages(chatGroupId, 1, 0, "", "pinned");
      if (data && data.length > 0) {
        setActivePinnedMessage(data[0]);
      } else {
        setActivePinnedMessage(null);
      }
    } catch (error) {
      console.error("Fetch pinned error", error);
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
    if ((!newMessage.trim() && !pendingAttachment) || sending) return;

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
          attachments: pendingAttachment ? [pendingAttachment.url] : undefined,
        });
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      setNewMessage("");
      setPendingAttachment(null);
    } catch (error) {
      console.error("Send message error:", error);
      toast.error(editingMessageId ? "Failed to update" : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    e.target.value = "";

    const toastId = toast.loading("Uploading file...");

    try {
      const uploaded = await chatService.uploadFile(file);

      setPendingAttachment(uploaded);
      toast.success("File uploaded, ready to send", { id: toastId });
    } catch (error) {
      console.error("File upload error", error);
      toast.error("Failed to upload file", { id: toastId });
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
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-architectural/50 backdrop-blur-sm">
        <div className="h-16 w-16 glass-panel rounded-2xl flex items-center justify-center">
          <Loader2 className={`h-8 w-8 animate-spin text-primary-nexus`} />
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-gray-500">Syncing Messages...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-white/20 dark:border-white/5 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden h-9 w-9 rounded-xl hover:bg-white/40">
              <ArrowRight className="h-5 w-5 rotate-180" />
            </Button>
          )}

          <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shadow-inner">
            {chatGroupType === "CourseChatGroup" ? (
              <BookOpen className="h-5 w-5 text-teal-600" />
            ) : (
              <Users className="h-5 w-5 text-teal-600" />
            )}
          </div>

          <div className="flex flex-col">
            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2 leading-none max-w-[200px] md:max-w-md truncate">
              <span className="truncate">{title || "Discussion"}</span>
              {courseCode && (
                <Badge variant="outline" className="text-[10px] font-black py-0 px-1.5 border-teal-500/30 text-teal-600 bg-teal-500/5 shrink-0">
                  {courseCode}
                </Badge>
              )}
            </h2>
            <p className="text-[9px] font-black text-teal-600/60 uppercase tracking-[0.2em] mt-1 italic">
              {subtitle || "Group Chat"}
            </p>
          </div>
        </div>

        {/* Floating Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <form onSubmit={handleSearch} className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-teal-600 dark:group-focus-within:text-teal-400 transition-colors z-10" />
            <Input
              placeholder="FIND SOMETHING IN HISTORY..."
              className="w-full bg-white/50 dark:bg-slate-900/50 border-white/20 dark:border-white/10 rounded-2xl pl-10 pr-4 py-6 text-[11px] font-black uppercase tracking-widest placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md focus-visible:ring-2 focus-visible:ring-teal-500/20 focus-visible:bg-white/80 dark:focus-visible:bg-slate-800/80 transition-all backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:bg-white/40 hover:text-teal-600">
            <Users className="h-4 w-4" />
          </Button>
          <Sheet open={isInfoOpen} onOpenChange={setIsInfoOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:bg-white/40 hover:text-teal-600">
                <Info className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent className="rounded-l-[2.5rem] border-none glass-panel shadow-2xl p-0 overflow-hidden">
              <div className="h-full flex flex-col">
                <SheetHeader className="p-8 border-b border-white/20 text-left bg-white/20">
                  <SheetTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest leading-tight">Group Info</SheetTitle>
                  <p className="font-bold text-teal-600 uppercase tracking-[0.3em] text-[10px] mt-1">Resources & Important Pins</p>
                </SheetHeader>
                <div className="p-6 flex-1 flex flex-col overflow-hidden">
                  <Tabs defaultValue="pinned" value={infoTab} onValueChange={setInfoTab} className="h-full flex flex-col">
                    <TabsList className="bg-white/10 p-1 rounded-2xl border border-white/20 mb-6">
                      <TabsTrigger value="pinned" className="rounded-xl px-6 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all flex-1">
                        Pinned
                      </TabsTrigger>
                      <TabsTrigger value="media" className="rounded-xl px-6 py-2.5 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all flex-1">
                        Media
                      </TabsTrigger>
                    </TabsList>

                    <ScrollArea className="flex-1 -mx-2 px-2">
                      <AnimatePresence mode="wait">
                        {loadingInfo ? (
                          <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
                          </div>
                        ) : (
                          <TabsContent value={infoTab} className="mt-0 focus-visible:outline-none">
                            {infoTab === "pinned" ? (
                              pinnedMessages.length === 0 ? (
                                <div className="text-center text-slate-400 py-20 italic text-xs font-black uppercase tracking-widest">No pins in Nexus</div>
                              ) : (
                                <div className="space-y-4">
                                  {pinnedMessages.map(msg => (
                                    <div key={msg.id} className="glass-inner p-4 rounded-3xl border border-white/20 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                          <AvatarImage src={getImageUrl(msg.sender?.avatar)} alt={msg.sender?.fullName} />
                                          <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600">{msg.sender?.fullName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-black text-[10px] uppercase tracking-widest text-slate-900">{msg.sender?.fullName}</span>
                                      </div>
                                      <p className="text-xs text-slate-600 italic leading-relaxed">{msg.content}</p>
                                    </div>
                                  ))}
                                </div>
                              )
                            ) : (
                              mediaMessages.length === 0 ? (
                                <div className="text-center text-slate-400 py-20 italic text-xs font-black uppercase tracking-widest">No media shared</div>
                              ) : (
                                <div className="grid grid-cols-2 gap-3">
                                  {mediaMessages.map(msg => msg.attachments?.map((att, i) => {
                                    const fullUrl = att.startsWith("http") ? att : `${process.env.NEXT_PUBLIC_COMMUNICATION_URL}${att}`;
                                    const isImage = att.match(/\.(jpeg|jpg|gif|png|webp)$/i);

                                    if (isImage) {
                                      return (
                                        <div key={`${msg.id}-${i}`} className="aspect-square glass-inner rounded-2xl border border-white/20 group relative overflow-hidden">
                                          <img
                                            src={fullUrl}
                                            alt="Media"
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                          />
                                          <a
                                            href={fullUrl}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                                          >
                                            <Download className="h-5 w-5" />
                                          </a>
                                        </div>
                                      );
                                    }

                                    return (
                                      <div key={`${msg.id}-${i}`} className="aspect-square glass-inner rounded-2xl flex flex-col items-center justify-center border border-white/20 group hover:border-teal-500/20 transition-all p-3 text-center gap-2 relative">
                                        <FileText className="h-7 w-7 text-slate-300 group-hover:text-teal-500 transition-colors" />
                                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest truncate w-full">{att.split('/').pop()}</span>
                                        <a
                                          href={fullUrl}
                                          download
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="absolute inset-0"
                                        />
                                      </div>
                                    );
                                  }))}
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

      {activePinnedMessage && showPinnedBanner && (
        <div
          className="mx-4 mt-2 z-10 glass-inner dark:bg-slate-800/50 shadow-xl rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-white/40 dark:hover:bg-slate-700/40 transition-all border border-teal-500/20 group/pin animate-in slide-in-from-top-2"
          onClick={() => {
            setIsInfoOpen(true);
            setInfoTab("pinned");
          }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0 border border-teal-500/20">
              <Pin className="h-3.5 w-3.5 fill-teal-600" />
            </div>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-teal-600 flex items-center gap-2">
                Priority Communication <div className="h-1 w-1 rounded-full bg-teal-500 animate-pulse" />
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate w-full">
                {activePinnedMessage.content}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-slate-400 hover:text-red-500 rounded-lg group-hover/pin:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              setShowPinnedBanner(false);
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4 md:px-6">
          <div className="space-y-4 pb-6 pt-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-40 gap-4">
                <div className="w-16 h-16 glass-inner rounded-3xl flex items-center justify-center mb-2">
                  <MessageSquare className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Beginning of Nexus</p>
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
                  <div key={msg.id || idx} className={`flex gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMe ? "justify-end" : "justify-start"} ${isContinuous ? "mt-1" : "mt-6"}`}>
                    {!isMe && !isContinuous && (
                      <Avatar className="h-9 w-9 mt-1 glass-inner p-1">
                        <AvatarImage src={getImageUrl(msg.sender?.avatar)} className="rounded-full shadow-inner" />
                        <AvatarFallback className="bg-slate-200/50 text-slate-600 font-bold text-[10px]">
                          {msg.sender?.fullName?.substring(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {isContinuous && !isMe && <div className="w-9" />}

                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] md:max-w-[70%]`}>
                      {isDeleting ? (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel border-red-500/20 bg-red-500/5 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
                          <p className="text-[10px] text-red-600 font-black uppercase tracking-widest">Delete this message?</p>
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="ghost" className="text-slate-500 font-bold h-7 rounded-lg text-[10px] uppercase tracking-widest" onClick={() => setDeletingMessageId(null)}>Cancel</Button>
                            <Button size="sm" variant="destructive" className="font-bold h-7 rounded-lg px-4 shadow-lg shadow-red-500/20 text-[10px] uppercase tracking-widest" onClick={() => handleDeleteMessage(msg.id)}>Confirm</Button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className={`relative transition-all duration-300 group-hover:shadow-lg ${(!msg.content || msg.content.startsWith("Sent an attachment:")) && msg.attachments?.some(a => a.match(/\.(jpeg|jpg|gif|png|webp)$/i))
                          ? "p-0 bg-transparent border-none shadow-none"
                          : isMe
                            ? "bg-teal-500/90 backdrop-blur-md text-white rounded-2xl rounded-tr-sm shadow-sm px-4 py-3 border border-white/20"
                            : "glass-inner dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl rounded-tl-sm px-4 py-3"
                          } ${msg.isPinned ? "ring-2 ring-teal-500/50" : ""}`}>

                          {msg.isPinned && (
                            <div className="absolute -top-2 -right-2 h-6 w-6 bg-teal-500 rounded-full border border-white shadow-md flex items-center justify-center z-10">
                              <Pin className="h-3 w-3 text-white fill-white" />
                            </div>
                          )}

                          {!isMe && !isContinuous && (
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1.5 text-teal-600/80">
                              {msg.sender?.fullName}
                            </p>
                          )}

                          {msg.content && !msg.content.startsWith("Sent an attachment:") && (
                            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          )}

                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className={(!msg.content || msg.content.startsWith("Sent an attachment:")) && msg.attachments.some(a => a.match(/\.(jpeg|jpg|gif|png|webp)$/i)) ? "" : "mt-2 space-y-2"}>
                              {msg.attachments.map((url, i) => {
                                const fullUrl = url.startsWith("http") ? url : `${process.env.NEXT_PUBLIC_COMMUNICATION_URL}${url}`;
                                const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)$/i);

                                if (isImage) {
                                  const isImageOnly = !msg.content || msg.content.startsWith("Sent an attachment:");
                                  return (
                                    <div
                                      key={i}
                                      className={`relative group/image overflow-hidden ${isImageOnly
                                        ? "rounded-2xl shadow-xl border border-white/20"
                                        : "rounded-xl border border-slate-200/20 mt-2"
                                        }`}
                                    >
                                      <img
                                        src={fullUrl}
                                        alt="Attachment"
                                        className="w-full h-auto max-h-80 object-cover block"
                                      />
                                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-all duration-300" />
                                      <a
                                        href={fullUrl}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute bottom-3 right-3 bg-white/20 backdrop-blur-xl text-white p-2 rounded-xl opacity-0 group-hover/image:opacity-100 transition-all duration-300 hover:bg-white/40 shadow-xl border border-white/20"
                                      >
                                        <Download className="h-4 w-4" />
                                      </a>
                                    </div>
                                  );
                                }

                                return (
                                  <div key={i} className={`flex items-center justify-between gap-3 p-3 rounded-xl border mt-2 ${isMe ? 'bg-white/10 border-white/20' : 'bg-slate-500/5 dark:bg-slate-700/30 border-slate-200/20 dark:border-white/5'}`}>
                                    <div className="flex items-center gap-2 overflow-hidden">
                                      <FileText className={`h-8 w-8 shrink-0 ${isMe ? 'text-white/70' : 'text-teal-500/70'}`} />
                                      <div className="flex flex-col overflow-hidden">
                                        <span className={`text-xs font-bold truncate ${isMe ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>Attachment</span>
                                        <span className={`text-[9px] truncate ${isMe ? 'text-white/60' : 'text-slate-400'}`}>{url.split('/').pop()}</span>
                                      </div>
                                    </div>
                                    <a href={fullUrl} download target="_blank" rel="noopener noreferrer"
                                      className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${isMe ? 'text-white/70 hover:bg-white/10' : 'text-slate-400 hover:bg-slate-100'}`}>
                                      <Download className="h-4 w-4" />
                                    </a>
                                  </div>
                                );
                              })}
                            </div>
                          )}

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
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg glass-inner hover:bg-white/50 self-center">
                            <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isMe ? "end" : "start"} className="rounded-xl border-white/20 glass-panel shadow-2xl p-1.5 min-w-[150px]">
                          {canPin && (
                            <DropdownMenuItem className="rounded-lg px-3 py-2 font-black text-[9px] uppercase tracking-widest text-slate-600 focus:bg-teal-500/10 focus:text-teal-600" onClick={() => handlePinMessage(msg.id)}>
                              <Pin className="h-3.5 w-3.5 mr-2" /> {msg.isPinned ? "Unpin Nexus" : "Pin to Nexus"}
                            </DropdownMenuItem>
                          )}
                          {isEditable && (
                            <>
                              <DropdownMenuItem className="rounded-lg px-3 py-2 font-black text-[9px] uppercase tracking-widest text-slate-600 focus:bg-teal-500/10 focus:text-teal-600" onClick={() => {
                                setEditingMessageId(msg.id);
                                setNewMessage(msg.content);
                                if (inputRef.current) inputRef.current.focus();
                              }}>
                                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Message
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-lg px-3 py-2 font-black text-[9px] uppercase tracking-widest text-red-500 focus:bg-red-50 focus:text-red-600" onClick={() => setDeletingMessageId(msg.id)}>
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
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
      <div className={`px-4 md:px-6 py-4 transition-all duration-300 ${editingMessageId ? 'bg-teal-500/5' : ''}`}>
        <div className="max-w-5xl mx-auto flex flex-col gap-3">
          <AnimatePresence>
            {editingMessageId && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center justify-between px-4 py-2 bg-teal-500 rounded-xl text-white shadow-lg shadow-teal-500/20">
                <div className="flex items-center gap-2">
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Rewriting Message</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setEditingMessageId(null); setNewMessage(""); }} className="h-6 w-6 text-white hover:bg-white/20 rounded-full">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {pendingAttachment && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center justify-between px-4 py-3 glass-inner rounded-xl border border-white/20 mb-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  {pendingAttachment.mimetype?.startsWith('image/') || pendingAttachment.filename?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                    <div className="h-14 w-14 glass-inner rounded-lg overflow-hidden shrink-0">
                      <img src={pendingAttachment.url.startsWith('http') ? pendingAttachment.url : `${process.env.NEXT_PUBLIC_COMMUNICATION_URL}${pendingAttachment.url}`} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <>
                      <div className="h-10 w-10 bg-teal-500/10 rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-teal-600" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{pendingAttachment.filename}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nexus Ready</span>
                      </div>
                    </>
                  )}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => setPendingAttachment(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 px-2">
              <div className="flex space-x-1">
                <div className="h-1 w-1 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1 w-1 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1 w-1 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-600/60">
                {typingUsers[0]} is transmitting...
              </span>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="glass-inner dark:bg-slate-800/50 rounded-2xl p-2 flex items-center gap-2 border border-white/20 dark:border-white/5">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-all shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="w-5 h-5" />
            </Button>

            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/50 transition-all shrink-0"
                >
                  <Smile className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" align="start" className="p-0 border-none bg-transparent shadow-none w-auto translate-y-[-10px]">
                <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-white/20">
                  <EmojiPicker
                    onEmojiClick={handleEmojiClick}
                    theme={document.documentElement.classList.contains('dark') ? EmojiTheme.DARK : EmojiTheme.LIGHT}
                    autoFocusSearch={false}
                    lazyLoadEmojis={true}
                  />
                </div>
              </PopoverContent>
            </Popover>

            <input
              ref={inputRef}
              type="text"
              placeholder={editingMessageId ? "Refine your transmission..." : "Type a message..."}
              value={newMessage}
              onChange={handleInputChange}
              disabled={sending}
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder-slate-400 text-sm py-2 px-2 outline-none"
            />

            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2 h-10 ml-1"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>{editingMessageId ? 'Update' : 'Send'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

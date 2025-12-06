"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { chatService, Message, ChatGroup } from "@/services/communication/chat.service";
import { toast } from "sonner";
import { Send, Paperclip, CheckCheck, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

interface ChatInterfaceProps {
    chatGroupId: string;
    chatGroupType?: 'group' | 'direct'; // Default to group if not specified
    initialMessages?: Message[];
}

export function ChatInterface({ chatGroupId, chatGroupType = 'group', initialMessages = [] }: ChatInterfaceProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(initialMessages.length === 0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatGroupId) {
            setLoading(true);
            fetchMessages();
            const interval = setInterval(fetchMessages, 5000); // Polling every 5s
            return () => clearInterval(interval);
        }
    }, [chatGroupId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    const fetchMessages = async () => {
        try {
            const data = await chatService.getMessages(chatGroupId, 50, 0);
            // Assuming API returns newest first, reverse for display
            setMessages(data.reverse());
        } catch (error) {
            console.error("Fetch messages error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const msg = await chatService.sendMessage({
                chatGroupId,
                chatGroupType,
                content: newMessage
            });
            setMessages(prev => [...prev, msg]);
            setNewMessage("");
            scrollToBottom();
        } catch (error) {
            console.error("Send message error:", error);
            toast.error("Failed to send message");
        } finally {
            setSending(false);
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
            {/* Messages Area */}
            <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full px-4 py-4">
                    <div className="space-y-4 pb-4">
                        {messages.length === 0 ? (
                            <div className="text-center text-muted-foreground py-10 opacity-50">
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.senderId === user?.id;
                                const isContinuous = idx > 0 && messages[idx - 1].senderId === msg.senderId;

                                return (
                                    <div
                                        key={msg.id || idx}
                                        className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"} ${isContinuous ? "mt-1" : "mt-4"}`}
                                    >
                                        {!isMe && !isContinuous && (
                                            <Avatar className="h-8 w-8 mt-1">
                                                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                                                    {msg.sender?.fullName?.substring(0, 2).toUpperCase() || "??"}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                        {isContinuous && !isMe && <div className="w-8" />} {/* Spacer */}

                                        <div
                                            className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isMe
                                                    ? "bg-[#1a3d32] text-white rounded-tr-none"
                                                    : "bg-white border text-slate-800 rounded-tl-none"
                                                }`}
                                        >
                                            {!isMe && !isContinuous && (
                                                <p className="text-xs font-bold mb-1 opacity-70">
                                                    {msg.sender?.fullName}
                                                </p>
                                            )}
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                            <div className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${isMe ? "text-white/70" : "text-muted-foreground"}`}>
                                                {format(new Date(msg.createdAt), "h:mm a")}
                                                {isMe && <CheckCheck className="h-3 w-3" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:bg-slate-100 rounded-full"
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 rounded-full border-slate-200 focus-visible:ring-[#1a3d32] py-5"
                        disabled={sending}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="rounded-full bg-[#1a3d32] hover:bg-[#142e26] w-12 h-10"
                        disabled={!newMessage.trim() || sending}
                    >
                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 ml-0.5" />}
                    </Button>
                </form>
            </div>
        </div>
    );
}

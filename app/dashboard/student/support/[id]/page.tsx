"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/dashboard/shared/TicketBadges";
import {
    supportTicketService,
    SupportTicket,
} from "@/services/user/supportTicket.service";
import { toast } from "sonner";
import {
    ArrowLeft,
    Send,
    XCircle,
    RotateCcw,
    Clock,
    MessageSquare,
    User,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

export default function StudentTicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = params.id as string;

    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchTicket = async () => {
        try {
            const data = await supportTicketService.getById(ticketId);
            setTicket(data);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load ticket");
            router.push("/dashboard/student/support");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [ticketId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [ticket?.messages]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        setIsSending(true);
        try {
            const updated = await supportTicketService.addMessage(ticketId, newMessage);
            setTicket(updated);
            setNewMessage("");
            toast.success("Message sent");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to send message");
        } finally {
            setIsSending(false);
        }
    };

    const handleStatusChange = async (action: "reopen") => {
        try {
            const updated = await supportTicketService.reopen(ticketId);
            setTicket(updated);
            toast.success("Ticket reopened successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `Failed to reopen ticket`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!ticket) return null;

    const isOpen = ticket.status === "open" || ticket.status === "in_progress" || ticket.status === "pending_user";

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/dashboard/student/support")}
                    className="rounded-full"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {ticket.ticketNumber}
                        </span>
                        <TicketStatusBadge status={ticket.status} />
                        <TicketPriorityBadge priority={ticket.priority} />
                        <Badge variant="outline" className="capitalize text-[10px] h-5 rounded-full">
                            {ticket.category}
                        </Badge>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 line-clamp-1">{ticket.subject}</h1>
                </div>
                {!isOpen && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange("reopen")}
                        className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reopen Ticket
                    </Button>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content: Conversation */}
                <div className="lg:col-span-2">
                    <Card className="border-slate-200 shadow-sm flex flex-col h-[600px]">
                        <CardHeader className="border-b border-slate-100 py-4">
                            <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-indigo-500" />
                                Conversation Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
                            {ticket.messages.map((msg, idx) => {
                                const isStaff = msg.senderType === 'moderator' || msg.senderType === 'admin' || msg.senderType === 'system';
                                return (
                                    <div
                                        key={idx}
                                        className={cn(
                                            "flex flex-col",
                                            isStaff ? "items-start" : "items-end"
                                        )}
                                    >
                                        <div className={cn(
                                            "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
                                            isStaff
                                                ? "bg-white border border-slate-200 rounded-tl-none"
                                                : "bg-indigo-600 text-white rounded-tr-none"
                                        )}>
                                            {isStaff && (
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1">
                                                    {msg.senderName} • {msg.senderType}
                                                </p>
                                            )}
                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                        </div>
                                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </CardContent>

                        {isOpen && (
                            <div className="p-4 border-t border-slate-100 bg-white">
                                <div className="relative group">
                                    <Textarea
                                        placeholder="Type your reply here..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="min-h-[100px] pr-12 focus-visible:ring-indigo-500 border-slate-200 resize-none rounded-xl"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.metaKey) {
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSendMessage}
                                        disabled={!newMessage.trim() || isSending}
                                        className="absolute bottom-3 right-3 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                                    >
                                        {isSending ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2 text-right">
                                    Press <kbd className="font-sans border px-1 rounded bg-slate-50">Cmd + Enter</kbd> to send
                                </p>
                            </div>
                        )}

                        {!isOpen && (
                            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                                <p className="text-sm text-slate-500 font-medium italic">
                                    This ticket is currently closed. If you need further assistance with this issue, please reopen it.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar: Details */}
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                            <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-widest">
                                Ticket Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5">
                            <div>
                                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Status</label>
                                <div className="flex items-center gap-2">
                                    <TicketStatusBadge status={ticket.status} />
                                    {ticket.status === 'resolved' && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Verified</Badge>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Assigned Support Staff</label>
                                {ticket.assignedToName ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <User className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{ticket.assignedToName}</p>
                                            <p className="text-[10px] text-slate-500 capitalize">{ticket.assignedTo?.role || 'Support Agent'}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <Clock className="h-4 w-4" />
                                        <p className="text-sm font-medium">Pending Assignment</p>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            <div>
                                <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Created On</label>
                                <p className="text-sm text-slate-700 font-medium">
                                    {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                                </p>
                                <p className="text-xs text-slate-400">
                                    at {format(new Date(ticket.createdAt), "h:mm a")}
                                </p>
                            </div>

                            {ticket.resolvedAt && (
                                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                                    <label className="text-[10px] font-bold uppercase text-emerald-600 block mb-1">Resolved On</label>
                                    <p className="text-sm text-emerald-800 font-bold">
                                        {format(new Date(ticket.resolvedAt), "MMM d, yyyy")}
                                    </p>
                                    <p className="text-xs text-emerald-600">
                                        by {ticket.resolvedBy || 'System'}
                                    </p>
                                </div>
                            )}

                            {ticket.description && (
                                <>
                                    <Separator />
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Initial Complaint</label>
                                        <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-indigo-200 pl-3">
                                            "{ticket.description}"
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-indigo-900 shadow-inner">
                        <h4 className="text-sm font-bold mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Need more help?
                        </h4>
                        <p className="text-xs text-indigo-700 leading-relaxed">
                            Our support team is available Sunday-Thursday, 9 AM - 5 PM.
                            Replies may take up to 24 hours during weekends or busy periods.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/dashboard/shared/TicketBadges";
import { RoleBadge } from "@/components/dashboard/shared/RoleBadge";
import {
    supportTicketService,
    SupportTicket,
    TicketStatus,
    TicketPriority,
} from "@/services/user/supportTicket.service";
import { adminService } from "@/services/user/admin.service";
import { toast } from "sonner";
import {
    ArrowLeft,
    Send,
    CheckCircle,
    XCircle,
    RotateCcw,
    User,
    Clock,
    MessageSquare,
    StickyNote,
    UserCheck,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default function TicketDetailPage() {
    const params = useParams();
    const router = useRouter();
    const ticketId = params.id as string;

    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const [newNote, setNewNote] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [admins, setAdmins] = useState<{ id: string; fullName: string; role: string }[]>([]);
    const [showNotes, setShowNotes] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchTicket = async () => {
        try {
            const data = await supportTicketService.getById(ticketId);
            setTicket(data);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load ticket");
            router.push("/dashboard/admin/support");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAdmins = async () => {
        try {
            const data = await adminService.getAll({ role: undefined });
            setAdmins(data.admins.map((a: { id: string; fullName: string; role: string }) => ({
                id: a.id,
                fullName: a.fullName,
                role: a.role,
            })));
        } catch {
            // Silently fail
        }
    };

    useEffect(() => {
        fetchTicket();
        fetchAdmins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        setIsSending(true);
        try {
            const updated = await supportTicketService.addInternalNote(ticketId, newNote);
            setTicket(updated);
            setNewNote("");
            toast.success("Note added");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to add note");
        } finally {
            setIsSending(false);
        }
    };

    const handleStatusChange = async (action: "resolve" | "close" | "reopen") => {
        try {
            let updated: SupportTicket;
            if (action === "resolve") {
                updated = await supportTicketService.resolve(ticketId);
            } else if (action === "close") {
                updated = await supportTicketService.close(ticketId);
            } else {
                updated = await supportTicketService.reopen(ticketId);
            }
            setTicket(updated);
            toast.success(`Ticket ${action}d successfully`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : `Failed to ${action} ticket`);
        }
    };

    const handleAssign = async (assigneeId: string) => {
        try {
            const updated = await supportTicketService.assign(ticketId, assigneeId);
            setTicket(updated);
            toast.success("Ticket assigned successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to assign ticket");
        }
    };

    const handlePriorityChange = async (priority: TicketPriority) => {
        try {
            const updated = await supportTicketService.update(ticketId, { priority });
            setTicket(updated);
            toast.success("Priority updated");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update priority");
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!ticket) {
        return (
            <DashboardLayout>
                <div className="text-center py-24">
                    <p className="text-lg text-muted-foreground">Ticket not found</p>
                </div>
            </DashboardLayout>
        );
    }

    const isOpen = ticket.status === "open" || ticket.status === "in_progress" || ticket.status === "pending_user";

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/dashboard/admin/support")}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-mono text-muted-foreground">
                                {ticket.ticketNumber}
                            </span>
                            <TicketStatusBadge status={ticket.status} />
                            <TicketPriorityBadge priority={ticket.priority} />
                            <Badge variant="outline" className="capitalize">
                                {ticket.category}
                            </Badge>
                        </div>
                        <h1 className="text-2xl font-bold text-[#344e41] mt-1">{ticket.subject}</h1>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Messages */}
                        <Card className="border-[#a3b18a]/30">
                            <CardHeader className="flex-row items-center justify-between pb-2">
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="h-5 w-5" />
                                    Conversation
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowNotes(!showNotes)}
                                    className={showNotes ? "bg-yellow-100" : ""}
                                >
                                    <StickyNote className="h-4 w-4 mr-1" />
                                    {showNotes ? "Show Messages" : "Internal Notes"}
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {!showNotes ? (
                                    <>
                                        <div className="space-y-4 max-h-[500px] overflow-y-auto mb-4">
                                            {ticket.messages.map((msg, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`flex ${msg.senderType === "user" ? "justify-start" : "justify-end"}`}
                                                >
                                                    <div
                                                        className={`max-w-[80%] rounded-lg p-3 ${msg.senderType === "user"
                                                            ? "bg-gray-100"
                                                            : msg.senderType === "system"
                                                                ? "bg-blue-50 border border-blue-200"
                                                                : "bg-[#588157]/10"
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-medium">
                                                                {msg.senderName}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        {isOpen && (
                                            <div className="flex gap-2">
                                                <Textarea
                                                    placeholder="Type your reply..."
                                                    value={newMessage}
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    className="resize-none"
                                                    rows={3}
                                                />
                                                <Button
                                                    onClick={handleSendMessage}
                                                    disabled={!newMessage.trim() || isSending}
                                                    className="bg-[#588157] hover:bg-[#3a5a40]"
                                                >
                                                    <Send className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                                            {ticket.internalNotes && ticket.internalNotes.length > 0 ? (
                                                ticket.internalNotes.map((note, idx) => (
                                                    <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-medium">{note.addedByName}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm">{note.note}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-8">
                                                    No internal notes yet
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <Textarea
                                                placeholder="Add internal note (not visible to user)..."
                                                value={newNote}
                                                onChange={(e) => setNewNote(e.target.value)}
                                                className="resize-none"
                                                rows={2}
                                            />
                                            <Button
                                                onClick={handleAddNote}
                                                disabled={!newNote.trim() || isSending}
                                                variant="outline"
                                                className="border-yellow-400"
                                            >
                                                <StickyNote className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Actions */}
                        <Card className="border-[#a3b18a]/30">
                            <CardHeader>
                                <CardTitle className="text-sm">Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {isOpen ? (
                                    <>
                                        <Button
                                            onClick={() => handleStatusChange("resolve")}
                                            className="w-full bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Resolve Ticket
                                        </Button>
                                        <Button
                                            onClick={() => handleStatusChange("close")}
                                            variant="outline"
                                            className="w-full border-gray-400"
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Close Ticket
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => handleStatusChange("reopen")}
                                        variant="outline"
                                        className="w-full border-blue-400 text-blue-600"
                                    >
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Reopen Ticket
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Details */}
                        <Card className="border-[#a3b18a]/30">
                            <CardHeader>
                                <CardTitle className="text-sm">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Priority */}
                                <div>
                                    <label className="text-xs text-muted-foreground">Priority</label>
                                    <Select
                                        value={ticket.priority}
                                        onValueChange={(v) => handlePriorityChange(v as TicketPriority)}
                                        disabled={!isOpen}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low</SelectItem>
                                            <SelectItem value="medium">Medium</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="urgent">Urgent</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Assign */}
                                <div>
                                    <label className="text-xs text-muted-foreground">Assigned To</label>
                                    <Select
                                        value={ticket.assignedTo?._id || "unassigned"}
                                        onValueChange={(v) => v !== "unassigned" && handleAssign(v)}
                                        disabled={!isOpen}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Unassigned" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {admins.map((admin) => (
                                                <SelectItem key={admin.id} value={admin.id}>
                                                    {admin.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator />

                                {/* Created By */}
                                <div>
                                    <label className="text-xs text-muted-foreground">Created By</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{ticket.createdByName}</span>
                                        <RoleBadge role={ticket.createdByType} size="sm" />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{ticket.createdByEmail}</p>
                                </div>

                                {/* Created At */}
                                <div>
                                    <label className="text-xs text-muted-foreground">Created</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">
                                            {format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}
                                        </span>
                                    </div>
                                </div>

                                {ticket.resolvedAt && (
                                    <div>
                                        <label className="text-xs text-muted-foreground">Resolved</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                            <span className="text-sm">
                                                {format(new Date(ticket.resolvedAt), "MMM d, yyyy 'at' h:mm a")}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

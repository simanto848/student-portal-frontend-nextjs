"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/dashboard/shared/TicketBadges";
import {
    supportTicketService,
    SupportTicket,
} from "@/services/user/supportTicket.service";
import { toast } from "sonner";
import {
    MessageSquare,
    Plus,
    RefreshCw,
    Inbox,
    Clock,
    CheckCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function StudentSupportPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const data = await supportTicketService.getMyTickets();
            setTickets(data || []);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load tickets");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Support Center"
                subtitle="Get help with your academic or technical issues"
                icon={MessageSquare}
                actionLabel="Create New Ticket"
                onAction={() => router.push("/dashboard/student/support/create")}
            />

            {/* Stats Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white border-none shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <MessageSquare className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Total Tickets</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Open & In Progress</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.open}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-sm">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-green-100 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Resolved</p>
                            <p className="text-2xl font-bold text-slate-900">{stats.resolved}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tickets List */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-200 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-indigo-500" />
                            My Support Tickets
                        </CardTitle>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchData}
                            disabled={isRefreshing}
                            className="bg-white border-slate-200 text-slate-600"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : tickets.length === 0 ? (
                        <div className="text-center py-20 px-4">
                            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Inbox className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No tickets yet</h3>
                            <p className="text-slate-500 max-w-sm mx-auto mb-6">
                                If you have any issues or questions, feel free to create a support ticket.
                            </p>
                            <Button
                                onClick={() => router.push("/dashboard/student/support/create")}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create First Ticket
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    className="flex items-start justify-between p-5 hover:bg-slate-50 transition-colors cursor-pointer"
                                    onClick={() => router.push(`/dashboard/student/support/${ticket.id}`)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap mb-2">
                                            <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                {ticket.ticketNumber}
                                            </span>
                                            <TicketStatusBadge status={ticket.status} />
                                            <TicketPriorityBadge priority={ticket.priority} />
                                            {ticket.category && (
                                                <Badge variant="outline" className="capitalize text-[10px] h-5 rounded-full border-slate-200 text-slate-500">
                                                    {ticket.category}
                                                </Badge>
                                            )}
                                        </div>
                                        <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                            {ticket.subject}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-1 mt-1">
                                            {ticket.description}
                                        </p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 font-medium">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                                            </div>
                                            {ticket.assignedToName && (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span>Assigned to {ticket.assignedToName}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 ml-4 self-center">
                                        {ticket.messages.length > 1 && (
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
                                                <MessageSquare className="h-3 w-3" />
                                                {ticket.messages.length}
                                            </div>
                                        )}
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="h-4 w-4 rotate-45" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

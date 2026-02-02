"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TicketStatusBadge, TicketPriorityBadge } from "@/components/dashboard/shared/TicketBadges";
import {
    supportTicketService,
    SupportTicket,
    TicketStatistics,
    TicketStatus,
    TicketPriority,
} from "@/services/user/supportTicket.service";
import { toast } from "sonner";
import {
    Search,
    RefreshCw,
    MessageSquare,
    Clock,
    AlertTriangle,
    CheckCircle,
    Users,
    Inbox,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function SupportTicketsPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [stats, setStats] = useState<TicketStatistics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const [ticketData, statsData] = await Promise.all([
                supportTicketService.getAll({
                    status: statusFilter === "all" ? undefined : statusFilter,
                    priority: priorityFilter === "all" ? undefined : priorityFilter,
                    search: search || undefined,
                }),
                supportTicketService.getStatistics(),
            ]);
            setTickets(ticketData.tickets || []);
            setStats(statsData);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to load tickets");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, priorityFilter]);

    const handleSearch = () => {
        fetchData();
    };

    const filteredTickets = useMemo(() => {
        if (!search) return tickets;
        const searchLower = search.toLowerCase();
        return tickets.filter(
            (t) =>
                t.subject.toLowerCase().includes(searchLower) ||
                t.ticketNumber.toLowerCase().includes(searchLower) ||
                t.createdByName.toLowerCase().includes(searchLower)
        );
    }, [tickets, search]);

    const statCards = [
        {
            label: "Total Tickets",
            value: stats?.total || 0,
            icon: MessageSquare,
            color: "bg-blue-100 text-blue-600",
        },
        {
            label: "Open",
            value: stats?.byStatus.open || 0,
            icon: Inbox,
            color: "bg-yellow-100 text-yellow-600",
        },
        {
            label: "In Progress",
            value: stats?.byStatus.in_progress || 0,
            icon: Clock,
            color: "bg-orange-100 text-orange-600",
        },
        {
            label: "Urgent",
            value: stats?.urgentOpen || 0,
            icon: AlertTriangle,
            color: "bg-red-100 text-red-600",
        },
        {
            label: "Unassigned",
            value: stats?.unassigned || 0,
            icon: Users,
            color: "bg-purple-100 text-purple-600",
        },
        {
            label: "Resolved",
            value: stats?.byStatus.resolved || 0,
            icon: CheckCircle,
            color: "bg-green-100 text-green-600",
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="Support Tickets"
                    subtitle="Manage user support requests and inquiries"
                />

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    {statCards.map((stat) => (
                        <Card key={stat.label} className="bg-white border-none shadow-sm">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${stat.color}`}>
                                        <stat.icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                                        <p className="text-xl font-bold text-[#344e41]">{stat.value}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search tickets..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                className="pl-9 w-64"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TicketStatus | "all")}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="pending_user">Pending User</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TicketPriority | "all")}>
                            <SelectTrigger className="w-36">
                                <SelectValue placeholder="Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priority</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        variant="outline"
                        onClick={fetchData}
                        disabled={isRefreshing}
                        className="border-[#a3b18a] text-[#344e41]"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                {/* Tickets List */}
                <Card className="border-[#a3b18a]/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Tickets
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-lg font-medium text-[#344e41]">No tickets found</p>
                                <p className="text-sm text-muted-foreground">
                                    {search || statusFilter !== "all" || priorityFilter !== "all"
                                        ? "Try adjusting your filters"
                                        : "No support tickets have been created yet"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredTickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        className="flex items-start justify-between p-4 rounded-lg border border-[#a3b18a]/30 hover:bg-[#dad7cd]/20 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/dashboard/moderator/support/${ticket.id}`)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="text-xs font-mono text-muted-foreground">
                                                    {ticket.ticketNumber}
                                                </span>
                                                <TicketStatusBadge status={ticket.status} />
                                                <TicketPriorityBadge priority={ticket.priority} />
                                                {ticket.category && (
                                                    <Badge variant="outline" className="capitalize">
                                                        {ticket.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <h3 className="font-medium text-[#344e41] truncate">
                                                {ticket.subject}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                <span>By: {ticket.createdByName}</span>
                                                <span>•</span>
                                                <span>
                                                    {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                                                </span>
                                                {ticket.assignedToName && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Assigned: {ticket.assignedToName}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            {ticket.messages.length > 1 && (
                                                <Badge variant="secondary" className="flex items-center gap-1">
                                                    <MessageSquare className="h-3 w-3" />
                                                    {ticket.messages.length}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

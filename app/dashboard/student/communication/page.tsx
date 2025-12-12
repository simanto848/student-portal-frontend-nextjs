"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Send,
  Bell,
  Users,
  Search,
  Loader2,
} from "lucide-react";
import { chatService, Message } from "@/services/communication/chat.service";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ChatGroupListItem = {
  id: string;
  type: "BatchChatGroup" | "CourseChatGroup";
  batchId: string;
  courseId?: string;
  courseCode?: string;
  courseName?: string;
  batchName?: string;
  lastMessage?: Message | null;
  updatedAt?: string;
};

export default function StudentCommunicationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<ChatGroupListItem[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data =
          (await chatService.listMyChatGroups()) as ChatGroupListItem[];
        setGroups(Array.isArray(data) ? data : []);
        if (Array.isArray(data) && data.length > 0) {
          setSelectedGroupId(data[0].id);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load channels.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedGroupId) {
        setMessages([]);
        return;
      }
      try {
        const data = await chatService.getMessages(selectedGroupId, 30, 0);
        // backend returns newest-first; show oldest-first in UI
        setMessages([...(data || [])].reverse());
      } catch (e: any) {
        setError(e?.message || "Failed to load messages.");
      }
    };

    loadMessages();
  }, [selectedGroupId]);

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => JSON.stringify(g).toLowerCase().includes(q));
  }, [groups, searchQuery]);

  const unreadCount = 0;
  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl bg-linear-to-r from-[#0b3b2a] via-[#1f5a44] to-[#3e6253] text-white p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_40%)]" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm text-white/70 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Communication Center
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                Stay informed. Read course announcements.
              </h1>
              <p className="text-white/75 max-w-2xl">
                This space is read-only for students: browse channels,
                announcements, and recent messages.
              </p>
              <div className="flex gap-3 flex-wrap pt-1">
                <Button
                  size="sm"
                  className="bg-white text-[#1a3d32] hover:bg-white/90 shadow-md"
                >
                  Mark all as read
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                >
                  Notification settings
                </Button>
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur p-4 min-w-[220px] shadow-lg">
              <p className="text-xs uppercase tracking-wide text-white/80">
                Unread
              </p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-4xl font-bold">
                  {unreadCount.toString().padStart(2, "0")}
                </span>
                <span className="text-sm text-white/70">messages</span>
              </div>
              <p className="text-[11px] text-white/70 mt-2">
                Across all enrolled courses.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-2 flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#3e6253]" /> Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                <Input
                  placeholder="Search channels"
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : (
                filteredGroups.map((g) => {
                  const title =
                    g.type === "CourseChatGroup"
                      ? `${g.courseCode || "COURSE"} • ${
                          g.courseName || "Course"
                        }`
                      : `${g.batchName || "Batch"} • Counselor`;
                  const last = g.lastMessage?.content || "No messages yet";
                  const isSelected = g.id === selectedGroupId;

                  return (
                    <div
                      key={g.id}
                      className={`rounded-xl border p-3 transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-[#3e6253]/40 bg-[#3e6253]/5"
                          : "border-gray-100 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedGroupId(g.id)}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#1a3d32]">
                          {title}
                        </p>
                        {/* Read-only: unread tracking not implemented */}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {last}
                      </p>
                    </div>
                  );
                })
              )}

              {!loading && filteredGroups.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No channels available.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm lg:col-span-2 transition-all duration-300 hover:shadow-lg">
            <CardHeader className="pb-2 flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                <Users className="h-4 w-4 text-[#3e6253]" /> Recent Messages
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-[#3e6253]">
                View all
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedGroup ? (
                <div className="text-xs text-muted-foreground">
                  Channel:{" "}
                  {selectedGroup.type === "CourseChatGroup"
                    ? selectedGroup.courseCode || selectedGroup.courseId
                    : selectedGroup.batchName || selectedGroup.batchId}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  Select a channel to view messages.
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-xl border border-gray-100 p-3 hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-[#1a3d32] font-semibold">
                      {msg.sender?.fullName || msg.senderId}
                      <Badge
                        variant="outline"
                        className="text-xs text-[#3e6253] border-[#3e6253]/40"
                      >
                        {msg.senderModel}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleString()
                        : ""}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              ))}

              {selectedGroupId && messages.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No messages yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
              <Send className="h-4 w-4 text-[#3e6253]" /> Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Students have read-only access here; outbound messaging may be
            disabled by your institution. For urgent matters, contact your
            instructor via official channels.
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

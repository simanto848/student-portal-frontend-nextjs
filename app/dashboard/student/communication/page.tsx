/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Search,
  Loader2,
  BookOpen,
  Users,
  User,
  GraduationCap,
} from "lucide-react";
import { chatService, Message } from "@/services/communication/chat.service";
import { ChatInterface } from "@/components/dashboard/communication/ChatInterface";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { batchService } from "@/services/academic/batch.service";
import { notifyError } from "@/components/toast";

type ChatGroupListItem = {
  id: string;
  type: "BatchChatGroup" | "CourseChatGroup";
  batchId: string;
  courseId?: string;
  courseCode?: string;
  courseName?: string;
  batchName?: string;
  instructorName?: string;
  lastMessage?: Message | null;
  updatedAt?: string;
};

export default function StudentCommunicationPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<ChatGroupListItem[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ChatGroupListItem | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("course");
  const [canPin, setCanPin] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data =
          (await chatService.listMyChatGroups()) as ChatGroupListItem[];
        setGroups(Array.isArray(data) ? data : []);
      } catch (e: any) {
        notifyError(e?.message || "Failed to load channels.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const checkPermissions = async () => {
      if (!selectedGroup || !user) {
        setCanPin(false);
        return;
      }

      if (selectedGroup.type === "BatchChatGroup") {
        try {
          const batch = await batchService.getBatchById(selectedGroup.batchId);
          const crId =
            typeof batch.classRepresentativeId === "object"
              ? (batch.classRepresentativeId as any)._id ||
                (batch.classRepresentativeId as any).id
              : batch.classRepresentativeId;

          const userId = user.id || user._id;
          if (crId && userId && crId.toString() === userId.toString()) {
            setCanPin(true);
          } else {
            setCanPin(false);
          }
        } catch (err) {
          console.error("Failed to check CR permissions", err);
          setCanPin(false);
        }
      } else {
        setCanPin(false);
      }
    };

    checkPermissions();
  }, [selectedGroup, user]);

  const filteredGroups = useMemo(() => {
    let filtered = groups;

    if (activeTab === "course") {
      filtered = filtered.filter((g) => g.type === "CourseChatGroup");
    } else {
      filtered = filtered.filter((g) => g.type === "BatchChatGroup");
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((g) =>
        JSON.stringify(g).toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [groups, searchQuery, activeTab]);

  useEffect(() => {
    if (!selectedGroup && filteredGroups.length > 0 && !loading) {
      // setSelectedGroup(filteredGroups[0]); // Optional: Auto-select first group
    }
  }, [filteredGroups, selectedGroup, loading]);

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-100px)] -m-4 md:-m-8 overflow-hidden bg-gray-50/50">
        {/* Sidebar - Group List */}
        <div className="w-full md:w-[380px] flex flex-col border-r bg-white z-10">
          {/* Header */}
          <div className="p-4 border-b space-y-4">
            <div className="flex items-center gap-2 text-[#1a3d32]">
              <div className="p-2 bg-[#1a3d32]/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-[#1a3d32]" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-none">Messages</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Your academic conversations
                </p>
              </div>
            </div>

            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
              <Input
                placeholder="Search conversations..."
                className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-[#1a3d32]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            defaultValue="course"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full flex-1 flex flex-col"
          >
            <div className="px-4 pt-2">
              <TabsList className="w-full grid grid-cols-2 bg-gray-100/80 p-1">
                <TabsTrigger
                  value="course"
                  className="data-[state=active]:bg-white data-[state=active]:text-[#1a3d32] data-[state=active]:shadow-sm"
                >
                  Course Groups
                </TabsTrigger>
                <TabsTrigger
                  value="batch"
                  className="data-[state=active]:bg-white data-[state=active]:text-[#1a3d32] data-[state=active]:shadow-sm"
                >
                  Batch Groups
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="course" className="flex-1 mt-0">
              <GroupList
                groups={filteredGroups}
                selectedId={selectedGroup?.id}
                onSelect={setSelectedGroup}
                loading={loading}
                type="course"
              />
            </TabsContent>

            <TabsContent value="batch" className="flex-1 mt-0">
              <GroupList
                groups={filteredGroups}
                selectedId={selectedGroup?.id}
                onSelect={setSelectedGroup}
                loading={loading}
                type="batch"
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Content - Chat Interface */}
        <div className="flex-1 flex flex-col bg-gray-50/50 relative">
          {selectedGroup ? (
            <div className="absolute inset-0 flex flex-col">
              {/* Chat Header */}
              <div className="h-16 border-b bg-white px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#1a3d32]/5 flex items-center justify-center text-[#1a3d32]">
                    {selectedGroup.type === "CourseChatGroup" ? (
                      <BookOpen className="h-5 w-5" />
                    ) : (
                      <Users className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-bold text-[#1a3d32] flex items-center gap-2">
                      {selectedGroup.type === "CourseChatGroup"
                        ? selectedGroup.courseName
                        : selectedGroup.batchName}
                      {selectedGroup.courseCode && (
                        <Badge
                          variant="outline"
                          className="text-xs font-normal text-[#1a3d32] border-[#1a3d32]/20"
                        >
                          {selectedGroup.courseCode}
                        </Badge>
                      )}
                    </h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {selectedGroup.type === "CourseChatGroup" ? (
                        <>
                          <User className="h-3 w-3" />
                          {selectedGroup.instructorName || "Instructor"}
                        </>
                      ) : (
                        <>
                          <GraduationCap className="h-3 w-3" />
                          Official Batch Discussion
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-hidden">
                <ChatInterface
                  key={selectedGroup.id} // Force remount on group change
                  chatGroupId={selectedGroup.id}
                  chatGroupType={selectedGroup.type}
                  canPin={canPin}
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
              <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Select a conversation
              </h3>
              <p className="max-w-sm mt-2 text-sm">
                Choose a course or batch group from the sidebar to start viewing
                messages and announcements.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function GroupList({
  groups,
  selectedId,
  onSelect,
  loading,
  type,
}: {
  groups: ChatGroupListItem[];
  selectedId?: string;
  onSelect: (g: ChatGroupListItem) => void;
  loading: boolean;
  type: "course" | "batch";
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-muted-foreground">
        <p className="text-sm">No {type} groups found.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col p-3 gap-2">
        {groups.map((group) => {
          const isSelected = group.id === selectedId;
          return (
            <button
              key={group.id}
              onClick={() => onSelect(group)}
              className={cn(
                "flex flex-col items-start text-left p-3 rounded-xl transition-all duration-200 border",
                isSelected
                  ? "bg-[#1a3d32]/5 border-[#1a3d32]/20 shadow-sm"
                  : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"
              )}
            >
              <div className="w-full flex justify-between items-start mb-1">
                <span
                  className={cn(
                    "font-semibold text-sm line-clamp-1",
                    isSelected ? "text-[#1a3d32]" : "text-gray-900"
                  )}
                >
                  {type === "course"
                    ? group.courseName || "Unknown Course"
                    : group.batchName || "Unknown Batch"}
                </span>
                {group.courseCode && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 h-5 shrink-0 ml-2 bg-gray-100 text-gray-600"
                  >
                    {group.courseCode}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                {type === "course" ? (
                  <>
                    <User className="h-3 w-3" />
                    <span className="line-clamp-1">
                      {group.instructorName || "Instructor"}
                    </span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-3 w-3" />
                    <span>Batch Counselor</span>
                  </>
                )}
              </div>

              <div className="w-full text-xs text-gray-500 line-clamp-1 pl-2 border-l-2 border-gray-200">
                {group.lastMessage?.content || (
                  <span className="italic opacity-70">No messages yet</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}

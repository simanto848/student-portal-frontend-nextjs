/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    MessageSquare,
    Search,
    BookOpen,
    Users,
    Edit3,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Message } from "@/services/communication/chat.service";
import { ChatInterface } from "@/components/dashboard/communication/ChatInterface";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import StudentLoading from "@/components/StudentLoading";
import { listMyChatGroupsAction, getBatchByIdAction } from "../actions";

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

// Query keys for chat groups
const chatKeys = {
    all: ["chat"] as const,
    groups: () => [...chatKeys.all, "groups"] as const,
    myGroups: () => [...chatKeys.groups(), "mine"] as const,
};

export default function CommunicationClient() {
    const { user } = useAuth();
    const [selectedGroup, setSelectedGroup] = useState<ChatGroupListItem | null>(
        null,
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("course");
    const [canPin, setCanPin] = useState(false);

    // Use React Query for data fetching
    const {
        data: groups = [],
        isLoading,
    } = useQuery({
        queryKey: chatKeys.myGroups(),
        queryFn: async () => {
            const data =
                (await listMyChatGroupsAction()) as ChatGroupListItem[];
            return Array.isArray(data) ? data : [];
        },
    });

    useEffect(() => {
        const checkPermissions = async () => {
            if (!selectedGroup || !user) {
                setCanPin(false);
                return;
            }

            if (selectedGroup.type === "BatchChatGroup") {
                try {
                    const batch = await getBatchByIdAction(selectedGroup.batchId);
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
                JSON.stringify(g).toLowerCase().includes(q),
            );
        }

        return filtered;
    }, [groups, searchQuery, activeTab]);

    if (isLoading) {
        return (
            <StudentLoading />
        );
    }

    return (
        <div className="h-full min-h-0 overflow-hidden -m-4 md:-m-8 bg-architectural/20">
            <div className="flex gap-6 h-full p-4 md:p-8">
                {/* Sidebar - Group List */}
                <aside
                    className={cn(
                        "w-full md:w-80 glass-panel rounded-3xl flex flex-col overflow-hidden transition-all duration-500 shadow-2xl border-white/40 dark:border-white/5 bg-white/40 dark:bg-slate-900/50",
                        selectedGroup ? "hidden md:flex" : "flex",
                    )}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/20 dark:border-white/5 bg-white/10">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.3em] flex items-center gap-2">
                                Messages
                            </h2>
                            <button className="h-9 w-9 glass-inner flex items-center justify-center rounded-xl hover:bg-teal-500/10 hover:text-teal-600 transition-all text-slate-400">
                                <Edit3 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="relative mb-6 group">
                            <Input
                                placeholder="Search conversations..."
                                className="w-full glass-inner border-0 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-teal-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:italic transition-all shadow-inner bg-white/50 dark:bg-slate-800/50 dark:text-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3.5 top-3 transition-colors group-focus-within:text-teal-500" />
                        </div>

                        <div className="flex p-1.5 glass-inner rounded-2xl border border-white/30">
                            <button
                                onClick={() => setActiveTab("course")}
                                className={cn(
                                    "flex-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all",
                                    activeTab === "course"
                                        ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-lg"
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                )}
                            >
                                Course
                            </button>
                            <button
                                onClick={() => setActiveTab("batch")}
                                className={cn(
                                    "flex-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all",
                                    activeTab === "batch"
                                        ? "bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-lg"
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                )}
                            >
                                Batch
                            </button>
                        </div>
                    </div>

                    {/* Groups List */}
                    <ScrollArea className="flex-1 bg-white/5">
                        <div className="p-4 space-y-3">
                            {filteredGroups.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-muted-foreground">
                                    <p className="text-sm">No {activeTab} groups found.</p>
                                </div>
                            ) : (
                                filteredGroups.map((group) => (
                                    <GroupItem
                                        key={group.id}
                                        group={group}
                                        isSelected={selectedGroup?.id === group.id}
                                        onSelect={setSelectedGroup}
                                        type={activeTab as "course" | "batch"}
                                    />
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </aside>

                {/* Main Content - Chat Interface */}
                <section className={cn(
                    "flex-1 glass-panel rounded-3xl flex flex-col overflow-hidden relative shadow-2xl border-white/30 dark:border-white/5 bg-white/30 dark:bg-slate-900/30",
                    !selectedGroup && "hidden md:flex"
                )}>
                    {selectedGroup ? (
                        <div className="absolute inset-0 flex flex-col">
                            <ChatInterface
                                key={selectedGroup.id} // Force remount on group change
                                chatGroupId={selectedGroup.id}
                                chatGroupType={selectedGroup.type}
                                canPin={canPin}
                                title={selectedGroup.type === "CourseChatGroup" ? selectedGroup.courseName : selectedGroup.batchName}
                                subtitle={selectedGroup.type === "CourseChatGroup" ? `${selectedGroup.instructorName || "Instructor"} • Active Now` : "Official Batch Discussion"}
                                courseCode={selectedGroup.courseCode}
                                onBack={() => setSelectedGroup(null)}
                            />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/5 backdrop-blur-[2px]">
                            <div className="h-24 w-24 glass-inner rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl border border-white/20 animate-in zoom-in-50 duration-500">
                                <MessageSquare className="h-10 w-10 text-teal-600/60" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-widest">
                                Select a conversation
                            </h3>
                            <p className="max-w-xs mt-4 text-xs font-black uppercase tracking-[0.2em] text-slate-500/80 dark:text-slate-400/80 leading-relaxed">
                                Choose a course or batch group<br />from the sidebar to start<br />viewing messages and announcements.
                            </p>
                        </div>
                    )}
                </section>
            </div >
        </div >
    );
}

function GroupItem({
    group,
    isSelected,
    onSelect,
    type,
}: {
    group: ChatGroupListItem;
    isSelected: boolean;
    onSelect: (g: ChatGroupListItem) => void;
    type: "course" | "batch";
}) {
    return (
        <div
            onClick={() => onSelect(group)}
            className={cn(
                "group relative flex items-center p-4 rounded-3xl cursor-pointer transition-all border outline-none",
                isSelected
                    ? "bg-teal-500/10 border-teal-500/40 shadow-[0_8px_32px_rgba(20,184,166,0.15)] scale-[1.02]"
                    : "hover:bg-white/40 dark:hover:bg-white/5 border-transparent hover:border-white/40 dark:hover:border-white/10"
            )}
        >
            <div className="relative h-12 w-12 shrink-0">
                <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner border border-white/20 dark:border-white/10",
                    isSelected ? "bg-teal-500 text-white rotate-6 scale-110 shadow-teal-500/50" : "bg-white/50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:rotate-3"
                )}>
                    {type === "course" ? (
                        <BookOpen className="h-6 w-6" />
                    ) : (
                        <Users className="h-6 w-6" />
                    )}
                </div>
                {isSelected && (
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-teal-500 border-2 border-white rounded-full animate-pulse shadow-lg" />
                )}
            </div>
            <div className="ml-4 flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                    <h3 className={cn(
                        "text-[11px] font-black uppercase tracking-widest truncate transition-colors",
                        isSelected ? "text-teal-600 dark:text-teal-400" : "text-slate-700 dark:text-slate-200"
                    )}>
                        {type === "course"
                            ? group.courseName || "Unknown Course"
                            : group.batchName || "Unknown Batch"}
                    </h3>
                    {group.courseCode && (
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            isSelected ? "text-teal-500/60" : "text-slate-400"
                        )}>
                            {group.courseCode}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <p className={cn(
                        "text-[10px] font-bold truncate flex-1 tracking-wide",
                        isSelected ? "text-teal-600/70 dark:text-teal-400/70" : "text-slate-500 dark:text-slate-400"
                    )}>
                        {group.lastMessage?.content || (
                            <span className="italic opacity-50 font-medium">Clear channels...</span>
                        )}
                    </p>
                    {group.updatedAt && (
                        <span className="text-[8px] font-black text-slate-400 uppercase">
                            {new Date(group.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

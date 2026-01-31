"use client";

import React, { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { batchCourseInstructorService } from "@/services/enrollment/batchCourseInstructor.service";
import { BatchCourseInstructor } from "@/services/enrollment/batchCourseInstructor.service";
import {
  courseGradeService,
  ResultWorkflow,
} from "@/services/enrollment/courseGrade.service";
import { toast } from "sonner";
import {
  Search,
  Activity,
  MessageCircle,
  Code,
  Terminal,
  ArrowRight,
  CheckCircle,
  FileText,
  FlaskConical,
  Pencil,
  PlusCircle,
  Megaphone,
  CalendarCheck,
  FolderOpen
} from "lucide-react";
import { notificationService, NotificationItem } from "@/services/notification/notification.service";
import { chatService } from "@/services/communication/chat.service";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { TeacherNotification } from "./fragments/TeacherNotification";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<BatchCourseInstructor[]>([]);
  const [workflows, setWorkflows] = useState<ResultWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useSyncExternalStore(
    () => () => { },
    () => true,
    () => false
  );

  // Notifications
  // Notifications & Messages
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentChats, setRecentChats] = useState<any[]>([]);

  const fetchDashboardData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const promises: Promise<any>[] = [
        batchCourseInstructorService.getInstructorCourses(user.id),
        courseGradeService.getWorkflow({ mine: true }),

        notificationService.list({ page: 1, limit: 10, mine: true }),
        chatService.listMyChatGroups()
      ];

      const results = await Promise.allSettled(promises);

      const coursesResult = results[0];
      const workflowResult = results[1];
      const notificationsResult = results[2];
      const chatsResult = results[3];

      if (coursesResult.status === 'fulfilled') setCourses(coursesResult.value);
      if (workflowResult.status === 'fulfilled') setWorkflows(workflowResult.value || []);
      if (chatsResult.status === 'fulfilled') {
        // Filter chats that have at least one message for the "Recent Messages" view
        const activeChats = (chatsResult.value || []).filter((c: any) => c.lastMessage);
        setRecentChats(activeChats);
      }

      if (notificationsResult.status === 'fulfilled') {
        const notifData = notificationsResult.value;
        const items = notifData.items || notifData.notifications || [];
        setNotifications(items);
        const unread = items.filter((n: NotificationItem) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleMarkAllRead = async () => {
    try {
      const unreadCountLocal = notifications.filter(n => !n.isRead).length;
      if (unreadCountLocal === 0) return;

      // Optimistic update
      setNotifications(current => current.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);

      // Single API call for efficiency & reliability
      await notificationService.markAllRead();
      toast.success("Intelligence Synchronization Complete");
    } catch (error) {
      toast.error("Failed to sync status with terminal");
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications(current =>
        current.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Status sync error:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="flex flex-col gap-6 font-display animate-in fade-in duration-500">

      {/* Header */}
      <header className="glass-panel rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Welcome Back, {user?.fullName?.split(' ')[0] || "Teacher"}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            You have <span className="text-[#2dd4bf] font-semibold">{courses.length} classes</span> and <span className="text-orange-500 font-semibold">{workflows.length} papers</span> to grade today.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              className="w-full bg-white/50 dark:bg-slate-800/50 border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#2dd4bf] placeholder-slate-400 transition-all shadow-sm outline-none"
              placeholder="Search students, courses, or files..."
            />
          </div>

          <TeacherNotification
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={handleMarkAllRead}
            onMarkRead={handleMarkRead}
            isMounted={isMounted}
          />
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Weekly Overview - Spans 2 columns on medium, 3 on large */}
        <GlassCard className="rounded-3xl p-6 col-span-1 md:col-span-2 lg:col-span-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-[#2dd4bf]/20 blur-[60px] opacity-60 dark:opacity-20 transition-all group-hover:scale-150 duration-700" />
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Activity className="text-[#2dd4bf] w-5 h-5" />
                Weekly Overview
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Student engagement over the last 7 days</p>
            </div>
            <select className="bg-transparent border-none text-sm font-medium text-slate-500 dark:text-slate-400 focus:ring-0 cursor-pointer outline-none">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>

          <div className="h-64 w-full relative">
            {/* Chart Graphic (SVG) */}
            <div className="absolute inset-0 flex items-end justify-between px-2 gap-2">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="w-full border-t border-slate-400 border-dashed"></div>
                <div className="w-full border-t border-slate-400 border-dashed"></div>
                <div className="w-full border-t border-slate-400 border-dashed"></div>
                <div className="w-full border-t border-slate-400 border-dashed"></div>
                <div className="w-full border-t border-slate-400 border-dashed"></div>
              </div>
              <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradientLine" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.5"></stop>
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <path className="drop-shadow-lg" d="M0,200 C50,150 100,180 150,100 C200,20 250,80 300,60 C350,40 400,120 450,140 C500,160 550,100 600,80 C650,60 700,20 750,40 C800,60 850,100 1200,80" fill="none" stroke="#2dd4bf" strokeWidth="4" vectorEffect="non-scaling-stroke"></path>
                <path d="M0,200 C50,150 100,180 150,100 C200,20 250,80 300,60 C350,40 400,120 450,140 C500,160 550,100 600,80 C650,60 700,20 750,40 C800,60 850,100 1200,80 V300 H0 Z" fill="url(#gradientLine)" opacity="0.3"></path>
              </svg>
              <div className="w-full flex justify-between absolute -bottom-6 text-xs text-slate-400 font-medium">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Messages Panel */}
        <GlassCard className="rounded-3xl p-6 col-span-1 md:col-span-2 lg:col-span-1 shadow-sm flex flex-col h-[420px] lg:h-auto hover:shadow-md transition-shadow group">
          <div className="absolute top-0 left-0 -mt-10 -ml-10 h-40 w-40 rounded-full bg-blue-500/10 blur-[60px] opacity-60 dark:opacity-20 transition-all group-hover:scale-150 duration-700" />
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <MessageCircle className="text-blue-500 w-5 h-5" />
              Messages
            </h2>
            <span className="bg-[#2dd4bf] text-white text-xs font-bold px-2 py-0.5 rounded-full">{recentChats.length}</span>
          </div>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 no-scrollbar">
            {recentChats.length > 0 ? (
              recentChats.map((chat, chatIdx) => (
                <Link href={`/dashboard/teacher/communication/chat/${chat.id}?type=${chat.type}`} key={chat.id || `chat-${chatIdx}`}>
                  <div className="flex items-center gap-3 p-2 hover:bg-white/40 dark:hover:bg-slate-700/40 rounded-xl cursor-pointer transition-colors group">
                    <div className="relative w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold text-slate-500 uppercase">
                      {chat.type === "CourseChatGroup" ? (
                        chat.courseCode ? chat.courseCode.slice(0, 3) : "CRS"
                      ) : (
                        chat.batchName ? chat.batchName.slice(0, 3) : "BAT"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                          {chat.type === "CourseChatGroup" ? (
                            <>
                              <span className="text-[#2dd4bf]">{chat.courseCode}</span>
                              <span className="mx-1">•</span>
                              {chat.batchShift?.toLowerCase() === 'day' ? 'D-' : chat.batchShift?.toLowerCase() === 'evening' ? 'E-' : ''}{chat.batchName}
                            </>
                          ) : (
                            `${chat.batchShift?.toLowerCase() === 'day' ? 'D-' : chat.batchShift?.toLowerCase() === 'evening' ? 'E-' : ''}${chat.batchName}`
                          )}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {chat.lastMessage?.createdAt && formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: false })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        <span className="font-medium text-slate-700 dark:text-slate-300 mr-1">
                          {chat.lastMessage?.sender?.fullName?.split(' ')[0]}:
                        </span>
                        {chat.lastMessage?.content || "Sent an attachment"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                <MessageCircle className="w-8 h-8 mb-2 opacity-20" />
                <p>No recent messages</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Courses & Assignments Grid */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {courses.length > 0 ? courses.slice(0, 2).map((courseItem: any, index: number) => (
            <GlassCard key={courseItem.id || `course-${index}`} className="rounded-3xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group border-slate-200/50 dark:border-slate-700">
              <div className={`h-32 rounded-2xl bg-gradient-to-br ${index % 2 === 0 ? 'from-teal-400 to-[#0d9488]' : 'from-blue-400 to-indigo-600'} mb-4 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <span className="absolute top-3 left-3 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg border border-white/20">
                  {courseItem.course?.code || "CS-101"}
                </span>
                <div className="absolute bottom-3 right-3 text-white/90">
                  {index % 2 === 0 ? <Code className="w-10 h-10 opacity-50" /> : <Terminal className="w-10 h-10 opacity-50" />}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 truncate">
                {courseItem.course?.name || "Untitled Course"}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                {courseItem.batch?.shift?.toLowerCase() === "day" ? "D" : courseItem.batch?.shift?.toLowerCase() === "evening" ? "E" : courseItem.batch?.shift}-{courseItem.batch?.name || "Batch Name"} • {courseItem.course?.credit} Credits
              </p>
              <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <Link href={`/dashboard/teacher/courses/${courseItem.id}`}>
                  <button className={`${index % 2 === 0 ? 'bg-[#2dd4bf] hover:bg-teal-400 text-white' : 'bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white'} p-2 rounded-xl border border-transparent dark:border-slate-600 transition-colors shadow-lg shadow-teal-500/10 active:scale-95`}>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </GlassCard>
          )) : (
            <GlassCard className="col-span-2 rounded-3xl p-6 text-center flex flex-col items-center justify-center text-slate-400">
              <p>No courses assigned.</p>
            </GlassCard>
          )}
        </div>

        {/* Grading Queue */}
        <GlassCard className="rounded-3xl p-6 col-span-1 md:col-span-2 lg:col-span-2 shadow-sm flex flex-col hover:shadow-md transition-shadow group h-full">
          <div className="absolute bottom-0 right-0 -mb-10 -mr-10 h-40 w-40 rounded-full bg-orange-500/10 blur-[60px] opacity-60 dark:opacity-20 transition-all group-hover:scale-150 duration-700" />
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <CheckCircle className="text-orange-400 w-5 h-5" />
              Grading Queue
            </h2>
            <Link href="/dashboard/teacher/grading">
              <button className="text-xs text-[#2dd4bf] font-medium hover:underline">View All</button>
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {workflows.length > 0 ? workflows.slice(0, 3).map((workflow, idx) => (
              <div key={workflow.id || `workflow-${idx}`} className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-slate-700/30 border border-white/50 dark:border-slate-600/50 hover:border-[#2dd4bf]/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${idx === 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' : idx === 1 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-500'} flex items-center justify-center`}>
                    {idx === 0 ? <FileText className="w-5 h-5" /> : idx === 1 ? <FlaskConical className="w-5 h-5" /> : <Code className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{workflow.grade?.course?.name || "Assignment"}</h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{workflow.grade?.course?.code || "Code"} • {workflow.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${idx === 0 ? 'text-orange-500 bg-orange-100' : 'text-blue-500 bg-blue-100'} dark:bg-opacity-20 px-2 py-1 rounded-lg`}>
                    {workflow.status === 'PUBLISHED' ? 'DONE' : 'PENDING'}
                  </span>
                  <button className="p-2 text-slate-400 hover:text-[#2dd4bf] transition-colors active:scale-95">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-slate-400 text-sm font-medium">No pending grading tasks.</div>
            )}

            {/* Fallback Static Items visually */}
            {workflows.length === 0 && (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-700 transition-all">
                <div className="flex items-center gap-3 opacity-50">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Queue Clear</p>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Quick Actions (Bottom) */}
      <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/teacher/classroom">
          <button className="w-full glass-panel p-5 rounded-2xl flex items-center justify-between hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all group cursor-pointer border border-white/50 dark:border-slate-700 shadow-sm active:scale-95">
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 dark:bg-teal-900/30 p-2.5 rounded-xl text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">New Assignment</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#2dd4bf] group-hover:translate-x-1 transition-all" />
          </button>
        </Link>
        <Link href="/dashboard/teacher/notifications/create">
          <button className="w-full glass-panel p-5 rounded-2xl flex items-center justify-between hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all group cursor-pointer border border-white/50 dark:border-slate-700 shadow-sm active:scale-95">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2.5 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Megaphone className="w-6 h-6" />
              </div>
              <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">Announcement</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
          </button>
        </Link>
        <Link href="/dashboard/teacher/attendance">
          <button className="w-full glass-panel p-5 rounded-2xl flex items-center justify-between hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all group cursor-pointer border border-white/50 dark:border-slate-700 shadow-sm active:scale-95">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 dark:bg-rose-900/30 p-2.5 rounded-xl text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">Mark Attendance</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-rose-500 group-hover:translate-x-1 transition-all" />
          </button>
        </Link>
        <Link href="/dashboard/teacher/classroom">
          <button className="w-full glass-panel p-5 rounded-2xl flex items-center justify-between hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all group cursor-pointer border border-white/50 dark:border-slate-700 shadow-sm active:scale-95">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-2.5 rounded-xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <FolderOpen className="w-6 h-6" />
              </div>
              <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">Course Materials</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
          </button>
        </Link>
      </div>
    </div>
  );
}


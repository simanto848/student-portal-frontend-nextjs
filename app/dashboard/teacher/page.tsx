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
  Bell,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { notificationService, NotificationItem } from "@/services/notification/notification.service";
import { chatService, ChatGroup } from "@/services/communication/chat.service";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

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

        notificationService.list({ page: 1, limit: 10 }),
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

  const handleMarkAllRead = () => {
    setNotifications(current => current.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
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

          {isMounted ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  suppressHydrationWarning
                  className="p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-[#2dd4bf] ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm relative transition-all cursor-pointer"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 mr-4" align="end" sideOffset={8}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <span className="text-xs text-[#2dd4bf] cursor-pointer hover:underline" onClick={handleMarkAllRead}>Mark all as read</span>
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length > 0 ? notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0 ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-1">{n.title}</h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                          {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2" dangerouslySetInnerHTML={{ __html: n.content }} />
                    </div>
                  )) : (
                    <div className="p-8 text-center text-slate-400 text-xs">No notifications</div>
                  )}
                </div>
                <div className="p-2 border-t border-slate-100 dark:border-slate-700 text-center bg-slate-50/50 dark:bg-slate-800/50 rounded-b-md">
                  <button className="text-xs font-medium text-slate-500 hover:text-[#2dd4bf] transition-colors">View all notifications</button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <button className="p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-[#2dd4bf] ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm relative transition-all cursor-pointer">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Weekly Overview - Spans 3 columns on large screens */}
        <div className="glass-panel rounded-3xl p-6 col-span-1 md:col-span-2 lg:col-span-3 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
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
        </div>

        {/* Messages Panel */}
        <div className="glass-panel rounded-3xl p-6 col-span-1 md:col-span-1 lg:col-span-1 shadow-sm flex flex-col h-96 lg:h-auto hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <MessageCircle className="text-blue-500 w-5 h-5" />
              Messages
            </h2>
            <span className="bg-[#2dd4bf] text-white text-xs font-bold px-2 py-0.5 rounded-full">{recentChats.length}</span>
          </div>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
            {recentChats.length > 0 ? (
              recentChats.map((chat) => (
                <Link href={`/dashboard/teacher/communication?chatId=${chat.id}`} key={chat.id}>
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
        </div>

        {/* Courses & Assignments Grid */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.length > 0 ? courses.slice(0, 2).map((courseItem: any, index: number) => (
            <div key={courseItem.id} className="glass-panel rounded-3xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
              <div className={`h-32 rounded-2xl bg-linear-to-br ${index % 2 === 0 ? 'from-violet-500 to-purple-600' : 'from-blue-500 to-cyan-500'} mb-4 relative overflow-hidden`}>
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
                  <button className={`${index % 2 === 0 ? 'bg-[#2dd4bf] hover:bg-teal-400 text-white' : 'bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-white'} p-2 rounded-xl border border-transparent dark:border-slate-600 transition-colors shadow-lg shadow-teal-500/10`}>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
            </div>
          )) : (
            <div className="col-span-2 glass-panel rounded-3xl p-6 text-center flex flex-col items-center justify-center text-slate-400">
              <p>No courses assigned.</p>
            </div>
          )}
        </div>

        {/* Grading Queue */}
        <div className="glass-panel rounded-3xl p-6 col-span-1 md:col-span-2 lg:col-span-2 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <CheckCircle className="text-orange-400 w-5 h-5" />
              Grading Queue
            </h2>
            <button className="text-xs text-[#2dd4bf] font-medium hover:underline">View All</button>
          </div>
          <div className="flex flex-col gap-3">
            {workflows.length > 0 ? workflows.slice(0, 3).map((workflow, idx) => (
              <div key={workflow.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-slate-700/30 border border-white/50 dark:border-slate-600/50 hover:border-[#2dd4bf]/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${idx === 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-500' : idx === 1 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-500' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-500'} flex items-center justify-center`}>
                    {idx === 0 ? <FileText className="w-5 h-5" /> : idx === 1 ? <FlaskConical className="w-5 h-5" /> : <Code className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{workflow.grade?.course?.name || "Assignment"}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{workflow.grade?.course?.code || "Code"} • {workflow.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${idx === 0 ? 'text-orange-500 bg-orange-100' : 'text-blue-500 bg-blue-100'} dark:bg-opacity-20 px-2 py-1 rounded-lg`}>
                    {workflow.status === 'PUBLISHED' ? 'Completed' : 'Pending'}
                  </span>
                  <button className="p-2 text-slate-400 hover:text-[#2dd4bf] transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="p-4 text-center text-slate-400">No pending grading tasks.</div>
            )}

            {/* Fallback Static Items if no data (for demo purposes if array is empty but we want to show UI) */}
            {workflows.length === 0 && loading === false && (
              <>
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-slate-700/30 border border-white/50 dark:border-slate-600/50 hover:border-[#2dd4bf]/50 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">Mid-Term Algorithms</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">CS-101 • 12 Pending</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-orange-500 bg-orange-100 dark:bg-orange-900/40 px-2 py-1 rounded-lg">High Priority</span>
                    <button className="p-2 text-slate-400 hover:text-[#2dd4bf] transition-colors"><Pencil className="w-4 h-4" /></button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Quick Actions (Bottom) */}
      <div className="mt-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="glass-panel p-4 rounded-2xl flex items-center gap-3 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer">
          <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-lg text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">New Assignment</span>
        </button>
        <button className="glass-panel p-4 rounded-2xl flex items-center gap-3 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer">
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
            <Megaphone className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Announcement</span>
        </button>
        <button className="glass-panel p-4 rounded-2xl flex items-center gap-3 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer">
          <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-lg text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Mark Attendance</span>
        </button>
        <button className="glass-panel p-4 rounded-2xl flex items-center gap-3 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer">
          <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
            <FolderOpen className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Course Materials</span>
        </button>
      </div>
    </div>
  );
}

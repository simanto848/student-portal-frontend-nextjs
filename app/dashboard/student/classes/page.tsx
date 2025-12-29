"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Clock, BookOpen, Download, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { scheduleService } from "@/services/academic/schedule.service";
import { CourseSchedule, Classroom } from "@/services/academic/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface FormattedSlot {
  id: string;
  day: string;
  time: string;
  course: string;
  title: string;
  room: string;
  building: string;
  type: string;
}

import { studentService } from "@/services/user/student.service";

export default function StudentSchedulesPage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user) return;

      try {
        setLoading(true);
        let batchId: string | undefined;
        if ('batchId' in user && typeof user.batchId === 'string') {
          batchId = user.batchId;
        } else if ('batchId' in user && user.batchId && typeof user.batchId === 'object') {
          batchId = (user.batchId as any).id || (user.batchId as any)._id;
        }

        if (!batchId && user.role === 'student') {
          try {
            const studentId = user.id || (user as any)._id;
            if (!studentId) return;
            const studentProfile = await studentService.getById(studentId);
            if (studentProfile) {
              if (typeof studentProfile.batchId === 'string') {
                batchId = studentProfile.batchId;
              } else if (studentProfile.batch && typeof studentProfile.batch === 'object') {
                batchId = (studentProfile.batch as any).id || (studentProfile.batch as any)._id;
              }
            }
          } catch (profileErr) {
            console.warn("Failed to fetch student profile to resolve batchId", profileErr);
          }
        }

        if (!batchId) {
          if (user.role === 'student') {
            setError("You are not assigned to a batch. Please contact administration.");
          }
          setLoading(false);
          return;
        }

        const data = await scheduleService.getScheduleByBatch(batchId);
        setSchedules(data || []);
      } catch (err: any) {
        console.error("Failed to fetch schedule", err);
        setError("Failed to load schedule. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [user]);

  const formatSlot = (schedule: CourseSchedule, day: string, index: number): FormattedSlot => {
    let course: any = null;
    if (typeof schedule.sessionCourseId === 'object') {
      const sc = schedule.sessionCourseId as any;
      if (sc.course) course = sc.course;
      else if (sc.courseId && typeof sc.courseId === 'object') course = sc.courseId;
    }

    const classroom = typeof schedule.classroomId === 'object' ? (schedule.classroomId as Classroom) : null;
    const room = classroom ? classroom.roomNumber : 'TBA';
    const building = classroom ? classroom.buildingName : '';

    return {
      id: `${schedule.id}-${day}-${index}`,
      day: day,
      time: `${schedule.startTime} - ${schedule.endTime}`,
      course: course?.code || 'N/A',
      title: course?.name || 'Unknown Course',
      room: room,
      building: building,
      type: schedule.classType
    };
  };

  const todayFullName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const allFormatted = schedules.flatMap(schedule => {
    return schedule.daysOfWeek.map((day, index) => formatSlot(schedule, day, index));
  });

  const todaySlots = allFormatted.filter(s => s.day === todayFullName).sort((a, b) => a.time.localeCompare(b.time));

  const daysOrder = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weeklyGrouped = daysOrder.map(day => {
    return {
      day,
      slots: allFormatted.filter(s => s.day === day).sort((a, b) => a.time.localeCompare(b.time))
    };
  }).filter(group => group.slots.length > 0);

  const todaySessions = todaySlots.length;

  const getTypeColor = (type: string = '') => {
    switch (type.toLowerCase()) {
      case 'lecture': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'lab': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'tutorial': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'seminar': return 'bg-pink-50 text-pink-700 border-pink-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-3xl" />
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-[400px] w-full bg-gray-100/50 rounded-2xl" />
            <Skeleton className="h-[400px] w-full bg-gray-100/50 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Hero Section */}
        <div className="rounded-3xl bg-linear-to-br from-[#0b3b2a] via-[#1f5a44] to-[#3e6253] text-white p-6 md:p-10 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-white/90">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Academic Schedule</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-sm">
                Your Weekly Timetable
              </h1>
              <p className="text-white/80 max-w-xl text-sm leading-relaxed">
                Stay organized with a clear view of your classes. Review your upcoming sessions, check room numbers, and manage your time effectively.
              </p>
              <div className="flex gap-3 pt-3">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white text-[#0b3b2a] hover:bg-gray-50 border-none shadow-lg shadow-black/5 font-semibold"
                >
                  <Download className="mr-2 h-4 w-4" /> Download ICS
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm"
                >
                  Print View
                </Button>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 p-5 min-w-[200px] shadow-xl text-center md:text-left">
              <p className="text-xs uppercase tracking-wider font-semibold text-white/70">
                Today ({todayFullName})
              </p>
              <div className="mt-2 flex items-baseline justify-center md:justify-start gap-1">
                <span className="text-5xl font-extrabold tracking-tight text-white">
                  {todaySessions}
                </span>
                <span className="text-sm font-medium text-white/80">classes</span>
              </div>
              <div className="mt-3 text-[11px] font-medium text-white/60 bg-white/10 rounded-lg py-1 px-2 inline-block">
                {todaySessions > 0 ? "Stay focused!" : "Enjoy your day off!"}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="border-red-100 bg-red-50 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Today's Schedule Section */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1a3d32] flex items-center gap-2">
              <div className="p-2 bg-[#e8f5e9] rounded-lg text-[#1f5a44]">
                <Clock className="h-5 w-5" />
              </div>
              Today's Schedule
            </h2>
            {todaySessions > 0 && <Badge variant="outline" className="border-[#3e6253] text-[#3e6253] bg-[#3e6253]/5">{todaySessions} Sessions</Badge>}
          </div>

          {todaySlots.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {todaySlots.map((slot) => (
                <Card key={slot.id} className="group relative overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white ring-1 ring-gray-100">
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${slot.type === 'Lab' ? 'bg-purple-500' : 'bg-[#3e6253]'}`}></div>
                  <CardContent className="p-5 pl-7">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Badge variant="outline" className={`mb-2 font-medium ${getTypeColor(slot.type)}`}>
                          {slot.type}
                        </Badge>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#1f5a44] transition-colors">
                          {slot.course}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 font-medium">{slot.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md">
                        <Clock className="h-4 w-4 text-[#3e6253]" /> {slot.time}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div className="leading-tight">
                          <span>{slot.room}</span>
                          {slot.building && <span className="block text-[10px] text-gray-400 font-medium">{slot.building}</span>}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No classes today</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                You have no scheduled sessions for today. Take this time to review your materials or relax.
              </p>
            </div>
          )}
        </section>

        {/* Weekly Schedule Section */}
        <section className="space-y-5 pt-2">
          <h2 className="text-xl font-bold text-[#1a3d32] flex items-center gap-2">
            <div className="p-2 bg-[#e3f2fd] rounded-lg text-[#0277bd]">
              <CalendarDays className="h-5 w-5" />
            </div>
            Full Week Overview
          </h2>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {weeklyGrouped.map((group) => {
              const isToday = group.day === todayFullName;
              return (
                <Card key={group.day} className={`border-none shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${isToday ? 'ring-2 ring-[#3e6253] ring-offset-2' : 'ring-1 ring-black/5'} p-0`}>
                  <CardHeader className={`pb-3 pt-4 border-b ${isToday ? 'bg-[#3e6253] text-white' : 'bg-gray-50 text-gray-900'}`}>
                    <CardTitle className="text-base font-bold flex justify-between items-center">
                      {group.day}
                      {isToday && <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">Today</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 bg-white">
                    <div className="divide-y divide-gray-100">
                      {group.slots.map((slot, idx) => (
                        <div key={idx} className="p-4 hover:bg-gray-50/80 transition-colors group relative">
                          <div className="flex gap-4">
                            {/* Time Column */}
                            <div className="w-16 flex-shrink-0 flex flex-col items-center justify-center border-r border-gray-100 pr-4">
                              <span className="text-xs font-bold text-gray-900">{slot.time.split('-')[0].trim()}</span>
                              <span className="h-4 w-px bg-gray-200 my-0.5"></span>
                              <span className="text-[10px] text-gray-400">{slot.time.split('-')[1].trim()}</span>
                            </div>

                            {/* Content Column */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-sm text-[#1a3d32] truncate pr-2">{slot.course}</span>
                                <Badge variant="outline" className={`text-[10px] h-5 border px-1.5 font-medium ${getTypeColor(slot.type)}`}>
                                  {slot.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-2 font-medium" title={slot.title}>{slot.title}</p>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 w-fit px-2 py-1 rounded">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span>{slot.room}</span>
                                {slot.building && (
                                  <>
                                    <span className="text-gray-300">|</span>
                                    <span className="text-[10px] font-medium">{slot.building}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {weeklyGrouped.length === 0 && (
            <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed">
              <p className="font-medium">No weekly schedule available.</p>
              <p className="text-sm mt-1">Check back later or contact your department.</p>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

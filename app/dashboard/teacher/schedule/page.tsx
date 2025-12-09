"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { scheduleService } from "@/services/academic/schedule.service";
import { CourseSchedule, SessionCourse, Batch, Classroom, Course } from "@/services/academic/types";
import { toast } from "sonner";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

export default function TeacherSchedulePage() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchedules = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const data = await scheduleService.getScheduleByTeacher(user.id);
        setSchedules(data);
      } catch (error) {
        console.error("Schedule fetch error", error);
        toast.error("Failed to load schedule");
      } finally {
        setLoading(false);
      }
    };
    loadSchedules();
  }, [user?.id]);

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  const getCourseName = (schedule: CourseSchedule) => {
    if (typeof schedule.sessionCourseId === 'object' && 'courseId' in schedule.sessionCourseId) {
      const sc = schedule.sessionCourseId as unknown as { courseId: Course };
      if (sc.courseId && typeof sc.courseId === 'object') {
        return sc.courseId.name;
      }
    }
    return "Unknown Course";
  };

  const getCourseCode = (schedule: CourseSchedule) => {
    if (typeof schedule.sessionCourseId === 'object' && 'courseId' in schedule.sessionCourseId) {
      const sc = schedule.sessionCourseId as unknown as { courseId: Course };
      if (sc.courseId && typeof sc.courseId === 'object') {
        return sc.courseId.code;
      }
    }
    return "";
  };

  const getBatchName = (schedule: CourseSchedule) => {
    if (typeof schedule.batchId === 'object') {
      return (schedule.batchId as Batch).name;
    }
    return "";
  };

  const getRoomNumber = (schedule: CourseSchedule) => {
    if (typeof schedule.classroomId === 'object') {
      const room = schedule.classroomId as Classroom;
      return `${room.roomNumber} (${room.buildingName})`;
    }
    return "TBD";
  };


  const getSchedulesForDay = (day: string) => {
    return schedules
      .filter((s) => s.daysOfWeek.includes(day as any))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">
            My Weekly Schedule
          </h1>
          <p className="text-muted-foreground">
            Overview of your assigned classes for the week
          </p>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-muted-foreground">Loading schedule...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
            {daysOfWeek.map((day) => {
              const daySchedules = getSchedulesForDay(day);
              const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === day;

              return (
                <div key={day} className={`flex flex-col space-y-3 rounded-lg border bg-card p-4 shadow-sm ${isToday ? 'ring-2 ring-primary/20' : ''}`}>
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className={`font-semibold ${isToday ? 'text-primary' : ''}`}>{day}</h3>
                    {isToday && <Badge variant="secondary" className="text-xs">Today</Badge>}
                  </div>

                  <div className="flex-1 space-y-3">
                    {daySchedules.length > 0 ? (
                      daySchedules.map((schedule) => (
                        <Card key={`${day}-${schedule.id}`} className="overflow-hidden border-l-4 border-l-primary transition-all hover:shadow-md">
                          <CardContent className="p-3">
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-semibold text-sm line-clamp-2" title={getCourseName(schedule)}>
                                  {getCourseName(schedule)}
                                </h4>
                                <p className="text-xs text-muted-foreground">{getCourseCode(schedule)}</p>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {schedule.startTime} - {schedule.endTime}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="h-3 w-3" />
                                <span>Batch {getBatchName(schedule)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate" title={getRoomNumber(schedule)}>
                                  {getRoomNumber(schedule)}
                                </span>
                              </div>
                              <div className="mt-2 pt-2 border-t flex justify-end">
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                                  {schedule.classType}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="flex h-20 items-center justify-center rounded-md border border-dashed bg-muted/50 p-4 text-xs text-muted-foreground">
                        No classes
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

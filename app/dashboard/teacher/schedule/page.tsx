"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { scheduleService } from "@/services/academic/schedule.service";
import { CourseSchedule } from "@/services/academic/types";
import { toast } from "sonner";

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

  const formatTime = (time: string | undefined) => {
    if (!time) return "";
    // time may come as "HH:mm"; we can render as is
    return time;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">
              My Schedule
            </h1>
            <p className="text-muted-foreground">
              Weekly schedule for your assigned courses
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center text-muted-foreground">
                Loading schedule...
              </div>
            ) : schedules.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                No schedule found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Day(s)</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Type</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((s) => {
                    const courseName =
                      typeof s.sessionCourse === "object" &&
                      s.sessionCourse?.course &&
                      typeof s.sessionCourse.course === "object"
                        ? s.sessionCourse.course.name
                        : "Course";
                    const courseCode =
                      typeof s.sessionCourse === "object" &&
                      s.sessionCourse?.course &&
                      typeof s.sessionCourse.course === "object"
                        ? s.sessionCourse.course.code
                        : undefined;
                    const roomNumber =
                      typeof s.classroom === "object"
                        ? s.classroom?.roomNumber
                        : undefined;
                    return (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">
                          {courseName}
                          {courseCode && (
                            <div className="text-xs text-muted-foreground">
                              {courseCode}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {s.daysOfWeek?.map((d: string) => (
                              <Badge
                                key={d}
                                variant="outline"
                                className="capitalize"
                              >
                                {d.toLowerCase()}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{`${formatTime(s.startTime)} - ${formatTime(
                          s.endTime
                        )}`}</TableCell>
                        <TableCell>{roomNumber || "TBD"}</TableCell>
                        <TableCell className="capitalize">
                          {s.classType?.toLowerCase()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

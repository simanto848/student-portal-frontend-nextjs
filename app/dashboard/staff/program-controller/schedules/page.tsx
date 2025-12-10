"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { DataTable, Column } from "@/components/dashboard/shared/DataTable";
import { DeleteModal } from "@/components/dashboard/shared/DeleteModal";
import {
  GenericFormModal,
  FormField,
} from "@/components/dashboard/shared/GenericFormModal";
import {
  academicService,
  CourseSchedule,
  Batch,
  SessionCourse,
  Classroom,
  AcademicApiError,
} from "@/services/academic.service";
import { teacherService, Teacher } from "@/services/teacher.service";
import { toast } from "sonner";
import { CalendarClock, Sparkles } from "lucide-react";

const getName = (
  item: { name?: string } | string | null | undefined
): string => {
  if (!item) return "N/A";
  if (typeof item === "string") return item;
  if (typeof item === "object" && item.name) return item.name;
  return "N/A";
};

const getId = (item: { id?: string } | string | null | undefined): string => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (typeof item === "object" && item.id) return item.id;
  return "";
};

interface ScheduleWithDetails extends CourseSchedule {
  batchName: string;
  courseName: string;
  teacherName: string;
  roomName: string;
}

export default function ProgramControllerSchedulePage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [sessionCourses, setSessionCourses] = useState<SessionCourse[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<CourseSchedule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const columns: Column<ScheduleWithDetails>[] = [
    {
      header: "Batch",
      accessorKey: "batchName",
    },
    {
      header: "Course",
      accessorKey: "courseName",
    },
    {
      header: "Days",
      accessorKey: "daysOfWeek",
      cell: (item) =>
        Array.isArray(item.daysOfWeek)
          ? item.daysOfWeek.join(", ")
          : item.daysOfWeek,
    },
    {
      header: "Time",
      accessorKey: "startTime",
      cell: (item) => `${item.startTime} - ${item.endTime}`,
    },
    {
      header: "Room",
      accessorKey: "roomName",
    },
    {
      header: "Status",
      accessorKey: "isActive",
      cell: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${item.isActive
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
            }`}
        >
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  const formFields: FormField[] = useMemo(
    () => [
      {
        name: "batchId",
        label: "Batch",
        type: "searchable-select",
        required: true,
        placeholder: "Select a batch",
        options: batches
          .filter((b) => b.status)
          .map((b) => ({ label: b.name, value: b.id })),
      },
      {
        name: "sessionCourseId",
        label: "Course (Session)",
        type: "searchable-select",
        required: true,
        placeholder: "Select a course",
        options: sessionCourses.map((sc) => {
          const courseName =
            typeof sc.courseId === "object"
              ? sc.courseId.name
              : "Unknown Course";
          const courseCode =
            typeof sc.courseId === "object" ? sc.courseId.code : "";
          return { label: `${courseName} (${courseCode})`, value: sc.id };
        }),
      },
      {
        name: "teacherId",
        label: "Teacher",
        type: "searchable-select",
        required: true,
        placeholder: "Select a teacher",
        options: teachers.map((t) => ({
          label: `${t.fullName} (${t.email})`,
          value: t.id,
        })),
      },
      {
        name: "daysOfWeek",
        label: "Days of Week",
        type: "multi-select",
        required: true,
        options: [
          { label: "Sunday", value: "Sunday" },
          { label: "Monday", value: "Monday" },
          { label: "Tuesday", value: "Tuesday" },
          { label: "Wednesday", value: "Wednesday" },
          { label: "Thursday", value: "Thursday" },
          { label: "Friday", value: "Friday" },
          { label: "Saturday", value: "Saturday" },
        ],
      },
      {
        name: "startTime",
        label: "Start Time",
        type: "time",
        required: true,
      },
      {
        name: "endTime",
        label: "End Time",
        type: "time",
        required: true,
      },
      {
        name: "classroomId",
        label: "Classroom",
        type: "searchable-select",
        required: false,
        placeholder: "Select a classroom",
        options: classrooms
          .filter((c) => c.isActive)
          .map((c) => ({
            label: `${c.roomNumber} - ${c.buildingName}`,
            value: c.id,
          })),
      },
      {
        name: "classType",
        label: "Class Type",
        type: "select",
        required: true,
        options: [
          { label: "Lecture", value: "Lecture" },
          { label: "Tutorial", value: "Tutorial" },
          { label: "Lab", value: "Lab" },
          { label: "Seminar", value: "Seminar" },
          { label: "Workshop", value: "Workshop" },
          { label: "Other", value: "Other" },
        ],
      },
      {
        name: "startDate",
        label: "Start Date",
        type: "date",
        required: true,
      },
      {
        name: "endDate",
        label: "End Date",
        type: "date",
        required: false,
      },
      {
        name: "isRecurring",
        label: "Recurring",
        type: "select",
        required: true,
        options: [
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
        ],
      },
      {
        name: "isActive",
        label: "Status",
        type: "select",
        required: true,
        options: [
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      },
    ],
    [batches, sessionCourses, classrooms, teachers]
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [
        schedulesData,
        batchesData,
        sessionCoursesData,
        classroomsData,
        teachersData,
      ] = await Promise.all([
        academicService.getAllSchedules(),
        academicService.getAllBatches(),
        academicService.getAllSessionCourses(),
        academicService.getAllClassrooms(),
        teacherService.getAllTeachers(),
      ]);
      setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
      setBatches(Array.isArray(batchesData) ? batchesData : []);
      setSessionCourses(
        Array.isArray(sessionCoursesData) ? sessionCoursesData : []
      );
      setClassrooms(Array.isArray(classroomsData) ? classroomsData : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
    } catch (error) {
      const message =
        error instanceof AcademicApiError ? error.message : "Failed to load data";
      toast.error(message);
      setSchedules([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedSchedule(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (schedule: ScheduleWithDetails) => {
    setSelectedSchedule(schedule);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (schedule: ScheduleWithDetails) => {
    setSelectedSchedule(schedule);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSchedule) return;
    setIsDeleting(true);
    try {
      await academicService.deleteSchedule(selectedSchedule.id);
      toast.success("Schedule deleted successfully");
      fetchData();
      setIsDeleteModalOpen(false);
    } catch (error) {
      const message =
        error instanceof AcademicApiError ? error.message : "Failed to delete schedule";
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setSelectedSchedule(null);
    }
  };

  const handleFormSubmit = async (data: Record<string, string>) => {
    setIsSubmitting(true);
    try {
      type DayOfWeek =
        | "Sunday"
        | "Monday"
        | "Tuesday"
        | "Wednesday"
        | "Thursday"
        | "Friday"
        | "Saturday";
      type ClassType =
        | "Lecture"
        | "Lab"
        | "Tutorial"
        | "Seminar"
        | "Workshop"
        | "Other";

      const submitData = {
        batchId: data.batchId,
        sessionCourseId: data.sessionCourseId,
        teacherId: data.teacherId,
        daysOfWeek: data.daysOfWeek as unknown as string[] as DayOfWeek[],
        startTime: data.startTime,
        endTime: data.endTime,
        classroomId: data.classroomId,
        classType: data.classType as ClassType,
        startDate: new Date(data.startDate).toISOString(),
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
        isRecurring: data.isRecurring === "true",
        isActive: data.isActive === "true",
      };

      if (selectedSchedule) {
        await academicService.updateSchedule(selectedSchedule.id, submitData);
        toast.success("Schedule updated successfully");
      } else {
        await academicService.createSchedule(submitData);
        toast.success("Schedule created successfully");
      }
      fetchData();
      setIsFormModalOpen(false);
    } catch (error) {
      const message =
        error instanceof AcademicApiError ? error.message : "Failed to save schedule";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Schedule Management"
          subtitle="Manage course schedules for your department"
          actionLabel="Add Schedule"
          onAction={handleCreate}
          icon={CalendarClock}
          extraActions={
            <button
              onClick={() => router.push('/dashboard/staff/program-controller/schedules/ai-scheduler')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              AI Scheduler
            </button>
          }
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
          </div>
        ) : (
          <DataTable
            data={schedules.map((s) => {
              const course =
                typeof s.sessionCourseId === "object" && s.sessionCourseId
                  ? (s.sessionCourseId as { courseId?: { name?: string } })
                    .courseId
                  : null;
              const courseName =
                typeof course === "object" && course
                  ? course.name || "N/A"
                  : "N/A";
              const room =
                typeof s.classroomId === "object" ? s.classroomId : null;

              const teacher = teachers.find((t) => t.id === s.teacherId);

              return {
                ...s,
                batchName: getName(
                  s.batchId as { name?: string } | string | null
                ),
                courseName: courseName,
                teacherName: teacher
                  ? teacher.fullName
                  : s.teacher
                    ? s.teacher.fullName
                    : "N/A",
                roomName: room
                  ? `${room.roomNumber} - ${room.buildingName}`
                  : "N/A",
              };
            })}
            columns={columns}
            searchKey="batchName"
            searchPlaceholder="Search by batch..."
            onView={(item) =>
              router.push(
                `/dashboard/staff/program-controller/schedules/${item.id}`
              )
            }
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
          />
        )}

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Schedule"
          description="Are you sure you want to delete this schedule? This action cannot be undone."
          isDeleting={isDeleting}
        />

        <GenericFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          title={selectedSchedule ? "Edit Schedule" : "Add Schedule"}
          description={
            selectedSchedule
              ? "Update schedule information"
              : "Create a new schedule"
          }
          fields={formFields}
          initialData={
            selectedSchedule
              ? {
                batchId: getId(
                  selectedSchedule.batchId as { id?: string } | string | null
                ),
                sessionCourseId: getId(
                  selectedSchedule.sessionCourseId as
                  | { id?: string }
                  | string
                  | null
                ),
                teacherId: getId(
                  selectedSchedule.teacherId as
                  | { id?: string }
                  | string
                  | null
                ),
                daysOfWeek: selectedSchedule.daysOfWeek,
                startTime: selectedSchedule.startTime,
                endTime: selectedSchedule.endTime,
                classroomId: getId(
                  selectedSchedule.classroomId as
                  | { id?: string }
                  | string
                  | null
                ),
                classType: selectedSchedule.classType,
                startDate: selectedSchedule.startDate
                  ? new Date(selectedSchedule.startDate)
                    .toISOString()
                    .split("T")[0]
                  : "",
                endDate: selectedSchedule.endDate
                  ? new Date(selectedSchedule.endDate)
                    .toISOString()
                    .split("T")[0]
                  : "",
                isRecurring: selectedSchedule.isRecurring.toString(),
                isActive: selectedSchedule.isActive.toString(),
              }
              : {
                isRecurring: "true",
                isActive: "true",
                classType: "Lecture",
              }
          }
          isSubmitting={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}

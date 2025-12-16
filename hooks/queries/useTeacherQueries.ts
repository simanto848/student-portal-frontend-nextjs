import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  batchCourseInstructorService,
  BatchCourseInstructor,
  AssignInstructorDto,
} from "@/services/enrollment/batchCourseInstructor.service";
import {
  courseGradeService,
  ResultWorkflow,
} from "@/services/enrollment/courseGrade.service";
import { attendanceService } from "@/services/enrollment/attendance.service";
import { assessmentService } from "@/services/enrollment/assessment.service";

const EMPTY_ARRAY: any[] = [];

// ===================================== Query Keys =======================================

export const teacherKeys = {
  all: ["teacher"] as const,

  // Instructor Courses
  instructorCourses: () => [...teacherKeys.all, "courses"] as const,
  instructorCoursesList: (instructorId: string) =>
    [...teacherKeys.instructorCourses(), "list", instructorId] as const,
  instructorCoursesWithStats: (instructorId: string) =>
    [...teacherKeys.instructorCourses(), "with-stats", instructorId] as const,
  instructorCourse: (id: string) =>
    [...teacherKeys.instructorCourses(), id] as const,

  // Course Instructors
  courseInstructors: () => [...teacherKeys.all, "course-instructors"] as const,
  courseInstructorsList: (params?: Record<string, unknown>) =>
    [...teacherKeys.courseInstructors(), "list", params] as const,

  // Grading Workflow
  gradingWorkflow: () => [...teacherKeys.all, "grading-workflow"] as const,
  gradingWorkflowList: (params?: Record<string, unknown>) =>
    [...teacherKeys.gradingWorkflow(), "list", params] as const,

  // Assignments (batch course instructor assignments)
  assignments: () => [...teacherKeys.all, "assignments"] as const,
  assignmentsList: (params?: Record<string, unknown>) =>
    [...teacherKeys.assignments(), "list", params] as const,
  assignment: (id: string) => [...teacherKeys.assignments(), id] as const,
};

// ===================================== Helper: Enrich courses with statistics =======================================

interface CourseWithStats extends BatchCourseInstructor {
  attendanceCount?: number;
  assessmentsCount?: number;
  studentsCount?: number;
}

async function enrichCoursesWithStats(
  courses: BatchCourseInstructor[],
): Promise<CourseWithStats[]> {
  return Promise.all(
    courses.map(async (course) => {
      try {
        const [attendanceRes, assessmentsRes] = await Promise.all([
          attendanceService
            .listAttendance({
              courseId: course.courseId,
              batchId: course.batchId,
              limit: 1,
            })
            .catch(() => ({ attendance: [], pagination: { total: 0 } })),
          assessmentService
            .list({
              courseId: course.courseId,
              batchId: course.batchId,
              limit: 1,
            })
            .catch(() => ({ assessments: [], pagination: { total: 0 } })),
        ]);

        return {
          ...course,
          attendanceCount:
            (attendanceRes as { pagination?: { total?: number } }).pagination
              ?.total || 0,
          assessmentsCount:
            (assessmentsRes as { pagination?: { total?: number } }).pagination
              ?.total || 0,
          studentsCount: course.batch?.currentStudents || 0,
        };
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        return {
          ...course,
          studentsCount: course.batch?.currentStudents || 0,
        };
      }
    }),
  );
}

// =================================== Instructor Course Queries =========================================

// Fetch courses assigned to an instructor
export function useInstructorCourses(instructorId: string) {
  return useQuery({
    queryKey: teacherKeys.instructorCoursesList(instructorId),
    queryFn: () =>
      batchCourseInstructorService.getInstructorCourses(instructorId),
    enabled: !!instructorId,
  });
}

// Fetch courses assigned to an instructor with statistics
export function useInstructorCoursesWithStats(instructorId: string) {
  return useQuery({
    queryKey: teacherKeys.instructorCoursesWithStats(instructorId),
    queryFn: async () => {
      const courses =
        await batchCourseInstructorService.getInstructorCourses(instructorId);
      return enrichCoursesWithStats(courses);
    },
    enabled: !!instructorId,
  });
}

// Fetch a single instructor course assignment
export function useInstructorCourse(id: string) {
  return useQuery({
    queryKey: teacherKeys.instructorCourse(id),
    queryFn: () => batchCourseInstructorService.getAssignment(id),
    enabled: !!id,
  });
}

// Fetch course instructors with optional filters
export function useCourseInstructors(params?: {
  courseId?: string;
  batchId?: string;
  semester?: number;
}) {
  return useQuery({
    queryKey: teacherKeys.courseInstructorsList(params),
    queryFn: () => batchCourseInstructorService.getCourseInstructors(params),
  });
}

// ===================================== Grading Workflow Queries =======================================

// Fetch grading workflow items
export function useGradingWorkflow(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: teacherKeys.gradingWorkflowList(params),
    queryFn: async () => {
      const response = await courseGradeService.getWorkflow(params);
      return (response || []) as ResultWorkflow[];
    },
  });
}

// Fetch grading workflow items filtered by status
export function useGradingWorkflowByStatus(
  status: "draft" | "pending" | "submitted" | "returned" | "approved",
) {
  const query = useGradingWorkflow();

  const filteredWorkflows =
    query.data?.filter((w) => {
      if (status === "pending") {
        return w.status === "draft" || w.status === "pending";
      }
      return w.status === status;
    }) ?? [];

  return {
    ...query,
    data: filteredWorkflows,
  };
}

// ===================================== Assignment Mutations =======================================

// Assign instructor to course mutation
export function useAssignInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignInstructorDto) =>
      batchCourseInstructorService.assignInstructor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teacherKeys.instructorCourses(),
      });
      queryClient.invalidateQueries({ queryKey: teacherKeys.assignments() });
    },
  });
}

// Update assignment mutation
export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<BatchCourseInstructor>;
    }) => batchCourseInstructorService.updateAssignment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: teacherKeys.instructorCourses(),
      });
      queryClient.invalidateQueries({
        queryKey: teacherKeys.assignment(variables.id),
      });
    },
  });
}

// Delete assignment mutation
export function useDeleteAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      batchCourseInstructorService.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teacherKeys.instructorCourses(),
      });
      queryClient.invalidateQueries({ queryKey: teacherKeys.assignments() });
    },
  });
}

// Bulk assign instructors mutation
export function useBulkAssignInstructors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assignments: AssignInstructorDto[]) =>
      batchCourseInstructorService.bulkAssign(assignments),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: teacherKeys.instructorCourses(),
      });
      queryClient.invalidateQueries({ queryKey: teacherKeys.assignments() });
    },
  });
}

// ===================================== Combined Hooks for Common Use Cases =======================================

// Hook for teacher courses page
export function useTeacherCourseDashboard(instructorId: string) {
  const query = useInstructorCoursesWithStats(instructorId);

  const { data, isLoading, isError, error, refetch } = query;
  return useMemo(
    () => ({
      courses: (data as any[]) ?? EMPTY_ARRAY,
      isLoading,
      isError,
      error,
      refetch,
    }),
    [data, isLoading, isError, error, refetch],
  );
}

// Hook for grading workflow page
export function useGradingWorkflowDashboard() {
  const query = useGradingWorkflow();

  const { data, isLoading, isError, error, refetch } = query;

  return useMemo(() => {
    const workflows = (data as ResultWorkflow[]) ?? EMPTY_ARRAY;

    const allWorkflows = workflows;
    const pendingWorkflows = workflows.filter(
      (w) => w.status === "draft" || w.status === "pending",
    );
    const submittedWorkflows = workflows.filter(
      (w) => w.status === "submitted",
    );
    const returnedWorkflows = workflows.filter(
      (w) => w.status === "returned",
    );
    const approvedWorkflows = workflows.filter(
      (w) => w.status === "approved",
    );

    return {
      all: allWorkflows,
      pending: pendingWorkflows,
      submitted: submittedWorkflows,
      returned: returnedWorkflows,
      approved: approvedWorkflows,
      isLoading,
      isError,
      error,
      refetch,
    };
  }, [data, isLoading, isError, error, refetch]);
}

// Hook for attendance management page
export function useAttendanceManagement(instructorId: string) {
  const coursesQuery = useInstructorCourses(instructorId);
  const { data, isLoading, isError, error, refetch } = coursesQuery;

  return useMemo(
    () => ({
      courses: (data as any[]) ?? EMPTY_ARRAY,
      isLoading,
      isError,
      error,
      refetch,
    }),
    [data, isLoading, isError, error, refetch],
  );
}

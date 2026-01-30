import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  courseGradeService,
  CourseGrade,
} from "@/services/enrollment/courseGrade.service";
import {
  attendanceService,
  Attendance,
  BulkAttendancePayload,
} from "@/services/enrollment/attendance.service";
import {
  enrollmentService,
  Enrollment,
} from "@/services/enrollment/enrollment.service";

// =======================================  Query Keys =====================================

export const enrollmentKeys = {
  all: ["enrollment"] as const,

  // Grades
  grades: () => [...enrollmentKeys.all, "grades"] as const,
  gradesList: (params?: Record<string, unknown>) =>
    [...enrollmentKeys.grades(), "list", params] as const,
  grade: (id: string) => [...enrollmentKeys.grades(), id] as const,
  studentGrades: (studentId: string) =>
    [...enrollmentKeys.grades(), "student", studentId] as const,
  semesterGrades: (studentId: string, semester: string) =>
    [
      ...enrollmentKeys.grades(),
      "student",
      studentId,
      "semester",
      semester,
    ] as const,
  cgpa: (studentId: string) =>
    [...enrollmentKeys.grades(), "cgpa", studentId] as const,
  semesterGpa: (studentId: string, semester: string) =>
    [...enrollmentKeys.grades(), "gpa", studentId, semester] as const,
  gradeStats: () => [...enrollmentKeys.grades(), "stats"] as const,
  gradeWorkflow: (params?: Record<string, unknown>) =>
    [...enrollmentKeys.grades(), "workflow", params] as const,

  // Attendance
  attendance: () => [...enrollmentKeys.all, "attendance"] as const,
  attendanceList: (params?: Record<string, unknown>) =>
    [...enrollmentKeys.attendance(), "list", params] as const,
  attendanceRecord: (id: string) =>
    [...enrollmentKeys.attendance(), id] as const,
  studentAttendance: (studentId: string) =>
    [...enrollmentKeys.attendance(), "student", studentId] as const,
  attendanceStats: (studentId: string, courseId: string) =>
    [...enrollmentKeys.attendance(), "stats", studentId, courseId] as const,
  courseAttendanceReport: (courseId: string, batchId: string) =>
    [...enrollmentKeys.attendance(), "report", courseId, batchId] as const,

  // Enrollments
  enrollments: () => [...enrollmentKeys.all, "enrollments"] as const,
  enrollmentsList: (params?: Record<string, unknown>) =>
    [...enrollmentKeys.enrollments(), "list", params] as const,
  enrollment: (id: string) => [...enrollmentKeys.enrollments(), id] as const,
  studentEnrollments: (studentId: string) =>
    [...enrollmentKeys.enrollments(), "student", studentId] as const,
  studentSemesterEnrollments: (studentId: string, semester: number) =>
    [
      ...enrollmentKeys.enrollments(),
      "student",
      studentId,
      "semester",
      semester,
    ] as const,
  batchSemesterCourses: (batchId: string, semester: number) =>
    [
      ...enrollmentKeys.enrollments(),
      "batch",
      batchId,
      "semester",
      semester,
      "courses",
    ] as const,
};

// Extract array data from API response
function extractArrayData<T>(response: unknown, key: string): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }
  if (response && typeof response === "object") {
    const obj = response as Record<string, unknown>;
    if (Array.isArray(obj[key])) {
      return obj[key] as T[];
    }
    if (Array.isArray(obj.data)) {
      return obj.data as T[];
    }
  }
  return [];
}

// ===================================== Grade Queries =======================================

// Fetch list of grades with optional filters
export function useGrades(params?: {
  studentId?: string;
  courseId?: string;
  semester?: number;
}) {
  return useQuery({
    queryKey: enrollmentKeys.gradesList(params),
    queryFn: async () => {
      const response = await courseGradeService.list(params);
      return extractArrayData<CourseGrade>(response, "grades");
    },
  });
}

// Fetch a single grade by ID
export function useGrade(id: string) {
  return useQuery({
    queryKey: enrollmentKeys.grade(id),
    queryFn: () => courseGradeService.getById(id),
    enabled: !!id,
  });
}

// Fetch grades for a specific student
export function useStudentGrades(studentId: string, options?: { includeMarksBreakdown?: boolean }) {
  return useQuery({
    queryKey: [...enrollmentKeys.studentGrades(studentId), options?.includeMarksBreakdown ? 'withMarks' : 'basic'],
    queryFn: async () => {
      const params: any = { studentId };
      if (options?.includeMarksBreakdown) {
        params.includeMarksBreakdown = 'true';
      }
      const response = await courseGradeService.list(params);
      return extractArrayData<CourseGrade>(response, "grades");
    },
    enabled: !!studentId,
  });
}

// Fetch grades for a specific student and semester
export function useSemesterGrades(studentId: string, semester: string) {
  return useQuery({
    queryKey: enrollmentKeys.semesterGrades(studentId, semester),
    queryFn: () =>
      courseGradeService.getStudentSemesterGrades(studentId, semester),
    enabled: !!studentId && !!semester,
  });
}

// Calculate and fetch CGPA for a student
export function useCGPA(studentId: string) {
  return useQuery({
    queryKey: enrollmentKeys.cgpa(studentId),
    queryFn: async () => {
      const response = await courseGradeService.calculateCGPA(studentId);
      return response?.cgpa ?? 0;
    },
    enabled: !!studentId,
  });
}

// Calculate and fetch semester GPA for a student
export function useSemesterGPA(studentId: string, semester: string) {
  return useQuery({
    queryKey: enrollmentKeys.semesterGpa(studentId, semester),
    queryFn: async () => {
      const response = await courseGradeService.calculateSemesterGPA(
        studentId,
        semester,
      );
      return response?.gpa ?? 0;
    },
    enabled: !!studentId && !!semester,
  });
}

// Fetch grade statistics
export function useGradeStats() {
  return useQuery({
    queryKey: enrollmentKeys.gradeStats(),
    queryFn: () => courseGradeService.getStats(),
  });
}

// Fetch grade workflow items
export function useGradeWorkflow(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: enrollmentKeys.gradeWorkflow(params),
    queryFn: () => courseGradeService.getWorkflow(params),
  });
}

// ====================================== Grade Mutations ======================================

// Calculate grade mutation
export function useCalculateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<CourseGrade>) =>
      courseGradeService.calculate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.grades() });
    },
  });
}

// Auto-calculate grade mutation
export function useAutoCalculateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) =>
      courseGradeService.autoCalculate(enrollmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.grades() });
    },
  });
}

// Update grade mutation
export function useUpdateGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CourseGrade> }) =>
      courseGradeService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.grades() });
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.grade(variables.id),
      });
    },
  });
}

// Publish grade mutation
export function usePublishGrade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courseGradeService.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.grades() });
    },
  });
}

// Submit grade to committee mutation
export function useSubmitGradeToCommittee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => courseGradeService.submitToCommittee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.gradeWorkflow(),
      });
    },
  });
}

// ===================================== Attendance Queries =======================================

// Fetch attendance list with optional filters
export function useAttendance(params?: {
  studentId?: string;
  courseId?: string;
  batchId?: string;
}) {
  return useQuery({
    queryKey: enrollmentKeys.attendanceList(params),
    queryFn: async () => {
      const response = await attendanceService.listAttendance(params);
      return extractArrayData<Attendance>(response, "attendance");
    },
  });
}

// Fetch attendance for a specific student
export function useStudentAttendance(studentId: string) {
  return useQuery({
    queryKey: enrollmentKeys.studentAttendance(studentId),
    queryFn: async () => {
      const response = await attendanceService.listAttendance({ studentId });
      return extractArrayData<Attendance>(response, "attendance");
    },
    enabled: !!studentId,
  });
}

// Fetch attendance statistics for a student in a course
export function useAttendanceStats(studentId: string, courseId: string) {
  return useQuery({
    queryKey: enrollmentKeys.attendanceStats(studentId, courseId),
    queryFn: () => attendanceService.getStudentStats(studentId, courseId),
    enabled: !!studentId && !!courseId,
  });
}

// Fetch course attendance report
export function useCourseAttendanceReport(courseId: string, batchId: string) {
  return useQuery({
    queryKey: enrollmentKeys.courseAttendanceReport(courseId, batchId),
    queryFn: () => attendanceService.getCourseReport(courseId, batchId),
    enabled: !!courseId && !!batchId,
  });
}

// ====================================== Attendance Mutations ======================================

// Mark single attendance mutation
export function useMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Attendance>) =>
      attendanceService.markAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.attendance() });
    },
  });
}

// Bulk mark attendance mutation
export function useBulkMarkAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkAttendancePayload) =>
      attendanceService.bulkMarkAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.attendance() });
    },
  });
}

// Update attendance mutation
export function useUpdateAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Attendance> }) =>
      attendanceService.updateAttendance(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.attendance() });
    },
  });
}

// Delete attendance mutation
export function useDeleteAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => attendanceService.deleteAttendance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.attendance() });
    },
  });
}

// ===================================== Enrollment Queries =======================================

// Fetch enrollments list with optional filters
export function useEnrollments(params?: {
  studentId?: string;
  batchId?: string;
  courseId?: string;
  semester?: number;
}) {
  return useQuery({
    queryKey: enrollmentKeys.enrollmentsList(params),
    queryFn: async () => {
      const response = await enrollmentService.listEnrollments(params);
      return extractArrayData<Enrollment>(response, "enrollments");
    },
  });
}

// Fetch a single enrollment by ID
export function useEnrollment(id: string) {
  return useQuery({
    queryKey: enrollmentKeys.enrollment(id),
    queryFn: () => enrollmentService.getEnrollment(id),
    enabled: !!id,
  });
}

// Fetch enrollments for a student in a specific semester
export function useStudentSemesterEnrollments(
  studentId: string,
  semester: number,
) {
  return useQuery({
    queryKey: enrollmentKeys.studentSemesterEnrollments(studentId, semester),
    queryFn: () =>
      enrollmentService.getStudentSemesterEnrollments(studentId, semester),
    enabled: !!studentId && semester > 0,
  });
}

// Fetch courses for a batch in a specific semester
export function useBatchSemesterCourses(batchId: string, semester: number) {
  return useQuery({
    queryKey: enrollmentKeys.batchSemesterCourses(batchId, semester),
    queryFn: () => enrollmentService.getBatchSemesterCourses(batchId, semester),
    enabled: !!batchId && semester > 0,
  });
}

// ==================================== Enrollment Mutations ========================================

// Enroll student mutation
export function useEnrollStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      studentId: string;
      batchId: string;
      sessionId: string;
      semester: number;
    }) => enrollmentService.enrollStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.enrollments() });
    },
  });
}

// Bulk enroll students mutation
export function useBulkEnroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      batchId: string;
      courseIds: string[];
      semester: number;
      academicYear: string;
    }) => enrollmentService.bulkEnroll(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.enrollments() });
    },
  });
}

// Update enrollment mutation
export function useUpdateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Enrollment> }) =>
      enrollmentService.updateEnrollment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.enrollments() });
      queryClient.invalidateQueries({
        queryKey: enrollmentKeys.enrollment(variables.id),
      });
    },
  });
}

// Delete enrollment mutation
export function useDeleteEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => enrollmentService.deleteEnrollment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.enrollments() });
    },
  });
}

// Complete batch semester mutation
export function useCompleteBatchSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      batchId,
      semester,
    }: {
      batchId: string;
      semester: number;
    }) => enrollmentService.completeBatchSemester(batchId, semester),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.enrollments() });
    },
  });
}

// Progress batch to next semester mutation
export function useProgressBatchSemester() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (batchId: string) =>
      enrollmentService.progressBatchSemester(batchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enrollmentKeys.enrollments() });
    },
  });
}

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  academicApi,
  extractArrayData,
  extractItemData,
  handleApiError,
} from "@/lib/api";
import { ApiError } from "@/types/api";
import type {
  Faculty,
  Department,
  Program,
  Session,
  Batch,
  Course,
  SessionCourse,
  Classroom,
  CourseSchedule,
  ExamCommittee,
  CoursePrerequisite,
  CourseSyllabus,
} from "@/services/academic/types";

// ===================== Query Keys Factory =====================

// Centralized query keys for academic data
export const academicKeys = {
  all: ["academic"] as const,

  // Faculties
  faculties: () => [...academicKeys.all, "faculties"] as const,
  faculty: (id: string) => [...academicKeys.faculties(), id] as const,
  facultyDepartments: (id: string) =>
    [...academicKeys.faculty(id), "departments"] as const,

  // Departments
  departments: () => [...academicKeys.all, "departments"] as const,
  department: (id: string) => [...academicKeys.departments(), id] as const,
  departmentPrograms: (id: string) =>
    [...academicKeys.department(id), "programs"] as const,

  // Programs
  programs: () => [...academicKeys.all, "programs"] as const,
  program: (id: string) => [...academicKeys.programs(), id] as const,
  programBatches: (id: string) =>
    [...academicKeys.program(id), "batches"] as const,

  // Sessions
  sessions: () => [...academicKeys.all, "sessions"] as const,
  session: (id: string) => [...academicKeys.sessions(), id] as const,

  // Batches
  batches: () => [...academicKeys.all, "batches"] as const,
  batch: (id: string) => [...academicKeys.batches(), id] as const,

  // Courses
  courses: () => [...academicKeys.all, "courses"] as const,
  course: (id: string) => [...academicKeys.courses(), id] as const,

  // Session Courses
  sessionCourses: () => [...academicKeys.all, "sessionCourses"] as const,
  sessionCourse: (id: string) =>
    [...academicKeys.sessionCourses(), id] as const,
  sessionCoursesBySession: (sessionId: string) =>
    [...academicKeys.sessionCourses(), "session", sessionId] as const,

  // Classrooms
  classrooms: () => [...academicKeys.all, "classrooms"] as const,
  classroom: (id: string) => [...academicKeys.classrooms(), id] as const,

  // Schedules
  schedules: () => [...academicKeys.all, "schedules"] as const,
  schedule: (id: string) => [...academicKeys.schedules(), id] as const,
  batchSchedules: (batchId: string) =>
    [...academicKeys.schedules(), "batch", batchId] as const,

  // Exam Committees
  examCommittees: () => [...academicKeys.all, "examCommittees"] as const,
  examCommittee: (id: string) =>
    [...academicKeys.examCommittees(), id] as const,

  // Prerequisites
  prerequisites: () => [...academicKeys.all, "prerequisites"] as const,
  prerequisite: (id: string) => [...academicKeys.prerequisites(), id] as const,
  coursePrerequisites: (courseId: string) =>
    [...academicKeys.prerequisites(), "course", courseId] as const,

  // Syllabus
  syllabi: () => [...academicKeys.all, "syllabi"] as const,
  syllabus: (id: string) => [...academicKeys.syllabi(), id] as const,
};

// ===================== Faculty Queries  =====================

export const useFaculties = (
  options?: Omit<UseQueryOptions<Faculty[], ApiError>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: academicKeys.faculties(),
    queryFn: async () => {
      try {
        const response = await academicApi.get("/faculties");
        return extractArrayData<Faculty>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    ...options,
  });
};

export const useFaculty = (
  id: string,
  options?: Omit<UseQueryOptions<Faculty, ApiError>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: academicKeys.faculty(id),
    queryFn: async () => {
      try {
        const response = await academicApi.get(`/faculties/${id}`);
        return extractItemData<Faculty>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateFaculty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Faculty>) => {
      try {
        const response = await academicApi.post("/faculties", data);
        return extractItemData<Faculty>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.faculties() });
    },
  });
};

export const useUpdateFaculty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Faculty>;
    }) => {
      try {
        const response = await academicApi.patch(`/faculties/${id}`, data);
        return extractItemData<Faculty>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.faculties() });
      queryClient.invalidateQueries({ queryKey: academicKeys.faculty(id) });
    },
  });
};

export const useDeleteFaculty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await academicApi.delete(`/faculties/${id}`);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.faculties() });
    },
  });
};

export const useAssignDean = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      facultyId,
      deanId,
    }: {
      facultyId: string;
      deanId: string;
    }) => {
      try {
        const response = await academicApi.post(
          `/faculties/${facultyId}/assign-dean`,
          { deanId },
        );
        return extractItemData<Faculty>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: (_, { facultyId }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.faculties() });
      queryClient.invalidateQueries({
        queryKey: academicKeys.faculty(facultyId),
      });
    },
  });
};

// ===================== Department Queries =====================

export const useDepartments = (
  options?: Omit<
    UseQueryOptions<Department[], ApiError>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: academicKeys.departments(),
    queryFn: async () => {
      try {
        const response = await academicApi.get("/departments");
        return extractArrayData<Department>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    ...options,
  });
};

export const useDepartment = (
  id: string,
  options?: Omit<UseQueryOptions<Department, ApiError>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: academicKeys.department(id),
    queryFn: async () => {
      try {
        const response = await academicApi.get(`/departments/${id}`);
        return extractItemData<Department>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Department>) => {
      try {
        const response = await academicApi.post("/departments", data);
        return extractItemData<Department>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.departments() });
      queryClient.invalidateQueries({ queryKey: academicKeys.faculties() });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Department>;
    }) => {
      try {
        const response = await academicApi.patch(`/departments/${id}`, data);
        return extractItemData<Department>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.departments() });
      queryClient.invalidateQueries({ queryKey: academicKeys.department(id) });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await academicApi.delete(`/departments/${id}`);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.departments() });
      queryClient.invalidateQueries({ queryKey: academicKeys.faculties() });
    },
  });
};

// ===================== Program Queries =====================

export const usePrograms = (
  options?: Omit<UseQueryOptions<Program[], ApiError>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: academicKeys.programs(),
    queryFn: async () => {
      try {
        const response = await academicApi.get("/programs");
        return extractArrayData<Program>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    ...options,
  });
};

export const useProgram = (
  id: string,
  options?: Omit<UseQueryOptions<Program, ApiError>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: academicKeys.program(id),
    queryFn: async () => {
      try {
        const response = await academicApi.get(`/programs/${id}`);
        return extractItemData<Program>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Program>) => {
      try {
        const response = await academicApi.post("/programs", data);
        return extractItemData<Program>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.programs() });
      queryClient.invalidateQueries({ queryKey: academicKeys.departments() });
    },
  });
};

export const useUpdateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Program>;
    }) => {
      try {
        const response = await academicApi.patch(`/programs/${id}`, data);
        return extractItemData<Program>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.programs() });
      queryClient.invalidateQueries({ queryKey: academicKeys.program(id) });
    },
  });
};

export const useDeleteProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await academicApi.delete(`/programs/${id}`);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.programs() });
      queryClient.invalidateQueries({ queryKey: academicKeys.departments() });
    },
  });
};

// ===================== Session Queries =====================

export const useSessions = (
  options?: Omit<UseQueryOptions<Session[], ApiError>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: academicKeys.sessions(),
    queryFn: async () => {
      try {
        const response = await academicApi.get("/sessions");
        return extractArrayData<Session>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    ...options,
  });
};

export const useSession = (
  id: string,
  options?: Omit<UseQueryOptions<Session, ApiError>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: academicKeys.session(id),
    queryFn: async () => {
      try {
        const response = await academicApi.get(`/sessions/${id}`);
        return extractItemData<Session>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Session>) => {
      try {
        const response = await academicApi.post("/sessions", data);
        return extractItemData<Session>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.sessions() });
    },
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Session>;
    }) => {
      try {
        const response = await academicApi.patch(`/sessions/${id}`, data);
        return extractItemData<Session>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.sessions() });
      queryClient.invalidateQueries({ queryKey: academicKeys.session(id) });
    },
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await academicApi.delete(`/sessions/${id}`);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.sessions() });
    },
  });
};

// ===================== Batch Queries =====================

export const useBatches = (
  options?: Omit<UseQueryOptions<Batch[], ApiError>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: academicKeys.batches(),
    queryFn: async () => {
      try {
        const response = await academicApi.get("/batches");
        return extractArrayData<Batch>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    ...options,
  });
};

export const useBatch = (
  id: string,
  options?: Omit<UseQueryOptions<Batch, ApiError>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: academicKeys.batch(id),
    queryFn: async () => {
      try {
        const response = await academicApi.get(`/batches/${id}`);
        return extractItemData<Batch>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Batch>) => {
      try {
        const response = await academicApi.post("/batches", data);
        return extractItemData<Batch>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.batches() });
      queryClient.invalidateQueries({ queryKey: academicKeys.programs() });
    },
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Batch> }) => {
      try {
        const response = await academicApi.patch(`/batches/${id}`, data);
        return extractItemData<Batch>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.batches() });
      queryClient.invalidateQueries({ queryKey: academicKeys.batch(id) });
    },
  });
};

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await academicApi.delete(`/batches/${id}`);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.batches() });
      queryClient.invalidateQueries({ queryKey: academicKeys.programs() });
    },
  });
};

// ===================== Course Queries =====================

export const useCourses = (
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<Course[], ApiError>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: params
      ? [...academicKeys.courses(), params]
      : academicKeys.courses(),
    queryFn: async () => {
      try {
        const response = await academicApi.get("/courses", { params });
        return extractArrayData<Course>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    ...options,
  });
};

export const useCourse = (
  id: string,
  options?: Omit<UseQueryOptions<Course, ApiError>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: academicKeys.course(id),
    queryFn: async () => {
      try {
        const response = await academicApi.get(`/courses/${id}`);
        return extractItemData<Course>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Course>) => {
      try {
        const response = await academicApi.post("/courses", data);
        return extractItemData<Course>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.courses() });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Course> }) => {
      try {
        const response = await academicApi.patch(`/courses/${id}`, data);
        return extractItemData<Course>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.courses() });
      queryClient.invalidateQueries({ queryKey: academicKeys.course(id) });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await academicApi.delete(`/courses/${id}`);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.courses() });
    },
  });
};

// ===================== Session Course Queries =====================

export const useSessionCourses = (
  params?: Record<string, any>,
  options?: Omit<
    UseQueryOptions<SessionCourse[], ApiError>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: params
      ? [...academicKeys.sessionCourses(), params]
      : academicKeys.sessionCourses(),
    queryFn: async () => {
      try {
        const response = await academicApi.get("/session-courses", { params });
        return extractArrayData<SessionCourse>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    ...options,
  });
};

export const useSessionCourse = (
  id: string,
  options?: Omit<
    UseQueryOptions<SessionCourse, ApiError>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: academicKeys.sessionCourse(id),
    queryFn: async () => {
      try {
        const response = await academicApi.get(`/session-courses/${id}`);
        return extractItemData<SessionCourse>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    enabled: !!id,
    ...options,
  });
};

// ===================== Classroom Queries =====================

export const useClassrooms = (
  options?: Omit<
    UseQueryOptions<Classroom[], ApiError>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: academicKeys.classrooms(),
    queryFn: async () => {
      try {
        const response = await academicApi.get("/classrooms");
        return extractArrayData<Classroom>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    ...options,
  });
};

export const useClassroom = (
  id: string,
  options?: Omit<UseQueryOptions<Classroom, ApiError>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: academicKeys.classroom(id),
    queryFn: async () => {
      try {
        const response = await academicApi.get(`/classrooms/${id}`);
        return extractItemData<Classroom>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Classroom>) => {
      try {
        const response = await academicApi.post("/classrooms", data);
        return extractItemData<Classroom>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.classrooms() });
    },
  });
};

export const useUpdateClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Classroom>;
    }) => {
      try {
        const response = await academicApi.patch(`/classrooms/${id}`, data);
        return extractItemData<Classroom>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.classrooms() });
      queryClient.invalidateQueries({ queryKey: academicKeys.classroom(id) });
    },
  });
};

export const useDeleteClassroom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await academicApi.delete(`/classrooms/${id}`);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.classrooms() });
    },
  });
};

// ===================== Schedule Queries =====================

export const useSchedules = (
  options?: Omit<
    UseQueryOptions<CourseSchedule[], ApiError>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: academicKeys.schedules(),
    queryFn: async () => {
      try {
        const response = await academicApi.get("/schedules");
        return extractArrayData<CourseSchedule>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    ...options,
  });
};

export const useBatchSchedules = (
  batchId: string,
  options?: Omit<
    UseQueryOptions<CourseSchedule[], ApiError>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: academicKeys.batchSchedules(batchId),
    queryFn: async () => {
      try {
        const response = await academicApi.get(`/schedules/batch/${batchId}`);
        return extractArrayData<CourseSchedule>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    enabled: !!batchId,
    ...options,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CourseSchedule>) => {
      try {
        const response = await academicApi.post("/schedules", data);
        return extractItemData<CourseSchedule>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.schedules() });
    },
  });
};

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CourseSchedule>;
    }) => {
      try {
        const response = await academicApi.patch(`/schedules/${id}`, data);
        return extractItemData<CourseSchedule>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.schedules() });
      queryClient.invalidateQueries({ queryKey: academicKeys.schedule(id) });
    },
  });
};

export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await academicApi.delete(`/schedules/${id}`);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.schedules() });
    },
  });
};

// ===================== Exam Committee Queries =====================

export const useExamCommittees = (
  options?: Omit<
    UseQueryOptions<ExamCommittee[], ApiError>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: academicKeys.examCommittees(),
    queryFn: async () => {
      try {
        const response = await academicApi.get("/exam-committees");
        return extractArrayData<ExamCommittee>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    ...options,
  });
};

export const useCreateExamCommittee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ExamCommittee>) => {
      try {
        const response = await academicApi.post("/exam-committees", data);
        return extractItemData<ExamCommittee>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: academicKeys.examCommittees(),
      });
    },
  });
};

export const useDeleteExamCommittee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await academicApi.delete(`/exam-committees/${id}`);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: academicKeys.examCommittees(),
      });
    },
  });
};

// ===================== Prerequisite Queries =====================

export const usePrerequisites = (
  options?: Omit<
    UseQueryOptions<CoursePrerequisite[], ApiError>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: academicKeys.prerequisites(),
    queryFn: async () => {
      try {
        const response = await academicApi.get("/courses/prerequisites");
        return extractArrayData<CoursePrerequisite>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    ...options,
  });
};

export const useCreatePrerequisite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CoursePrerequisite>) => {
      try {
        const response = await academicApi.post("/prerequisites", data);
        return extractItemData<CoursePrerequisite>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.prerequisites() });
    },
  });
};

export const useDeletePrerequisite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await academicApi.delete(`/prerequisites/${id}`);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.prerequisites() });
    },
  });
};

// ===================== Syllabus Queries =====================
export const useSyllabi = (
  options?: Omit<
    UseQueryOptions<CourseSyllabus[], ApiError>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: academicKeys.syllabi(),
    queryFn: async () => {
      try {
        const response = await academicApi.get("/courses/syllabus");
        return extractArrayData<CourseSyllabus>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    ...options,
  });
};

export const useSyllabus = (
  id: string,
  options?: Omit<
    UseQueryOptions<CourseSyllabus, ApiError>,
    "queryKey" | "queryFn"
  >,
) => {
  return useQuery({
    queryKey: academicKeys.syllabus(id),
    queryFn: async () => {
      try {
        const response = await academicApi.get(`/courses/syllabus/${id}`);
        return extractItemData<CourseSyllabus>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateSyllabus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<CourseSyllabus>) => {
      try {
        const response = await academicApi.post("/courses/syllabus", data);
        return extractItemData<CourseSyllabus>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.syllabi() });
    },
  });
};

export const useUpdateSyllabus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CourseSyllabus>;
    }) => {
      try {
        const response = await academicApi.patch(`/courses/syllabus/${id}`, data);
        return extractItemData<CourseSyllabus>(response);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: academicKeys.syllabi() });
      queryClient.invalidateQueries({ queryKey: academicKeys.syllabus(id) });
    },
  });
};

export const useDeleteSyllabus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await academicApi.delete(`/courses/syllabus/${id}`);
      } catch (error) {
        return handleApiError(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: academicKeys.syllabi() });
    },
  });
};

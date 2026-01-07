import { academicApi as api, handleApiError } from "../academic/axios-instance";
import { batchService } from "../academic/batch.service";
import { courseService } from "../academic/course.service";
import { Batch, Course } from "../academic/types";

export interface BatchCourseInstructor {
  id: string;
  batchId: string;
  courseId: string;
  instructorId: string;
  sessionId: string;
  semester: number;
  status: "active" | "completed" | "reassigned";
  assignedDate: string;
  assignedBy?: string;
  batch?: Batch;
  course?: Course;
  instructor?: {
    id: string;
    fullName: string;
    email: string;
    registrationNumber?: string;
  };
}

export interface AssignInstructorDto {
  batchId: string;
  courseId: string;
  instructorId: string;
  sessionId: string;
  semester: number;
  status?: "active" | "completed" | "reassigned";
}

export const batchCourseInstructorService = {
  assignInstructor: async (
    data: AssignInstructorDto
  ): Promise<BatchCourseInstructor> => {
    try {
      const response = await api.post(
        "/enrollment/batch-course-instructors",
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  listAssignments: async (
    params?: Record<string, unknown>
  ): Promise<{
    assignments: BatchCourseInstructor[];
    pagination: { total?: number; page?: number; limit?: number };
  }> => {
    try {
      const response = await api.get("/enrollment/batch-course-instructors", {
        params,
      });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getInstructorCourses: async (
    instructorId: string
  ): Promise<BatchCourseInstructor[]> => {
    try {
      const response = await api.get(
        `/enrollment/batch-course-instructors/instructor/${instructorId}/courses`
      );
      const assignments = response.data.data;

      // Enrich with course and batch details
      const enriched = await Promise.all(
        assignments.map(async (assignment: BatchCourseInstructor) => {
          try {
            const [course, batch] = await Promise.all([
              courseService.getCourseById(assignment.courseId),
              batchService.getBatchById(assignment.batchId),
            ]);
            return { ...assignment, course, batch };
          } catch (err) {
            console.error("Failed to enrich assignment:", err);
            return assignment;
          }
        })
      );
      return enriched;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getCourseInstructors: async (params?: {
    courseId?: string;
    batchId?: string;
    semester?: number;
  }): Promise<BatchCourseInstructor[]> => {
    try {
      const response = await api.get(
        "/enrollment/batch-course-instructors/course/instructors",
        { params }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAssignment: async (id: string): Promise<BatchCourseInstructor> => {
    try {
      const response = await api.get(
        `/enrollment/batch-course-instructors/${id}`
      );
      const assignment = response.data.data;

      // Enrich with course and batch details
      try {
        const [course, batch] = await Promise.all([
          courseService.getCourseById(assignment.courseId),
          batchService.getBatchById(assignment.batchId),
        ]);
        return { ...assignment, course, batch };
      } catch (err) {
        console.error("Failed to enrich assignment:", err);
        return assignment;
      }
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateAssignment: async (
    id: string,
    data: Partial<BatchCourseInstructor>
  ): Promise<BatchCourseInstructor> => {
    try {
      const response = await api.put(
        `/enrollment/batch-course-instructors/${id}`,
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteAssignment: async (id: string): Promise<void> => {
    try {
      await api.delete(`/enrollment/batch-course-instructors/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  bulkAssign: async (
    assignments: AssignInstructorDto[]
  ): Promise<{ results: BatchCourseInstructor[]; errors: unknown[] }> => {
    try {
      const response = await api.post(
        "/enrollment/batch-course-instructors/bulk",
        { assignments }
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

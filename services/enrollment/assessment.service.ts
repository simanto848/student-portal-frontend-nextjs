import { api, handleApiError } from "../academic/axios-instance";

export interface AssessmentType {
  id: string;
  name: string;
  code: string;
  weightPercentage: number;
  description?: string;
  isActive: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  courseId: string;
  batchId: string;
  typeId: string;
  totalMarks: number;
  passingMarks: number;
  weightPercentage: number;
  dueDate?: string;
  status: "draft" | "published" | "closed" | "graded";
  createdBy: string;
  type?: AssessmentType;
  course?: any;
  batch?: any;
}

export interface AssessmentSubmission {
  id: string;
  assessmentId: string;
  studentId: string;
  obtainedMarks?: number;
  feedback?: string;
  status: "submitted" | "graded" | "late" | "missed";
  submittedAt?: string;
  gradedBy?: string;
  gradedAt?: string;
  attachments?: string[];
  content?: string;
  student?: any;
  assessment?: Assessment;
}

export interface SubmissionAttachment {
  filename: string;
  url: string;
}

export interface CreateAssessmentSubmissionDto {
  assessmentId: string;
  enrollmentId: string;
  content?: string;
  attachments?: SubmissionAttachment[];
}

export const assessmentService = {
  // Assessment Types
  createType: async (
    data: Partial<AssessmentType>
  ): Promise<AssessmentType> => {
    try {
      const response = await api.post("/enrollment/assessments/types", data);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateType: async (
    id: string,
    data: Partial<AssessmentType>
  ): Promise<AssessmentType> => {
    try {
      const response = await api.put(
        `/enrollment/assessments/types/${id}`,
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteType: async (id: string): Promise<void> => {
    try {
      await api.delete(`/enrollment/assessments/types/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  listTypes: async (): Promise<AssessmentType[]> => {
    try {
      const response = await api.get("/enrollment/assessments/types");
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getType: async (id: string): Promise<AssessmentType> => {
    try {
      const response = await api.get(`/enrollment/assessments/types/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Assessments
  create: async (data: Partial<Assessment>): Promise<Assessment> => {
    try {
      const response = await api.post("/enrollment/assessments", data);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  update: async (
    id: string,
    data: Partial<Assessment>
  ): Promise<Assessment> => {
    try {
      const response = await api.put(`/enrollment/assessments/${id}`, data);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/enrollment/assessments/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },

  publish: async (id: string): Promise<Assessment> => {
    try {
      const response = await api.post(`/enrollment/assessments/${id}/publish`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  close: async (id: string): Promise<Assessment> => {
    try {
      const response = await api.post(`/enrollment/assessments/${id}/close`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  markGraded: async (id: string): Promise<Assessment> => {
    try {
      const response = await api.post(
        `/enrollment/assessments/${id}/mark-graded`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  list: async (
    params?: any
  ): Promise<{ assessments: Assessment[]; pagination: any }> => {
    try {
      const response = await api.get("/enrollment/assessments", { params });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getById: async (id: string): Promise<Assessment> => {
    try {
      const response = await api.get(`/enrollment/assessments/${id}`);
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentAssessments: async (
    studentId: string,
    courseId: string
  ): Promise<Assessment[]> => {
    try {
      const response = await api.get(
        `/enrollment/assessments/student/${studentId}/course/${courseId}`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Submissions
  submit: async (
    data: CreateAssessmentSubmissionDto
  ): Promise<AssessmentSubmission> => {
    try {
      const response = await api.post(
        "/enrollment/assessments/submissions",
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateSubmission: async (
    id: string,
    data: Partial<AssessmentSubmission>
  ): Promise<AssessmentSubmission> => {
    try {
      const response = await api.put(
        `/enrollment/assessments/submissions/${id}`,
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  gradeSubmission: async (
    id: string,
    data: { obtainedMarks: number; feedback?: string }
  ): Promise<AssessmentSubmission> => {
    try {
      const response = await api.post(
        `/enrollment/assessments/submissions/${id}/grade`,
        data
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  listSubmissions: async (
    params?: any
  ): Promise<{ submissions: AssessmentSubmission[]; pagination: any }> => {
    try {
      const response = await api.get("/enrollment/assessments/submissions", {
        params,
      });
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSubmission: async (id: string): Promise<AssessmentSubmission> => {
    try {
      const response = await api.get(
        `/enrollment/assessments/submissions/${id}`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStudentSubmission: async (
    studentId: string,
    assessmentId: string
  ): Promise<AssessmentSubmission> => {
    try {
      const response = await api.get(
        `/enrollment/assessments/submissions/student/${studentId}/assessment/${assessmentId}`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAssessmentSubmissions: async (
    assessmentId: string
  ): Promise<AssessmentSubmission[]> => {
    try {
      const response = await api.get(
        `/enrollment/assessments/${assessmentId}/submissions`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAssessmentSubmissionStats: async (assessmentId: string): Promise<any> => {
    try {
      const response = await api.get(
        `/enrollment/assessments/${assessmentId}/submissions/stats`
      );
      return response.data.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

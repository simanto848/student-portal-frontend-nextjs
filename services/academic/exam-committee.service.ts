import {
  api,
  handleApiError,
  extractArrayData,
  extractItemData,
} from "./axios-instance";
import { ExamCommittee } from "./types";

export const examCommitteeService = {
  getMembers: async (
    departmentId?: string,
    batchId?: string,
    shift?: "day" | "evening"
  ): Promise<ExamCommittee[]> => {
    try {
      const params: any = {};
      if (departmentId) params.departmentId = departmentId;
      if (batchId) params.batchId = batchId;
      if (shift) params.shift = shift;
      const response = await api.get("/academic/exam-committees", { params });
      return extractArrayData<ExamCommittee>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  addMember: async (data: {
    departmentId: string;
    teacherId: string;
    shift: "day" | "evening";
    batchId?: string | null;
  }): Promise<ExamCommittee> => {
    try {
      const response = await api.post("/academic/exam-committees", data);
      return extractItemData<ExamCommittee>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  updateMember: async (
    id: string,
    data: Partial<ExamCommittee>
  ): Promise<ExamCommittee> => {
    try {
      const response = await api.patch(`/academic/exam-committees/${id}`, data);
      return extractItemData<ExamCommittee>(response);
    } catch (error) {
      return handleApiError(error);
    }
  },
  removeMember: async (id: string): Promise<void> => {
    try {
      await api.delete(`/academic/exam-committees/${id}`);
    } catch (error) {
      return handleApiError(error);
    }
  },
};

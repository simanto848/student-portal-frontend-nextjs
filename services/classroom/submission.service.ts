import { classroomApi, handleClassroomApiError, extractClassroomArrayData, extractClassroomItemData } from './axios-instance';
import { Submission, SubmitAssignmentDto, GradeSubmissionDto, Feedback, CreateFeedbackDto } from './types';

export const submissionService = {
    /**
     * Submit or update a submission for an assignment
     * Roles: super_admin, admin, program_controller, teacher, student
     * Students can only submit their own; teachers can submit on behalf
     */
    submitOrUpdate: async (assignmentId: string, data: SubmitAssignmentDto): Promise<Submission> => {
        try {
            const response = await classroomApi.post(`/submissions/${assignmentId}`, data);
            return extractClassroomItemData<Submission>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * List all submissions for an assignment
     * Roles: super_admin, admin, program_controller, teacher
     * Teachers can see all submissions; students cannot list others' submissions
     */
    listByAssignment: async (assignmentId: string): Promise<Submission[]> => {
        try {
            const response = await classroomApi.get(`/submissions/${assignmentId}`);
            return extractClassroomArrayData<Submission>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Get a specific submission by ID
     * Roles: super_admin, admin, program_controller, teacher, student
     * Students can only view their own submission
     */
    getById: async (id: string): Promise<Submission> => {
        try {
            const response = await classroomApi.get(`/submissions/item/${id}`);
            return extractClassroomItemData<Submission>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Grade a submission
     * Roles: super_admin, admin, program_controller, teacher
     */
    grade: async (id: string, data: GradeSubmissionDto): Promise<Submission> => {
        try {
            const response = await classroomApi.post(`/submissions/${id}/grade`, data);
            return extractClassroomItemData<Submission>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },

    /**
     * Add feedback to a submission
     * Roles: super_admin, admin, program_controller, teacher, student
     * Both teachers and students can comment
     */
    addFeedback: async (id: string, data: CreateFeedbackDto): Promise<Feedback> => {
        try {
            const response = await classroomApi.post(`/submissions/${id}/feedback`, data);
            return extractClassroomItemData<Feedback>(response);
        } catch (error) {
            return handleClassroomApiError(error);
        }
    },
};

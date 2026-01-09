import { classroomApi, handleClassroomApiError } from './axios-instance';

// Types
export interface QuizOption {
    id: string;
    text: string;
    isCorrect?: boolean;
}

// TipTap content type
export type TipTapContent = {
    type: string;
    content?: TipTapContent[];
    attrs?: Record<string, unknown>;
    marks?: { type: string; attrs?: Record<string, unknown> }[];
    text?: string;
};

export interface Question {
    id: string;
    quizId: string;
    type: 'mcq_single' | 'mcq_multiple' | 'true_false' | 'short_answer' | 'long_answer';
    text: string;  // Plain text fallback / searchable text
    content?: TipTapContent;  // TipTap JSON content
    contentType?: 'plain' | 'tiptap';  // Content format indicator
    options: QuizOption[];
    correctAnswer?: string;
    points: number;
    order: number;
    explanation?: string;
}

export interface Quiz {
    id: string;
    workspaceId: string;
    title: string;
    description?: string;
    instructions?: string;
    duration: number;
    maxAttempts: number;
    maxScore: number;
    passingScore: number;
    startAt?: string;
    endAt?: string;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    showResultsAfterSubmit: boolean;
    showCorrectAnswers: boolean;
    status: 'draft' | 'published' | 'closed';
    publishedAt?: string;
    questionCount: number;
    questions?: Question[];
    attemptCount?: number;
    submittedCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface QuizAnswer {
    questionId: string;
    selectedOptions: string[];
    writtenAnswer?: string;
    isCorrect?: boolean | null;
    pointsAwarded?: number | null;
    feedback?: string;
}

export interface QuizAttempt {
    id: string;
    quizId: string;
    studentId: string;
    attemptNumber: number;
    startedAt: string;
    submittedAt?: string;
    expiresAt: string;
    status: 'in_progress' | 'submitted' | 'graded' | 'timed_out';
    isAutoSubmitted: boolean;
    score: number | null;
    maxScore: number;
    percentage: number | null;
    isPassed: boolean | null;
    answers: QuizAnswer[];
    feedback?: string;
}

export interface StartAttemptResponse {
    attempt: QuizAttempt;
    questions: Question[];
    timeRemaining: number;
}

export interface SubmitResult {
    attemptId: string;
    status: string;
    submittedAt: string;
    isAutoSubmitted: boolean;
    score?: number;
    maxScore?: number;
    percentage?: number;
    isPassed?: boolean;
}

// Normalize quiz data to ensure id is always present
const normalizeQuiz = (data: any): Quiz => ({
    ...data,
    id: data?.id || data?._id || '',
});

const normalizeQuizArray = (data: any[]): Quiz[] =>
    Array.isArray(data) ? data.map(normalizeQuiz) : [];

// Quiz Service
export const quizService = {
    // Create quiz
    async create(data: Partial<Quiz>): Promise<Quiz> {
        try {
            const res = await classroomApi.post('/quizzes', data);
            return normalizeQuiz(res.data.data);
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Get quiz by ID
    async getById(id: string): Promise<Quiz> {
        try {
            const res = await classroomApi.get(`/quizzes/${id}`);
            return normalizeQuiz(res.data.data);
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // List quizzes by workspace
    async listByWorkspace(workspaceId: string, status?: string): Promise<Quiz[]> {
        try {
            const params = status ? { status } : {};
            const res = await classroomApi.get(`/quizzes/workspace/${workspaceId}`, { params });
            return normalizeQuizArray(res.data.data || []);
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Update quiz
    async update(id: string, data: Partial<Quiz>): Promise<Quiz> {
        try {
            const res = await classroomApi.patch(`/quizzes/${id}`, data);
            return normalizeQuiz(res.data.data);
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Delete quiz
    async delete(id: string): Promise<void> {
        try {
            await classroomApi.delete(`/quizzes/${id}`);
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Publish quiz
    async publish(id: string): Promise<Quiz> {
        try {
            const res = await classroomApi.post(`/quizzes/${id}/publish`);
            return normalizeQuiz(res.data.data);
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Close quiz
    async close(id: string): Promise<Quiz> {
        try {
            const res = await classroomApi.post(`/quizzes/${id}/close`);
            return normalizeQuiz(res.data.data);
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Get submissions
    async getSubmissions(id: string): Promise<QuizAttempt[]> {
        try {
            const res = await classroomApi.get(`/quizzes/${id}/submissions`);
            return res.data.data || [];
        } catch (e) {
            return handleClassroomApiError(e);
        }
    }
};

// Question Service
export const questionService = {
    // Create question
    async create(data: Partial<Question>): Promise<Question> {
        try {
            const res = await classroomApi.post('/questions', data);
            return res.data.data;
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Bulk create questions
    async bulkCreate(quizId: string, questions: Partial<Question>[]): Promise<Question[]> {
        try {
            const res = await classroomApi.post('/questions/bulk', { quizId, questions });
            return res.data.data || [];
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // List questions by quiz
    async listByQuiz(quizId: string): Promise<Question[]> {
        try {
            const res = await classroomApi.get(`/questions/quiz/${quizId}`);
            return res.data.data || [];
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Update question
    async update(id: string, data: Partial<Question>): Promise<Question> {
        try {
            const res = await classroomApi.patch(`/questions/${id}`, data);
            return res.data.data;
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Delete question
    async delete(id: string): Promise<void> {
        try {
            await classroomApi.delete(`/questions/${id}`);
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Reorder questions
    async reorder(quizId: string, questionIds: string[]): Promise<Question[]> {
        try {
            const res = await classroomApi.post(`/questions/quiz/${quizId}/reorder`, { questionIds });
            return res.data.data || [];
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Upload image for question content (TipTap editor)
    async uploadImage(file: File): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await classroomApi.post('/questions/images', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            // Return the full URL for the image
            const imageUrl = res.data.data?.url;
            // Prepend the API base URL if needed
            if (imageUrl && !imageUrl.startsWith('http')) {
                // Get the classroom service base URL - classroom runs on port 8011
                const baseUrl = process.env.NEXT_PUBLIC_CLASSROOM_API_URL || 'http://localhost:8011';
                return `${baseUrl}${imageUrl}`;
            }
            return imageUrl;
        } catch (e) {
            return handleClassroomApiError(e);
        }
    }
};

// Quiz Attempt Service
export const quizAttemptService = {
    // Start attempt
    async start(quizId: string): Promise<StartAttemptResponse> {
        try {
            const res = await classroomApi.post(`/quiz-attempts/quiz/${quizId}/start`);
            return res.data.data;
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Save progress
    async saveProgress(attemptId: string, answers: QuizAnswer[]): Promise<{ saved: boolean; timeRemaining: number }> {
        try {
            const res = await classroomApi.post(`/quiz-attempts/${attemptId}/save`, { answers });
            return res.data.data;
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Submit attempt
    async submit(attemptId: string, answers: QuizAnswer[], isAutoSubmit = false): Promise<SubmitResult> {
        try {
            const res = await classroomApi.post(`/quiz-attempts/${attemptId}/submit`, { answers, isAutoSubmit });
            return res.data.data;
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Get status
    async getStatus(attemptId: string): Promise<{ status: string; timeRemaining: number; hasExpired: boolean; answers: QuizAnswer[] }> {
        try {
            const res = await classroomApi.get(`/quiz-attempts/${attemptId}/status`);
            return res.data.data;
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Get results
    async getResults(attemptId: string): Promise<{ attempt: QuizAttempt; quiz: Quiz; questions?: Question[]; resultsHidden?: boolean; message?: string }> {
        try {
            const res = await classroomApi.get(`/quiz-attempts/${attemptId}/results`);
            return res.data.data;
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Get my attempts for a quiz
    async getMyAttempts(quizId: string): Promise<QuizAttempt[]> {
        try {
            const res = await classroomApi.get(`/quiz-attempts/quiz/${quizId}/my-attempts`);
            return res.data.data || [];
        } catch (e) {
            return handleClassroomApiError(e);
        }
    },

    // Grade answer (teacher)
    async gradeAnswer(attemptId: string, questionId: string, pointsAwarded: number, feedback?: string): Promise<QuizAttempt> {
        try {
            const res = await classroomApi.post(`/quiz-attempts/${attemptId}/grade/${questionId}`, { pointsAwarded, feedback });
            return res.data.data;
        } catch (e) {
            return handleClassroomApiError(e);
        }
    }
};

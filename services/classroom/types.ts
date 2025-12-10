// Workspace Types
export interface WorkspaceSettings {
    allowLateSubmission: boolean;
    lateGraceMinutes: number;
    maxAttachmentSizeMB: number;
}

export interface Workspace {
    id: string;
    courseId: string;
    departmentId: string;
    batchId: string;
    teacherIds: string[];
    studentIds: string[];
    title: string;
    settings: WorkspaceSettings;
    createdAt: string;
    updatedAt: string;
    status: 'active' | 'archived'; // Update Workspace interface strictly

    // Enriched fields
    courseName?: string;
    courseCode?: string;
    batchName?: string;
    semester?: number;
    studentCount?: number; // Enrolled in workspace (joined)
    totalBatchStudents?: number; // Total students in the batch (potential)
}

export interface PendingWorkspace {
    courseId: string;
    batchId: string;
    courseName: string;
    courseCode: string;
    batchName: string;
    programId: string;
    semester: number;
}

export interface CreateWorkspaceDto {
    courseId: string;
    departmentId?: string;
    batchId: string;
    title?: string;
    teacherIds?: string[];
}

export interface UpdateWorkspaceDto {
    title?: string;
    settings?: Partial<WorkspaceSettings>;
    teacherIds?: string[];
}

// Topic Types
export interface Topic {
    id: string;
    workspaceId: string;
    title: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTopicDto {
    workspaceId: string;
    title: string;
    order?: number;
}

export interface UpdateTopicDto {
    title?: string;
    order?: number;
}

// Material Types
export type MaterialType = 'file' | 'link' | 'text';
export type MaterialVisibility = 'all' | 'teachers';

export interface Attachment {
    name: string;
    url: string;
    type: string;
    size?: number;
}

export interface Material {
    id: string;
    workspaceId: string;
    topicId?: string;
    topic?: Topic;
    title: string;
    type: MaterialType;
    content?: string;
    attachments: Attachment[];
    publishedAt?: string;
    visibility: MaterialVisibility;
    createdById: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMaterialDto {
    workspaceId: string;
    topicId?: string;
    title: string;
    type: MaterialType;
    content?: string;
    attachments?: Attachment[];
}

export interface UpdateMaterialDto {
    topicId?: string;
    title?: string;
    type?: MaterialType;
    content?: string;
    attachments?: Attachment[];
    visibility?: MaterialVisibility;
}

// Assignment Types
export type AssignmentStatus = 'draft' | 'published' | 'closed';

export interface Assignment {
    id: string;
    workspaceId: string;
    topicId?: string;
    topic?: Topic;
    title: string;
    description?: string;
    attachments: Attachment[];
    dueAt?: string;
    allowLate: boolean;
    maxScore: number;
    rubricId?: string;
    rubric?: Rubric;
    status: AssignmentStatus;
    publishedAt?: string;
    createdById: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAssignmentDto {
    workspaceId: string;
    topicId?: string;
    title: string;
    description?: string;
    attachments?: Attachment[];
    dueAt?: string;
    allowLate?: boolean;
    maxScore?: number;
    rubricId?: string;
}

export interface UpdateAssignmentDto {
    topicId?: string;
    title?: string;
    description?: string;
    attachments?: Attachment[];
    dueAt?: string;
    allowLate?: boolean;
    maxScore?: number;
    rubricId?: string;
    status?: AssignmentStatus;
}

// Submission Types
export type SubmissionStatus = 'none' | 'draft' | 'submitted' | 'resubmitted' | 'graded';

export interface SubmissionFile {
    name: string;
    url: string;
    type: string;
    size?: number;
    uploadedAt?: string;
}

export interface RubricScore {
    criterionId: string;
    score: number;
    comment?: string;
}

export interface Submission {
    id: string;
    assignmentId: string;
    assignment?: Assignment;
    workspaceId: string;
    studentId: string;
    submittedAt?: string;
    files: SubmissionFile[];
    textAnswer?: string;
    status: SubmissionStatus;
    grade?: number;
    rubricScores: RubricScore[];
    feedbackCount: number;
    late: boolean;
    gradedAt?: string;
    gradedById?: string;
    createdAt: string;
    updatedAt: string;
}

export interface SubmitAssignmentDto {
    files?: SubmissionFile[];
    textAnswer?: string;
}

export interface GradeSubmissionDto {
    grade: number;
    rubricScores?: RubricScore[];
}

// Feedback Types
export type FeedbackType = 'comment' | 'inline' | 'score_change';

export interface Feedback {
    id: string;
    submissionId: string;
    authorId: string;
    message: string;
    type: FeedbackType;
    createdAt: string;
}

export interface CreateFeedbackDto {
    message: string;
    type?: FeedbackType;
}

// Rubric Types
export interface RubricCriterion {
    id: string;
    name: string;
    description?: string;
    maxPoints: number;
    levels?: {
        points: number;
        description: string;
    }[];
}

export interface Rubric {
    id: string;
    workspaceId: string;
    name: string;
    criteria: RubricCriterion[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateRubricDto {
    workspaceId: string;
    name: string;
    criteria: Omit<RubricCriterion, 'id'>[];
}

export interface UpdateRubricDto {
    name?: string;
    criteria?: RubricCriterion[];
}

// Stream Types
export type StreamItemType = 'assignment' | 'material' | 'announcement' | 'grade_event' | 'feedback';

export interface StreamItem {
    id: string;
    workspaceId: string;
    type: StreamItemType;
    refId?: string;
    actorId?: string;
    createdAt: string;
    // Populated fields
    assignment?: Assignment;
    material?: Material;
    // UI helper fields
    title?: string;
    actorName?: string;
    action?: string;
    entityTitle?: string;
}

// User Role Types for Access Control
export type ClassroomUserRole =
    | 'super_admin'
    | 'admin'
    | 'program_controller'
    | 'teacher'
    | 'student';

// Permission Matrix
export const CLASSROOM_PERMISSIONS = {
    workspace: {
        create: ['super_admin', 'admin', 'program_controller', 'teacher'],
        read: ['super_admin', 'admin', 'program_controller', 'teacher', 'student'],
        update: ['super_admin', 'admin', 'program_controller', 'teacher'],
        delete: ['super_admin', 'admin'],
        syncRoster: ['super_admin', 'admin', 'program_controller', 'teacher'],
    },
    topic: {
        create: ['super_admin', 'admin', 'program_controller', 'teacher'],
        read: ['super_admin', 'admin', 'program_controller', 'teacher', 'student'],
        update: ['super_admin', 'admin', 'program_controller', 'teacher'],
        delete: ['super_admin', 'admin', 'program_controller', 'teacher'],
    },
    material: {
        create: ['super_admin', 'admin', 'program_controller', 'teacher'],
        read: ['super_admin', 'admin', 'program_controller', 'teacher', 'student'],
        update: ['super_admin', 'admin', 'program_controller', 'teacher'],
        delete: ['super_admin', 'admin', 'program_controller', 'teacher'],
    },
    assignment: {
        create: ['super_admin', 'admin', 'program_controller', 'teacher'],
        read: ['super_admin', 'admin', 'program_controller', 'teacher', 'student'],
        update: ['super_admin', 'admin', 'program_controller', 'teacher'],
        delete: ['super_admin', 'admin', 'program_controller', 'teacher'],
        publish: ['super_admin', 'admin', 'program_controller', 'teacher'],
        close: ['super_admin', 'admin', 'program_controller', 'teacher'],
    },
    submission: {
        submit: ['super_admin', 'admin', 'program_controller', 'teacher', 'student'],
        listByAssignment: ['super_admin', 'admin', 'program_controller', 'teacher'],
        read: ['super_admin', 'admin', 'program_controller', 'teacher', 'student'],
        grade: ['super_admin', 'admin', 'program_controller', 'teacher'],
        feedback: ['super_admin', 'admin', 'program_controller', 'teacher', 'student'],
    },
    rubric: {
        create: ['super_admin', 'admin', 'program_controller', 'teacher'],
        read: ['super_admin', 'admin', 'program_controller', 'teacher'],
        update: ['super_admin', 'admin', 'program_controller', 'teacher'],
        delete: ['super_admin', 'admin', 'program_controller', 'teacher'],
    },
    stream: {
        read: ['super_admin', 'admin', 'program_controller', 'teacher', 'student'],
    },
} as const;

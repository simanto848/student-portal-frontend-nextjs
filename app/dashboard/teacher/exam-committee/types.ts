
export interface TeacherOption {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    departmentId: string;
}

export interface ExamCommitteeMember {
    id: string;
    departmentId: string;
    teacherId: string | {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    shift: "day" | "evening";
    batchId?: string | {
        id: string;
        batchName: string;
    };
    status: boolean;
    createdAt: string;
    updatedAt: string;
}

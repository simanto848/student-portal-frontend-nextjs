export interface Faculty {
    id: string;
    name: string;
    email: string;
    phone?: string;
    deanId?: string;
    dean?: {
        fullName: string;
        email: string;
        registrationNumber?: string;
    };
    establishedAt?: string;
    status: boolean;
    departmentsCount?: number;
}

export interface Department {
    id: string;
    name: string;
    shortName: string;
    email: string;
    phone?: string;
    facultyId: string | { id: string; name: string; email: string };
    faculty?: Faculty;
    departmentHeadId?: string;
    departmentHead?: {
        fullName: string;
        email: string;
        registrationNumber?: string;
    };
    isActingHead?: boolean;
    status: boolean;
    programsCount?: number;
}

export interface Program {
    id: string;
    name: string;
    shortName: string;
    description?: string;
    departmentId: string | { id: string; name: string; shortName: string; email?: string; facultyId?: string };
    department?: Department;
    duration: number;
    totalCredits: number;
    status: boolean;
    batchesCount?: number;
}

export interface Session {
    id: string;
    name: string;
    year: number;
    startDate: string;
    endDate: string;
    status: boolean;
}

export interface Batch {
    id: string;
    name: string;
    year: number;
    programId: string | { id: string; name: string; shortName: string };
    program?: Program;
    departmentId: string | { id: string; name: string };
    department?: Department;
    sessionId: string | { id: string; name: string };
    session?: Session;
    counselorId?: string;
    counselor?: {
        fullName: string;
        email: string;
    };
    classRepresentativeId?: string;
    classRepresentative?: {
        fullName: string;
        registrationNumber: string;
    };
    currentSemester: number;
    startDate?: string;
    endDate?: string;
    maxStudents: number;
    currentStudents: number;
    status: boolean;
}

export interface Course {
    id: string;
    name: string;
    code: string;
    credit: number;
    courseType: 'theory' | 'lab' | 'project';
    duration?: number;
    isElective: boolean;
    description?: string;
    departmentId: string | { id: string; name: string };
    department?: Department;
    status: boolean;
}

export interface SessionCourse {
    id: string;
    sessionId: string | Session;
    session?: Session;
    courseId: string | Course;
    course?: Course;
    semester: number;
    departmentId: string | Department;
    department?: Department;
}

export interface Classroom {
    id: string;
    roomNumber: string;
    buildingName: string;
    floor?: number;
    capacity: number;
    roomType: 'Lecture Hall' | 'Laboratory' | 'Seminar Room' | 'Computer Lab' | 'Conference Room' | 'Virtual' | 'Other';
    facilities: string[];
    isActive: boolean;
    isUnderMaintenance: boolean;
    maintenanceNotes?: string;
    departmentId?: string | Department;
    department?: Department;
}

export interface ExamCommittee {
    id: string;
    departmentId: string | Department;
    department?: Department;
    teacherId: string;
    teacher?: {
        fullName: string;
        email: string;
        registrationNumber?: string;
    };
    status: boolean;
    batchId?: string;
    batch?: Batch;
}


export interface CourseSchedule {
    id: string;
    batchId: string | Batch;
    sessionCourseId: string | SessionCourse;
    teacherId?: string | {
        _id: string;
        fullName: string;
        email: string;
        registrationNumber?: string;
    };
    teacher?: {
        fullName: string;
        email: string;
        registrationNumber?: string;
    };
    daysOfWeek: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[];
    startTime: string;
    endTime: string;
    classroomId?: string | Classroom;
    classroom?: Classroom;
    building?: string;
    isRecurring: boolean;
    startDate: string;
    endDate?: string;
    classType: 'Lecture' | 'Tutorial' | 'Lab' | 'Seminar' | 'Workshop' | 'Other';
    isActive: boolean;
    updatedAt?: string;
}

export interface CoursePrerequisite {
    id: string;
    courseId: string | Course;
    course?: Course;
    prerequisiteId: string | Course;
    prerequisite?: Course;
}

export interface Textbook {
    title: string;
    author: string;
    edition?: string;
    isbn?: string;
    required?: boolean;
}

export interface WeeklyScheduleItem {
    week: number;
    topic: string;
    readings?: string;
    assignments?: string;
}

export interface Resource {
    title: string;
    type?: string;
    description?: string;
    url?: string;
}

export interface CourseSyllabus {
    id: string;
    sessionCourseId: string | SessionCourse;
    sessionCourse?: SessionCourse;
    version: string;
    overview?: string;
    objectives?: string;
    prerequisites?: string;
    textbooks?: Textbook[];
    gradingPolicy?: string;
    assessmentBreakdown?: Record<string, number>;
    weeklySchedule?: WeeklyScheduleItem[];
    additionalResources?: Resource[];
    policies?: string;
    status: 'Draft' | 'Pending Approval' | 'Approved' | 'Published' | 'Archived';
    createdById?: string;
    approvedById?: string;
    publishedById?: string;
    approvedAt?: string;
    publishedAt?: string;
}

export interface ScheduleProposal {
    id: string;
    sessionId: string;
    generatedBy: string;
    status: 'pending' | 'approved' | 'rejected';
    scheduleData: any[]; // JSON array
    metadata?: any;
    createdAt: string;
}

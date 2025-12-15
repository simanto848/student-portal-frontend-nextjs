// Academic queries (faculties, departments, programs, courses, etc.)
export * from "./useAcademicQueries";

// Enrollment queries (grades, attendance, enrollments)
export * from "./useEnrollmentQueries";

// Library queries (borrowing, books, libraries)
export * from "./useLibraryQueries";

// Notification queries
export * from "./useNotificationQueries";

// Classroom queries (workspaces)
export * from "./useClassroomQueries";

// Teacher queries (instructor courses, grading workflow)
export * from "./useTeacherQueries";

// Re-export query keys for external use
export { academicKeys } from "./useAcademicQueries";
export { enrollmentKeys } from "./useEnrollmentQueries";
export { libraryKeys } from "./useLibraryQueries";
export { notificationKeys } from "./useNotificationQueries";
export { classroomKeys } from "./useClassroomQueries";
export { teacherKeys } from "./useTeacherQueries";

// Centralized exports for all custom hooks

// ================================== CRUD Operations Hook ==========================================
export { useCrudOperations } from "./useCrudOperations";
export type { CrudServiceInterface } from "./useCrudOperations";

// ===================================== Search Hook =======================================
export { useSearch, createNestedSearchFn } from "./useSearch";
export type { UseSearchOptions, UseSearchReturn } from "./useSearch";

// ====================================  React Query Hooks - Academic ========================================
export * from "./queries/useAcademicQueries";

// ====================================== React Query Hooks - Enrollment (grades, attendance, enrollments) ======================================
export * from "./queries/useEnrollmentQueries";

// ================================== React Query Hooks - Library (borrowing, books) ==========================================
export * from "./queries/useLibraryQueries";

// ======================================= React Query Hooks - Notifications =====================================
export * from "./queries/useNotificationQueries";

// ====================================== Re-export query keys for external use ======================================
export { academicKeys } from "./queries/useAcademicQueries";
export { enrollmentKeys } from "./queries/useEnrollmentQueries";
export { libraryKeys } from "./queries/useLibraryQueries";
export { notificationKeys } from "./queries/useNotificationQueries";

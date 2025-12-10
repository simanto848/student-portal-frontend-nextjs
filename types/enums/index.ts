/**
 * Common Enums
 * Centralized enum definitions
 */

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  STAFF = 'staff',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  MODERATOR = 'moderator',
}

export enum EnrollmentStatus {
  NOT_ENROLLED = 'not_enrolled',
  ENROLLED = 'enrolled',
  GRADUATED = 'graduated',
  DROPPED_OUT = 'dropped_out',
  SUSPENDED = 'suspended',
  ON_LEAVE = 'on_leave',
  TRANSFERRED_OUT = 'transferred_out',
  TRANSFERRED_IN = 'transferred_in',
}

export enum TeacherDesignation {
  PROFESSOR = 'professor',
  ASSOCIATE_PROFESSOR = 'associate_professor',
  ASSISTANT_PROFESSOR = 'assistant_professor',
  LECTURER = 'lecturer',
  SENIOR_LECTURER = 'senior_lecturer',
}

export enum CourseType {
  THEORY = 'theory',
  LAB = 'lab',
  PROJECT = 'project',
  THESIS = 'thesis',
}

export enum CourseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

export enum EnrollmentCourseStatus {
  ACTIVE = 'active',
  ENROLLED = 'enrolled',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  FAILED = 'failed',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export enum GradeStatus {
  PENDING = 'pending',
  GRADED = 'graded',
  PUBLISHED = 'published',
}

export enum StaffRole {
  PROGRAM_CONTROLLER = 'program_controller',
  ADMISSION = 'admission',
  EXAM = 'exam',
  FINANCE = 'finance',
  LIBRARY = 'library',
  TRANSPORT = 'transport',
  HR = 'hr',
  IT = 'it',
  HOSTEL = 'hostel',
  HOSTEL_WARDEN = 'hostel_warden',
  HOSTEL_SUPERVISOR = 'hostel_supervisor',
  MAINTENANCE = 'maintenance',
}

export enum BorrowingStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  LOST = 'lost',
}

export enum ReservationStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  FULFILLED = 'fulfilled',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

/**
 * Application Constants
 * Centralized constants used throughout the application
 */

export const APP_NAME = 'Student Portal';
export const APP_VERSION = '1.0.0';

export const ITEMS_PER_PAGE = 10;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';
export const TIME_FORMAT = 'HH:mm';

export const DEBOUNCE_DELAY = 500;
export const REQUEST_TIMEOUT = 30000;

export const TOAST_DURATION = 5000;
export const TOAST_POSITION = 'top-right';

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

export const SEMESTER_OPTIONS = [
  { value: 1, label: 'Semester 1' },
  { value: 2, label: 'Semester 2' },
  { value: 3, label: 'Semester 3' },
  { value: 4, label: 'Semester 4' },
  { value: 5, label: 'Semester 5' },
  { value: 6, label: 'Semester 6' },
  { value: 7, label: 'Semester 7' },
  { value: 8, label: 'Semester 8' },
];

export const GRADE_POINTS = {
  'A+': 4.0,
  'A': 3.75,
  'A-': 3.5,
  'B+': 3.25,
  'B': 3.0,
  'B-': 2.75,
  'C+': 2.5,
  'C': 2.25,
  'D': 2.0,
  'F': 0.0,
};

export const COURSE_TYPE_OPTIONS = [
  { value: 'theory', label: 'Theory' },
  { value: 'lab', label: 'Lab' },
  { value: 'project', label: 'Project' },
  { value: 'thesis', label: 'Thesis' },
];

export const TEACHER_DESIGNATION_OPTIONS = [
  { value: 'professor', label: 'Professor' },
  { value: 'associate_professor', label: 'Associate Professor' },
  { value: 'assistant_professor', label: 'Assistant Professor' },
  { value: 'lecturer', label: 'Lecturer' },
  { value: 'senior_lecturer', label: 'Senior Lecturer' },
];

export const ENROLLMENT_STATUS_OPTIONS = [
  { value: 'not_enrolled', label: 'Not Enrolled' },
  { value: 'enrolled', label: 'Enrolled' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'dropped_out', label: 'Dropped Out' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'transferred_out', label: 'Transferred Out' },
  { value: 'transferred_in', label: 'Transferred In' },
];

import { z } from "zod";

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
const emailSchema = z.string().email("Please enter a valid email address");
const phoneSchema = z
  .string()
  .regex(phoneRegex, "Please enter a valid phone number")
  .optional()
  .or(z.literal(""));

const booleanStringSchema = z
  .enum(["true", "false"])
  .transform((val) => val === "true");

const optionalBooleanStringSchema = z
  .enum(["true", "false"])
  .optional()
  .transform((val) => val === "true");

// Faculty Schema
export const facultySchema = z.object({
  name: z
    .string()
    .min(3, "Faculty name must be at least 3 characters")
    .max(100, "Faculty name must be less than 100 characters")
    .transform((val) => val.trim()),
  email: emailSchema.transform((val) => val.toLowerCase().trim()),
  phone: phoneSchema,
  status: booleanStringSchema,
});

export const assignDeanSchema = z.object({
  deanId: z.string().min(1, "Please select a dean"),
});

export type FacultyFormData = z.input<typeof facultySchema>;
export type FacultySubmitData = z.output<typeof facultySchema>;
export type AssignDeanFormData = z.infer<typeof assignDeanSchema>;

// Department Schema
export const departmentSchema = z.object({
  name: z
    .string()
    .min(3, "Department name must be at least 3 characters")
    .max(100, "Department name must be less than 100 characters")
    .transform((val) => val.trim()),
  shortName: z
    .string()
    .min(2, "Short name must be at least 2 characters")
    .max(10, "Short name must be less than 10 characters")
    .transform((val) => val.trim().toUpperCase()),
  email: emailSchema.transform((val) => val.toLowerCase().trim()),
  phone: phoneSchema,
  facultyId: z.string().min(1, "Please select a faculty"),
  departmentHeadId: z.string().optional().or(z.literal("")),
  isActingHead: optionalBooleanStringSchema,
  status: booleanStringSchema,
});

export type DepartmentFormData = z.input<typeof departmentSchema>;
export type DepartmentSubmitData = z.output<typeof departmentSchema>;

// Program Schema
export const programSchema = z.object({
  name: z
    .string()
    .min(3, "Program name must be at least 3 characters")
    .max(150, "Program name must be less than 150 characters")
    .transform((val) => val.trim()),
  shortName: z
    .string()
    .min(2, "Short name must be at least 2 characters")
    .max(15, "Short name must be less than 15 characters")
    .transform((val) => val.trim().toUpperCase()),
  description: z.string().optional().or(z.literal("")),
  departmentId: z.string().min(1, "Please select a department"),
  duration: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1 year")
    .max(10, "Duration cannot exceed 10 years"),
  totalCredits: z
    .number()
    .int("Credits must be a whole number")
    .min(1, "Credits must be at least 1")
    .max(300, "Credits cannot exceed 300"),
  status: booleanStringSchema,
});

export type ProgramFormData = z.input<typeof programSchema>;
export type ProgramSubmitData = z.output<typeof programSchema>;

// Session Schema
export const sessionSchema = z
  .object({
    name: z
      .string()
      .min(3, "Session name must be at least 3 characters")
      .max(50, "Session name must be less than 50 characters")
      .transform((val) => val.trim()),
    year: z
      .number()
      .int("Year must be a whole number")
      .min(2000, "Year must be 2000 or later")
      .max(2100, "Year cannot exceed 2100"),
    startDate: z.string().min(1, "Please select a start date"),
    endDate: z.string().min(1, "Please select an end date"),
    status: booleanStringSchema,
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type SessionFormData = z.input<typeof sessionSchema>;
export type SessionSubmitData = z.output<typeof sessionSchema>;

// Batch Schema
export const batchSchema = z.object({
  name: z
    .string()
    .min(2, "Batch name must be at least 2 characters")
    .max(50, "Batch name must be less than 50 characters")
    .transform((val) => val.trim()),
  code: z.string().optional().or(z.literal("")),
  shift: z.enum(["day", "evening"]).optional(),
  year: z
    .number()
    .int("Year must be a whole number")
    .min(2000, "Year must be 2000 or later")
    .max(2100, "Year cannot exceed 2100"),
  programId: z.string().min(1, "Please select a program"),
  departmentId: z.string().min(1, "Please select a department"),
  sessionId: z.string().min(1, "Please select a session"),
  counselorId: z.string().optional().or(z.literal("")),
  classRepresentativeId: z.string().optional().or(z.literal("")),
  currentSemester: z
    .number()
    .int("Semester must be a whole number")
    .min(1, "Semester must be at least 1")
    .max(12, "Semester cannot exceed 12"),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
  maxStudents: z
    .number()
    .int("Must be a whole number")
    .min(1, "Must have at least 1 student")
    .max(500, "Cannot exceed 500 students"),
  status: booleanStringSchema,
});

export type BatchFormData = z.input<typeof batchSchema>;
export type BatchSubmitData = z.output<typeof batchSchema>;

// Course Schema
export const courseSchema = z.object({
  name: z
    .string()
    .min(3, "Course name must be at least 3 characters")
    .max(150, "Course name must be less than 150 characters")
    .transform((val) => val.trim()),
  code: z
    .string()
    .min(2, "Course code must be at least 2 characters")
    .max(20, "Course code must be less than 20 characters")
    .transform((val) => val.trim().toUpperCase()),
  credit: z
    .number()
    .min(0.5, "Credit must be at least 0.5")
    .max(12, "Credit cannot exceed 12"),
  courseType: z.enum(["theory", "lab", "project"], {
    message: "Please select a course type",
  }),
  duration: z.number().optional(),
  isElective: booleanStringSchema,
  description: z.string().optional().or(z.literal("")),
  departmentId: z.string().min(1, "Please select a department"),
  status: booleanStringSchema,
});

export type CourseFormData = z.input<typeof courseSchema>;
export type CourseSubmitData = z.output<typeof courseSchema>;

// Session Course Schema
export const sessionCourseSchema = z.object({
  sessionId: z.string().min(1, "Please select a session"),
  courseId: z.string().min(1, "Please select a course"),
  semester: z
    .number()
    .int("Semester must be a whole number")
    .min(1, "Semester must be at least 1")
    .max(12, "Semester cannot exceed 12"),
  departmentId: z.string().min(1, "Please select a department"),
});

export type SessionCourseFormData = z.input<typeof sessionCourseSchema>;
export type SessionCourseSubmitData = z.output<typeof sessionCourseSchema>;

// Classroom Schema
export const classroomSchema = z.object({
  roomNumber: z
    .string()
    .min(1, "Room number is required")
    .max(20, "Room number must be less than 20 characters")
    .transform((val) => val.trim()),
  buildingName: z
    .string()
    .min(1, "Building name is required")
    .max(100, "Building name must be less than 100 characters")
    .transform((val) => val.trim()),
  floor: z.number().int().optional(),
  capacity: z
    .number()
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1")
    .max(1000, "Capacity cannot exceed 1000"),
  roomType: z.enum(
    [
      "Lecture Hall",
      "Laboratory",
      "Seminar Room",
      "Computer Lab",
      "Conference Room",
      "Virtual",
      "Other",
    ],
    {
      message: "Please select a room type",
    },
  ),
  facilities: z.array(z.string()).optional().default([]),
  isActive: booleanStringSchema,
  isUnderMaintenance: optionalBooleanStringSchema,
  maintenanceNotes: z.string().optional().or(z.literal("")),
  departmentId: z.string().optional().or(z.literal("")),
});

export type ClassroomFormData = z.input<typeof classroomSchema>;
export type ClassroomSubmitData = z.output<typeof classroomSchema>;

// Course Schedule Schema
export const courseScheduleSchema = z
  .object({
    batchId: z.string().min(1, "Please select a batch"),
    sessionCourseId: z.string().min(1, "Please select a session course"),
    teacherId: z.string().optional().or(z.literal("")),
    daysOfWeek: z
      .array(
        z.enum([
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ]),
      )
      .min(1, "Please select at least one day"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    classroomId: z.string().optional().or(z.literal("")),
    building: z.string().optional().or(z.literal("")),
    isRecurring: booleanStringSchema,
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional().or(z.literal("")),
    classType: z.enum(
      ["Lecture", "Tutorial", "Lab", "Seminar", "Workshop", "Other"],
      {
        message: "Please select a class type",
      },
    ),
    isActive: booleanStringSchema,
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export type CourseScheduleFormData = z.input<typeof courseScheduleSchema>;
export type CourseScheduleSubmitData = z.output<typeof courseScheduleSchema>;

// Exam Committee Schema
export const examCommitteeSchema = z.object({
  departmentId: z.string().min(1, "Please select a department"),
  teacherId: z.string().min(1, "Please select a teacher"),
  shift: z.enum(["day", "evening"], {
    message: "Please select a shift",
  }),
  batchId: z.string().optional().or(z.literal("")),
  status: booleanStringSchema,
});

export type ExamCommitteeFormData = z.input<typeof examCommitteeSchema>;
export type ExamCommitteeSubmitData = z.output<typeof examCommitteeSchema>;

// Course Prerequisite Schema
export const coursePrerequisiteSchema = z
  .object({
    courseId: z.string().min(1, "Please select a course"),
    prerequisiteId: z.string().min(1, "Please select a prerequisite course"),
  })
  .refine((data) => data.courseId !== data.prerequisiteId, {
    message: "A course cannot be its own prerequisite",
    path: ["prerequisiteId"],
  });

export type CoursePrerequisiteFormData = z.infer<
  typeof coursePrerequisiteSchema
>;

// Syllabus Schema
const textbookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  edition: z.string().optional(),
  isbn: z.string().optional(),
  required: z.boolean().optional().default(false),
});

const weeklyScheduleItemSchema = z.object({
  week: z.number().int().min(1),
  topic: z.string().min(1, "Topic is required"),
  readings: z.string().optional(),
  assignments: z.string().optional(),
});

const resourceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.string().optional(),
  description: z.string().optional(),
  url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export const syllabusSchema = z.object({
  sessionCourseId: z.string().min(1, "Please select a session course"),
  version: z.string().min(1, "Version is required").default("1.0"),
  overview: z.string().optional().or(z.literal("")),
  objectives: z.string().optional().or(z.literal("")),
  prerequisites: z.string().optional().or(z.literal("")),
  textbooks: z.array(textbookSchema).optional().default([]),
  gradingPolicy: z.string().optional().or(z.literal("")),
  assessmentBreakdown: z.record(z.string(), z.number()).optional().default({}),
  weeklySchedule: z.array(weeklyScheduleItemSchema).optional().default([]),
  additionalResources: z.array(resourceSchema).optional().default([]),
  policies: z.string().optional().or(z.literal("")),
  status: z
    .enum(["Draft", "Pending Approval", "Approved", "Published", "Archived"])
    .default("Draft"),
});

export type SyllabusFormData = z.input<typeof syllabusSchema>;
export type SyllabusSubmitData = z.output<typeof syllabusSchema>;

// Assessment Schema
export const assessmentSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters")
    .transform((val) => val.trim()),
  description: z.string().optional().or(z.literal("")),
  courseId: z.string().min(1, "Please select a course"),
  batchId: z.string().min(1, "Please select a batch"),
  typeId: z.string().min(1, "Please select an assessment type"),
  totalMarks: z
    .number()
    .min(1, "Total marks must be at least 1")
    .max(1000, "Total marks cannot exceed 1000"),
  passingMarks: z
    .number()
    .min(0, "Passing marks must be at least 0")
    .max(1000, "Passing marks cannot exceed 1000"),
  weightPercentage: z
    .number()
    .min(0, "Weight percentage must be at least 0")
    .max(100, "Weight percentage cannot exceed 100"),
  dueDate: z.string().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "closed", "graded"], {
    message: "Please select a status",
  }),
})
.refine((data) => data.passingMarks <= data.totalMarks, {
  message: "Passing marks cannot exceed total marks",
  path: ["passingMarks"],
});

export type AssessmentFormData = z.input<typeof assessmentSchema>;
export type AssessmentSubmitData = z.output<typeof assessmentSchema>;

// Assessment Type Schema
export const assessmentTypeSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters")
    .transform((val) => val.trim()),
  code: z
    .string()
    .min(2, "Code must be at least 2 characters")
    .max(20, "Code must be less than 20 characters")
    .transform((val) => val.trim().toUpperCase()),
  weightPercentage: z
    .number()
    .min(0, "Weight percentage must be at least 0")
    .max(100, "Weight percentage cannot exceed 100"),
  description: z.string().optional().or(z.literal("")),
  isActive: booleanStringSchema,
});

export type AssessmentTypeFormData = z.input<typeof assessmentTypeSchema>;
export type AssessmentTypeSubmitData = z.output<typeof assessmentTypeSchema>;

export function validateForm<T extends z.ZodSchema>(
  schema: T,
  data: unknown,
):
  | { success: true; data: z.infer<T> }
  | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  if (result.error && "issues" in result.error) {
    for (const issue of result.error.issues) {
      const path = String(issue.path?.join(".") || "");
      if (!errors[path]) {
        errors[path] = issue.message;
      }
    }
  }

  return { success: false, errors };
}

export function getFirstError(result: {
  success: boolean;
  error?: { issues?: Array<{ message: string }> };
}): string | null {
  if (result.success) return null;
  
  if (
    result.error &&
    "issues" in result.error &&
    result.error.issues &&
    result.error.issues.length > 0
  ) {
    return result.error.issues[0]?.message || "Validation failed";
  }

  return "Validation failed";
}

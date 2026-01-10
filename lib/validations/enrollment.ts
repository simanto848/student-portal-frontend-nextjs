import { z } from "zod";

const booleanStringSchema = z
    .enum(["true", "false"])
    .transform((val) => val === "true");

// Instructor Assignment Schema
export const instructorAssignmentSchema = z.object({
    instructorId: z.string().min(1, "Please select an instructor"),
    batchId: z.string().min(1, "Please select a batch"),
    courseId: z.string().min(1, "Please select a course"),
    semester: z.number().int().min(1).max(12),
    status: z.enum(["active", "completed", "reassigned"]).default("active"),
    assignedDate: z.string().optional(),
});

export type InstructorAssignmentFormData = z.input<typeof instructorAssignmentSchema>;
export type InstructorAssignmentSubmitData = z.output<typeof instructorAssignmentSchema>;

// Bulk Assignment Schema
export const bulkInstructorAssignmentSchema = z.array(z.object({
    instructorId: z.string().min(1, "Instructor is required"),
    batchId: z.string().min(1, "Batch is required"),
    courseId: z.string().min(1, "Course is required"),
    sessionId: z.string().min(1, "Session is required"),
    semester: z.number().int().min(1),
}));

export type BulkInstructorAssignmentData = z.infer<typeof bulkInstructorAssignmentSchema>;

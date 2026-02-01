import { enrollmentService } from "@/services/enrollment/enrollment.service";
import { studentService } from "@/services/user/student.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { EnrollmentDetailClient } from "../fragments/EnrollmentDetailClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";

export const metadata: Metadata = {
  title: "Lifecycle Detail | Guardian Intelligence",
  description: "Detailed analysis of student induction and presence lifecycle.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EnrollmentDetailsPage({ params }: PageProps) {
  await requireUser('/login', [UserRole.ADMIN, UserRole.SUPER_ADMIN]);

  const { id } = await params;

  let enrollment, student, course, batch;
  try {
    enrollment = await enrollmentService.getEnrollment(id);
    if (!enrollment) {
      return notFound();
    }
    [student, course, batch] = await Promise.all([
      studentService.getById(enrollment.studentId).catch(() => null),
      courseService.getCourseById(enrollment.courseId).catch(() => null),
      batchService.getBatchById(enrollment.batchId).catch(() => null),
    ]);
  } catch {
    return notFound();
  }

  return (
    <EnrollmentDetailClient
      enrollment={enrollment}
      student={student}
      course={course}
      batch={batch}
    />
  );
}

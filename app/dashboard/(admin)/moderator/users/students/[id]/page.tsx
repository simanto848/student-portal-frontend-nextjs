import { studentService } from "@/services/user/student.service";
import { studentProfileService } from "@/services/user/studentProfile.service";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { sessionService } from "@/services/academic/session.service";
import { StudentDetailClient } from "../fragments/StudentDetailClient";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";

export const metadata = {
  title: "Student Details",
  description: "View detailed information about a student within the academic system.",
};

interface StudentDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailsPage({ params }: StudentDetailsPageProps) {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);

  const { id } = await params;

  let student, profile, departments, programs, batches, sessions;
  try {
    [student, profile, departments, programs, batches, sessions] = await Promise.all([
      studentService.getById(id),
      studentProfileService.get(id).catch(() => null),
      departmentService.getAllDepartments(),
      programService.getAllPrograms(),
      batchService.getAllBatches(),
      sessionService.getAllSessions(),
    ]);
    if (!student) {
      return notFound();
    }
  } catch {
    return notFound();
  }

  return (
    <StudentDetailClient
      student={student}
      profile={profile}
      departments={Array.isArray(departments) ? departments : []}
      programs={Array.isArray(programs) ? programs : []}
      batches={Array.isArray(batches) ? batches : []}
      sessions={Array.isArray(sessions) ? sessions : []}
    />
  );
}

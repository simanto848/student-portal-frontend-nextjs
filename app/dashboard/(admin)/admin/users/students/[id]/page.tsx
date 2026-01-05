import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { studentService } from "@/services/user/student.service";
import { studentProfileService } from "@/services/user/studentProfile.service";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { sessionService } from "@/services/academic/session.service";
import { StudentDetailClient } from "../fragments/StudentDetailClient";
import { notFound } from "next/navigation";

interface StudentDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentDetailsPage({ params }: StudentDetailsPageProps) {
  const { id } = await params;

  try {
    const [student, profile, departments, programs, batches, sessions] = await Promise.all([
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

    return (
      <DashboardLayout>
        <StudentDetailClient
          student={student}
          profile={profile}
          departments={Array.isArray(departments) ? departments : []}
          programs={Array.isArray(programs) ? programs : []}
          batches={Array.isArray(batches) ? batches : []}
          sessions={Array.isArray(sessions) ? sessions : []}
        />
      </DashboardLayout>
    );
  } catch (error) {
    return notFound();
  }
}

import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { sessionService } from "@/services/academic/session.service";
import { StudentFormClient } from "../fragments/StudentFormClient";
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";

export const metadata = {
  title: "Student Creation",
  description: "Enroll a new student into the academic system.",
};

export default async function CreateStudentPage() {
  await requireUser("/login", [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]);

  const [departments, programs, batches, sessions] = await Promise.all([
    departmentService.getAllDepartments(),
    programService.getAllPrograms(),
    batchService.getAllBatches(),
    sessionService.getAllSessions(),
  ]);

  return (
    <StudentFormClient
      departments={Array.isArray(departments) ? departments : []}
      programs={Array.isArray(programs) ? programs : []}
      batches={Array.isArray(batches) ? batches : []}
      sessions={Array.isArray(sessions) ? sessions : []}
    />
  );
}

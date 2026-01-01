import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { sessionService } from "@/services/academic/session.service";
import { StudentFormClient } from "../fragments/StudentFormClient";

export default async function CreateStudentPage() {
  const [departments, programs, batches, sessions] = await Promise.all([
    departmentService.getAllDepartments(),
    programService.getAllPrograms(),
    batchService.getAllBatches(),
    sessionService.getAllSessions(),
  ]);

  return (
    <DashboardLayout>
      <StudentFormClient
        departments={Array.isArray(departments) ? departments : []}
        programs={Array.isArray(programs) ? programs : []}
        batches={Array.isArray(batches) ? batches : []}
        sessions={Array.isArray(sessions) ? sessions : []}
      />
    </DashboardLayout>
  );
}

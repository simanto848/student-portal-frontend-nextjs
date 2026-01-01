import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { studentService } from "@/services/user/student.service";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { sessionService } from "@/services/academic/session.service";
import { StudentManagementClient } from "./fragments/StudentManagementClient";

export default async function StudentsPage() {
  const [studentsData, deletedStudents, departments, programs, batches, sessions] = await Promise.all([
    studentService.getAll({ limit: 50 }),
    studentService.getDeleted().catch(() => []),
    departmentService.getAllDepartments().catch(() => []),
    programService.getAllPrograms().catch(() => []),
    batchService.getAllBatches().catch(() => []),
    sessionService.getAllSessions().catch(() => []),
  ]);

  return (
    <DashboardLayout>
      <StudentManagementClient
        initialStudents={studentsData.students}
        deletedStudents={deletedStudents}
        departments={Array.isArray(departments) ? departments : []}
        programs={Array.isArray(programs) ? programs : []}
        batches={Array.isArray(batches) ? batches : []}
        sessions={Array.isArray(sessions) ? sessions : []}
      />
    </DashboardLayout>
  );
}

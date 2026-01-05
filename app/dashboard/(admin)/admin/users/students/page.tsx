import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { studentService } from "@/services/user/student.service";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { sessionService } from "@/services/academic/session.service";
import { StudentManagementClient } from "./fragments/StudentManagementClient";

export default async function StudentsPage() {
  const [studentsResult, deletedStudents, departments, programs, batches, sessions] = await Promise.all([
    studentService.getAll({ limit: 50 }).catch((error) => {
      console.error("Failed to fetch students:", error);
      return { students: [], pagination: undefined };
    }),
    studentService.getDeleted().catch((error) => {
      console.error("Failed to fetch deleted students:", error);
      return [];
    }),
    departmentService.getAllDepartments().catch((error) => {
      console.error("Failed to fetch departments:", error);
      return [];
    }),
    programService.getAllPrograms().catch((error) => {
      console.error("Failed to fetch programs:", error);
      return [];
    }),
    batchService.getAllBatches().catch((error) => {
      console.error("Failed to fetch batches:", error);
      return [];
    }),
    sessionService.getAllSessions().catch((error) => {
      console.error("Failed to fetch sessions:", error);
      return [];
    }),
  ]);

  return (
    <DashboardLayout>
      <StudentManagementClient
        initialStudents={studentsResult.students || []}
        deletedStudents={deletedStudents}
        departments={Array.isArray(departments) ? departments : []}
        programs={Array.isArray(programs) ? programs : []}
        batches={Array.isArray(batches) ? batches : []}
        sessions={Array.isArray(sessions) ? sessions : []}
      />
    </DashboardLayout>
  );
}

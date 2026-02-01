import { ExamCommitteeCreateClient } from "../fragments/ExamCommitteeCreateClient";
import { Metadata } from "next";
import { academicService } from "@/services/academic.service";
import { teacherService } from "@/services/teacher.service";

export const metadata: Metadata = {
  title: "Assign Committee Member | Admin Dashboard",
  description: "Add a new teacher to the exam committee",
};

export default async function CreateExamCommitteePage() {
  const [departments, batches, teachers] = await Promise.all([
    academicService.getAllDepartments(),
    academicService.getAllBatches(),
    teacherService.getAllTeachers(),
  ]);

  return (
      <ExamCommitteeCreateClient
        departments={Array.isArray(departments) ? departments : []}
        batches={Array.isArray(batches) ? batches : []}
        teachers={Array.isArray(teachers) ? teachers : []}
      />
  );
}

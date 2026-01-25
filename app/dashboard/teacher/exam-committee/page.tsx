import { requireUser } from "@/lib/auth/userAuth";
import { getExamCommitteeData } from "./actions";
import ExamCommitteeClient from "./fragments/ExamCommitteeClient";
import { redirect } from "next/navigation";

export default async function ExamCommitteePage() {
  const user = await requireUser();

  const isDeptHead = user.role === 'department_head' || (user.role === 'teacher' && (user as any).isDepartmentHead);
  if (!isDeptHead) {
    redirect("/dashboard/teacher/unauthorized");
  }

  const { members, teachers, batches, departmentId } = await getExamCommitteeData();

  if (!departmentId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">No Department Associated</h1>
        <p className="text-slate-500">Your account is not linked to any department as Head.</p>
      </div>
    );
  }

  return (
    <ExamCommitteeClient
      initialMembers={members}
      teachers={teachers || []}
      batches={batches || []}
      departmentId={departmentId}
    />
  );
}

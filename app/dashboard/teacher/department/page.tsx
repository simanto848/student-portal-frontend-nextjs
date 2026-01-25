import { requireUser } from "@/lib/auth/userAuth";
import {
  getDepartmentData
} from "./actions";
import DepartmentClient from "./fragments/DepartmentClient";

export default async function DepartmentPage() {
  const user = await requireUser();

  const departmentId = (user as any).departmentId;

  if (!departmentId) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-slate-600">No department association found for your account.</p>
      </div>
    );
  }

  const { success, data, error } = await getDepartmentData(departmentId);

  if (!success || !data) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-red-600">Failed to load data</h1>
        <p className="text-slate-600">{error || "Unknown error"}</p>
      </div>
    );
  }

  return (
    <DepartmentClient
      workflows={data.workflows}
      batches={data.batches}
      students={data.students}
    />
  );
}

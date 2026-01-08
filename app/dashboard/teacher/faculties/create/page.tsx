
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import { redirect } from "next/navigation";
import { TeacherFacultyForm } from "../fragments/TeacherFacultyForm";

export const metadata = {
    title: "Add Faculty | Academic Matrix",
    description: "Onboard new faculty members",
};

export default async function CreateTeacherPage() {
    const user = await requireUser();

    // Authorization Check
    const isDeptHead = (user.role === UserRole.TEACHER && (user as any).isDepartmentHead) || user.role === UserRole.DEPARTMENT_HEAD;
    const isDean = user.role === UserRole.DEAN || (user as any).isDean;

    if (!isDeptHead && !isDean) {
        redirect("/dashboard/teacher");
    }

    return (
        <TeacherFacultyForm
            scope={isDeptHead ? 'department' : 'faculty'}
            fixedDepartmentId={isDeptHead ? (user as any).departmentId : undefined}
        />
    );
}

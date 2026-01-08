
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import { redirect } from "next/navigation";
import { teacherService } from "@/services/user/teacher.service";
import { TeacherFacultyList } from "./fragments/TeacherFacultyList";

export const metadata = {
    title: "Faculty Management | Academic Matrix",
    description: "Manage the educators and scholars",
};

export default async function FacultyPage() {
    const user = await requireUser();

    const isDeptHead = (user.role === UserRole.TEACHER && (user as any).isDepartmentHead) || user.role === UserRole.DEPARTMENT_HEAD;
    const isDean = user.role === UserRole.DEAN || (user as any).isDean;

    if (!isDeptHead && !isDean) {
        redirect("/dashboard/teacher");
    }

    const filters: any = { limit: 100 };
    if (isDeptHead && (user as any).departmentId) {
        filters.departmentId = (user as any).departmentId;
    } else if (isDean && (user as any).facultyId) {
        filters.facultyId = (user as any).facultyId;
    }

    const [listRes, deletedTeachers] = await Promise.all([
        teacherService.getAll(filters).catch(() => ({ teachers: [], pagination: null })),
        teacherService.getDeleted().catch(() => [])
    ]);

    const filteredDeleted = (Array.isArray(deletedTeachers) ? deletedTeachers : []).filter((t: any) => {
        if (isDeptHead) return t.departmentId === (user as any).departmentId;
        if (isDean) return t.department?.facultyId === (user as any).facultyId;
        return false;
    });

    return (
        <TeacherFacultyList
            initialTeachers={listRes.teachers}
            deletedTeachers={filteredDeleted}
            pagination={listRes.pagination}
            scope={isDeptHead ? 'department' : 'faculty'}
        />
    );
}

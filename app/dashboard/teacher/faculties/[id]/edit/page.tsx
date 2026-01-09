
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import { notFound, redirect } from "next/navigation";
import { teacherService } from "@/services/user/teacher.service";
import { teacherProfileService } from "@/services/user/teacherProfile.service";
import { TeacherFacultyForm } from "../../fragments/TeacherFacultyForm";
import { departmentService } from "@/services/academic/department.service";

export const metadata = {
    title: "Edit Faculty | Academic Matrix",
    description: "Update faculty member details",
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditTeacherPage({ params }: PageProps) {
    const { id } = await params;
    const user = await requireUser();

    const isDeptHead = (user.role === UserRole.TEACHER && (user as any).isDepartmentHead) || user.role === UserRole.DEPARTMENT_HEAD;
    const isDean = user.role === UserRole.DEAN || (user as any).isDean;

    if (!isDeptHead && !isDean) {
        redirect("/dashboard/teacher");
    }

    try {
        const [teacher, departments] = await Promise.all([
            teacherService.getById(id),
            departmentService.getAllDepartments().catch(() => [])
        ]);

        if (!teacher) {
            return notFound();
        }

        // Access Control
        if (isDeptHead && teacher.departmentId !== (user as any).departmentId) {
            return notFound();
        }
        if (isDean) {
            const dept = (Array.isArray(departments) ? departments : []).find((d: any) => d.id === teacher.departmentId);
            if (dept && dept.facultyId !== (user as any).facultyId) {
                return notFound();
            }
        }

        let profile = null;
        try {
            profile = await teacherProfileService.get(id);
        } catch (error) {
            // Profile might not exist
        }

        return (
            <TeacherFacultyForm
                teacher={teacher}
                profile={profile}
                scope={isDeptHead ? 'department' : 'faculty'}
                fixedDepartmentId={isDeptHead ? (user as any).departmentId : undefined}
            />
        );
    } catch (error) {
        return notFound();
    }
}

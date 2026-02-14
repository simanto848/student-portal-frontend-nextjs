
import { requireUser } from "@/lib/auth/userAuth";
import { UserRole } from "@/types/user";
import { notFound, redirect } from "next/navigation";
import { teacherService } from "@/services/user/teacher.service";
import { teacherProfileService } from "@/services/user/teacherProfile.service";
import { departmentService } from "@/services/academic/department.service";
import { TeacherFacultyDetail } from "../fragments/TeacherFacultyDetail";

export const metadata = {
    title: "Faculty Member Details | Academic Matrix",
    description: "Detailed profile of faculty member",
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TeacherDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const user = await requireUser();

    const isDeptHead = (user.role === UserRole.TEACHER && (user as any).isDepartmentHead) || user.role === UserRole.DEPARTMENT_HEAD;
    const isDean = user.role === UserRole.DEAN || (user as any).isDean;

    if (!isDeptHead && !isDean) {
        redirect("/dashboard/teacher");
    }

    try {
        const [teacher, departmentsRes] = await Promise.all([
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
            const dept = (Array.isArray(departmentsRes) ? departmentsRes : []).find((d: any) => d.id === teacher.departmentId);
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
            <TeacherFacultyDetail
                teacher={teacher}
                profile={profile}
                departments={Array.isArray(departmentsRes) ? departmentsRes : []}
            />
        );
    } catch (error) {
        return notFound();
    }
}

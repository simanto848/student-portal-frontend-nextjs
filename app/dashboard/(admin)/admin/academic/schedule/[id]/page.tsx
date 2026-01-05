import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ScheduleDetailClient } from "../fragments/ScheduleDetailClient";
import { Metadata } from "next";
import { academicService } from "@/services/academic.service";
import { teacherService } from "@/services/teacher.service";
import { notFound } from "next/navigation";

interface ScheduleDetailsPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ScheduleDetailsPageProps): Promise<Metadata> {
    const { id } = await params;
    try {
        const schedule = await academicService.getScheduleById(id);
        const sessionCourse = typeof schedule.sessionCourseId === 'object' ? (schedule.sessionCourseId as any) : null;
        const courseName = sessionCourse?.course?.name || (schedule as any).course?.name || "Schedule";

        return {
            title: `${courseName} Details | Admin Dashboard`,
            description: `View details for schedule ${schedule.id}`,
        };
    } catch {
        return {
            title: "Schedule Details | Admin Dashboard",
        };
    }
}

export default async function ScheduleDetailsPage({ params }: ScheduleDetailsPageProps) {
    const { id } = await params;
    try {
        const schedule = await academicService.getScheduleById(id);
        let teacher = null;

        if (schedule.teacherId) {
            if (typeof schedule.teacherId === 'string') {
                try {
                    teacher = await teacherService.getTeacherById(schedule.teacherId);
                } catch (err) {
                    console.error("Failed to load teacher details", err);
                }
            } else if (typeof schedule.teacherId === 'object') {
                teacher = schedule.teacherId as any;
            }
        }

        return (
            <DashboardLayout>
                <ScheduleDetailClient schedule={schedule} teacher={teacher} />
            </DashboardLayout>
        );
    } catch (error) {
        notFound();
    }
}

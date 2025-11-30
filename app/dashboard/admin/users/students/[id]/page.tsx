"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { studentService, Student } from "@/services/user/student.service";
import { studentProfileService, StudentProfile } from "@/services/user/studentProfile.service";
import { toast } from "sonner";
import {
    ArrowLeft,
    Users,
    Mail,
    Phone,
    Calendar,
    MapPin,
    BookOpen,
    GraduationCap,
    Trash2,
    Edit,
    User,
    School,
    Clock
} from "lucide-react";

export default function StudentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const s = await studentService.getById(id);
            setStudent(s);

            // Try to fetch profile, but don't fail if not found
            try {
                const p = await studentProfileService.get(id);
                setProfile(p);
            } catch (e) {
                console.log("Profile not found or error fetching profile", e);
            }
        } catch (error) {
            toast.error("Failed to load student details");
            router.push("/dashboard/admin/users/students");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this student?")) return;
        setIsDeleting(true);
        try {
            await studentService.delete(id);
            toast.success("Student deleted");
            router.push("/dashboard/admin/users/students");
        } catch (error) {
            toast.error("Failed to delete student");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]" />
                </div>
            </DashboardLayout>
        );
    }

    if (!student) return null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-[#dad7cd] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-[#344e41]" />
                    </button>
                    <PageHeader
                        title={student.fullName}
                        subtitle={student.registrationNumber}
                        icon={Users}
                        actionLabel="Edit"
                        onAction={() => router.push(`/dashboard/admin/users/students/${id}/edit`)}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="ml-auto border-red-500 text-red-600"
                    >
                        {isDeleting ? "Deleting..." : <><Trash2 className="h-4 w-4 mr-1" /> Delete</>}
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Info */}
                    <Card className="md:col-span-2 border-[#a3b18a]/30">
                        <CardContent className="p-6 space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <InfoRow icon={Mail} label="Email" value={student.email} />
                                <InfoRow icon={School} label="Department" value={student.department?.name || student.departmentId} />
                                <InfoRow icon={BookOpen} label="Program" value={student.program?.name || student.programId} />
                                <InfoRow icon={Users} label="Batch" value={student.batch?.name || student.batchId} />
                                <InfoRow icon={Clock} label="Session" value={student.session?.name || student.sessionId} />
                                <InfoRow icon={Calendar} label="Admission Date" value={new Date(student.admissionDate).toLocaleDateString()} />
                                <InfoRow
                                    icon={GraduationCap}
                                    label="Status"
                                    value={student.enrollmentStatus}
                                    valueClass="capitalize"
                                />
                            </div>

                            {/* Profile Details */}
                            {profile && (
                                <div className="bg-[#dad7cd]/20 rounded-lg p-5 space-y-4 border border-[#a3b18a]/20">
                                    <h3 className="font-semibold text-[#344e41] flex items-center gap-2">
                                        <User className="h-4 w-4" /> Personal Details
                                    </h3>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <InfoRow icon={Phone} label="Mobile" value={profile.studentMobile || "N/A"} />
                                        <InfoRow icon={User} label="Gender" value={profile.gender || "N/A"} />
                                        <InfoRow icon={Calendar} label="DOB" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "N/A"} />
                                        <InfoRow icon={User} label="Blood Group" value={profile.bloodGroup || "N/A"} />
                                        <InfoRow icon={User} label="Father" value={profile.father?.name || "N/A"} />
                                        <InfoRow icon={User} label="Mother" value={profile.mother?.name || "N/A"} />
                                        <InfoRow icon={MapPin} label="Address" value={profile.permanentAddress?.city || "N/A"} />
                                    </div>
                                </div>
                            )}

                            {!profile && (
                                <div className="text-center py-8 text-[#344e41]/60 bg-[#dad7cd]/10 rounded-lg border border-dashed border-[#a3b18a]/30">
                                    No extended profile information available.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Sidebar / Quick Actions or Stats */}
                    <Card className="border-[#a3b18a]/30">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="font-semibold text-[#344e41]">Quick Actions</h3>
                            <Button className="w-full justify-start" variant="outline" onClick={() => router.push(`/dashboard/admin/users/students/${id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Student
                            </Button>
                            {/* Add more actions like "Print ID Card", "View Transcript" etc in future */}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

function InfoRow({
    icon: Icon,
    label,
    value,
    valueClass = ""
}: {
    icon: any;
    label: string;
    value: string;
    valueClass?: string;
}) {
    return (
        <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-[#344e41]/50 flex items-center gap-1">
                <Icon className="h-3 w-3" /> {label}
            </p>
            <p className={`text-sm font-medium text-[#344e41] ${valueClass}`}>{value}</p>
        </div>
    );
}

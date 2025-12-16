"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Briefcase,
    Shield,
    Pencil,
    Building2,
    GraduationCap
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { teacherService, Teacher } from "@/services/user/teacher.service";
import { EditTeacherProfileDialog } from "@/components/teacher/profile/EditTeacherProfileDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TeacherProfilePage() {
    const { user } = useAuth();
    const [teacherData, setTeacherData] = useState<Teacher | null>(null);
    const [profileData, setProfileData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const fetchProfile = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const teacherId = user.id || user._id;
            if (teacherId) {
                const teacher = await teacherService.getById(teacherId);
                setTeacherData(teacher);
                setProfileData((teacher as any)?.profile || null);
            }
        } catch (err: any) {
            console.error("Failed to fetch profile", err);
            setError("Failed to load profile data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <Skeleton className="h-[200px] w-full rounded-3xl" />
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </DashboardLayout>
        );
    }

    if (error || !teacherData) {
        return (
            <DashboardLayout>
                <Alert variant="destructive">
                    <AlertDescription>{error || "Profile not found"}</AlertDescription>
                </Alert>
            </DashboardLayout>
        );
    }

    const joiningDate = teacherData.joiningDate ? new Date(teacherData.joiningDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'N/A';

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Profile Header Card */}
                <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#1a3d32] to-[#2d5246] p-8 md:p-10 text-white shadow-xl">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl opacity-50" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-full border-4 border-white/20 bg-white/10 overflow-hidden shadow-2xl">
                                {profileData?.profilePicture ? (
                                    <img
                                        src={`http://localhost:5000/${profileData.profilePicture}`}
                                        alt={teacherData.fullName}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-white/50">
                                        <User className="h-16 w-16" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2">
                            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                                <h1 className="text-3xl font-bold tracking-tight">{teacherData.fullName}</h1>
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 w-fit mx-auto md:mx-0 capitalize">
                                    {teacherData.designation?.replace(/_/g, " ") || 'Teacher'}
                                </Badge>
                            </div>

                            <p className="text-emerald-100 flex items-center justify-center md:justify-start gap-2">
                                <Building2 className="h-4 w-4" />
                                {teacherData.department?.name || 'Department Not Assigned'}
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2 text-sm text-emerald-100/80">
                                <span className="flex items-center gap-1.5">
                                    <Mail className="h-4 w-4" />
                                    {teacherData.email}
                                </span>
                                {teacherData.phone && (
                                    <span className="flex items-center gap-1.5">
                                        <Phone className="h-4 w-4" />
                                        {teacherData.phone}
                                    </span>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={() => setIsEditDialogOpen(true)}
                            className="bg-white text-[#1a3d32] hover:bg-emerald-50 shadow-lg border-0"
                        >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit Profile
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* About / Bio */}
                    <Card className="md:col-span-2 border-none shadow-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                                <User className="h-5 w-5 text-emerald-600" /> Professional Bio
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {profileData?.bio ? (
                                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {profileData.bio}
                                </p>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                                    <p>No bio added yet.</p>
                                    <Button variant="link" onClick={() => setIsEditDialogOpen(true)}>Add a professional summary</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Use Details Side Panel */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-[#1a3d32]">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Registration ID</p>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Shield className="h-4 w-4 text-emerald-600" />
                                        {teacherData.registrationNumber}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Joined</p>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <Calendar className="h-4 w-4 text-emerald-600" />
                                        {joiningDate}
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Address</p>
                                    <div className="flex items-start gap-2 text-sm font-medium">
                                        <MapPin className="h-4 w-4 text-emerald-600 mt-0.5" />
                                        <span className="break-words">{profileData?.address || "Not provided"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-50 to-white">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                        <GraduationCap className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-indigo-900">Academic Role</p>
                                        <p className="text-xs text-indigo-700/80">Faculty Member</p>
                                    </div>
                                </div>
                                <p className="text-sm text-indigo-800/70 mt-3">
                                    As a {teacherData.designation?.replace(/_/g, " ") || 'Teacher'}, you have access to course management, grading workflows, and student assessment tools.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <EditTeacherProfileDialog
                    teacher={teacherData}
                    profile={profileData}
                    open={isEditDialogOpen}
                    setOpen={setIsEditDialogOpen}
                    onProfileUpdated={fetchProfile}
                />
            </div>
        </DashboardLayout>
    );
}

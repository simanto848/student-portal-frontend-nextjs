"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { studentService, StudentUpdatePayload } from "@/services/user/student.service";
import { studentProfileService, StudentProfilePayload } from "@/services/user/studentProfile.service";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { sessionService } from "@/services/academic/session.service";
import { toast } from "sonner";
import { Users, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

export default function EditStudentPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data for dropdowns
    const [departments, setDepartments] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any[]>([]);
    const [batches, setBatches] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);

    // Form Data
    const [formData, setFormData] = useState<StudentUpdatePayload>({});
    const [profileData, setProfileData] = useState<StudentProfilePayload>({});
    const [hasProfile, setHasProfile] = useState(false);

    useEffect(() => {
        if (id) {
            fetchInitialData();
        }
    }, [id]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [student, profile, depts, progs, batchesData, sessionsData] = await Promise.all([
                studentService.getById(id),
                studentProfileService.get(id).catch(() => null),
                departmentService.getAllDepartments(),
                programService.getAllPrograms(),
                batchService.getAllBatches(),
                sessionService.getAllSessions(),
            ]);

            setDepartments(Array.isArray(depts) ? depts : []);
            setPrograms(Array.isArray(progs) ? progs : []);
            setBatches(Array.isArray(batchesData) ? batchesData : []);
            setSessions(Array.isArray(sessionsData) ? sessionsData : []);

            setFormData({
                fullName: student.fullName,
                departmentId: student.departmentId,
                programId: student.programId,
                batchId: student.batchId,
                sessionId: student.sessionId,
                enrollmentStatus: student.enrollmentStatus,
                admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : "",
            });

            if (profile) {
                setHasProfile(true);
                setProfileData({
                    studentMobile: profile.studentMobile,
                    gender: profile.gender as any,
                    dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
                    bloodGroup: profile.bloodGroup as any,
                    father: profile.father,
                    mother: profile.mother,
                    permanentAddress: profile.permanentAddress,
                });
            }

        } catch (error) {
            toast.error("Failed to load student data");
            router.push("/dashboard/admin/users/students");
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleProfileChange = (key: string, value: any) => {
        setProfileData(prev => ({ ...prev, [key]: value }));
    };

    const handleNestedProfileChange = (parent: string, key: string, value: any) => {
        setProfileData(prev => ({
            ...prev,
            [parent]: { ...(prev as any)[parent], [key]: value }
        }));
    }

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Update Student
            await studentService.update(id, formData);

            // Update Profile
            if (hasProfile) {
                await studentProfileService.update(id, profileData);
            } else {
                // Create profile if it didn't exist but we have data? 
                // For now assume update only updates existing or creates if we want. 
                // Let's use upsert logic if available or just create.
                // The service has create and update.
                await studentProfileService.create(id, profileData);
            }

            toast.success("Student updated successfully");
            router.push(`/dashboard/admin/users/students/${id}`);
        } catch (error) {
            const err = error as Error;
            toast.error(err?.message || "Failed to update student");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#588157]" />
                </div>
            </DashboardLayout>
        );
    }

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
                        title="Edit Student"
                        subtitle="Update student information"
                        icon={Users}
                    />
                </div>

                <Card className="border-[#a3b18a]/30">
                    <CardContent className="p-6 space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#344e41]">Full Name</label>
                                <Input value={formData.fullName} onChange={e => handleChange("fullName", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#344e41]">Department</label>
                                <Select value={formData.departmentId} onValueChange={v => handleChange("departmentId", v)}>
                                    <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                                    <SelectContent>
                                        {departments.map(d => <SelectItem key={d.id || d._id} value={d.id || d._id}>{d.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#344e41]">Program</label>
                                <Select value={formData.programId} onValueChange={v => handleChange("programId", v)}>
                                    <SelectTrigger><SelectValue placeholder="Select Program" /></SelectTrigger>
                                    <SelectContent>
                                        {programs.map(p => <SelectItem key={p.id || p._id} value={p.id || p._id}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#344e41]">Batch</label>
                                <Select value={formData.batchId} onValueChange={v => handleChange("batchId", v)}>
                                    <SelectTrigger><SelectValue placeholder="Select Batch" /></SelectTrigger>
                                    <SelectContent>
                                        {batches.map(b => <SelectItem key={b.id || b._id} value={b.id || b._id}>{b.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#344e41]">Session</label>
                                <Select value={formData.sessionId} onValueChange={v => handleChange("sessionId", v)}>
                                    <SelectTrigger><SelectValue placeholder="Select Session" /></SelectTrigger>
                                    <SelectContent>
                                        {sessions.map(s => <SelectItem key={s.id || s._id} value={s.id || s._id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#344e41]">Status</label>
                                <Select value={formData.enrollmentStatus} onValueChange={v => handleChange("enrollmentStatus", v)}>
                                    <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                                    <SelectContent>
                                        {['not_enrolled', 'enrolled', 'graduated', 'dropped_out', 'suspended', 'on_leave', 'transferred_out', 'transferred_in'].map(s => (
                                            <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="border-t border-[#a3b18a]/20 pt-6">
                            <h3 className="text-lg font-semibold text-[#344e41] mb-4">Profile Information</h3>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#344e41]">Mobile</label>
                                    <Input value={profileData.studentMobile || ""} onChange={e => handleProfileChange("studentMobile", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#344e41]">Gender</label>
                                    <Select value={profileData.gender || ""} onValueChange={v => handleProfileChange("gender", v)}>
                                        <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Male">Male</SelectItem>
                                            <SelectItem value="Female">Female</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#344e41]">Father's Name</label>
                                    <Input value={profileData.father?.name || ""} onChange={e => handleNestedProfileChange("father", "name", e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#344e41]">Mother's Name</label>
                                    <Input value={profileData.mother?.name || ""} onChange={e => handleNestedProfileChange("mother", "name", e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[#588157] text-white">
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                                Save Changes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

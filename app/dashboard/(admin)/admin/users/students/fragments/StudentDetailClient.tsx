"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Student } from "@/services/user/student.service";
import { StudentProfile } from "@/services/user/studentProfile.service";
import {
    ArrowLeft,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Trash2,
    User as UserIcon,
    Edit3,
    Sparkles,
    Briefcase,
    Building2,
    GraduationCap,
    School,
    BookOpen,
    Clock,
    Heart,
    Flag,
    CreditCard,
    Home,
    Contact,
    Layers,
    Hash
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { notifySuccess, notifyError } from "@/components/toast";
import { deleteStudentAction } from "../actions";

interface StudentDetailClientProps {
    student: Student;
    profile: StudentProfile | null;
    departments: any[];
    programs: any[];
    batches: any[];
    sessions: any[];
}

import { FaceEnrollmentStep } from "./FaceEnrollmentStep";

export function StudentDetailClient({
    student,
    profile,
    departments,
    programs,
    batches,
    sessions
}: StudentDetailClientProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [enrollmentOpen, setEnrollmentOpen] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to suspend ${student.fullName}?`)) return;
        setIsDeleting(true);
        try {
            const result = await deleteStudentAction(student.id, null, new FormData());
            if (result.success) {
                notifySuccess("Student suspended successfully");
                router.push("/dashboard/admin/users/students");
            } else {
                notifyError(result.message || "Suspension failed");
            }
        } catch (error) {
            notifyError("An error occurred during suspension");
        } finally {
            setIsDeleting(false);
        }
    };

    const getBatchLabel = (bId: string) => {
        const b = batches.find(x => (x.id || x._id) === bId);
        if (!b) return "N/A";
        const shift = String(b.shift || "").toLowerCase();
        const prefix = shift === "evening" ? "E" : "D";
        return `${prefix}-${b.name || b.code}`;
    };

    const getName = (list: any[], id: string) => {
        const item = list.find((i) => (i.id || i._id) === id);
        return item ? item.name : "N/A";
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-amber-600 hover:border-amber-500/30 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-amber-100 text-amber-700 border-none px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-sm">
                                <GraduationCap className="w-3 h-3" />
                                <span className="text-[10px] font-medium uppercase tracking-wider">Student Profile</span>
                            </Badge>
                            <span className="text-slate-500 font-medium text-xs flex items-center gap-1">
                                <Hash className="w-3 h-3" />
                                {student.registrationNumber}
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{student.fullName}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="h-10 px-4 rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition-colors"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Suspend Student
                    </Button>
                    <Button
                        onClick={() => router.push(`/dashboard/admin/users/students/${student.id}/edit`)}
                        className="h-10 px-6 rounded-lg bg-slate-900 hover:bg-amber-600 text-white shadow-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <Edit3 className="w-4 h-4" />
                        Edit Profile
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-slate-100 to-slate-50" />
                        <CardContent className="p-6 pt-12">
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                <div className="relative flex-shrink-0">
                                    <div className="h-32 w-32 rounded-xl overflow-hidden border-4 border-white shadow-md relative z-10 bg-slate-100">
                                        {student.profile?.profilePicture ? (
                                            <img
                                                src={getImageUrl(student.profile.profilePicture)}
                                                alt={student.fullName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-400 font-medium text-3xl">
                                                {student.fullName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6 pt-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <InfoBlock icon={Mail} label="Email Address" value={student.email} />
                                        <InfoBlock icon={Calendar} label="Admission Date" value={new Date(student.admissionDate).toLocaleDateString()} />
                                        <InfoBlock icon={Building2} label="Department" value={getName(departments, student.departmentId)} />
                                        <InfoBlock icon={Phone} label="Phone Number" value={profile?.studentMobile || "N/A"} />
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <Badge className="px-3 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs flex items-center gap-1.5 border-none">
                                            <Layers className="w-3 h-3 text-slate-400" />
                                            {getBatchLabel(student.batchId)}
                                        </Badge>
                                        <Badge className="px-3 py-1 rounded-md bg-slate-900 text-white font-medium text-xs flex items-center gap-1.5 border-none">
                                            <BookOpen className="w-3 h-3 text-amber-400" />
                                            {getName(programs, student.programId)}
                                        </Badge>
                                        <Badge className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium text-xs flex items-center gap-1.5 border border-emerald-200">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            {student.enrollmentStatus.replace(/_/g, " ")}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="academic" className="w-full">
                        <TabsList className="bg-slate-100 p-1 rounded-lg gap-1 mb-6 inline-flex w-full sm:w-auto overflow-x-auto">
                            <TabsTrigger value="academic" className="px-4 py-2 rounded-md font-medium text-xs data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm transition-all whitespace-nowrap">Academic Info</TabsTrigger>
                            <TabsTrigger value="personal" className="px-4 py-2 rounded-md font-medium text-xs data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm transition-all whitespace-nowrap">Personal Info</TabsTrigger>
                            <TabsTrigger value="locus" className="px-4 py-2 rounded-md font-medium text-xs data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm transition-all whitespace-nowrap">Addresses</TabsTrigger>
                            <TabsTrigger value="kin" className="px-4 py-2 rounded-md font-medium text-xs data-[state=active]:bg-white data-[state=active]:text-amber-600 data-[state=active]:shadow-sm transition-all whitespace-nowrap">Guardian Info</TabsTrigger>
                        </TabsList>

                        <TabsContent value="academic" className="mt-0">
                            <Card className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <SummaryItem label="Current Semester" value={`Semester ${student.currentSemester || 1}`} icon={Layers} />
                                    <SummaryItem label="Session" value={getName(sessions, student.sessionId)} icon={Clock} />
                                    <SummaryItem label="Enrollment Status" value={student.enrollmentStatus.replace(/_/g, " ")} icon={GraduationCap} highlighted />
                                    <SummaryItem label="University Email" value={student.email} icon={Mail} />
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="personal" className="mt-0">
                            <Card className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <SummaryItem label="Date of Birth" value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "N/A"} icon={Calendar} />
                                    <SummaryItem label="Gender" value={profile?.gender || "N/A"} icon={UserIcon} />
                                    <SummaryItem label="Blood Group" value={profile?.bloodGroup || "N/A"} icon={Heart} />
                                    <SummaryItem label="Nationality" value={profile?.nationality || "N/A"} icon={Flag} />
                                    <SummaryItem label="NID/Passport" value={profile?.nidOrPassportNo || "N/A"} icon={CreditCard} />
                                    <SummaryItem label="Religion" value={profile?.religion || "N/A"} icon={Sparkles} />
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="locus" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                                            <Home className="w-4 h-4" />
                                        </div>
                                        <p className="text-xs font-medium text-slate-700">Permanent Address</p>
                                    </div>
                                    {profile?.permanentAddress ? (
                                        <div className="space-y-3">
                                            <LocusItem label="Street" value={profile.permanentAddress.street || ""} />
                                            <LocusItem label="City" value={profile.permanentAddress.city || ""} />
                                            <LocusItem label="Country" value={profile.permanentAddress.country || ""} />
                                        </div>
                                    ) : <EmptyLocus />}
                                </Card>
                                <Card className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <p className="text-xs font-medium text-slate-700">Mailing Address</p>
                                    </div>
                                    {profile?.mailingAddress ? (
                                        <div className="space-y-3">
                                            <LocusItem label="Street" value={profile.mailingAddress.street || ""} />
                                            <LocusItem label="City" value={profile.mailingAddress.city || ""} />
                                            <LocusItem label="Country" value={profile.mailingAddress.country || ""} />
                                        </div>
                                    ) : <EmptyLocus />}
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="kin" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <KinBlock label="Father's Info" icon={UserIcon} name={profile?.father?.name} phone={profile?.father?.cell} />
                                    <KinBlock label="Mother's Info" icon={UserIcon} name={profile?.mother?.name} phone={profile?.mother?.cell} />
                                </div>
                                <div className="space-y-4">
                                    <KinBlock label="Primary Guardian" icon={ShieldAlert} name={profile?.guardian?.name} phone={profile?.guardian?.cell} extra={profile?.guardian?.occupation} />
                                    <KinBlock label="Emergency Contact" icon={Contact} name={profile?.emergencyContact?.name} phone={profile?.emergencyContact?.cell} extra={profile?.emergencyContact?.relation} highlighted />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="bg-slate-900 text-white border-none rounded-xl shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Clock className="w-24 h-24" />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <p className="text-xs font-medium text-slate-400 mb-6">System Info</p>
                            <div className="space-y-4">
                                <StatItem label="Registration Date" value={new Date(student.createdAt || "").toDateString()} />
                                <StatItem label="Infrastructure" value="Portal Core" />
                                <StatItem label="Validation" value="ACTIVE" highlighted />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <ActionButton label="View Transcripts" icon={Layers} />
                            <ActionButton label="Financial Info" icon={CreditCard} />
                            <ActionButton label="Attendance Log" icon={Clock} />
                            <ActionButton
                                label="Enroll Face ID"
                                icon={Sparkles}
                                onClick={() => setEnrollmentOpen(true)}
                                highlighted
                            />
                        </div>
                    </Card>
                </div>
            </div>

            {student.registrationNumber && (
                <FaceEnrollmentStep
                    isOpen={enrollmentOpen}
                    onClose={() => setEnrollmentOpen(false)}
                    studentName={student.fullName}
                    studentId={student.registrationNumber}
                    studentDepartment={getName(departments, student.departmentId)}
                    onComplete={() => {
                        setEnrollmentOpen(false);
                        notifySuccess("Face enrollment completed successfully");
                        router.refresh();
                    }}
                />
            )}
        </div>
    );
}

function InfoBlock({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-medium text-slate-500">{label}</p>
            </div>
            <p className="text-sm font-medium text-slate-900 truncate pl-6">{value}</p>
        </div>
    );
}

function SummaryItem({ label, value, icon: Icon, highlighted = false }: { label: string; value: string; icon: any; highlighted?: boolean }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${highlighted ? 'text-amber-500' : 'text-slate-400'}`} />
                <p className="text-xs font-medium text-slate-500">{label}</p>
            </div>
            <p className={`text-sm font-medium pl-6 ${highlighted ? 'text-amber-600' : 'text-slate-900'}`}>{value}</p>
        </div>
    );
}

function LocusItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-0.5">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="text-sm font-medium text-slate-900">{value || "N/A"}</p>
        </div>
    );
}

function EmptyLocus() {
    return <p className="text-sm text-slate-400 italic">Address not provided</p>;
}

function KinBlock({ label, icon: Icon, name, phone, extra, highlighted = false }: { label: string; icon: any; name?: string; phone?: string; extra?: string; highlighted?: boolean }) {
    return (
        <Card className={`p-4 rounded-xl border transition-colors ${highlighted ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${highlighted ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon className="w-4 h-4" />
                </div>
                <p className="text-xs font-medium text-slate-700">{label}</p>
            </div>
            <div className="space-y-1 pl-11">
                <p className={`text-sm font-medium ${highlighted ? 'text-amber-700' : 'text-slate-900'}`}>{name || "N/A"}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="w-3 h-3" />
                    {phone || "N/A"}
                </div>
                {extra && <p className="text-xs text-slate-500 mt-1">{extra}</p>}
            </div>
        </Card>
    );
}

function StatItem({ label, value, highlighted = false }: { label: string; value: string; highlighted?: boolean }) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-slate-400">{label}</p>
            <p className={`text-sm font-medium ${highlighted ? 'text-amber-400' : 'text-white'}`}>{value}</p>
        </div>
    );
}

function ActionButton({ label, icon: Icon, onClick, highlighted = false }: { label: string; icon: any; onClick?: () => void; highlighted?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`w-full h-10 rounded-lg border flex items-center justify-between px-4 transition-colors ${highlighted
                    ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
        >
            <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${highlighted ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className="text-sm font-medium">{label}</span>
            </div>
            <ArrowLeft className="w-4 h-4 rotate-180 opacity-50" />
        </button>
    );
}

import { ShieldAlert } from "lucide-react";

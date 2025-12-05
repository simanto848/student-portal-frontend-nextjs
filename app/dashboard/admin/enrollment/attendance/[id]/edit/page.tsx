"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { attendanceService, Attendance } from "@/services/enrollment/attendance.service";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function EditAttendancePage() {
    const router = useRouter();
    const params = useParams();
    const [attendance, setAttendance] = useState<Attendance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form Data
    const [status, setStatus] = useState("");
    const [remarks, setRemarks] = useState("");

    useEffect(() => {
        if (params.id) {
            fetchAttendance(params.id as string);
        }
    }, [params.id]);

    const fetchAttendance = async (id: string) => {
        try {
            const data = await attendanceService.getAttendance(id);
            setAttendance(data);
            setStatus(data.status);
            setRemarks(data.remarks || "");
        } catch (error) {
            toast.error("Failed to load attendance record");
            router.push("/dashboard/admin/enrollment/attendance");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!attendance) return;

        setIsSaving(true);
        try {
            await attendanceService.updateAttendance(attendance.id, {
                status: status as any,
                remarks
            });
            toast.success("Attendance updated successfully");
            router.push("/dashboard/admin/enrollment/attendance");
        } catch (error: any) {
            toast.error(error.message || "Failed to update attendance");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-[#344e41]" /></div>
            </DashboardLayout>
        );
    }

    if (!attendance) return null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-[#344e41]">Edit Attendance</h2>
                        <p className="text-muted-foreground">Update attendance status for a student.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Student Name</span>
                                <span>{attendance.student?.fullName || "Unknown"}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Student ID</span>
                                <span>{attendance.student?.studentId || "-"}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Course</span>
                                <span>{attendance.course?.name || "-"}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Batch</span>
                                <span>{attendance.batch?.name || "-"}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="font-medium text-muted-foreground">Date</span>
                                <span>{new Date(attendance.date).toLocaleDateString()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {['present', 'absent', 'late', 'excused'].map((s) => (
                                            <div
                                                key={s}
                                                className={`cursor-pointer px-4 py-2 rounded-md border transition-all ${status === s
                                                        ? s === 'present' ? 'bg-green-100 border-green-500 text-green-700'
                                                            : s === 'absent' ? 'bg-red-100 border-red-500 text-red-700'
                                                                : s === 'late' ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                                                                    : 'bg-blue-100 border-blue-500 text-blue-700'
                                                        : 'border-slate-200 hover:bg-slate-50'
                                                    }`}
                                                onClick={() => setStatus(s)}
                                            >
                                                <div className="text-sm font-medium capitalize">{s}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="remarks">Remarks</Label>
                                    <Textarea
                                        id="remarks"
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        placeholder="Optional remarks..."
                                        rows={4}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                                    <Button type="submit" className="bg-[#3e6253] hover:bg-[#2c463b]" disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        <Save className="mr-2 h-4 w-4" /> Update Record
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}

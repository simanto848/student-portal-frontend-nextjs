"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { enrollmentService, Enrollment } from "@/services/enrollment/enrollment.service";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditEnrollmentPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // Form State
    const [semester, setSemester] = useState<number | "">("");
    const [academicYear, setAcademicYear] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (id) {
            fetchEnrollment();
        }
    }, [id]);

    const fetchEnrollment = async () => {
        setIsFetching(true);
        try {
            const data = await enrollmentService.getEnrollment(id);
            setEnrollment(data);
            setSemester(data.semester);
            setAcademicYear(data.academicYear || "");
            setStatus(data.status || "");
        } catch (error) {
            toast.error("Failed to fetch enrollment details");
            router.push("/dashboard/admin/enrollment/enrollments");
        } finally {
            setIsFetching(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!semester || !academicYear || !status) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        try {
            await enrollmentService.updateEnrollment(id, {
                semester: Number(semester),
                academicYear,
                status: status as any
            });
            toast.success("Enrollment updated successfully");
            router.push(`/dashboard/admin/enrollment/enrollments/${id}`);
        } catch (error: any) {
            toast.error(error.message || "Failed to update enrollment");
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <DashboardLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
                </div>
            </DashboardLayout>
        );
    }

    if (!enrollment) return null;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Edit Enrollment</h1>
                        <p className="text-muted-foreground">Update enrollment details</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Enrollment Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Semester */}
                                <div className="space-y-2">
                                    <Label>Semester <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="number"
                                        value={semester}
                                        onChange={(e) => setSemester(Number(e.target.value))}
                                        placeholder="Semester"
                                        min={1}
                                    />
                                </div>

                                {/* Academic Year */}
                                <div className="space-y-2">
                                    <Label>Academic Year <span className="text-red-500">*</span></Label>
                                    <Input
                                        value={academicYear}
                                        onChange={(e) => setAcademicYear(e.target.value)}
                                        placeholder="e.g. 2024"
                                    />
                                </div>

                                {/* Status */}
                                <div className="space-y-2">
                                    <Label>Status <span className="text-red-500">*</span></Label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="enrolled">Enrolled</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                            <SelectItem value="dropped">Dropped</SelectItem>
                                            <SelectItem value="failed">Failed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => router.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-[#3e6253] hover:bg-[#2c463b]" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Enrollment
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

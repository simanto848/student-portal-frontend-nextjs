"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { batchCourseInstructorService, BatchCourseInstructor } from "@/services/enrollment/batchCourseInstructor.service";
import { batchService } from "@/services/academic/batch.service";
import { chatService } from "@/services/communication/chat.service";
import { Batch } from "@/services/academic/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MessageSquare, Users } from "lucide-react";
import { BatchCommunicationCard } from "@/components/dashboard/communication/BatchCommunicationCard";
import { CRManagementDialog } from "@/components/dashboard/communication/CRManagementDialog";

export default function CommunicationPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<BatchCourseInstructor[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);

    // UI State
    const [activeTab, setActiveTab] = useState("courses");
    const [loading, setLoading] = useState(true);
    const [enteringChat, setEnteringChat] = useState<string | null>(null);

    // Dialog State
    const [crDialogOpen, setCrDialogOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user?.id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [coursesData, batchesData] = await Promise.all([
                batchCourseInstructorService.getInstructorCourses(user!.id),
                batchService.getAllBatches({ counselorId: user!.id })
            ]);
            setCourses(coursesData);
            setBatches(batchesData);
        } catch (error) {
            console.error("Fetch data error:", error);
            toast.error("Failed to load communication groups");
        } finally {
            setLoading(false);
        }
    };

    const handleEnterCourseChat = async (course: BatchCourseInstructor) => {
        if (!course.sessionId) {
            console.error("Missing sessionId for course:", course);
            toast.error("Error: Course session ID is missing.");
            return;
        }

        setEnteringChat(course.id);
        try {
            console.log("Entering chat for course:", {
                batchId: course.batchId,
                courseId: course.courseId,
                sessionId: course.sessionId,
                instructorId: user!.id
            });

            const chatGroup = await chatService.getOrCreateCourseChatGroup({
                batchId: course.batchId,
                courseId: course.courseId,
                sessionId: course.sessionId,
                instructorId: user!.id
            });

            router.push(`/dashboard/teacher/communication/chat/${chatGroup.id}?type=CourseChatGroup`);
        } catch (error) {
            console.error("Enter chat error:", error);
            toast.error("Failed to enter chat. Check console for details.");
        } finally {
            setEnteringChat(null);
        }
    };

    const handleEnterBatchChat = async (batch: Batch) => {
        setEnteringChat(batch.id);
        try {
            const chatGroup = await chatService.getOrCreateBatchChatGroup({
                batchId: batch.id,
                counselorId: user!.id
            });
            router.push(`/dashboard/teacher/communication/chat/${chatGroup.id}?type=BatchChatGroup`);
        } catch (error) {
            console.error("Enter chat error:", error);
            toast.error("Failed to enter chat");
        } finally {
            setEnteringChat(null);
        }
    };

    const openManageCR = (batch: Batch) => {
        setSelectedBatch(batch);
        setCrDialogOpen(true);
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6 pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Communication</h1>
                        <p className="text-muted-foreground">Keep in touch with your students and seek updates.</p>
                    </div>
                </div>

                <div className="flex items-center space-x-1 border-b">
                    <button
                        onClick={() => setActiveTab("courses")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "courses"
                            ? "border-[#1a3d32] text-[#1a3d32]"
                            : "border-transparent text-muted-foreground hover:text-slate-700"
                            }`}
                    >
                        My Courses
                    </button>
                    <button
                        onClick={() => setActiveTab("batches")}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === "batches"
                            ? "border-[#1a3d32] text-[#1a3d32]"
                            : "border-transparent text-muted-foreground hover:text-slate-700"
                            }`}
                    >
                        My Batches (Counseling)
                    </button>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />)}
                    </div>
                ) : (
                    <>
                        {activeTab === "courses" && (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {courses.length > 0 ? (
                                    courses.map((course) => (
                                        <Card key={course.id} className="flex flex-col border-none shadow-md hover:shadow-lg transition-shadow p-0">
                                            <CardHeader className="bg-[#f8f9fa] border-b py-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-lg font-bold text-[#1a3d32] line-clamp-1">
                                                            {course.course?.name}
                                                        </CardTitle>
                                                        <p className="text-sm text-muted-foreground">{course.batch?.name}</p>
                                                    </div>
                                                    <MessageSquare className="h-5 w-5 text-[#3a5a40]" />
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-6 flex-1">
                                                <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                                                    <Users className="h-4 w-4" />
                                                    <span>{course.batch?.currentStudents || "Unknown"} Students</span>
                                                </div>
                                                <Button
                                                    className="w-full bg-[#1a3d32] hover:bg-[#142e26] text-white mb-4"
                                                    onClick={() => handleEnterCourseChat(course)}
                                                    disabled={enteringChat === course.id}
                                                >
                                                    {enteringChat === course.id ? "Entering..." : "Open Course Chat"}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                                        You are not assigned to any courses currently.
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "batches" && (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {batches.length > 0 ? (
                                    batches.map((batch) => (
                                        <BatchCommunicationCard
                                            key={batch.id}
                                            batch={batch}
                                            onOpenChat={handleEnterBatchChat}
                                            onManageCR={openManageCR}
                                            enteringChat={enteringChat === batch.id}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                                        You are not assigned as counselor for any batches.
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                <CRManagementDialog
                    open={crDialogOpen}
                    onOpenChange={setCrDialogOpen}
                    batch={selectedBatch}
                    onSuccess={fetchData}
                />
            </div>
        </DashboardLayout>
    );
}

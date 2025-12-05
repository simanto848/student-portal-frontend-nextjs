"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { batchCourseInstructorService, BatchCourseInstructor } from "@/services/enrollment/batchCourseInstructor.service";
import { chatService } from "@/services/communication/chat.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MessageSquare, Users } from "lucide-react";

export default function CommunicationPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<BatchCourseInstructor[]>([]);
    const [loading, setLoading] = useState(true);
    const [enteringChat, setEnteringChat] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchCourses();
        }
    }, [user?.id]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const data = await batchCourseInstructorService.getInstructorCourses(user!.id);
            setCourses(data);
        } catch (error) {
            console.error("Fetch courses error:", error);
            toast.error("Failed to load courses");
        } finally {
            setLoading(false);
        }
    };

    const handleEnterChat = async (course: BatchCourseInstructor) => {
        setEnteringChat(course.id);
        try {
            const chatGroup = await chatService.getOrCreateCourseChatGroup({
                batchId: course.batchId,
                courseId: course.courseId,
                sessionId: course.sessionId,
                instructorId: user!.id
            });

            // Redirect to chat page (assuming we'll implement [id] page later)
            // For now, just show success toaster since we don't have the chat UI built in this task scope
            toast.success(`Entered chat for ${course.course?.name}`);
            // router.push(`/dashboard/teacher/communication/chat/${chatGroup.id}`); 
        } catch (error) {
            console.error("Enter chat error:", error);
            toast.error("Failed to enter chat");
        } finally {
            setEnteringChat(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">Communication</h1>
                    <p className="text-muted-foreground">Chat with your classes and students</p>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading class chats...</div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {courses.length > 0 ? (
                            courses.map((course) => (
                                <Card key={course.id} className="flex flex-col border-none shadow-md hover:shadow-lg transition-shadow">
                                    <CardHeader className="bg-[#f8f9fa] border-b pb-4">
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
                                            <span>{course.batch?.currentStudents || "Unknown"} Members</span>
                                        </div>
                                        <Button
                                            className="w-full bg-[#1a3d32] hover:bg-[#142e26] text-white"
                                            onClick={() => handleEnterChat(course)}
                                            disabled={enteringChat === course.id}
                                        >
                                            {enteringChat === course.id ? "Entering..." : "Open Course Chat"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-muted-foreground">
                                No active courses found.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

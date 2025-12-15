"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  DashboardHero,
  DashboardSkeleton,
} from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import {
  batchCourseInstructorService,
  BatchCourseInstructor,
} from "@/services/enrollment/batchCourseInstructor.service";
import { batchService } from "@/services/academic/batch.service";
import { chatService } from "@/services/communication/chat.service";
import { Batch } from "@/services/academic/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Users,
  AlertCircle,
  Search,
  GraduationCap,
} from "lucide-react";
import { BatchCommunicationCard } from "@/components/dashboard/communication/BatchCommunicationCard";
import { CRManagementDialog } from "@/components/dashboard/communication/CRManagementDialog";

// Query keys for teacher communication
const communicationKeys = {
  all: ["teacher-communication"] as const,
  courses: (instructorId: string) =>
    [...communicationKeys.all, "courses", instructorId] as const,
  batches: (counselorId: string) =>
    [...communicationKeys.all, "batches", counselorId] as const,
};

export default function CommunicationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const instructorId = user?.id || user?._id || "";

  // UI State
  const [activeTab, setActiveTab] = useState<"courses" | "batches">("courses");
  const [enteringChat, setEnteringChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog State
  const [crDialogOpen, setCrDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  // Use React Query for courses
  const {
    data: courses = [],
    isLoading: coursesLoading,
    isError: coursesError,
    refetch: refetchCourses,
  } = useQuery({
    queryKey: communicationKeys.courses(instructorId),
    queryFn: () =>
      batchCourseInstructorService.getInstructorCourses(instructorId),
    enabled: !!instructorId,
  });

  // Use React Query for batches
  const {
    data: batches = [],
    isLoading: batchesLoading,
    isError: batchesError,
    refetch: refetchBatches,
  } = useQuery({
    queryKey: communicationKeys.batches(instructorId),
    queryFn: () => batchService.getAllBatches({ counselorId: instructorId }),
    enabled: !!instructorId,
  });

  const isLoading = coursesLoading || batchesLoading;
  const isError = coursesError || batchesError;

  // Filter courses based on search
  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;
    const query = searchQuery.toLowerCase();
    return courses.filter(
      (c) =>
        c.course?.name?.toLowerCase().includes(query) ||
        c.course?.code?.toLowerCase().includes(query) ||
        c.batch?.name?.toLowerCase().includes(query),
    );
  }, [courses, searchQuery]);

  // Filter batches based on search
  const filteredBatches = useMemo(() => {
    if (!searchQuery) return batches;
    const query = searchQuery.toLowerCase();
    return batches.filter((b) => b.name?.toLowerCase().includes(query));
  }, [batches, searchQuery]);

  const refetchAll = () => {
    refetchCourses();
    refetchBatches();
  };

  const handleEnterCourseChat = async (course: BatchCourseInstructor) => {
    if (!course.sessionId) {
      console.error("Missing sessionId for course:", course);
      toast.error("Error: Course session ID is missing.");
      return;
    }

    setEnteringChat(course.id);
    try {
      const chatGroup = await chatService.getOrCreateCourseChatGroup({
        batchId: course.batchId,
        courseId: course.courseId,
        sessionId: course.sessionId,
        instructorId: instructorId,
      });

      router.push(
        `/dashboard/teacher/communication/chat/${chatGroup.id}?type=CourseChatGroup`,
      );
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
        counselorId: instructorId,
      });
      router.push(
        `/dashboard/teacher/communication/chat/${chatGroup.id}?type=BatchChatGroup`,
      );
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

  // Loading state using DashboardSkeleton
  if (isLoading) {
    return <DashboardSkeleton layout="hero-cards" cardCount={6} />;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-10">
        {/* Hero Section using DashboardHero component */}
        <DashboardHero
          icon={MessageSquare}
          label="Communication Hub"
          title="Keep in touch with your students"
          description="Manage course chats and batch communications from one place."
          actions={
            <Button
              size="sm"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10"
              onClick={refetchAll}
            >
              Refresh
            </Button>
          }
          stats={{
            label: "Communication Groups",
            value: (courses.length + batches.length).toString(),
            subtext: "total",
          }}
        >
          <div className="flex gap-4 mt-2 text-xs text-white/70">
            <span>Course Chats: {courses.length}</span>
            <span>Batch Groups: {batches.length}</span>
          </div>
        </DashboardHero>

        {/* Error Alert */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load communication groups. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
          <Input
            placeholder="Search groups..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 border-b">
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "courses"
                ? "border-[#1a3d32] text-[#1a3d32]"
                : "border-transparent text-muted-foreground hover:text-slate-700"
            }`}
          >
            My Courses ({filteredCourses.length})
          </button>
          <button
            onClick={() => setActiveTab("batches")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "batches"
                ? "border-[#1a3d32] text-[#1a3d32]"
                : "border-transparent text-muted-foreground hover:text-slate-700"
            }`}
          >
            My Batches ({filteredBatches.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "courses" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <CourseChatCard
                  key={course.id}
                  course={course}
                  onEnterChat={() => handleEnterCourseChat(course)}
                  isEntering={enteringChat === course.id}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>
                  {searchQuery
                    ? "No courses match your search."
                    : "You are not assigned to any courses currently."}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "batches" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBatches.length > 0 ? (
              filteredBatches.map((batch) => (
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
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>
                  {searchQuery
                    ? "No batches match your search."
                    : "You are not assigned as counselor for any batches."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* CR Management Dialog */}
        <CRManagementDialog
          open={crDialogOpen}
          onOpenChange={setCrDialogOpen}
          batch={selectedBatch}
          onSuccess={refetchAll}
        />
      </div>
    </DashboardLayout>
  );
}

// Course Chat Card sub-component
interface CourseChatCardProps {
  course: BatchCourseInstructor;
  onEnterChat: () => void;
  isEntering: boolean;
}

function CourseChatCard({
  course,
  onEnterChat,
  isEntering,
}: CourseChatCardProps) {
  return (
    <Card className="flex flex-col border-none shadow-md hover:shadow-lg transition-shadow p-0">
      <CardHeader className="bg-[#f8f9fa] border-b py-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold dashboard-title line-clamp-1">
              {course.course?.name || "Unknown Course"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {course.batch?.name || "Unknown Batch"}
            </p>
          </div>
          <MessageSquare className="h-5 w-5 text-[#3a5a40]" />
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex-1">
        <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
          <Users className="h-4 w-4" />
          <span>{course.batch?.currentStudents || "Unknown"} Students</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
          <GraduationCap className="h-4 w-4" />
          <span>Semester {course.semester || "—"}</span>
        </div>
        <Button
          className="w-full bg-[#1a3d32] hover:bg-[#142e26] text-white"
          onClick={onEnterChat}
          disabled={isEntering}
        >
          {isEntering ? "Entering..." : "Open Course Chat"}
        </Button>
      </CardContent>
    </Card>
  );
}

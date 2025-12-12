/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ChatInterface } from "@/components/dashboard/communication/ChatInterface";
import { chatService } from "@/services/communication/chat.service";
import { useAuth } from "@/contexts/AuthContext";
import { batchService } from "@/services/academic/batch.service";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { studentService } from "@/services/user/student.service";

export default function StudentChatPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const chatGroupId = Array.isArray(params.id) ? params.id[0] : params.id;
  const typeParam = searchParams.get("type") as
    | "BatchChatGroup"
    | "CourseChatGroup"
    | "group"
    | null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupDetails, setGroupDetails] = useState<any>(null);
  const [canPin, setCanPin] = useState(false);

  useEffect(() => {
    if (!user || !chatGroupId) return;
    loadChatDetails();
  }, [user, chatGroupId]);

  const loadChatDetails = async () => {
    if (!chatGroupId) return;
    try {
      setLoading(true);
      const details = await chatService.getChatGroupDetails(chatGroupId);
      setGroupDetails(details);

      let canPinMessages = false;

      if (details.type === "BatchChatGroup") {
        if (details.batchId) {
          try {
            const batch = await batchService.getBatchById(details.batchId);
            const crId =
              typeof batch.classRepresentativeId === "object"
                ? (batch.classRepresentativeId as any)._id ||
                  (batch.classRepresentativeId as any).id
                : batch.classRepresentativeId;

            const userId = user?.id || user?._id;

            if (crId && userId && crId.toString() === userId.toString()) {
              canPinMessages = true;
            }
          } catch (err) {
            console.error("Failed to fetch batch for CR check", err);
          }
        }
      }

      setCanPin(canPinMessages);
    } catch (err: any) {
      console.error("Failed to load chat", err);
      setError("Failed to load chat group.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !groupDetails) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              {error || "Chat group not found"}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const title =
    groupDetails.type === "CourseChatGroup"
      ? groupDetails.courseName || "Course Chat"
      : groupDetails.batchName || "Batch Chat";

  const subtitle =
    groupDetails.type === "CourseChatGroup"
      ? `${groupDetails.courseCode || "CODE"} • ${
          groupDetails.instructorName || "Instructor"
        }`
      : "Official Batch Group";

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-100px)] -m-4 md:-m-8">
        {/* Header */}
        <header className="bg-white border-b px-4 py-3 flex items-center shadow-sm z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/student/communication")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-[#1a3d32]">{title}</h1>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              {subtitle}
              {canPin && (
                <span className="text-amber-600 font-semibold bg-amber-50 px-1.5 rounded ml-2">
                  You are CR
                </span>
              )}
            </p>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            chatGroupId={chatGroupId as string}
            chatGroupType={groupDetails.type}
            canPin={canPin}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

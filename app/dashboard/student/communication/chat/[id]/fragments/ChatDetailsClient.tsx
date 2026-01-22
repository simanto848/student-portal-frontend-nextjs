/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChatInterface } from "@/components/dashboard/communication/ChatInterface";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StudentLoading from "@/components/StudentLoading";
import { getChatGroupDetailsAction, getBatchByIdAction } from "../../../actions";

export default function ChatDetailsClient() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();

    const chatGroupId = Array.isArray(params.id) ? params.id[0] : params.id;

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
            const details = await getChatGroupDetailsAction(chatGroupId);
            setGroupDetails(details);

            let canPinMessages = false;

            if (details.type === "BatchChatGroup") {
                if (details.batchId) {
                    try {
                        const batch = await getBatchByIdAction(details.batchId);
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
            setError("Failed to load chat group.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <StudentLoading />
        );
    }

    if (error || !groupDetails) {
        return (
            <div className="p-6 h-screen flex flex-col items-center justify-center bg-architectural">
                <div className="glass-panel p-8 rounded-3xl max-w-sm w-full text-center">
                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 mb-6">
                        <AlertDescription>
                            {error || "Chat group not found"}
                        </AlertDescription>
                    </Alert>
                    <Button
                        variant="outline"
                        className="w-full glass-inner border-white/20 hover:bg-white/40 rounded-xl"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Messages
                    </Button>
                </div>
            </div>
        );
    }

    const title =
        groupDetails.type === "CourseChatGroup"
            ? groupDetails.courseName || "Course Chat"
            : groupDetails.batchName || "Batch Chat";

    const subtitle =
        groupDetails.type === "CourseChatGroup"
            ? `${groupDetails.courseCode || "CODE"} • Dr. ${groupDetails.instructorName || "Instructor"}`
            : "Official Batch Discussion";

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] -m-4 md:-m-8 bg-architectural overflow-hidden">
            <ChatInterface
                chatGroupId={chatGroupId as string}
                chatGroupType={groupDetails.type}
                canPin={canPin}
                title={title}
                subtitle={subtitle}
                courseCode={groupDetails.courseCode}
                onBack={() => router.push("/dashboard/student/communication")}
            />
        </div>
    );
}

"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ChatInterface } from "@/components/dashboard/communication/ChatInterface";

import { useEffect, useState } from "react";
import { chatService } from "@/services/communication/chat.service";

export default function ChatPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const chatGroupId = params.id as string;
    const chatGroupType = searchParams.get("type") as 'BatchChatGroup' | 'CourseChatGroup' | undefined;

    const [headerInfo, setHeaderInfo] = useState<{ title: string, subtitle: string } | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (chatGroupId) {
                try {
                    const details = await chatService.getChatGroupDetails(chatGroupId);
                    if (details.courseName) {
                        setHeaderInfo({
                            title: `${details.courseName} (${details.courseCode})`,
                            subtitle: details.batchName
                        });
                    } else if (details.batchName) {
                        setHeaderInfo({
                            title: details.batchName,
                            subtitle: "Batch Discussion"
                        });
                    }
                } catch (error) {
                    console.error("Failed to fetch chat details", error);
                }
            }
        };
        fetchDetails();
    }, [chatGroupId]);

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto rounded-xl border bg-white shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b flex items-center gap-4 bg-slate-50">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <h2 className="font-bold text-slate-800">{headerInfo?.title || "Chat"}</h2>
                        <p className="text-xs text-muted-foreground">{headerInfo?.subtitle || `ID: ${chatGroupId?.substring(0, 8)}...`}</p>
                    </div>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 overflow-hidden relative">
                    <ChatInterface chatGroupId={chatGroupId} chatGroupType={chatGroupType} />
                </div>
            </div>
        </DashboardLayout>
    );
}

"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ChatInterface } from "@/components/dashboard/communication/ChatInterface";

export default function ChatPage() {
    const router = useRouter();
    const params = useParams();
    const chatGroupId = params.id as string;

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-100px)] max-w-5xl mx-auto rounded-xl border bg-white shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b flex items-center gap-4 bg-slate-50">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1">
                        <h2 className="font-bold text-slate-800">Chat</h2>
                        <p className="text-xs text-muted-foreground">ID: {chatGroupId?.substring(0, 8)}...</p>
                    </div>
                </div>

                {/* Chat Interface */}
                <div className="flex-1 overflow-hidden relative">
                    <ChatInterface chatGroupId={chatGroupId} />
                </div>
            </div>
        </DashboardLayout>
    );
}

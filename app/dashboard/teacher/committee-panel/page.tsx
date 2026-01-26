"use client";

import { useAuth } from "@/contexts/AuthContext";
import { isTeacherUser } from "@/types/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import CommitteeWorkflowList from "./components/CommitteeWorkflowList";

export default function CommitteePanel() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/auth/login");
                return;
            }

            // Check if user is a teacher and is an exam committee member
            if (isTeacherUser(user) && user.isExamCommitteeMember) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        }
    }, [user, isLoading, router]);

    if (isLoading || isAuthorized === null) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/20">
                    <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Access Restricted
                    </h1>
                    <p className="max-w-md text-slate-600 dark:text-slate-400">
                        You do not have permission to view the Exam Committee Panel.
                        This area is restricted to assigned committee members only.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Exam Committee Panel</h1>
                <p className="text-slate-600 dark:text-slate-400">Review and approve course results for publishing.</p>
            </div>

            <CommitteeWorkflowList />
        </div>
    );
}
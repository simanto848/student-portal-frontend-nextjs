"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { quizService, Quiz } from "@/services/classroom/quiz.service";
import { notifyError } from "@/components/toast";
import { getErrorMessage } from "@/lib/utils/toastHelpers";
import { Loader2 } from "lucide-react";
import { QuizListClient } from "./fragments/QuizListClient";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

export default function QuizListPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const theme = useDashboardTheme();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchQuizzes();
  }, [workspaceId]);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const data = await quizService.listByWorkspace(workspaceId);
      setQuizzes(data);
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to load quizzes");
      notifyError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="relative">
          <div className={`h-20 w-20 rounded-full border-4 border-slate-100 border-t-${theme.colors.accent.primary.replace('text-', '')} animate-spin`} />
          <Loader2 className={`h-8 w-8 ${theme.colors.accent.primary} animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
          Synchronizing Assessment Database
        </p>
      </div>
    );
  }

  return (
    <QuizListClient
      quizzes={quizzes}
      workspaceId={workspaceId}
      refresh={fetchQuizzes}
    />
  );
}

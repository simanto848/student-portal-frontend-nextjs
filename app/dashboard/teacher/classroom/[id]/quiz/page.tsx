"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { quizService, Quiz } from "@/services/classroom/quiz.service";
import { notifyError } from "@/components/toast";
import { getErrorMessage } from "@/lib/utils/toastHelpers";
import { Loader2 } from "lucide-react";
import { QuizListClient } from "./fragments/QuizListClient";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { DashboardSkeleton } from "@/components/dashboard/shared";

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
      <DashboardSkeleton layout="hero-cards" cardCount={6} withLayout={false} />
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

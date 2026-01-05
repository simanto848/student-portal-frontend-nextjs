"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  quizService,
  questionService,
  Quiz,
  Question,
  QuizAttempt,
} from "@/services/classroom/quiz.service";
import { workspaceService } from "@/services/classroom/workspace.service";
import { studentService, Student } from "@/services/user/student.service";
import { notifyError } from "@/components/toast";
import { getErrorMessage } from "@/lib/utils/toastHelpers";
import { Loader2 } from "lucide-react";
import { QuizDetailClient } from "../fragments/QuizDetailClient";

export default function TeacherQuizDetailPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const quizId = params.quizId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<QuizAttempt[]>([]);
  const [batchStudents, setBatchStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, [quizId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [quizData, questionData, submissionData, workspace] =
        await Promise.all([
          quizService.getById(quizId),
          questionService.listByQuiz(quizId),
          quizService.getSubmissions(quizId),
          workspaceService.getById(workspaceId),
        ]);
      setQuiz(quizData);
      setQuestions(questionData);
      setSubmissions(submissionData);

      if (workspace.batchId) {
        try {
          const { students } = await studentService.getAll({
            batchId: workspace.batchId,
            limit: 500,
          });
          setBatchStudents(students);
        } catch (e) {
          console.error("Failed to fetch batch students:", e);
        }
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to load quiz");
      notifyError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
          <div className="relative">
            <div className="h-20 w-20 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
            <Loader2 className="h-8 w-8 text-indigo-600 animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
            Decompressing Evaluation Analytics
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz) return null;

  return (
    <DashboardLayout>
      <QuizDetailClient
        quiz={quiz}
        questions={questions}
        submissions={submissions}
        batchStudents={batchStudents}
        workspaceId={workspaceId}
        refresh={fetchData}
      />
    </DashboardLayout>
  );
}

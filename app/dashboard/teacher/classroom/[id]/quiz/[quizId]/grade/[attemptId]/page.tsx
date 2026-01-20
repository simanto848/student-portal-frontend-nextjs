"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  quizService,
  questionService,
  quizAttemptService,
  Quiz,
  Question,
  QuizAttempt,
} from "@/services/classroom/quiz.service";
import { studentService, Student } from "@/services/user/student.service";
import { notifyError } from "@/components/toast";
import { getErrorMessage } from "@/lib/utils/toastHelpers";
import { Loader2 } from "lucide-react";
import { QuizGradingClient } from "../../../fragments/QuizGradingClient";

export default function GradeSubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const quizId = params.quizId as string;
  const attemptId = params.attemptId as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData();
  }, [attemptId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [quizData, questionData, attemptResult] = await Promise.all([
        quizService.getById(quizId),
        questionService.listByQuiz(quizId),
        quizAttemptService.getResults(attemptId),
      ]);
      setQuiz(quizData);
      setQuestions(questionData);
      setAttempt(attemptResult.attempt);

      if (attemptResult.attempt.studentId) {
        try {
          const studentData = await studentService.getById(
            attemptResult.attempt.studentId,
          );
          setStudent(studentData);
        } catch (e) {
          console.error("Failed to fetch student details:", e);
        }
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to load submission");
      notifyError(message);
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="relative">
          <div className="h-20 w-20 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
          <Loader2 className="h-8 w-8 text-indigo-600 animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
          Deep-Scanning Candidate Assessment Data
        </p>
      </div>
    );
  }

  if (!quiz || !attempt) return null;

  return (
    <QuizGradingClient
      quiz={quiz}
      questions={questions}
      attempt={attempt}
      student={student}
      workspaceId={workspaceId}
      refresh={fetchData}
    />
  );
}

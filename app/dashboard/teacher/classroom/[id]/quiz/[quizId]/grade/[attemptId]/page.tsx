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
  const [otherAttempts, setOtherAttempts] = useState<QuizAttempt[]>([]);
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
          const [studentData, attemptsList] = await Promise.all([
            studentService.getById(attemptResult.attempt.studentId),
            quizAttemptService.getAttemptsByStudent(quizId, attemptResult.attempt.studentId)
          ]);
          setStudent(studentData);
          setOtherAttempts(attemptsList);
        } catch (e) {
          console.error("Failed to fetch student details or attempts:", e);
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
  // ... (rest of loading state)
  if (!quiz || !attempt) return null;

  return (
    <QuizGradingClient
      quiz={quiz}
      questions={questions}
      attempt={attempt}
      otherAttempts={otherAttempts}
      student={student}
      workspaceId={workspaceId}
      refresh={fetchData}
    />
  );
}

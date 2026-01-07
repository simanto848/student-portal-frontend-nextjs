"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
    quizService,
    questionService,
    Quiz,
    Question,
} from "@/services/classroom/quiz.service";
import { notifyError } from "@/components/toast";
import { getErrorMessage } from "@/lib/utils/toastHelpers";
import { Loader2 } from "lucide-react";
import { QuizCreateClient } from "../../fragments/QuizCreateClient";

export default function EditQuizPage() {
    const params = useParams();
    const workspaceId = params.id as string;
    const quizId = params.quizId as string;

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [quizId]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [quizData, questionData] = await Promise.all([
                quizService.getById(quizId),
                questionService.listByQuiz(quizId),
            ]);
            setQuiz(quizData);
            setQuestions(questionData);
        } catch (error: unknown) {
            notifyError(getErrorMessage(error, "Failed to load protocol for modification"));
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
                        Loading Evaluation Framework
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <QuizCreateClient
                workspaceId={workspaceId}
                quizId={quizId}
                initialQuiz={quiz}
                initialQuestions={questions}
            />
        </DashboardLayout>
    );
}

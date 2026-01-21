"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import {
    quizService,
    questionService,
    Question,
    Quiz,
    QuizOption,
} from "@/services/classroom/quiz.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { getErrorMessage, getSuccessMessage } from "@/lib/utils/toastHelpers";
import {
    Check,
    Clock,
    FileText,
    Settings,
    Plus,
    Trash2,
    Loader2,
    Save,
    X,
    Target,
    Shield,
    Sparkles,
    ChevronDown,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    PlusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO, format } from "date-fns";
import { QuizHeader } from "./QuizHeader";
import QuizBottomNavigation from "./QuizBottomNavigation";

const generateId = () => crypto.randomUUID();

const QUESTION_TYPES = [
    { value: "mcq_single", label: "Multiple Choice (Single)", icon: "🔘" },
    { value: "mcq_multiple", label: "Multiple Choice (Multiple)", icon: "☑️" },
    { value: "true_false", label: "True or False", icon: "✓✗" },
    { value: "short_answer", label: "Short Answer", icon: "📝" },
    { value: "long_answer", label: "Long Answer", icon: "📄" },
];

type Step = 1 | 2 | 3 | 4;

interface QuestionDraft extends Partial<Question> {
    tempId: string;
}

interface QuizCreateClientProps {
    workspaceId: string;
    quizId?: string;
    initialQuiz?: Quiz | null;
    initialQuestions?: Question[];
}

export function QuizCreateClient({
    workspaceId,
    quizId,
    initialQuiz,
    initialQuestions,
}: QuizCreateClientProps) {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Step 1: Basic Info
    const [title, setTitle] = useState(initialQuiz?.title || "");
    const [description, setDescription] = useState(initialQuiz?.description || "");
    const [instructions, setInstructions] = useState(initialQuiz?.instructions || "");
    const [duration, setDuration] = useState(initialQuiz?.duration || 30);
    const [maxAttempts, setMaxAttempts] = useState(initialQuiz?.maxAttempts || 1);
    const [startAt, setStartAt] = useState(
        initialQuiz?.startAt ? new Date(initialQuiz.startAt).toISOString().slice(0, 16) : ""
    );
    const [endAt, setEndAt] = useState(
        initialQuiz?.endAt ? new Date(initialQuiz.endAt).toISOString().slice(0, 16) : ""
    );

    // Step 2: Questions
    const [questions, setQuestions] = useState<QuestionDraft[]>(
        initialQuestions?.map((q) => ({ ...q, tempId: q.id })) || []
    );
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
    const [bulkPoints, setBulkPoints] = useState(1);

    const duplicateQuestion = (tempId: string) => {
        const questionToDuplicate = questions.find((q) => q.tempId === tempId);
        if (!questionToDuplicate) return;

        const newQuestion: QuestionDraft = {
            ...questionToDuplicate,
            tempId: generateId(),
            id: undefined,
            options: questionToDuplicate.options?.map((opt) => ({
                ...opt,
                id: generateId(),
            })),
        };

        setQuestions((prev) => [...prev, newQuestion]);
        setExpandedQuestion(newQuestion.tempId);
        notifySuccess("Question duplicated successfully");
    };

    // Step 3: Settings
    const [shuffleQuestions, setShuffleQuestions] = useState(initialQuiz?.shuffleQuestions ?? false);
    const [shuffleOptions, setShuffleOptions] = useState(initialQuiz?.shuffleOptions ?? false);
    const [showResultsAfterSubmit, setShowResultsAfterSubmit] = useState(initialQuiz?.showResultsAfterSubmit ?? true);
    const [showCorrectAnswers, setShowCorrectAnswers] = useState(initialQuiz?.showCorrectAnswers ?? false);
    const [passingScore, setPassingScore] = useState(initialQuiz?.passingScore || 0);

    const steps = [
        { id: 1, title: "Basic Info", icon: FileText },
        { id: 2, title: "Questions", icon: Sparkles },
        { id: 3, title: "Settings", icon: Settings },
        { id: 4, title: "Review", icon: Check },
    ];

    const addQuestion = () => {
        const newQuestion: QuestionDraft = {
            tempId: generateId(),
            type: "mcq_single",
            text: "New Question",
            content: undefined,
            contentType: "tiptap",
            points: bulkPoints, // Use bulkPoints for new questions
            options: [
                { id: generateId(), text: "Option 1", isCorrect: true },
                { id: generateId(), text: "Option 2", isCorrect: false },
            ],
            correctAnswer: "",
            explanation: "",
        };
        setQuestions([...questions, newQuestion]);
        setExpandedQuestion(newQuestion.tempId);
    };

    const applyBulkPoints = () => {
        setQuestions(questions.map(q => ({ ...q, points: bulkPoints })));
        notifySuccess(`Applied ${bulkPoints} points to all questions`);
    };

    const handleImageUpload = useCallback(async (file: File): Promise<string> => {
        return await questionService.uploadImage(file);
    }, []);

    const updateQuestion = (tempId: string, updates: Partial<QuestionDraft>) => {
        setQuestions(
            questions.map((q) => (q.tempId === tempId ? { ...q, ...updates } : q)),
        );
    };

    const removeQuestion = (tempId: string) => {
        setQuestions(questions.filter((q) => q.tempId !== tempId));
        if (expandedQuestion === tempId) setExpandedQuestion(null);
    };

    const addOption = (tempId: string) => {
        const question = questions.find((q) => q.tempId === tempId);
        if (!question) return;
        const newOption: QuizOption = { id: generateId(), text: "", isCorrect: false };
        updateQuestion(tempId, { options: [...(question.options || []), newOption] });
    };

    const updateOption = (tempId: string, optionId: string, updates: Partial<QuizOption>) => {
        const question = questions.find((q) => q.tempId === tempId);
        if (!question) return;
        const options = question.options?.map((o) => (o.id === optionId ? { ...o, ...updates } : o));
        updateQuestion(tempId, { options });
    };

    const removeOption = (tempId: string, optionId: string) => {
        const question = questions.find((q) => q.tempId === tempId);
        if (!question) return;
        updateQuestion(tempId, { options: question.options?.filter((o) => o.id !== optionId) });
    };

    const setCorrectOption = (tempId: string, optionId: string, isMultiple: boolean) => {
        const question = questions.find((q) => q.tempId === tempId);
        if (!question) return;
        const options = question.options?.map((o) => ({
            ...o,
            isCorrect: isMultiple ? (o.id === optionId ? !o.isCorrect : o.isCorrect) : o.id === optionId,
        }));
        updateQuestion(tempId, { options });
    };

    const validateStep = (s: Step): boolean => {
        switch (s) {
            case 1: return !!(title.trim() && duration >= 1);
            case 2:
                return questions.length > 0 && questions.every((q) => {
                    if (!q.text?.trim()) return false;
                    if (q.type?.startsWith("mcq") || q.type === "true_false") {
                        return q.options?.some((o) => o.isCorrect) && q.options?.every((o) => o.text.trim());
                    }
                    return true;
                });
            default: return true;
        }
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            const payload = {
                workspaceId,
                title,
                description,
                instructions,
                duration,
                maxAttempts,
                passingScore,
                shuffleQuestions,
                shuffleOptions,
                showResultsAfterSubmit,
                showCorrectAnswers,
                startAt: startAt ? new Date(startAt).toISOString() : undefined,
                endAt: endAt ? new Date(endAt).toISOString() : undefined,
            };

            const quizData = quizId
                ? await quizService.update(quizId, payload)
                : await quizService.create(payload);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const targetQuizId = (quizData as any).id;

            if (questions.length > 0) {
                if (quizId) {
                    // To prevent duplication on update, we fetch existing questions and delete them
                    // Using sequential deletion to avoid concurrency issues on the backend
                    try {
                        const existingQuestions = await questionService.listByQuiz(quizId);
                        if (existingQuestions.length > 0) {
                            for (const q of existingQuestions) {
                                await questionService.delete(q.id);
                            }
                        }
                    } catch (e) {
                        console.error("Failed to clear existing questions:", e);
                    }
                }

                await questionService.bulkCreate(
                    targetQuizId,
                    questions.map((q, index) => ({
                        type: q.type,
                        text: q.text,
                        content: q.content,
                        contentType: q.contentType || "tiptap",
                        options: (q.options || []).map(opt => ({
                            text: opt.text,
                            isCorrect: opt.isCorrect ?? false,
                            id: "" // Use empty string to satisfy type and trigger fresh creation
                        })),
                        correctAnswer: q.correctAnswer,
                        points: q.points,
                        explanation: q.explanation,
                        order: index,
                    })),
                );
            }

            notifySuccess(getSuccessMessage(quizData, `Quiz ${quizId ? 'updated' : 'created'} successfully.`));
            router.push(`/dashboard/teacher/classroom/${workspaceId}/quiz/${targetQuizId}`);
        } catch (error: unknown) {
            notifyError(getErrorMessage(error, `Failed to ${quizId ? 'update' : 'create'} quiz`));
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-24">
            {/* Page Header and Steps combined in QuizHeader */}
            <QuizHeader
                title={quizId ? "Edit Quiz" : "Create Quiz"}
                subtitle="Set up your quiz details and questions for your students."
                backHref={`/dashboard/teacher/classroom/${workspaceId}/quiz`}
                badgeText={quizId ? "UPDATING QUIZ" : "NEW ASSESSMENT"}
                icon={Plus}
                breadcrumbs={[
                    { label: "Classroom", href: `/dashboard/teacher/classroom/${workspaceId}` },
                    { label: "Quizzes", href: `/dashboard/teacher/classroom/${workspaceId}/quiz` },
                    { label: quizId ? "Edit" : "Create" }
                ]}
                steps={steps}
                step={step}
                setStep={setStep}
            />

            <div className="max-w-5xl mx-auto space-y-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8"
                    >
                        {step === 1 && (
                            <div className="grid gap-8">
                                <div className="glass-panel p-8 rounded-3xl shadow-sm space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-[#2dd4bf] flex items-center gap-2">
                                            <Target className="w-4 h-4" /> Quiz Title <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            placeholder="e.g., Introduction to Computer Science - Midterm"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="h-14 rounded-2xl border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 px-6 font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2dd4bf] transition-all shadow-sm outline-none border-0 ring-1 ring-slate-200 dark:ring-slate-700"
                                        />
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-[#2dd4bf] flex items-center gap-2">
                                                <Clock className="w-4 h-4" /> Duration (Minutes)
                                            </Label>
                                            <Input
                                                type="number"
                                                value={duration}
                                                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                                                className="h-14 rounded-2xl bg-white/50 dark:bg-slate-800/50 px-6 font-medium text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#2dd4bf] border-0 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-xs font-bold uppercase tracking-widest text-[#2dd4bf] flex items-center gap-2">
                                                <Shield className="w-4 h-4" /> Max Attempts
                                            </Label>
                                            <Input
                                                type="number"
                                                value={maxAttempts}
                                                onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                                                className="h-14 rounded-2xl bg-white/50 dark:bg-slate-800/50 px-6 font-medium text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#2dd4bf] border-0 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-[#2dd4bf] flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Description
                                        </Label>
                                        <Textarea
                                            placeholder="Provide context or topics covered in this quiz..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="rounded-2xl bg-white/50 dark:bg-slate-800/50 p-6 font-medium text-slate-900 dark:text-white ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#2dd4bf] border-0 outline-none min-h-[120px]"
                                        />
                                    </div>
                                </div>

                                <div className="glass-panel p-8 rounded-3xl shadow-sm border-indigo-100/50 dark:border-indigo-900/20 space-y-8">
                                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <Settings className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Scheduling</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Optional: Set when students can access this quiz</p>
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Available From</Label>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <DatePicker
                                                    date={startAt ? parseISO(startAt) : undefined}
                                                    onChange={(d) => {
                                                        const timePart = startAt.split('T')[1] || "00:00";
                                                        setStartAt(d ? `${format(d, "yyyy-MM-dd")}T${timePart}` : "");
                                                    }}
                                                    className="h-12 rounded-xl flex-1 bg-white/50 dark:bg-slate-800/50"
                                                />
                                                <Input
                                                    type="time"
                                                    value={startAt.split('T')[1] || ""}
                                                    onChange={(e) => {
                                                        const datePart = startAt.split('T')[0] || format(new Date(), "yyyy-MM-dd");
                                                        setStartAt(`${datePart}T${e.target.value || "00:00"}`);
                                                    }}
                                                    className="h-12 w-full sm:w-[120px] rounded-xl border-0 ring-1 ring-slate-200 dark:ring-slate-700 bg-white/50 dark:bg-slate-800/50 font-bold text-slate-700 dark:text-slate-300 px-4"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-widest">Available Until</Label>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <DatePicker
                                                    date={endAt ? parseISO(endAt) : undefined}
                                                    onChange={(d) => {
                                                        const timePart = endAt.split('T')[1] || "00:00";
                                                        setEndAt(d ? `${format(d, "yyyy-MM-dd")}T${timePart}` : "");
                                                    }}
                                                    className="h-12 rounded-xl flex-1 bg-white/50 dark:bg-slate-800/50"
                                                />
                                                <Input
                                                    type="time"
                                                    value={endAt.split('T')[1] || ""}
                                                    onChange={(e) => {
                                                        const datePart = endAt.split('T')[0] || format(new Date(), "yyyy-MM-dd");
                                                        setEndAt(`${datePart}T${e.target.value || "00:00"}`);
                                                    }}
                                                    className="h-12 w-full sm:w-[120px] rounded-xl border-0 ring-1 ring-slate-200 dark:ring-slate-700 bg-white/50 dark:bg-slate-800/50 font-bold text-slate-700 dark:text-slate-300 px-4"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-8">
                                <div className="glass-panel p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-[#2dd4bf]/10 flex items-center justify-center text-[#2dd4bf]">
                                            <Plus className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Question Builder</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="bg-[#2dd4bf]/10 text-[#2dd4bf] text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase">{questions.length} Questions</span>
                                                <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase">{questions.reduce((sum, q) => sum + (q.points || 0), 0)} Total Points</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                                        <div className="flex items-center bg-white/50 dark:bg-slate-800/50 rounded-2xl p-1.5 ring-1 ring-slate-200 dark:ring-slate-700 transition-all focus-within:ring-2 focus-within:ring-[#2dd4bf] shadow-sm">
                                            <Input
                                                type="number"
                                                value={bulkPoints}
                                                onChange={(e) => setBulkPoints(parseInt(e.target.value) || 1)}
                                                className="w-14 h-10 border-none bg-transparent font-bold text-center focus-visible:ring-0 text-slate-800 dark:text-white"
                                            />
                                            <Button
                                                onClick={applyBulkPoints}
                                                variant="ghost"
                                                className="h-10 px-4 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 hover:text-[#2dd4bf] dark:hover:text-[#2dd4bf] hover:bg-slate-100 dark:hover:bg-slate-700"
                                            >
                                                Apply to All
                                            </Button>
                                        </div>
                                        <Button
                                            onClick={addQuestion}
                                            className="h-14 px-8 rounded-2xl bg-[#2dd4bf] text-white hover:bg-[#2dd4bf]/90 font-bold shadow-lg shadow-teal-500/20 transition-all active:scale-95"
                                        >
                                            <Plus className="h-5 w-5 mr-2" />
                                            Add Question
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {questions.length === 0 ? (
                                        <div className="glass-panel py-24 rounded-[3rem] border-dashed border-2 flex flex-col items-center justify-center text-center">
                                            <div className="h-24 w-24 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-6">
                                                <Sparkles className="h-12 w-12" />
                                            </div>
                                            <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Build Your Quiz</h4>
                                            <p className="text-slate-500 dark:text-slate-400 max-w-sm px-8">Every great assessment starts with a first question. Click the button above to begin.</p>
                                        </div>
                                    ) : (
                                        questions.map((q, idx) => (
                                            <div key={q.tempId} className="group relative">
                                                <div className="absolute -left-4 md:-left-14 top-6 h-10 w-10 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-sm shadow-xl z-10 border-4 border-white dark:border-[#0f172a]">
                                                    {idx + 1}
                                                </div>
                                                <div className={cn(
                                                    "glass-panel rounded-3xl overflow-hidden transition-all duration-500 border-white/40 dark:border-slate-700/40",
                                                    expandedQuestion === q.tempId ? "shadow-2xl ring-2 ring-[#2dd4bf]/20" : "hover:shadow-md"
                                                )}>
                                                    <div
                                                        onClick={() => setExpandedQuestion(expandedQuestion === q.tempId ? null : q.tempId)}
                                                        className="px-8 py-6 flex items-center justify-between cursor-pointer hover:bg-white/40 dark:hover:bg-slate-800/40 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-5 flex-1 min-w-0">
                                                            <div className="w-12 h-12 rounded-[1.25rem] bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-xl ring-1 ring-slate-100 dark:ring-slate-700">
                                                                {QUESTION_TYPES.find(t => t.value === q.type)?.icon}
                                                            </div>
                                                            <div className="truncate">
                                                                <p className="text-base font-bold text-slate-800 dark:text-white truncate pr-4">{q.text || "Untitled Question"}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{QUESTION_TYPES.find(t => t.value === q.type)?.label}</span>
                                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                                    <span className="text-[10px] font-bold text-[#2dd4bf] uppercase tracking-widest">{q.points || 1} Points</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    duplicateQuestion(q.tempId);
                                                                }}
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-10 w-10 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                                                            >
                                                                <Save className="h-4.5 w-4.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(e) => { e.stopPropagation(); removeQuestion(q.tempId); }}
                                                                className="h-10 w-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            >
                                                                <Trash2 className="h-4.5 w-4.5" />
                                                            </Button>
                                                            <div className={cn(
                                                                "h-10 w-10 flex items-center justify-center rounded-xl text-slate-300 transition-transform duration-300",
                                                                expandedQuestion === q.tempId && "rotate-180"
                                                            )}>
                                                                <ChevronDown className="w-5 h-5" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {expandedQuestion === q.tempId && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden border-t border-slate-100 dark:border-slate-800"
                                                            >
                                                                <div className="p-8 space-y-8 bg-slate-50/30 dark:bg-slate-900/10">
                                                                    <div className="space-y-4">
                                                                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Question Source Content</Label>
                                                                        <RichTextEditor
                                                                            content={q.content || q.text || ""}
                                                                            onChange={(content) => {
                                                                                const extractText = (node: any): string => {
                                                                                    if (node.text) return node.text;
                                                                                    if (node.content) return node.content.map(extractText).join(" ");
                                                                                    return "";
                                                                                };
                                                                                updateQuestion(q.tempId, {
                                                                                    content: content as any,
                                                                                    text: extractText(content),
                                                                                    contentType: "tiptap"
                                                                                });
                                                                            }}
                                                                            onImageUpload={handleImageUpload}
                                                                            className="rounded-2xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#2dd4bf]"
                                                                            placeholder="Type your question prompt here..."
                                                                        />
                                                                    </div>

                                                                    <div className="grid md:grid-cols-2 gap-8">
                                                                        <div className="space-y-4">
                                                                            <Label className="text-xs font-bold uppercase tracking-widest text-[#2dd4bf]">Score Points</Label>
                                                                            <Input
                                                                                type="number"
                                                                                value={q.points || 1}
                                                                                onChange={(e) => updateQuestion(q.tempId, { points: parseInt(e.target.value) || 0 })}
                                                                                className="h-12 rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#2dd4bf] border-0"
                                                                            />
                                                                        </div>
                                                                        {q.type === 'short_answer' && (
                                                                            <div className="space-y-4">
                                                                                <Label className="text-xs font-bold uppercase tracking-widest text-indigo-500">Exact Answer</Label>
                                                                                <Input
                                                                                    value={q.correctAnswer || ""}
                                                                                    onChange={(e) => updateQuestion(q.tempId, { correctAnswer: e.target.value })}
                                                                                    className="h-12 rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#2dd4bf] border-0"
                                                                                    placeholder="Expected student response..."
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {(q.type?.startsWith("mcq") || q.type === "true_false") && (
                                                                        <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                                            <div className="flex items-center justify-between">
                                                                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white flex items-center gap-2">
                                                                                    <PlusCircle className="w-4 h-4 text-[#2dd4bf]" /> Options
                                                                                </Label>
                                                                                {q.type !== "true_false" && (
                                                                                    <Button
                                                                                        onClick={() => addOption(q.tempId)}
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        className="h-9 px-4 rounded-xl border-[#2dd4bf] text-[#2dd4bf] hover:bg-[#2dd4bf] hover:text-white transition-all font-bold text-[10px] uppercase"
                                                                                    >
                                                                                        Add Choice
                                                                                    </Button>
                                                                                )}
                                                                            </div>

                                                                            <div className="grid gap-3">
                                                                                {q.options?.map((opt, oIdx) => (
                                                                                    <div key={opt.id} className="flex items-center gap-4 group/option">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => setCorrectOption(q.tempId, opt.id, q.type === "mcq_multiple")}
                                                                                            className={cn(
                                                                                                "h-12 w-12 shrink-0 rounded-2xl border-2 flex items-center justify-center transition-all duration-300",
                                                                                                opt.isCorrect
                                                                                                    ? "bg-[#2dd4bf] border-[#2dd4bf] text-white shadow-lg shadow-teal-500/20"
                                                                                                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 hover:border-[#2dd4bf]"
                                                                                            )}
                                                                                        >
                                                                                            {opt.isCorrect ? <Check className="w-5 h-5" /> : <span className="font-bold text-sm">{String.fromCharCode(65 + oIdx)}</span>}
                                                                                        </button>
                                                                                        <div className="flex-1 relative">
                                                                                            <Input
                                                                                                value={opt.text}
                                                                                                onChange={(e) => updateOption(q.tempId, opt.id, { text: e.target.value })}
                                                                                                className="h-12 rounded-2xl bg-white/50 dark:bg-slate-800/50 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#2dd4bf] border-0 pr-10"
                                                                                                disabled={q.type === "true_false"}
                                                                                            />
                                                                                            {q.type !== "true_false" && q.options!.length > 2 && (
                                                                                                <button
                                                                                                    onClick={() => removeOption(q.tempId, opt.id)}
                                                                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-red-500 transition-colors"
                                                                                                >
                                                                                                    <X className="w-4 h-4" />
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                                        <Label className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Feedback Explanation</Label>
                                                                        <Textarea
                                                                            placeholder="Explain the logic behind the correct answer..."
                                                                            value={q.explanation || ""}
                                                                            onChange={(e) => updateQuestion(q.tempId, { explanation: e.target.value })}
                                                                            className="rounded-2xl bg-white/50 dark:bg-slate-800/50 p-6 font-medium text-slate-600 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#2dd4bf] border-0 italic"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="grid lg:grid-cols-2 gap-8">
                                <div className="glass-panel p-8 rounded-3xl shadow-sm space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <Settings className="w-5 h-5" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Delivery Options</h3>
                                    </div>

                                    <div className="grid gap-4">
                                        {[
                                            { label: "Shuffle Questions", state: shuffleQuestions, set: setShuffleQuestions, desc: "Randomize question order for each student" },
                                            { label: "Shuffle Options", state: shuffleOptions, set: setShuffleOptions, desc: "Randomize answer choices for MCQ" },
                                            { label: "Instant Results", state: showResultsAfterSubmit, set: setShowResultsAfterSubmit, desc: "Show marks immediately after finish" },
                                            { label: "Show Correct Answers", state: showCorrectAnswers, set: setShowCorrectAnswers, desc: "Reveal answers after submission" },
                                        ].map((s) => (
                                            <div key={s.label} className="flex items-center justify-between p-5 rounded-2xl bg-white/40 dark:bg-slate-800/40 ring-1 ring-slate-200/50 dark:ring-slate-700/50 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all">
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-white text-sm">{s.label}</p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{s.desc}</p>
                                                </div>
                                                <Switch
                                                    checked={s.state}
                                                    onCheckedChange={s.set}
                                                    className="data-[state=checked]:bg-[#2dd4bf]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="glass-panel p-8 rounded-3xl shadow-sm space-y-8 border-orange-100/50 dark:border-orange-900/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                                <CheckCircle className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Success Criteria</h3>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Min. Passing Grade</Label>
                                                    <span className="text-2xl font-black text-[#2dd4bf]">{passingScore}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0" max="100"
                                                    value={passingScore}
                                                    onChange={(e) => setPassingScore(parseInt(e.target.value))}
                                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-[#2dd4bf]"
                                                />
                                            </div>

                                            <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                                                <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Student Instructions</Label>
                                                <Textarea
                                                    placeholder="Guidance for students before they start (e.g., Honor code, forbidden materials)..."
                                                    value={instructions}
                                                    onChange={(e) => setInstructions(e.target.value)}
                                                    className="rounded-2xl bg-white/50 dark:bg-slate-800/50 p-6 font-medium text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-[#2dd4bf] border-0 min-h-[150px]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-10">
                                <div className="text-center py-6">
                                    <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        className="h-24 w-24 rounded-[2.5rem] bg-[#2dd4bf] text-white flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-teal-500/30 rotate-3"
                                    >
                                        <Check className="h-12 w-12" />
                                    </motion.div>
                                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Review & Publish</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mt-2">Almost done! Review your quiz setup before making it live.</p>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-8">
                                    <div className="glass-panel p-8 rounded-3xl shadow-sm space-y-6">
                                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Quiz Summary</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: "Questions", value: `${questions.length} Items`, icon: FileText, color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20" },
                                                { label: "Points", value: `${questions.reduce((sum, q) => sum + (q.points || 0), 0)} Pts`, icon: Target, color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20" },
                                                { label: "Duration", value: `${duration} mins`, icon: Clock, color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20" },
                                                { label: "Pass Mark", value: `${passingScore}%`, icon: CheckCircle, color: "text-teal-500 bg-teal-50 dark:bg-teal-900/20" },
                                            ].map((item, idx) => (
                                                <div key={idx} className="p-5 rounded-2xl bg-white/50 dark:bg-slate-800/50 ring-1 ring-slate-100 dark:ring-slate-800 flex flex-col gap-3">
                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.color)}>
                                                        <item.icon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                                                        <p className="text-base font-bold text-slate-800 dark:text-white">{item.value}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="glass-panel p-8 rounded-3xl shadow-lg border-[#2dd4bf]/20 dark:border-teal-900/20 bg-[#2dd4bf]/5 flex flex-col justify-center items-center text-center space-y-8">
                                        <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 shadow-sm ring-1 ring-slate-100 dark:ring-slate-700 max-w-sm w-full">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Live Preview</p>
                                            <div className="text-left space-y-4">
                                                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-3/4 animate-pulse"></div>
                                                <div className="h-32 bg-slate-50 dark:bg-slate-900/50 rounded-2xl w-full flex items-center justify-center">
                                                    <Sparkles className="w-8 h-8 text-slate-200 dark:text-slate-700" />
                                                </div>
                                                <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded-full w-1/2 animate-pulse"></div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 px-6">
                                            <h4 className="text-xl font-bold text-slate-800 dark:text-white">Final Action</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Published quizzes will be visible to students according to your schedule.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
                <QuizBottomNavigation
                    step={step}
                    setStep={setStep}
                    isSubmitting={isSubmitting}
                    validateStep={validateStep}
                    handleSubmit={handleSubmit}
                    quizId={quizId}
                    steps={steps}
                />
            </div>
        </div>
    );
}

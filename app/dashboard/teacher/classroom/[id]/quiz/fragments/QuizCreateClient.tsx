"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
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
    GripVertical,
    Loader2,
    Save,
    X,
    ChevronDown,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    ChevronRight,
    Target,
    Shield,
} from "lucide-react";
import { QuizHeader } from "./QuizHeader";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "@/components/ui/date-picker";
import { parseISO, format } from "date-fns";

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
        <div className="space-y-12 pb-24">
            <QuizHeader
                title={quizId ? "Edit Quiz" : "Create Quiz"}
                subtitle="Set up your quiz details and questions."
                backHref={`/dashboard/teacher/classroom/${workspaceId}/quiz`}
                breadcrumbs={[
                    { label: "Classroom", href: `/dashboard/teacher/classroom/${workspaceId}` },
                    { label: "Quizzes", href: `/dashboard/teacher/classroom/${workspaceId}/quiz` },
                    { label: quizId ? "Edit" : "New Quiz" }
                ]}
                icon={Plus}
                badgeText="Quiz Details"
            />

            <div className="max-w-4xl mx-auto space-y-12">
                {/* Step Indicator */}
                <div className="bg-white rounded-[2rem] p-4 shadow-xl shadow-slate-200/40 border-2 border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
                    {steps.map((s, idx) => (
                        <div key={s.id} className="flex items-center flex-1 w-full group">
                            <div
                                onClick={() => step > s.id && setStep(s.id as Step)}
                                className={cn(
                                    "flex items-center gap-4 px-6 py-3.5 rounded-2xl transition-all duration-300 cursor-pointer relative z-10",
                                    step === s.id ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-105" :
                                        step > s.id ? "bg-emerald-50 text-emerald-600 border-2 border-emerald-100/50" :
                                            "bg-white text-slate-400 opacity-60 hover:opacity-100"
                                )}
                            >
                                {step > s.id ? <Check className="w-5 h-5 font-black" /> : <s.icon className="w-5 h-5" />}
                                <span className="text-[10px] font-black uppercase tracking-widest">{s.title}</span>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={cn(
                                    "flex-1 h-1.5 mx-4 rounded-full transition-all duration-1000",
                                    step > s.id ? "bg-emerald-200" : "bg-slate-100"
                                )} />
                            )}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-10"
                    >
                        {step === 1 && (
                            <div className="grid gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <Target className="w-3.5 h-3.5" /> Quiz Title *
                                    </Label>
                                    <Input
                                        placeholder="e.g., Midterm Project Examination"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="h-16 rounded-2xl border-2 border-slate-100 bg-white px-6 font-bold text-slate-900 focus:border-indigo-500 shadow-sm"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3 text-left">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5" /> Duration (Minutes) *
                                        </Label>
                                        <Input
                                            type="number"
                                            value={duration}
                                            onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                                            className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 font-bold text-slate-900 focus:border-indigo-500 shadow-sm"
                                        />
                                    </div>
                                    <div className="space-y-3 text-left">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <Shield className="w-3.5 h-3.5" /> Allowed Attempts
                                        </Label>
                                        <Input
                                            type="number"
                                            value={maxAttempts}
                                            onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 1)}
                                            className="h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 font-bold text-slate-900 focus:border-indigo-500 shadow-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5" /> Description (Optional)
                                    </Label>
                                    <Textarea
                                        placeholder="Briefly describe what this quiz covers..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="rounded-2xl border-2 border-slate-100 bg-white p-6 font-bold text-slate-900 focus:border-indigo-500 shadow-sm min-h-[120px]"
                                    />
                                </div>

                                <div className="p-8 rounded-[2.5rem] bg-indigo-50 border-2 border-indigo-100/50 space-y-6">
                                    <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest flex items-center gap-3">
                                        <Settings className="w-4 h-4" /> Quiz Schedule (Optional)
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">START DATE</Label>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <DatePicker
                                                    date={startAt ? parseISO(startAt) : undefined}
                                                    onChange={(d) => {
                                                        const timePart = startAt.split('T')[1] || "00:00";
                                                        setStartAt(d ? `${format(d, "yyyy-MM-dd")}T${timePart}` : "");
                                                    }}
                                                    className="h-12 rounded-xl flex-1"
                                                />
                                                <Input
                                                    type="time"
                                                    value={startAt.split('T')[1] || ""}
                                                    onChange={(e) => {
                                                        const datePart = startAt.split('T')[0] || format(new Date(), "yyyy-MM-dd");
                                                        setStartAt(`${datePart}T${e.target.value || "00:00"}`);
                                                    }}
                                                    className="h-12 w-full sm:w-[120px] rounded-xl border-none bg-white font-bold text-indigo-700 shadow-inner px-4"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">END DATE</Label>
                                            <div className="flex flex-col sm:flex-row gap-3">
                                                <DatePicker
                                                    date={endAt ? parseISO(endAt) : undefined}
                                                    onChange={(d) => {
                                                        const timePart = endAt.split('T')[1] || "00:00";
                                                        setEndAt(d ? `${format(d, "yyyy-MM-dd")}T${timePart}` : "");
                                                    }}
                                                    className="h-12 rounded-xl flex-1"
                                                />
                                                <Input
                                                    type="time"
                                                    value={endAt.split('T')[1] || ""}
                                                    onChange={(e) => {
                                                        const datePart = endAt.split('T')[0] || format(new Date(), "yyyy-MM-dd");
                                                        setEndAt(`${datePart}T${e.target.value || "00:00"}`);
                                                    }}
                                                    className="h-12 w-full sm:w-[120px] rounded-xl border-none bg-white font-bold text-indigo-700 shadow-inner px-4"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-10">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Question List</h3>
                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                            <span className="bg-indigo-50 px-3 py-1 rounded-full">{questions.length} Questions</span>
                                            <span className="bg-indigo-50 px-3 py-1 rounded-full">{questions.reduce((sum, q) => sum + (q.points || 0), 0)} Points</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center bg-slate-100 rounded-xl p-1 border-2 border-slate-200">
                                            <Input
                                                type="number"
                                                value={bulkPoints}
                                                onChange={(e) => setBulkPoints(parseInt(e.target.value) || 1)}
                                                className="w-16 h-10 border-none bg-transparent font-black text-center focus-visible:ring-0"
                                            />
                                            <Button
                                                onClick={applyBulkPoints}
                                                variant="ghost"
                                                size="sm"
                                                className="h-10 px-4 rounded-lg font-black text-[9px] uppercase tracking-widest text-slate-600 hover:text-indigo-600"
                                            >
                                                Set All Points
                                            </Button>
                                        </div>
                                        <Button
                                            onClick={addQuestion}
                                            className="h-12 px-6 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                                        >
                                            <Plus className="h-4 w-4 mr-2" /> Add Question
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {questions.length === 0 ? (
                                        <div className="py-24 rounded-[3rem] bg-slate-50 border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                                            <div className="h-20 w-20 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-200 mb-6">
                                                <Sparkles className="h-10 w-10" />
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900 mb-2">No Questions Added Yet</h4>
                                            <p className="text-slate-500 font-bold max-w-xs px-6">Click "Add Question" above to start building your quiz.</p>
                                        </div>
                                    ) : (
                                        questions.map((q, idx) => (
                                            <div key={q.tempId} className="group relative">
                                                <div className="absolute -left-12 top-6 h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg shadow-slate-300 pointer-events-none italic">
                                                    {idx + 1}
                                                </div>
                                                <Card className="border-2 border-slate-100 rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-slate-200/40 hover:border-indigo-100 transition-all duration-300 p-0">
                                                    <div
                                                        onClick={() => setExpandedQuestion(expandedQuestion === q.tempId ? null : q.tempId)}
                                                        className="px-8 py-6 flex items-center justify-between cursor-pointer group-hover:bg-slate-50/50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                                            <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                                                                {QUESTION_TYPES.find(t => t.value === q.type)?.icon}
                                                            </div>
                                                            <div className="truncate">
                                                                <p className="text-sm font-black text-slate-900 truncate">{q.text || "New Question"}</p>
                                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                                                    {QUESTION_TYPES.find(t => t.value === q.type)?.label} • {q.points || 1} Points
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <Button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    duplicateQuestion(q.tempId);
                                                                }}
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-10 w-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                                                title="Duplicate Question"
                                                            >
                                                                <Save className="h-5 w-5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={(e) => { e.stopPropagation(); removeQuestion(q.tempId); }}
                                                                className="rounded-xl h-10 w-10 text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </Button>
                                                            <ChevronDown className={cn("w-5 h-5 text-slate-300 transition-transform duration-500", expandedQuestion === q.tempId && "rotate-180")} />
                                                        </div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {expandedQuestion === q.tempId && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden border-t-2 border-slate-50"
                                                            >
                                                                <CardContent className="p-8 space-y-8">
                                                                    <div className="space-y-4">
                                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Question Text</Label>
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
                                                                            className="rounded-[1.5rem] border-2 border-slate-50 shadow-inner"
                                                                            placeholder="Enter your question here..."
                                                                        />
                                                                    </div>

                                                                    <div className="grid md:grid-cols-2 gap-8">
                                                                        <div className="space-y-4">
                                                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Points</Label>
                                                                            <Input
                                                                                type="number"
                                                                                value={q.points || 1}
                                                                                onChange={(e) => updateQuestion(q.tempId, { points: parseInt(e.target.value) || 0 })}
                                                                                className="h-12 rounded-xl border-2 border-slate-50 bg-slate-50 font-black text-slate-900 focus:bg-white"
                                                                            />
                                                                        </div>
                                                                        {q.type === 'short_answer' && (
                                                                            <div className="space-y-4">
                                                                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Correct Answer</Label>
                                                                                <Input
                                                                                    value={q.correctAnswer || ""}
                                                                                    onChange={(e) => updateQuestion(q.tempId, { correctAnswer: e.target.value })}
                                                                                    className="h-12 rounded-xl border-2 border-slate-50 bg-slate-50 font-black text-slate-900 focus:bg-white"
                                                                                    placeholder="Enter the expected response..."
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Options for MCQ */}
                                                                    {(q.type?.startsWith("mcq") || q.type === "true_false") && (
                                                                        <div className="space-y-6 bg-slate-50/50 p-6 rounded-[2rem] border-2 border-white">
                                                                            <div className="flex items-center justify-between">
                                                                                <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Answer Options</Label>
                                                                                {q.type !== "true_false" && (
                                                                                    <Button
                                                                                        onClick={() => addOption(q.tempId)}
                                                                                        className="h-10 px-4 rounded-xl bg-white border-2 border-slate-100 text-indigo-600 font-black text-[9px] uppercase tracking-widest shadow-sm active:scale-95"
                                                                                    >
                                                                                        Add Option
                                                                                    </Button>
                                                                                )}
                                                                            </div>

                                                                            <div className="space-y-3">
                                                                                {q.options?.map((opt, oIdx) => (
                                                                                    <div key={opt.id} className="flex items-center gap-4">
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => setCorrectOption(q.tempId, opt.id, q.type === "mcq_multiple")}
                                                                                            className={cn(
                                                                                                "h-10 w-10 shrink-0 rounded-xl border-2 flex items-center justify-center transition-all duration-300",
                                                                                                opt.isCorrect ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 rotate-12" : "bg-white border-slate-200 hover:border-emerald-200"
                                                                                            )}
                                                                                        >
                                                                                            {opt.isCorrect ? <Check className="w-5 h-5 font-black" /> : <span className="text-[10px] font-black opacity-20">{String.fromCharCode(65 + oIdx)}</span>}
                                                                                        </button>
                                                                                        <Input
                                                                                            value={opt.text}
                                                                                            onChange={(e) => updateOption(q.tempId, opt.id, { text: e.target.value })}
                                                                                            className="h-10 rounded-xl border-2 border-slate-100 bg-white font-bold text-slate-700"
                                                                                            disabled={q.type === "true_false"}
                                                                                        />
                                                                                        {q.type !== "true_false" && q.options!.length > 2 && (
                                                                                            <Button
                                                                                                variant="ghost"
                                                                                                size="icon"
                                                                                                onClick={() => removeOption(q.tempId, opt.id)}
                                                                                                className="text-rose-400"
                                                                                            >
                                                                                                <X className="w-4 h-4" />
                                                                                            </Button>
                                                                                        )}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    <div className="space-y-4">
                                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Explanation (Optional)</Label>
                                                                        <Textarea
                                                                            placeholder="Explain why the correct answer is correct..."
                                                                            value={q.explanation || ""}
                                                                            onChange={(e) => updateQuestion(q.tempId, { explanation: e.target.value })}
                                                                            className="rounded-2xl border-2 border-slate-100 bg-white p-6 font-bold text-slate-600 italic focus:border-indigo-500 shadow-sm"
                                                                        />
                                                                    </div>
                                                                </CardContent>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </Card>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-8">
                                    <div className="p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 shadow-xl shadow-slate-200/40 space-y-8">
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] italic">Quiz Settings</h3>

                                        <div className="space-y-4">
                                            {[
                                                { label: "Shuffle Questions", state: shuffleQuestions, set: setShuffleQuestions, desc: "Randomize the order of questions for each student." },
                                                { label: "Shuffle Options", state: shuffleOptions, set: setShuffleOptions, desc: "Randomize the order of choices within questions." },
                                                { label: "Show Results", state: showResultsAfterSubmit, set: setShowResultsAfterSubmit, desc: "Students can see their marks immediately." },
                                                { label: "Reveal Correct Answers", state: showCorrectAnswers, set: setShowCorrectAnswers, desc: "Show correct answers after submission." },
                                            ].map((s) => (
                                                <div key={s.label} className="flex items-center justify-between p-6 rounded-3xl bg-slate-50/50 border-2 border-white transition-all hover:bg-slate-50">
                                                    <div>
                                                        <p className="font-black text-slate-900 text-sm tracking-tight">{s.label}</p>
                                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{s.desc}</p>
                                                    </div>
                                                    <Switch checked={s.state} onCheckedChange={s.set} className="data-[state=checked]:bg-indigo-600" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl space-y-8">
                                        <h3 className="text-sm font-black text-indigo-400 uppercase tracking-[0.2em] italic">Scoring & Pass Grade</h3>

                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">PASSING SCORE (%)</Label>
                                                <div className="flex items-center gap-6">
                                                    <input
                                                        type="range"
                                                        min="0" max="100"
                                                        value={passingScore}
                                                        onChange={(e) => setPassingScore(parseInt(e.target.value))}
                                                        className="flex-1 h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                                                    />
                                                    <span className="text-3xl font-black text-white italic">{passingScore}%</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-6 border-t border-slate-800">
                                                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">STUDENT INSTRUCTIONS</Label>
                                                <Textarea
                                                    placeholder="Instructions for students when starting the quiz..."
                                                    value={instructions}
                                                    onChange={(e) => setInstructions(e.target.value)}
                                                    className="rounded-[1.5rem] bg-slate-800 border-none p-6 font-bold text-slate-300 placeholder:text-slate-600 min-h-[150px]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-12">
                                <div className="text-center py-12">
                                    <div className="h-24 w-24 rounded-[2.5rem] bg-indigo-600 text-white flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-200 rotate-12">
                                        <Check className="h-14 w-14 font-black" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Ready to Publish</h3>
                                    <p className="text-slate-500 font-bold mt-2">Final review of your quiz before publishing.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 space-y-8">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Summary</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-6 rounded-2xl bg-slate-50">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">TITLE</p>
                                                <p className="text-sm font-black text-slate-900 truncate">{title}</p>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-slate-50">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">QUESTIONS</p>
                                                <p className="text-sm font-black text-slate-900">{questions.length} Items</p>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-slate-50">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">TOTAL POINTS</p>
                                                <p className="text-sm font-black text-slate-900">{questions.reduce((sum, q) => sum + (q.points || 0), 0)} Pts</p>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-indigo-50">
                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">PASSING SCORE</p>
                                                <p className="text-sm font-black text-indigo-700">{passingScore}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl flex flex-col justify-center items-center text-center space-y-6">
                                        <h4 className="text-[10px] font-black text-indigo-200 uppercase tracking-widest italic">Publish Quiz</h4>
                                        <p className="text-sm font-bold text-indigo-100 leading-relaxed px-6">Publishing this quiz will make it available to students within the specified schedule.</p>
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={isSubmitting}
                                            className="h-14 px-10 rounded-2xl bg-white text-indigo-600 font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-50 transition-all active:scale-95"
                                        >
                                            {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Publish Quiz"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="sticky bottom-0 z-50 flex items-center justify-between p-6 -mx-6 mt-12 bg-white/80 backdrop-blur-xl border-t-2 border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] rounded-t-[2.5rem]">
                            <Button
                                onClick={() => step > 1 && setStep((step - 1) as Step)}
                                disabled={step === 1 || isSubmitting}
                                className="h-14 px-8 rounded-2xl gap-3 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Go Back
                            </Button>

                            {step < 4 ? (
                                <Button
                                    onClick={() => validateStep(step) && setStep((step + 1) as Step)}
                                    disabled={!validateStep(step)}
                                    className="h-14 px-10 rounded-2xl gap-3 bg-slate-900 text-white hover:bg-black font-black text-[10px] uppercase tracking-widest shadow-2xl active:scale-95 transition-all shadow-slate-900/20"
                                >
                                    Next Step
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            ) : null}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

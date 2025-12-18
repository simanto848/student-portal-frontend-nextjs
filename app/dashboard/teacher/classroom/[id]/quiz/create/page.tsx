"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import {
  quizService,
  questionService,
  Quiz,
  Question,
  QuizOption,
  TipTapContent,
} from "@/services/classroom/quiz.service";
import { notifySuccess, notifyError } from "@/components/toast";
import { getErrorMessage, getSuccessMessage } from "@/lib/utils/toastHelpers";
import {
  ArrowLeft,
  ArrowRight,
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
  Home,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Simple UUID generator using built-in crypto API
const generateId = () => crypto.randomUUID();

const QUESTION_TYPES = [
  { value: "mcq_single", label: "Multiple Choice (Single Answer)", icon: "🔘" },
  {
    value: "mcq_multiple",
    label: "Multiple Choice (Multiple Answers)",
    icon: "☑️",
  },
  { value: "true_false", label: "True / False", icon: "✓✗" },
  { value: "short_answer", label: "Short Answer", icon: "📝" },
  { value: "long_answer", label: "Long Answer / Essay", icon: "📄" },
];

type Step = 1 | 2 | 3 | 4;

interface QuestionDraft extends Partial<Question> {
  tempId: string;
}

export default function CreateQuizPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [duration, setDuration] = useState(30);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  // Step 2: Questions
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Step 3: Settings
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [showResultsAfterSubmit, setShowResultsAfterSubmit] = useState(true);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [passingScore, setPassingScore] = useState(0);

  const steps = [
    { id: 1, title: "Basic Info", icon: FileText },
    { id: 2, title: "Questions", icon: FileText },
    { id: 3, title: "Settings", icon: Settings },
    { id: 4, title: "Review", icon: Check },
  ];

  const addQuestion = (type: string) => {
    const newQuestion: QuestionDraft = {
      tempId: generateId(),
      type: type as Question["type"],
      text: "",
      content: undefined,
      contentType: "tiptap",
      points: 1,
      options:
        type === "true_false"
          ? [
              { id: generateId(), text: "True", isCorrect: false },
              { id: generateId(), text: "False", isCorrect: false },
            ]
          : type.startsWith("mcq")
            ? [
                { id: generateId(), text: "", isCorrect: false },
                { id: generateId(), text: "", isCorrect: false },
              ]
            : [],
      correctAnswer: "",
      explanation: "",
    };
    setQuestions([...questions, newQuestion]);
    setExpandedQuestion(newQuestion.tempId);
  };

  // Image upload handler for RichTextEditor
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
    const newOption: QuizOption = {
      id: generateId(),
      text: "",
      isCorrect: false,
    };
    updateQuestion(tempId, {
      options: [...(question.options || []), newOption],
    });
  };

  const updateOption = (
    tempId: string,
    optionId: string,
    updates: Partial<QuizOption>,
  ) => {
    const question = questions.find((q) => q.tempId === tempId);
    if (!question) return;
    const options = question.options?.map((o) =>
      o.id === optionId ? { ...o, ...updates } : o,
    );
    updateQuestion(tempId, { options });
  };

  const removeOption = (tempId: string, optionId: string) => {
    const question = questions.find((q) => q.tempId === tempId);
    if (!question) return;
    updateQuestion(tempId, {
      options: question.options?.filter((o) => o.id !== optionId),
    });
  };

  const setCorrectOption = (
    tempId: string,
    optionId: string,
    isMultiple: boolean,
  ) => {
    const question = questions.find((q) => q.tempId === tempId);
    if (!question) return;

    const options = question.options?.map((o) => ({
      ...o,
      isCorrect: isMultiple
        ? o.id === optionId
          ? !o.isCorrect
          : o.isCorrect
        : o.id === optionId,
    }));
    updateQuestion(tempId, { options });
  };

  const validateStep = (s: Step): boolean => {
    switch (s) {
      case 1:
        return !!(title.trim() && duration >= 1);
      case 2:
        return (
          questions.length > 0 &&
          questions.every((q) => {
            if (!q.text?.trim()) return false;
            if (q.type?.startsWith("mcq") || q.type === "true_false") {
              return (
                q.options?.some((o) => o.isCorrect) &&
                q.options?.every((o) => o.text.trim())
              );
            }
            return true;
          })
        );
      case 3:
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Create quiz
      const quiz = await quizService.create({
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
      });

      // Create questions
      if (questions.length > 0) {
        await questionService.bulkCreate(
          quiz.id,
          questions.map((q, index) => ({
            type: q.type,
            text: q.text,
            content: q.content,
            contentType: q.contentType || "tiptap",
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: q.points,
            explanation: q.explanation,
            order: index,
          })),
        );
      }

      const message = getSuccessMessage(quiz, "Quiz created successfully!");
      notifySuccess(message);
      router.push(
        `/dashboard/teacher/classroom/${workspaceId}/quiz/${(quiz as any).id}`,
      );
    } catch (error: unknown) {
      const message = getErrorMessage(error, "Failed to create quiz");
      notifyError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestionEditor = (question: QuestionDraft) => {
    const isExpanded = expandedQuestion === question.tempId;
    const typeInfo = QUESTION_TYPES.find((t) => t.value === question.type);
    const isMultipleChoice = question.type === "mcq_multiple";

    return (
      <Card key={question.tempId} className="overflow-hidden">
        <div
          className={cn(
            "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors",
            isExpanded && "bg-muted/30",
          )}
          onClick={() =>
            setExpandedQuestion(isExpanded ? null : question.tempId)
          }
        >
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
          <span className="text-lg">{typeInfo?.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#344e41] truncate">
              {question.text || "Untitled Question"}
            </p>
            <p className="text-xs text-muted-foreground">
              {typeInfo?.label} • {question.points} pts
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              removeQuestion(question.tempId);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <ChevronDown
            className={cn(
              "h-5 w-5 transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </div>

        {isExpanded && (
          <CardContent className="border-t pt-4 space-y-4">
            <div className="grid gap-4">
              <div>
                <Label className="mb-2 block">Question Content *</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Use the toolbar to format text, add images, code blocks, and
                  more.
                </p>
                <RichTextEditor
                  content={question.content || question.text || ""}
                  onChange={(content) => {
                    // Extract plain text for searchability
                    const extractText = (node: any): string => {
                      if (node.text) return node.text;
                      if (node.content)
                        return node.content.map(extractText).join(" ");
                      return "";
                    };
                    const plainText = extractText(content);
                    updateQuestion(question.tempId, {
                      content: content as any,
                      text: plainText,
                      contentType: "tiptap",
                    });
                  }}
                  onImageUpload={handleImageUpload}
                  placeholder="Enter your question here... Use the toolbar to add formatting, images, code blocks, etc."
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Points</Label>
                  <Input
                    type="number"
                    min={0}
                    value={question.points || 1}
                    onChange={(e) =>
                      updateQuestion(question.tempId, {
                        points: parseInt(e.target.value) || 1,
                      })
                    }
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* Options for MCQ and True/False */}
              {(question.type?.startsWith("mcq") ||
                question.type === "true_false") && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Answer Options</Label>
                    {question.type !== "true_false" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(question.tempId)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Option
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isMultipleChoice
                      ? "Select all correct answers"
                      : "Select the correct answer"}
                  </p>
                  {question.options?.map((option, idx) => (
                    <div key={option.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCorrectOption(
                            question.tempId,
                            option.id,
                            isMultipleChoice,
                          )
                        }
                        className={cn(
                          "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                          option.isCorrect
                            ? "bg-green-500 border-green-500 text-white"
                            : "border-gray-300 hover:border-green-400",
                        )}
                      >
                        {option.isCorrect && <Check className="h-4 w-4" />}
                      </button>
                      <Input
                        placeholder={`Option ${idx + 1}`}
                        value={option.text}
                        onChange={(e) =>
                          updateOption(question.tempId, option.id, {
                            text: e.target.value,
                          })
                        }
                        className="flex-1"
                        disabled={question.type === "true_false"}
                      />
                      {question.type !== "true_false" &&
                        question.options!.length > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() =>
                              removeOption(question.tempId, option.id)
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                    </div>
                  ))}
                </div>
              )}

              {/* Short Answer correct answer */}
              {question.type === "short_answer" && (
                <div>
                  <Label>Correct Answer (for auto-grading)</Label>
                  <Input
                    placeholder="Enter the expected answer..."
                    value={question.correctAnswer || ""}
                    onChange={(e) =>
                      updateQuestion(question.tempId, {
                        correctAnswer: e.target.value,
                      })
                    }
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank for manual grading only
                  </p>
                </div>
              )}

              {question.type === "long_answer" && (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  Essay questions require manual grading. Students will see a
                  text area to write their response.
                </p>
              )}

              <div>
                <Label>Explanation (shown after submission)</Label>
                <Textarea
                  placeholder="Add an explanation for the correct answer..."
                  value={question.explanation || ""}
                  onChange={(e) =>
                    updateQuestion(question.tempId, {
                      explanation: e.target.value,
                    })
                  }
                  className="mt-1.5"
                  rows={2}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/dashboard/teacher"
            className="flex items-center gap-1 hover:text-[#588157] transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/dashboard/teacher/classroom/${workspaceId}`}
            className="hover:text-[#588157] transition-colors"
          >
            Classroom
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href={`/dashboard/teacher/classroom/${workspaceId}/quiz`}
            className="hover:text-[#588157] transition-colors"
          >
            Quizzes
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-[#344e41] font-medium">Create New</span>
        </nav>

        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              router.push(`/dashboard/teacher/classroom/${workspaceId}/quiz`)
            }
            className="shrink-0 hover:bg-[#588157]/10 hover:border-[#588157]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#588157] to-[#3a5a40] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#344e41] to-[#588157] bg-clip-text text-transparent">
                  Create New Quiz
                </h1>
                <p className="text-sm text-muted-foreground">
                  Build an engaging quiz for your students
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, index) => (
              <div key={s.id} className="flex items-center flex-1">
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer",
                    step === s.id
                      ? "bg-gradient-to-r from-[#588157] to-[#3a5a40] text-white shadow-md"
                      : step > s.id
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                  )}
                  onClick={() => step > s.id && setStep(s.id as Step)}
                >
                  {step > s.id ? (
                    <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  ) : (
                    <s.icon className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium hidden sm:inline">
                    {s.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2 rounded-full transition-colors",
                      step > s.id ? "bg-emerald-400" : "bg-gray-200",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Step {step} of 4:{" "}
            <span className="font-medium text-[#344e41]">
              {steps[step - 1].title}
            </span>
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardContent className="pt-6">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title">Quiz Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Midterm Exam, Chapter 5 Quiz"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Briefly describe what this quiz covers..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="instructions">
                    Instructions for Students
                  </Label>
                  <Textarea
                    id="instructions"
                    placeholder="Add any special instructions..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes) *</Label>
                    <div className="relative mt-1.5">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="duration"
                        type="number"
                        min={1}
                        value={duration}
                        onChange={(e) =>
                          setDuration(parseInt(e.target.value) || 1)
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="attempts">Max Attempts</Label>
                    <Input
                      id="attempts"
                      type="number"
                      min={1}
                      value={maxAttempts}
                      onChange={(e) =>
                        setMaxAttempts(parseInt(e.target.value) || 1)
                      }
                      className="mt-1.5"
                    />
                  </div>
                </div>

                {/* Quiz Scheduling */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-sm font-semibold text-[#344e41] mb-3">
                    Quiz Scheduling (Optional)
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Set when this quiz becomes available to students. Leave
                    empty for no time restrictions.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startAt">Start Date & Time</Label>
                      <Input
                        id="startAt"
                        type="datetime-local"
                        value={startAt}
                        onChange={(e) => setStartAt(e.target.value)}
                        className="mt-1.5"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Quiz opens at this time
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="endAt">End Date & Time</Label>
                      <Input
                        id="endAt"
                        type="datetime-local"
                        value={endAt}
                        onChange={(e) => setEndAt(e.target.value)}
                        className="mt-1.5"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Quiz closes at this time
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Add Question Buttons */}
                <div className="flex flex-wrap gap-2">
                  {QUESTION_TYPES.map((type) => (
                    <Button
                      key={type.value}
                      variant="outline"
                      size="sm"
                      onClick={() => addQuestion(type.value)}
                      className="gap-1.5"
                    >
                      <span>{type.icon}</span>
                      <span className="hidden sm:inline">{type.label}</span>
                      <span className="sm:hidden">
                        {type.value.split("_")[0].toUpperCase()}
                      </span>
                    </Button>
                  ))}
                </div>

                {/* Questions List */}
                {questions.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[#344e41] mb-2">
                      No questions yet
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Click one of the buttons above to add your first question
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <div key={question.tempId} className="relative">
                        <span className="absolute -left-8 top-4 text-sm text-muted-foreground font-medium">
                          {index + 1}.
                        </span>
                        {renderQuestionEditor(question)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Summary */}
                {questions.length > 0 && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-[#344e41]">
                        {questions.length}
                      </strong>{" "}
                      questions •
                      <strong className="text-[#344e41] ml-1">
                        {questions.reduce((sum, q) => sum + (q.points || 0), 0)}
                      </strong>{" "}
                      total points
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Shuffle Questions</Label>
                      <p className="text-sm text-muted-foreground">
                        Randomize question order for each student
                      </p>
                    </div>
                    <Switch
                      checked={shuffleQuestions}
                      onCheckedChange={setShuffleQuestions}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">Shuffle Options</Label>
                      <p className="text-sm text-muted-foreground">
                        Randomize answer options for MCQ questions
                      </p>
                    </div>
                    <Switch
                      checked={shuffleOptions}
                      onCheckedChange={setShuffleOptions}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">
                        Show Results After Submit
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Students can see their score immediately
                      </p>
                    </div>
                    <Switch
                      checked={showResultsAfterSubmit}
                      onCheckedChange={setShowResultsAfterSubmit}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label className="font-medium">
                        Show Correct Answers
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Reveal correct answers after submission
                      </p>
                    </div>
                    <Switch
                      checked={showCorrectAnswers}
                      onCheckedChange={setShowCorrectAnswers}
                    />
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Label className="font-medium">Passing Score (%)</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Set to 0 to disable pass/fail indication
                    </p>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={passingScore}
                      onChange={(e) =>
                        setPassingScore(parseInt(e.target.value) || 0)
                      }
                      className="w-32"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[#344e41]">
                  Review Your Quiz
                </h3>

                <div className="grid gap-4">
                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p>
                        <strong>Title:</strong> {title}
                      </p>
                      <p>
                        <strong>Duration:</strong> {duration} minutes
                      </p>
                      <p>
                        <strong>Max Attempts:</strong> {maxAttempts}
                      </p>
                      {description && (
                        <p>
                          <strong>Description:</strong> {description}
                        </p>
                      )}
                      {startAt && (
                        <p>
                          <strong>Starts:</strong>{" "}
                          {new Date(startAt).toLocaleString()}
                        </p>
                      )}
                      {endAt && (
                        <p>
                          <strong>Ends:</strong>{" "}
                          {new Date(endAt).toLocaleString()}
                        </p>
                      )}
                      {!startAt && !endAt && (
                        <p className="text-muted-foreground italic">
                          No time restrictions set
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">
                        Questions Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p>
                        <strong>Total Questions:</strong> {questions.length}
                      </p>
                      <p>
                        <strong>Total Points:</strong>{" "}
                        {questions.reduce((sum, q) => sum + (q.points || 0), 0)}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {QUESTION_TYPES.map((type) => {
                          const count = questions.filter(
                            (q) => q.type === type.value,
                          ).length;
                          if (count === 0) return null;
                          return (
                            <span
                              key={type.value}
                              className="bg-white px-2 py-1 rounded text-xs"
                            >
                              {type.icon} {count} {type.label.split(" ")[0]}
                            </span>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <p>
                        <strong>Shuffle Questions:</strong>{" "}
                        {shuffleQuestions ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong>Shuffle Options:</strong>{" "}
                        {shuffleOptions ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong>Show Results:</strong>{" "}
                        {showResultsAfterSubmit ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong>Show Answers:</strong>{" "}
                        {showCorrectAnswers ? "Yes" : "No"}
                      </p>
                      {passingScore > 0 && (
                        <p>
                          <strong>Passing Score:</strong> {passingScore}%
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Question Preview - Student View */}
                  <Card className="border-2 border-[#588157]/30">
                    <CardHeader className="pb-2 bg-gradient-to-r from-[#588157]/10 to-[#3a5a40]/10">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-[#588157] flex items-center justify-center">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            Question Preview
                          </CardTitle>
                          <CardDescription className="text-xs">
                            How students will see your questions
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-6">
                      {questions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No questions added yet
                        </p>
                      ) : (
                        questions.map((question, index) => (
                          <div
                            key={question.tempId}
                            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-4">
                              {/* Question Number */}
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#588157] text-white flex items-center justify-center font-semibold text-sm">
                                {index + 1}
                              </div>

                              <div className="flex-1 space-y-4">
                                {/* Question Header */}
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                    {QUESTION_TYPES.find(
                                      (t) => t.value === question.type,
                                    )?.label || question.type}
                                  </span>
                                  <span className="text-xs font-medium text-[#588157]">
                                    {question.points || 1}{" "}
                                    {(question.points || 1) === 1
                                      ? "point"
                                      : "points"}
                                  </span>
                                </div>

                                {/* Question Content */}
                                <div className="prose prose-sm max-w-none">
                                  {question.content ? (
                                    <RichTextEditor
                                      content={question.content}
                                      editable={false}
                                      className="border-0 shadow-none"
                                    />
                                  ) : (
                                    <p className="text-gray-700">
                                      {question.text || "No question text"}
                                    </p>
                                  )}
                                </div>

                                {/* Answer Options for MCQ/True-False */}
                                {(question.type?.startsWith("mcq") ||
                                  question.type === "true_false") && (
                                  <div className="space-y-2 pl-2">
                                    {question.options?.map((option, optIdx) => (
                                      <label
                                        key={option.id}
                                        className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                                      >
                                        {question.type === "mcq_multiple" ? (
                                          <div className="h-5 w-5 rounded border-2 border-gray-300 flex items-center justify-center">
                                            {/* Checkbox style */}
                                          </div>
                                        ) : (
                                          <div className="h-5 w-5 rounded-full border-2 border-gray-300">
                                            {/* Radio style */}
                                          </div>
                                        )}
                                        <span className="text-sm text-gray-700">
                                          {option.text ||
                                            `Option ${optIdx + 1}`}
                                        </span>
                                      </label>
                                    ))}
                                  </div>
                                )}

                                {/* Answer Input for Short/Long Answer */}
                                {question.type === "short_answer" && (
                                  <div className="pl-2">
                                    <input
                                      type="text"
                                      disabled
                                      placeholder="Student enters short answer here..."
                                      className="w-full p-3 border rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
                                    />
                                  </div>
                                )}

                                {question.type === "long_answer" && (
                                  <div className="pl-2">
                                    <textarea
                                      disabled
                                      placeholder="Student enters detailed answer here..."
                                      rows={4}
                                      className="w-full p-3 border rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed resize-none"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((step - 1) as Step)}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          {step < 4 ? (
            <Button
              onClick={() => setStep((step + 1) as Step)}
              disabled={!validateStep(step)}
              className="bg-[#588157] hover:bg-[#3a5a40] text-white"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#588157] hover:bg-[#3a5a40] text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Quiz
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

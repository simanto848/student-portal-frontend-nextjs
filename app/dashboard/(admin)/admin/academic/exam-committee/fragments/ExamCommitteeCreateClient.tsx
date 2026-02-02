"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Loader2, ArrowLeft, ShieldPlus } from "lucide-react";
import {
    Department,
    Batch,
} from "@/services/academic/types";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Switch } from "@/components/ui/switch";
import { addCommitteeMemberAction } from "../actions";
import { notifySuccess, notifyError } from "@/components/toast";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";

const formSchema = z.object({
    departmentId: z.string().min(1, "Department is required"),
    teacherId: z.string().min(1, "Teacher is required"),
    shift: z.enum(["day", "evening"]),
    batchId: z.string().nullable().optional(),
    status: z.boolean(),
});

type ExamCommitteeFormValues = z.infer<typeof formSchema>;

interface ExamCommitteeCreateClientProps {
    departments: Department[];
    batches: Batch[];
    teachers: any[];
}

export function ExamCommitteeCreateClient({
    departments,
    batches,
    teachers,
}: ExamCommitteeCreateClientProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ExamCommitteeFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            departmentId: "",
            teacherId: "",
            shift: "day",
            batchId: null,
            status: true,
        },
    });

    const selectedDept = form.watch("departmentId");

    const filteredBatches = useMemo(() => {
        if (!selectedDept) return batches;
        return batches.filter((b) => {
            const bDeptId = (b.departmentId && typeof b.departmentId === 'object')
                ? (b.departmentId as any).id
                : b.departmentId;
            return bDeptId === selectedDept;
        });
    }, [selectedDept, batches]);

    const departmentOptions = useMemo(() =>
        departments.map(d => ({ label: d.name, value: d.id })), [departments]);

    const teacherOptions = useMemo(() =>
        teachers.map(t => ({ label: t.fullName || t.name, value: t.id || t._id })), [teachers]);

    const batchOptions = useMemo(() => [
        { label: "General / All Batches", value: "null" },
        ...filteredBatches.map(b => ({ label: b.name, value: b.id }))
    ], [filteredBatches]);

    const handleFormSubmit = async (values: ExamCommitteeFormValues) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("departmentId", values.departmentId);
            formData.append("teacherId", values.teacherId);
            formData.append("shift", values.shift);

            const finalBatchId = values.batchId === "null" ? null : values.batchId;
            if (finalBatchId) {
                formData.append("batchId", finalBatchId);
            }

            formData.append("status", String(values.status));

            const result = await addCommitteeMemberAction(null, formData);

            if (result.success) {
                notifySuccess("Committee member assigned successfully");
                router.push("/dashboard/admin/academic/exam-committee");
            } else {
                notifyError(result.message || "Failed to assign member");
            }
        } catch (error: any) {
            notifyError(error?.message || "An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="group h-10 w-10 p-0 rounded-full hover:bg-amber-50 hover:text-amber-600 transition-all border border-slate-200 shadow-sm"
                >
                    <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                </Button>
                <PageHeader
                    title="Assign Committee Member"
                    subtitle="Scale institutional integrity by assigning qualified teachers"
                    icon={ShieldPlus}
                />
            </div>

            <Card className="border-slate-200/60 shadow-xl shadow-slate-200/40 rounded-4xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        Member Assignment Details
                    </CardTitle>
                    <CardDescription className="text-slate-500 font-medium italic">
                        Select a teacher and their corresponding department/shift to authorize committee roles.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="departmentId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-bold uppercase text-[11px] tracking-widest pl-1 mb-2 block">Selecting Department</FormLabel>
                                            <FormControl>
                                                <SearchableSelect
                                                    options={departmentOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Search Department..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="teacherId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-bold uppercase text-[11px] tracking-widest pl-1 mb-2 block">Primary Teacher</FormLabel>
                                            <FormControl>
                                                <SearchableSelect
                                                    options={teacherOptions}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Search Teacher..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="shift"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-bold uppercase text-[11px] tracking-widest pl-1 mb-2 block">Assigned Shift</FormLabel>
                                            <FormControl>
                                                <SearchableSelect
                                                    options={[
                                                        { label: "Day Shift", value: "day" },
                                                        { label: "Evening Shift", value: "evening" }
                                                    ]}
                                                    value={field.value}
                                                    onChange={(val) => field.onChange(val as "day" | "evening")}
                                                    placeholder="Select Shift"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="batchId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-700 font-bold uppercase text-[11px] tracking-widest pl-1 mb-2 block">Batch (Optional)</FormLabel>
                                            <FormControl>
                                                <SearchableSelect
                                                    options={batchOptions}
                                                    value={field.value || "null"}
                                                    onChange={field.onChange}
                                                    placeholder="Search Batch..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-3xl border border-slate-100 p-6 bg-slate-50/30">
                                        <div className="space-y-1">
                                            <FormLabel className="text-slate-900 font-bold">Active Authorization</FormLabel>
                                            <div className="text-xs text-slate-500 font-medium italic">
                                                Determines if this teacher can currently perform committee duties.
                                            </div>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-amber-600 shadow-sm"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-8 border-t border-slate-100 mt-8">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => router.back()}
                                    disabled={isSubmitting}
                                    className="rounded-2xl hover:bg-slate-100 transition-all font-bold px-8 h-12"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-12 h-12 shadow-lg shadow-slate-200 transition-all active:scale-95 font-bold flex items-center justify-center gap-2 group"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        "Finalize Assignment"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}

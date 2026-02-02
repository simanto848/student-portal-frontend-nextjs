"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
    ExamCommittee,
    Department,
    Batch,
} from "@/services/academic/types";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
    departmentId: z.string().min(1, "Department is required"),
    teacherId: z.string().min(1, "Teacher is required"),
    shift: z.enum(["day", "evening"]),
    batchId: z.string().nullable().optional(),
    status: z.boolean(),
});

type ExamCommitteeFormValues = z.infer<typeof formSchema>;

interface ExamCommitteeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ExamCommitteeFormValues) => Promise<void>;
    initialData?: ExamCommittee | null;
    departments: Department[];
    batches: Batch[];
    teachers: any[];
    isSubmitting: boolean;
}

export function ExamCommitteeFormModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    departments,
    batches,
    teachers,
    isSubmitting,
}: ExamCommitteeFormModalProps) {
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

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                form.reset({
                    departmentId: (initialData.departmentId && typeof initialData.departmentId === 'object')
                        ? (initialData.departmentId as any).id
                        : (initialData.departmentId || ""),
                    teacherId: initialData.teacherId,
                    shift: (initialData.shift as "day" | "evening") || "day",
                    batchId: (initialData.batchId && typeof initialData.batchId === 'object')
                        ? (initialData.batchId as any).id
                        : (initialData.batchId || null),
                    status: !!initialData.status,
                });
            } else {
                form.reset({
                    departmentId: "",
                    teacherId: "",
                    shift: "day",
                    batchId: null,
                    status: true,
                });
            }
        }
    }, [isOpen, initialData, form]);

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
        // Ensure "null" string from SearchableSelect is converted back to actual null
        const formattedValues = {
            ...values,
            batchId: values.batchId === "null" ? null : values.batchId
        };
        await onSubmit(formattedValues);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-slate-900">
                        {initialData ? "Edit Committee Member" : "Add Committee Member"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500">
                        {initialData
                            ? "Update member details and assignment status."
                            : "Assign a teacher to the exam committee."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="departmentId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Department</FormLabel>
                                        <FormControl>
                                            <SearchableSelect
                                                options={departmentOptions}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select department"
                                                disabled={!!initialData}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="shift"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-slate-700 font-semibold">Shift</FormLabel>
                                        <FormControl>
                                            <SearchableSelect
                                                options={[
                                                    { label: "Day", value: "day" },
                                                    { label: "Evening", value: "evening" }
                                                ]}
                                                value={field.value}
                                                onChange={(val) => field.onChange(val as "day" | "evening")}
                                                placeholder="Select shift"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="teacherId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-slate-700 font-semibold">Teacher</FormLabel>
                                    <FormControl>
                                        <SearchableSelect
                                            options={teacherOptions}
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Select teacher"
                                            disabled={!!initialData}
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
                                    <FormLabel className="text-slate-700 font-semibold">Batch (Optional)</FormLabel>
                                    <FormControl>
                                        <SearchableSelect
                                            options={batchOptions}
                                            value={field.value || "null"}
                                            onChange={field.onChange}
                                            placeholder="Select batch"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-slate-100 p-4 bg-slate-50/50">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-slate-900 font-semibold">Active Status</FormLabel>
                                        <div className="text-xs text-slate-500 italic">
                                            {field.value ? "Member is currently active" : "Member is currently inactive"}
                                        </div>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="data-[state=checked]:bg-amber-600"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="rounded-xl hover:bg-slate-100 transition-all font-semibold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl px-8 shadow-sm shadow-amber-200 transition-all active:scale-95 font-semibold"
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialData ? "Update Member" : "Assign Member"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

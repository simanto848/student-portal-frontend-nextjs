"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { assignmentService } from "@/services/classroom/assignment.service";
import { CreateAssignmentDto, UpdateAssignmentDto, Assignment, Attachment } from "@/services/classroom/types";
import { Loader2, Plus, UploadCloud, X, FileText } from "lucide-react";
import { toast } from "sonner";

interface CreateAssignmentDialogProps {
    workspaceId: string;
    assignment?: Assignment; // If provided, we are in edit mode
    trigger?: React.ReactNode;
    onSuccess?: () => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function CreateAssignmentDialog({ workspaceId, assignment, trigger, onSuccess, open: controlledOpen, onOpenChange }: CreateAssignmentDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? onOpenChange! : setInternalOpen;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [maxScore, setMaxScore] = useState(100);
    const [dueAt, setDueAt] = useState("");
    const [allowLate, setAllowLate] = useState(false);
    const [requiresFileUpload, setRequiresFileUpload] = useState(false);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const [publishImmediately, setPublishImmediately] = useState(true);

    useEffect(() => {
        if (open) {
            if (assignment) {
                setTitle(assignment.title);
                setDescription(assignment.description || "");
                setMaxScore(assignment.maxScore);
                setDueAt(assignment.dueAt ? new Date(assignment.dueAt).toISOString().slice(0, 16) : "");
                setAllowLate(assignment.allowLate);
                setRequiresFileUpload(assignment.requiresFileUpload || false);
                setAttachments(assignment.attachments || []);
                setPublishImmediately(assignment.status === 'published');
            } else {
                resetForm();
            }
        }
    }, [open, assignment]);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setMaxScore(100);
        setDueAt("");
        setDueAt("");
        setAllowLate(false);
        setRequiresFileUpload(false);
        setAttachments([]);
        setPublishImmediately(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("workspaceId", workspaceId);
        Array.from(e.target.files).forEach((file) => {
            formData.append("files", file);
        });

        try {
            const uploadedAttachments = await assignmentService.upload(formData);
            setAttachments((prev) => [...prev, ...uploadedAttachments]);
            toast.success("Files uploaded successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to upload files");
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = "";
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) {
            toast.error("Title is required");
            return;
        }

        setIsSubmitting(true);
        try {
            if (assignment) {
                const updateData: UpdateAssignmentDto = {
                    title,
                    description,
                    maxScore,
                    dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
                    allowLate,
                    requiresFileUpload,
                    attachments,
                    status: publishImmediately ? 'published' : 'draft'
                };
                await assignmentService.update(assignment.id, updateData);
                toast.success("Assignment updated successfully");
            } else {
                const createData: CreateAssignmentDto = {
                    workspaceId,
                    title,
                    description,
                    maxScore,
                    dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
                    allowLate,
                    requiresFileUpload,
                    attachments,
                    status: publishImmediately ? 'published' : 'draft'
                };
                await assignmentService.create(createData);
                toast.success("Assignment created successfully");
            }
            setOpen(false);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            toast.error(error.message || "Failed to save assignment");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger !== null && (
                <DialogTrigger asChild>
                    {trigger || (
                        <Button className="bg-[#2dd4bf] text-white hover:bg-[#25b0a0] shadow-md hover:shadow-lg hover:shadow-teal-500/20 transition-all font-bold text-xs uppercase tracking-widest rounded-xl">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Assignment
                        </Button>
                    )}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[600px] overflow-hidden rounded-[2rem] p-0 gap-0 border-none shadow-2xl">
                <DialogHeader className="p-8 bg-white border-b border-slate-100 pb-6">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                        {assignment ? "Edit Assignment" : "New Task"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">
                        {assignment ? "Modify the assignment details below." : "Create a new assignment for your students."}
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[70vh] overflow-y-auto px-8 py-6 bg-[#fafafa]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Midterm Project"
                                required
                                className="h-12 rounded-xl border-slate-200 focus:border-[#2dd4bf] focus:ring-[#2dd4bf] bg-white text-base font-semibold text-slate-800 placeholder:text-slate-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Instructions for the assignment..."
                                rows={4}
                                className="rounded-xl border-slate-200 focus:border-[#2dd4bf] focus:ring-[#2dd4bf] bg-white text-sm font-medium text-slate-700 placeholder:text-slate-400 min-h-[100px]"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Attachments</Label>
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center hover:bg-white hover:border-[#2dd4bf] transition-all relative group bg-white/50 min-h-[120px] shadow-sm">
                                <input
                                    type="file"
                                    multiple
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                />
                                <div className="p-4 flex flex-col items-center justify-center text-center w-full">
                                    {isUploading ? (
                                        <Loader2 className="h-8 w-8 text-[#2dd4bf] animate-spin" />
                                    ) : (
                                        <>
                                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-teal-50 transition-colors">
                                                <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-[#2dd4bf] transition-colors" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700">Drop files here or click to upload</p>
                                            <p className="text-xs text-slate-400 mt-1 font-medium">Support for all major file formats</p>
                                        </>
                                    )}
                                </div>
                            </div>

                            {attachments.length > 0 && (
                                <div className="grid grid-cols-1 gap-2 mt-2">
                                    {attachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-3 truncate">
                                                <div className="h-8 w-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#2dd4bf]">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div className="truncate">
                                                    <div className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{file.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{(file.size ? file.size / 1024 : 0).toFixed(0)} KB</div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(idx)}
                                                className="h-8 w-8 rounded-full flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="maxScore" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Max Score</Label>
                                <Input
                                    id="maxScore"
                                    type="number"
                                    min="0"
                                    value={maxScore}
                                    onChange={(e) => setMaxScore(parseInt(e.target.value) || 0)}
                                    className="h-12 rounded-xl border-slate-200 focus:border-[#2dd4bf] focus:ring-[#2dd4bf] bg-white text-center font-bold text-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueAt" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Due Date</Label>
                                <Input
                                    id="dueAt"
                                    type="datetime-local"
                                    value={dueAt}
                                    onChange={(e) => setDueAt(e.target.value)}
                                    className="h-12 rounded-xl border-slate-200 focus:border-[#2dd4bf] focus:ring-[#2dd4bf] bg-white font-medium text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold text-slate-800">Allow Late Submissions</Label>
                                    <p className="text-xs text-slate-400 font-medium">Students can submit after deadline</p>
                                </div>
                                <Switch checked={allowLate} onCheckedChange={setAllowLate} className="data-[state=checked]:bg-[#2dd4bf]" />
                            </div>
                            <div className="h-px bg-slate-50" />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold text-slate-800">Require File Upload</Label>
                                    <p className="text-xs text-slate-400 font-medium">Students must upload a file</p>
                                </div>
                                <Switch checked={requiresFileUpload} onCheckedChange={setRequiresFileUpload} className="data-[state=checked]:bg-[#2dd4bf]" />
                            </div>
                            <div className="h-px bg-slate-50" />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold text-slate-800">Publish Immediately</Label>
                                    <p className="text-xs text-slate-400 font-medium">Visible to students right away</p>
                                </div>
                                <Switch checked={publishImmediately} onCheckedChange={setPublishImmediately} className="data-[state=checked]:bg-[#2dd4bf]" />
                            </div>
                        </div>

                        {/* Hidden submit button to allow form submission on enter */}
                        <button type="submit" className="hidden" />
                    </form>
                </div>

                <DialogFooter className="p-6 bg-white border-t border-slate-100 gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="h-12 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="h-12 px-8 rounded-xl bg-[#2dd4bf] hover:bg-[#25b0a0] text-white font-bold shadow-lg shadow-teal-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {assignment ? "Save Changes" : (publishImmediately ? "Create & Publish" : "Create Draft")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { materialService } from "@/services/classroom/material.service";
import { CreateMaterialDto, UpdateMaterialDto, Material, MaterialType } from "@/services/classroom/types";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateMaterialDialogProps {
    workspaceId: string;
    material?: Material; // If provided, we are in edit mode
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function CreateMaterialDialog({ workspaceId, material, trigger, onSuccess }: CreateMaterialDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [type, setType] = useState<MaterialType>("text");
    const [content, setContent] = useState("");
    const [files, setFiles] = useState<File[]>([]);

    useEffect(() => {
        if (open) {
            if (material) {
                setTitle(material.title);
                setType(material.type);
                setContent(material.content || "");
            } else {
                resetForm();
            }
        }
    }, [open, material]);

    const resetForm = () => {
        setTitle("");
        setType("text");
        setContent("");
        setFiles([]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) {
            toast.error("Title is required");
            return;
        }

        if (!material && type === 'file' && files.length === 0) {
            toast.error('Please select at least one file');
            return;
        }

        setIsSubmitting(true);
        try {
            if (material) {
                const updateData: UpdateMaterialDto = {
                    title,
                    type,
                    content
                };
                await materialService.update(material.id, updateData);
                toast.success("Material updated successfully");
            } else {
                if (type === 'file') {
                    const formData = new FormData();
                    formData.append('workspaceId', workspaceId);
                    formData.append('title', title);
                    files.forEach((file) => {
                        formData.append('files', file);
                    });
                    await materialService.upload(formData);
                } else {
                    const createData: CreateMaterialDto = {
                        workspaceId,
                        title,
                        type,
                        content
                    };
                    await materialService.create(createData);
                }
                toast.success("Material created successfully");
            }
            setOpen(false);
            if (onSuccess) onSuccess();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to save material";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-[#2dd4bf] text-white hover:bg-[#25b0a0] shadow-md hover:shadow-lg hover:shadow-teal-500/20 transition-all font-bold text-xs uppercase tracking-widest rounded-xl">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Resource
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] overflow-hidden rounded-[2rem] p-0 gap-0 border-none shadow-2xl">
                <DialogHeader className="p-8 bg-white border-b border-slate-100 pb-6">
                    <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                        {material ? "Edit Material" : "Add Resource"}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">
                        {material ? "Update material details." : "Share learning resources with your students."}
                    </DialogDescription>
                </DialogHeader>

                <div className="px-8 py-6 bg-[#fafafa]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Week 1 Lecture Slides"
                                required
                                className="h-12 rounded-xl border-slate-200 focus:border-[#2dd4bf] focus:ring-[#2dd4bf] bg-white text-base font-semibold text-slate-800 placeholder:text-slate-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Resource Type</Label>
                            <Select value={type} onValueChange={(value) => setType(value as MaterialType)}>
                                <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:border-[#2dd4bf] focus:ring-[#2dd4bf] bg-white text-base font-medium text-slate-700">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                    <SelectItem value="text" className="font-medium text-slate-700 focus:bg-teal-50 focus:text-teal-700 cursor-pointer">Text / Announcement</SelectItem>
                                    <SelectItem value="link" className="font-medium text-slate-700 focus:bg-teal-50 focus:text-teal-700 cursor-pointer">External Link</SelectItem>
                                    <SelectItem value="file" className="font-medium text-slate-700 focus:bg-teal-50 focus:text-teal-700 cursor-pointer">File Upload</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {type === 'file' ? (
                            !material ? (
                                <div className="space-y-2">
                                    <Label htmlFor="files" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Upload Files</Label>
                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center hover:bg-white hover:border-[#2dd4bf] transition-all relative group bg-white/50 min-h-[120px] shadow-sm">
                                        <input
                                            id="files"
                                            type="file"
                                            multiple
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={(e) => setFiles(Array.from(e.target.files || []))}
                                        />
                                        <div className="p-4 flex flex-col items-center justify-center text-center w-full">
                                            <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-teal-50 transition-colors">
                                                <Plus className="h-5 w-5 text-slate-400 group-hover:text-[#2dd4bf] transition-colors" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-700">Drop files here or click to upload</p>
                                            {files.length > 0 && (
                                                <div className="mt-2 text-xs font-bold text-[#2dd4bf] bg-teal-50 px-2 py-1 rounded-full">
                                                    {files.length} file(s) selected
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : null
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="content" className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                                    {type === 'link' ? "URL Link" : "Content Body"}
                                </Label>
                                <Textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={type === 'link' ? "https://example.com/resource" : "Share instructions, notes, or announcements..."}
                                    rows={5}
                                    className="rounded-xl border-slate-200 focus:border-[#2dd4bf] focus:ring-[#2dd4bf] bg-white text-sm font-medium text-slate-700 placeholder:text-slate-400 min-h-[120px]"
                                />
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setOpen(false)}
                                className="h-12 rounded-xl font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-12 px-8 rounded-xl bg-[#2dd4bf] hover:bg-[#25b0a0] text-white font-bold shadow-lg shadow-teal-500/20 transition-all hover:scale-105 active:scale-95"
                            >
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {material ? "Save Changes" : "Create Material"}
                            </Button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}

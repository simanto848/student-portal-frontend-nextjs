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
                    <Button className="bg-[#3e6253] text-white hover:bg-[#2c4a3e]">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Material
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{material ? "Edit Material" : "Create Material"}</DialogTitle>
                    <DialogDescription>
                        {material ? "Update the material details." : "Share resources with your class."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Week 1 Lecture Notes"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Select value={type} onValueChange={(value) => setType(value as MaterialType)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Text / Announcement</SelectItem>
                                <SelectItem value="link">Link</SelectItem>
                                <SelectItem value="file">File</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {type === 'file' ? (
                        !material ? (
                            <div className="space-y-2">
                                <Label htmlFor="files">Files</Label>
                                <Input
                                    id="files"
                                    type="file"
                                    multiple
                                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                                />
                            </div>
                        ) : null
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="content">Content / URL</Label>
                            <Textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={type === 'link' ? "https://example.com" : "Enter content here..."}
                                rows={5}
                            />
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-[#3e6253] text-white hover:bg-[#2c4a3e]">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {material ? "Save Changes" : "Create Material"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

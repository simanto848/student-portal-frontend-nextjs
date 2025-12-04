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
import { CreateAssignmentDto, UpdateAssignmentDto, Assignment } from "@/services/classroom/types";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateAssignmentDialogProps {
    workspaceId: string;
    assignment?: Assignment; // If provided, we are in edit mode
    trigger?: React.ReactNode;
    onSuccess?: () => void;
}

export function CreateAssignmentDialog({ workspaceId, assignment, trigger, onSuccess }: CreateAssignmentDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [maxScore, setMaxScore] = useState(100);
    const [dueAt, setDueAt] = useState("");
    const [allowLate, setAllowLate] = useState(false);

    useEffect(() => {
        if (open) {
            if (assignment) {
                setTitle(assignment.title);
                setDescription(assignment.description || "");
                setMaxScore(assignment.maxScore);
                setDueAt(assignment.dueAt ? new Date(assignment.dueAt).toISOString().slice(0, 16) : "");
                setAllowLate(assignment.allowLate);
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
        setAllowLate(false);
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
                    allowLate
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
                    allowLate
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
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-[#3e6253] text-white hover:bg-[#2c4a3e]">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Assignment
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{assignment ? "Edit Assignment" : "Create Assignment"}</DialogTitle>
                    <DialogDescription>
                        {assignment ? "Update the assignment details." : "Create a new assignment for this workspace."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Midterm Project"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Instructions for the assignment..."
                            rows={3}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="maxScore">Max Score</Label>
                            <Input
                                id="maxScore"
                                type="number"
                                min="0"
                                value={maxScore}
                                onChange={(e) => setMaxScore(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dueAt">Due Date (Optional)</Label>
                            <Input
                                id="dueAt"
                                type="datetime-local"
                                value={dueAt}
                                onChange={(e) => setDueAt(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between space-x-2 border rounded-lg p-3">
                        <div className="space-y-0.5">
                            <Label className="text-base">Allow Late Submissions</Label>
                            <p className="text-xs text-muted-foreground">
                                Students can submit after the due date
                            </p>
                        </div>
                        <Switch
                            checked={allowLate}
                            onCheckedChange={setAllowLate}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-[#3e6253] text-white hover:bg-[#2c4a3e]">
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {assignment ? "Save Changes" : "Create Assignment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

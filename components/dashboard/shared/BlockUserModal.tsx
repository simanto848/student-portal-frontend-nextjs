"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Ban, AlertTriangle } from "lucide-react";

interface BlockUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => Promise<void>;
    userName: string;
    userType: string;
    isBlocking?: boolean;
}

export function BlockUserModal({
    isOpen,
    onClose,
    onConfirm,
    userName,
    userType,
    isBlocking = false,
}: BlockUserModalProps) {
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (!reason.trim()) return;

        setIsSubmitting(true);
        try {
            await onConfirm(reason);
            setReason("");
            onClose();
        } catch (error) {
            console.error("Failed to block user:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <Ban className="h-5 w-5" />
                        Block User
                    </DialogTitle>
                    <DialogDescription>
                        You are about to block <strong>{userName}</strong> ({userType}).
                        This will prevent them from logging in.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                        Blocking a user will immediately terminate their session and prevent
                        future logins. This action can be reversed by unblocking the user.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="reason">Reason for blocking *</Label>
                    <Textarea
                        id="reason"
                        placeholder="Enter the reason for blocking this user..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        This reason will be visible to the user when they try to log in.
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleConfirm}
                        disabled={!reason.trim() || isSubmitting}
                    >
                        {isSubmitting ? "Blocking..." : "Block User"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default BlockUserModal;

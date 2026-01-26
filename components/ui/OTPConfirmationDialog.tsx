"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface OTPConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (otp: string) => Promise<void>;
    title?: string;
    description?: string;
    purpose: string;
}

export default function OTPConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title = "Verify Identity",
    description = "Please confirm this action by entering the OTP sent to your email.",
    purpose,
}: OTPConfirmationDialogProps) {
    const [step, setStep] = useState<"initial" | "verify">("initial");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSendOTP = async () => {
        setLoading(true);
        setError("");
        try {
            await api.post("/user/auth/otp/generate", { purpose });
            setStep("verify");
        } catch (err: any) {
            console.error("Failed to send OTP", err);
            setError(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!otp) return;
        setLoading(true);
        setError("");
        try {
            await onConfirm(otp);
            // Reset state on success
            setStep("initial");
            setOtp("");
            onClose();
        } catch (err: any) {
            console.error("Verification failed", err);
            setError(err.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep("initial");
        setOtp("");
        setError("");
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    {step === "initial" ? (
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <p className="text-sm text-muted-foreground text-center">
                                To ensure security, we need to verify your identity. <br />
                                Click below to receive a One-Time Password (OTP) via email.
                            </p>
                            <Button onClick={handleSendOTP} disabled={loading} className="w-full">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send OTP
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Enter OTP</label>
                                <Input
                                    placeholder="Enter 6-digit code"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                />
                            </div>
                            <div className="text-sm text-center">
                                <span className="text-muted-foreground">Didn't receive code? </span>
                                <button
                                    type="button"
                                    onClick={handleSendOTP}
                                    className="text-primary hover:underline font-medium"
                                    disabled={loading}
                                >
                                    Resend
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    {step === "verify" && (
                        <Button onClick={handleVerify} disabled={!otp || loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Verify & Submit
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, RefreshCw, CheckCircle2, UserPlus, X, AlertTriangle, Upload } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PYTHON_API_URL = process.env.NEXT_PUBLIC_FACE_DETECTION;

interface FaceEnrollmentStepProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    studentId: string;
    studentDepartment: string;
    onComplete: () => void;
}

export function FaceEnrollmentStep({
    isOpen,
    onClose,
    studentName,
    studentId,
    studentDepartment,
    onComplete
}: FaceEnrollmentStepProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const [isTraining, setIsTraining] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Start Camera when component opens
    useEffect(() => {
        let stream: MediaStream | null = null;

        if (isOpen) {
            if (!navigator?.mediaDevices?.getUserMedia) {
                toast.error("Camera not supported or blocked by browser.");
                return;
            }

            navigator.mediaDevices.getUserMedia({ video: true })
                .then(s => {
                    stream = s;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => {
                    let msg = "Failed to access camera.";
                    if (err.name === 'NotAllowedError') msg = "Camera permission denied.";
                    if (err.name === 'NotFoundError') msg = "No camera found.";
                    toast.error(msg);
                });
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const remainingSlots = 10 - capturedImages.length;
        if (remainingSlots <= 0) {
            toast.info("Limit reached (10 images)");
            return;
        }

        const filesArray = Array.from(files).slice(0, remainingSlots);

        filesArray.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCapturedImages(prev => {
                    if (prev.length >= 10) return prev;
                    return [...prev, reader.result as string];
                });
            };
            reader.readAsDataURL(file);
        });

        if (files.length > remainingSlots) {
            toast.info(`Only ${remainingSlots} images were added (total limit is 10)`);
        }

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const captureImage = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        if (capturedImages.length >= 10) {
            toast.info("Limit reached (10 images)");
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Draw video frame to canvas
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImages(prev => [...prev, imageData]);
        toast.success(`Image ${capturedImages.length + 1}/10 captured`);
    };

    const handleEnroll = async () => {
        if (capturedImages.length < 5) {
            toast.warning("Please capture at least 5 images.");
            return;
        }

        setIsTraining(true);
        try {
            // 1. Send images to Python backend
            const response = await fetch(`${PYTHON_API_URL}/api/enroll`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: studentId,
                    name: studentName,
                    dept: studentDepartment,
                    images: capturedImages
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Enrollment failed");
            }

            // 2. Trigger Training
            const trainResp = await fetch(`${PYTHON_API_URL}/api/train`, {
                method: 'POST'
            });

            if (!trainResp.ok) {
                const trainData = await trainResp.json().catch(() => ({}));
                throw new Error(trainData.error || "Training failed");
            }

            toast.success("Enrollment & Training Successful!");
            onComplete();
            onClose();

        } catch (error: any) {
            console.error("Enrollment error:", error);
            toast.error(error.message || "Failed to enroll/train model");
        } finally {
            setIsTraining(false);
        }
    };

    const handleSkip = () => {
        if (confirm("Are you sure you want to skip face enrollment? The student will not be able to use Smart Attendance.")) {
            onClose();
            onComplete();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
            <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <UserPlus className="w-6 h-6 text-emerald-400" />
                        Face Enrollment
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Enroll <b>{studentName}</b> for Smart Attendance.
                        Capture at least 5 clear images of their face.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Camera Feed */}
                    <div className="space-y-4">
                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border-2 border-slate-700 shadow-xl">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* Overlay Guidelines */}
                            <div className="absolute inset-0 border-[3px] border-dashed border-emerald-500/30 m-8 rounded-full pointer-events-none opacity-50" />
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 justify-between">
                            <Button
                                variant="outline"
                                onClick={handleSkip}
                                className="border-slate-600 text-slate-400 hover:text-white w-full sm:w-auto"
                            >
                                Skip
                            </Button>

                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    multiple
                                    accept="image/*"
                                    onChange={handleUpload}
                                />
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={capturedImages.length >= 10 || isTraining}
                                    className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 font-bold rounded-xl w-full sm:w-auto"
                                >
                                    <Upload className="w-5 h-5 mr-2" />
                                    Upload
                                </Button>

                                <Button
                                    size="lg"
                                    onClick={captureImage}
                                    disabled={capturedImages.length >= 10 || isTraining}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl px-4 w-full sm:w-auto"
                                >
                                    <Camera className="w-5 h-5 mr-2" />
                                    ({capturedImages.length}/10)
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Gallery & Actions */}
                    <div className="flex flex-col h-full bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Captured Samples
                        </h4>

                        <div className="flex-1 grid grid-cols-3 gap-2 overflow-y-auto content-start min-h-[200px]">
                            {capturedImages.map((img, idx) => (
                                <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-600">
                                    <img src={img} alt={`Capture ${idx}`} className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setCapturedImages(prev => prev.filter((_, i) => i !== idx))}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {Array.from({ length: Math.max(0, 10 - capturedImages.length) }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                                    <span className="text-xs text-slate-600 font-bold">{capturedImages.length + i + 1}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-700">
                            <Button
                                onClick={handleEnroll}
                                disabled={capturedImages.length < 5 || isTraining}
                                className="w-full h-12 text-lg font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isTraining ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                        Training Model...
                                    </>
                                ) : (
                                    <>
                                        Finish Enrollment
                                    </>
                                )}
                            </Button>
                            {capturedImages.length < 5 && (
                                <p className="text-center text-xs text-amber-500/80 mt-2 font-bold flex items-center justify-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Minimum 5 images required
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

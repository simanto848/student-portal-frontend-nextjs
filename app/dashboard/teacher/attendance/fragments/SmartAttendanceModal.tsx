"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScanFace, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Enrollment } from "@/services/enrollment/enrollment.service";

const PYTHON_API_URL = "http://localhost:5000";
const CAPTURE_INTERVAL_MS = 1000; // Capture every 1 second
const ANALYSIS_DURATION_MS = 20000; // Analyze for 20 seconds

interface SmartAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    students: Enrollment[];
    onMarkAttendance: (recognizedIds: Map<string, number>) => void;
}

interface RecognizedFace {
    id: string; // Registration Number
    name: string;
    accuracy: number;
    box: [number, number, number, number];
    isLive: boolean;
}

export function SmartAttendanceModal({ isOpen, onClose, students, onMarkAttendance }: SmartAttendanceModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [recognizedStudents, setRecognizedStudents] = useState<Map<string, number>>(new Map()); // ID -> accumulated confidence
    const [currentFaces, setCurrentFaces] = useState<RecognizedFace[]>([]);

    // Start/Stop Camera
    useEffect(() => {
        let stream: MediaStream | null = null;
        if (isOpen) {
            const initCamera = async () => {
                const s = await startCamera();
                if (s) stream = s;
            };
            initCamera();
        } else {
            stopCamera();
            resetState();
        }
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen]);

    // Frame Processing Loop
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (isScanning && scanProgress < 100) {
            intervalId = setInterval(async () => {
                await processFrame();
                setScanProgress(prev => {
                    const next = prev + (100 / (ANALYSIS_DURATION_MS / CAPTURE_INTERVAL_MS));
                    return next > 100 ? 100 : next;
                });
            }, CAPTURE_INTERVAL_MS);
        } else if (scanProgress >= 100 && isScanning) {
            finishScanning();
        }

        return () => clearInterval(intervalId);
    }, [isScanning, scanProgress]);

    const startCamera = async () => {
        try {
            if (!navigator?.mediaDevices?.getUserMedia) {
                toast.error("Camera access not supported");
                return null;
            }
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            return stream;
        } catch (error) {
            console.error(error);
            toast.error("Failed to access camera");
            return null;
        }
    };

    const stopCamera = () => {
        const stream = videoRef.current?.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        if (videoRef.current) videoRef.current.srcObject = null;
    };

    const resetState = () => {
        setIsScanning(false);
        setScanProgress(0);
        setRecognizedStudents(new Map());
        setCurrentFaces([]);
    };

    const processFrame = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = canvas.toDataURL('image/jpeg');

        try {
            const res = await fetch(`${PYTHON_API_URL}/api/recognize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: imageData,
                    requireLiveness: false // Disable liveness check as requested
                })
            });
            const data = await res.json();

            if (data.faces) {
                setCurrentFaces(data.faces);
                updateRecognizedSet(data.faces);
            }
        } catch (err) {
            console.error("Recognition error:", err);
        }
    };

    const updateRecognizedSet = (faces: any[]) => {
        setRecognizedStudents(prev => {
            const next = new Map(prev);
            faces.forEach(face => {
                const isEnrolled = students.some(s => s.student?.registrationNumber === face.id);
                if (isEnrolled && face.accuracy > 40) { // Threshold 40%
                    const currentScore = next.get(face.id) || 0;
                    next.set(face.id, Math.max(currentScore, face.accuracy));
                }
            });
            return next;
        });
    };

    const finishScanning = () => {
        setIsScanning(false);
        onMarkAttendance(recognizedStudents);
    };

    const handleStart = () => {
        setRecognizedStudents(new Map());
        setScanProgress(0);
        setIsScanning(true);
    };

    return (
        <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
            <DialogContent className="max-w-4xl bg-slate-900 border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <ScanFace className="w-6 h-6 text-[#2dd4bf]" />
                        Smart Attendance Scanner
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Analyzing video feed to mark attendance automatically. Ensure students are well-lit.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="md:col-span-2 space-y-4">
                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden border-2 border-slate-700 shadow-xl">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                            <canvas ref={canvasRef} className="hidden" />

                            {/* Face Overlay Boxes */}
                            {currentFaces.map((face, idx) => {
                                // face.box is [top, right, bottom, left] from original image
                                // Video is mirrored (scale-x-[-1]), so we need to flip the horizontal coordinates visually.
                                // Actually, if we apply the boxes inside the same container that has scale-x-[-1] applied, 
                                // they will flip with it! 
                                // BUT the detected coordinates are from the *unflipped* image sent to backend.
                                // The video element is visually flipped.
                                // If we place divs absolutely on top of the video, we should probably NOT flip the container of the boxes,
                                // but flip the coordinates manually OR apply the same transform.
                                // Let's try applying the same transform to the box container? 
                                // No, the text would be backwards.

                                // Let's calculate percentages based on the canvas size used for sending.
                                const videoWidth = canvasRef.current?.width || 640;
                                const videoHeight = canvasRef.current?.height || 480;

                                const [top, right, bottom, left] = face.box;
                                const width = right - left;
                                const height = bottom - top;

                                // Calculate percentages
                                const topPct = (top / videoHeight) * 100;
                                const leftPct = (left / videoWidth) * 100;
                                const widthPct = (width / videoWidth) * 100;
                                const heightPct = (height / videoHeight) * 100;

                                // Since the video is mirrored with scale-x-[-1], to align the box:
                                // The visual "left" is actually (100 - rightPct)%
                                // simpler: (100 - (leftPct + widthPct))%
                                const visualLeftPct = 100 - (leftPct + widthPct);

                                const isUnknown = face.name === "Unknown" || face.accuracy < 40;
                                const color = isUnknown ? "#ef4444" : "#2dd4bf"; // Red or Teal

                                return (
                                    <div
                                        key={idx}
                                        className="absolute border-2 flex items-end justify-center pointer-events-none transition-all duration-200"
                                        style={{
                                            top: `${topPct}%`,
                                            left: `${visualLeftPct}%`,
                                            width: `${widthPct}%`,
                                            height: `${heightPct}%`,
                                            borderColor: color,
                                            zIndex: 10
                                        }}
                                    >
                                        <div
                                            className="bg-black/70 text-white text-[10px] px-1 py-0.5 rounded-b mb-[-20px] whitespace-nowrap"
                                        >
                                            {face.name} ({face.accuracy.toFixed(0)}%)
                                        </div>
                                    </div>
                                );
                            })}

                            {isScanning && (
                                <div className="absolute inset-0 border-[4px] border-[#2dd4bf]/50 animate-pulse pointer-events-none" />
                            )}
                        </div>

                        {/* Progress Bar */}
                        {isScanning && (
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#2dd4bf] transition-all duration-1000 ease-linear"
                                    style={{ width: `${scanProgress}%` }}
                                />
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <p className="text-sm font-bold text-slate-400">
                                {isScanning ? "Scanning..." : "Ready to scan"}
                            </p>
                            {!isScanning ? (
                                <Button
                                    onClick={handleStart}
                                    className="bg-[#2dd4bf] hover:bg-[#26b3a2] text-white font-bold"
                                >
                                    Start Analysis
                                </Button>
                            ) : (
                                <Button
                                    onClick={finishScanning}
                                    variant="destructive"
                                >
                                    Stop & Apply
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex flex-col h-full max-h-[400px]">
                        <h3 className="font-bold text-slate-300 uppercase tracking-wider text-xs mb-3 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Recognized ({recognizedStudents.size})
                        </h3>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {Array.from(recognizedStudents.entries()).map(([regNum, conf]) => {
                                const student = students.find(s => s.student?.registrationNumber === regNum);
                                return (
                                    <div key={regNum} className="flex items-center gap-3 bg-slate-800 p-2 rounded-lg border border-slate-700/50">
                                        <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                            {student?.student?.fullName?.[0] || "?"}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-bold text-slate-200 truncate">{student?.student?.fullName || regNum}</p>
                                            <p className="text-xs text-[#2dd4bf] font-mono">{conf.toFixed(0)}% Match</p>
                                        </div>
                                    </div>
                                );
                            })}
                            {recognizedStudents.size === 0 && (
                                <p className="text-xs text-slate-500 italic text-center mt-10">
                                    No students recognized yet.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

"use client";

import { useEffect, useState } from "react";
import { batchService } from "@/services/academic/batch.service";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Archive, ArrowRight, Sparkles } from "lucide-react";
import { Workspace } from "@/services/classroom/types";
import { motion } from "framer-motion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ClassroomCardProps {
    workspace: Workspace;
    onEnter: (id: string) => void;
    onArchive: (id: string) => void;
}

export function ClassroomCard({ workspace, onEnter, onArchive }: ClassroomCardProps) {
    const [shift, setShift] = useState<string>("");

    useEffect(() => {
        if (workspace.batchId) {
            batchService.getBatchById(workspace.batchId)
                .then(batch => setShift(batch.shift || ""))
                .catch(err => console.error("Failed to fetch batch shift", err));
        }
    }, [workspace.batchId]);

    const displayShift = shift?.toLowerCase() === "day" ? "D" : shift?.toLowerCase() === "evening" ? "E" : shift;

    return (
        <motion.div
            whileHover={{ y: -8 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            <Card className="glass-panel group relative overflow-hidden rounded-[2.5rem] transition-all border border-white/50 dark:border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-teal-500/10">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                    <BookOpen className="w-24 h-24 text-slate-900 dark:text-slate-100" />
                </div>

                <CardHeader className="pb-4 relative z-10">
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-[#2dd4bf]/10 text-[#2dd4bf] border-teal-100/20 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                                    Active Room
                                </Badge>
                                {workspace.courseCode && (
                                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 rounded-md">
                                        {workspace.courseCode}
                                    </span>
                                )}
                            </div>
                            <CardTitle className="text-xl font-bold text-slate-800 dark:text-white tracking-tight line-clamp-2 leading-tight">
                                {workspace.courseName || workspace.title}
                            </CardTitle>
                            {workspace.batchName && (
                                <p className="text-base font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                                    <Users className="w-3.5 h-3.5 text-[#2dd4bf]" />
                                    {displayShift ? `${displayShift}-` : ""}{workspace.batchName}
                                    {workspace.semester ? <span className="text-slate-300 dark:text-slate-600 mx-1">•</span> : ""}
                                    {workspace.semester ? `Semester ${workspace.semester}` : ""}
                                </p>
                            )}
                        </div>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-10 w-10 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all active:scale-90 shadow-sm"
                                >
                                    <Archive className="h-5 w-5" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-white">Archive Classroom?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                                        This will move the classroom to the archive. Students will no longer be able to submit assignments. You can restore it later if needed.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="h-12 rounded-xl font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => onArchive(workspace.id)}
                                        className="h-12 rounded-xl bg-rose-500 hover:bg-rose-600 font-bold"
                                    >
                                        Archive Session
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>

                <CardContent className="py-2 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Total Students</p>
                            <p className="text-lg font-bold text-[#2dd4bf] tracking-tighter">{workspace.totalBatchStudents || 0}</p>
                        </div>
                        <div className="h-8 w-[1px] bg-slate-100 dark:bg-slate-700" />
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Stream Status</p>
                            <div className="flex items-center gap-1.5">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-sm font-bold text-emerald-500 tracking-tight">ENGAGED</p>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="pt-6 pb-8 relative z-10">
                    <Button
                        className="w-full h-14 rounded-2xl bg-[#2dd4bf] hover:bg-[#26b8a5] text-white font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-teal-500/20 transition-all active:scale-95 group/btn"
                        onClick={() => onEnter(workspace.id)}
                    >
                        <Sparkles className="w-4 h-4 text-white group-hover/btn:rotate-12 transition-transform" />
                        Enter Classroom
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

"use client";

import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Users, BookOpen, Loader2 } from "lucide-react";
import { PendingWorkspace } from "@/services/classroom/types";
import { motion } from "framer-motion";

interface PendingClassroomCardProps {
    pending: PendingWorkspace;
    onCreate: (pending: PendingWorkspace) => void;
    isCreating: boolean;
}

export function PendingClassroomCard({ pending, onCreate, isCreating }: PendingClassroomCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <Card className="glass-panel group relative overflow-hidden rounded-[2.5rem] transition-all border border-orange-200/50 dark:border-orange-900/20 bg-orange-50/30 dark:bg-orange-950/10 hover:shadow-xl hover:shadow-orange-500/5">
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-orange-100/50 blur-2xl group-hover:bg-orange-200/50 transition-colors" />

                <CardHeader className="pb-4 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-white dark:bg-slate-800 text-orange-500 border-orange-100 dark:border-orange-900/30 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">
                                Awaiting Hub
                            </Badge>
                            {pending.courseCode && (
                                <span className="text-xs font-bold text-orange-400/70 uppercase tracking-widest px-2 py-0.5 rounded-md">
                                    {pending.courseCode}
                                </span>
                            )}
                        </div>
                        <CardTitle className="text-lg font-bold text-slate-800 dark:text-white tracking-tight line-clamp-2 leading-tight">
                            {pending.courseName || "Untitled Course"}
                        </CardTitle>
                        <div className="flex flex-col gap-1 mt-2">
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-orange-400" />
                                {pending.batchName}
                            </p>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-orange-400" />
                                Semester {pending.semester}
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardFooter className="pt-4 pb-8 relative z-10">
                    <Button
                        onClick={() => onCreate(pending)}
                        disabled={isCreating}
                        className="w-full h-12 rounded-2xl bg-white dark:bg-slate-800 border-2 border-orange-100 dark:border-orange-900/30 text-orange-500 hover:bg-orange-500 hover:text-white hover:border-orange-500 font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 group/btn"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Initializing...
                            </>
                        ) : (
                            <>
                                <PlusCircle className="w-4 h-4 group-hover/btn:rotate-90 transition-transform duration-300" />
                                Start Classroom
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}

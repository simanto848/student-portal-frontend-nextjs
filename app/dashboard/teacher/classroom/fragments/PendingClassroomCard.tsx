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
            <Card className="group relative overflow-hidden border-2 border-dashed border-indigo-200 bg-indigo-50/20 rounded-[2.5rem] transition-all hover:bg-indigo-50/40 hover:border-indigo-400/50">
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-indigo-100/50 blur-2xl group-hover:bg-indigo-200/50 transition-colors" />

                <CardHeader className="pb-4 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-white text-indigo-700 border-indigo-100 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                                Awaiting Hub
                            </Badge>
                            {pending.courseCode && (
                                <span className="text-[10px] font-bold text-indigo-400/70 uppercase tracking-widest px-2 py-0.5 rounded-md">
                                    {pending.courseCode}
                                </span>
                            )}
                        </div>
                        <CardTitle className="text-lg font-black text-slate-900 tracking-tight line-clamp-2 leading-tight">
                            {pending.courseName || "Untitled Course"}
                        </CardTitle>
                        <div className="flex flex-col gap-1 mt-2">
                            <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-indigo-400" />
                                {pending.batchName}
                            </p>
                            <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                                Semester {pending.semester}
                            </p>
                        </div>
                    </div>
                </CardHeader>

                <CardFooter className="pt-4 pb-8 relative z-10">
                    <Button
                        onClick={() => onCreate(pending)}
                        disabled={isCreating}
                        className="w-full h-12 rounded-2xl bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 group/btn"
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

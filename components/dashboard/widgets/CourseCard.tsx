import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface CourseCardProps {
    title: string;
    code?: string;
    batchName?: string;
    studentCount: number;
    progress: {
        current: number;
        total: number;
        label: string;
    };
    variant?: "teacher" | "student";
}

export function CourseCard({ title, code, batchName, studentCount, progress, variant = "teacher" }: CourseCardProps) {
    const percentage = (progress.current / progress.total) * 100;

    return (
        <Card className="bg-white/70 backdrop-blur-xl border-2 border-slate-100 rounded-[2rem] shadow-xl shadow-slate-200/40 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                <span className="text-8xl font-black">{code?.substring(0, 2)}</span>
            </div>

            <CardHeader className="pb-4 relative z-10">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5">
                        <CardTitle className="text-xl font-black text-slate-800 tracking-tight leading-7 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {title}
                        </CardTitle>
                        {batchName && (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 w-fit">
                                <span className="text-[10px] font-black uppercase tracking-widest">{batchName}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{studentCount} Students Induced</p>
                </div>
            </CardHeader>
            <CardContent className="pb-6 relative z-10">
                <div className="flex justify-between text-[11px] mb-3 font-black text-slate-400 uppercase tracking-widest">
                    <span>{progress.label}</span>
                    <span className="text-indigo-600">{Math.round(percentage)}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-indigo-600 rounded-full shadow-lg shadow-indigo-200"
                    />
                </div>
            </CardContent>
            <CardFooter className="pt-0 relative z-10">
                <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-black tracking-tight transition-all active:scale-95 shadow-xl shadow-slate-200/40">
                    Access Portal
                </Button>
            </CardFooter>
        </Card>
    );
}

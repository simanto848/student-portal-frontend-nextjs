"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Edit, Trash2, Calendar, Link as LinkIcon, Download } from "lucide-react";
import { Assignment, Material } from "@/services/classroom/types";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

interface ClassworkCardProps {
    item: Assignment | Material;
    type: "assignment" | "material";
    onEdit: (item: any) => void;
    onDelete: (id: string) => void;
    onDownload?: (item: Material, index: number) => void;
}

export function ClassworkCard({ item, type, onEdit, onDelete, onDownload }: ClassworkCardProps) {
    const theme = useDashboardTheme();
    const isAssignment = type === "assignment";
    const assignment = isAssignment ? (item as Assignment) : null;
    const material = !isAssignment ? (item as Material) : null;

    return (
        <motion.div
            whileHover={{ scale: 1.005, x: 4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <Card className={`group border border-slate-200 bg-white hover:${theme.colors.accent.primary.replace('text-', 'border-')}/30 hover:shadow-xl hover:shadow-slate-200/40 transition-all rounded-[2rem] overflow-hidden`}>
                <CardContent className="p-5 flex items-center gap-5">
                    <div className={`h-12 w-12 rounded-2xl shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${isAssignment
                        ? `${theme.colors.accent.primary.replace('text-', 'bg-')}/10 ${theme.colors.accent.primary} shadow-sm`
                        : "bg-slate-50 text-slate-600 shadow-sm"
                        }`}>
                        {isAssignment ? (
                            <FileText className="h-6 w-6" />
                        ) : (
                            <BookOpen className="h-6 w-6" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${isAssignment ? `${theme.colors.accent.primary.replace('text-', 'bg-')}/10 ${theme.colors.accent.primary}` : "bg-slate-100 text-slate-600"
                                }`}>
                                {type}
                            </span>
                            {isAssignment && assignment?.dueAt && (
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-md">
                                    <Calendar className="w-3 h-3" />
                                    Due {format(new Date(assignment.dueAt), "MMM d, yyyy")}
                                </div>
                            )}
                        </div>

                        <h4 className="text-base font-black text-slate-900 truncate tracking-tight pr-4">
                            {item.title}
                        </h4>

                        {material && (
                            <div className="mt-2 text-xs font-medium text-slate-500 line-clamp-1">
                                {material.type === "link" && (
                                    <div className={`flex items-center gap-1 ${theme.colors.accent.primary}`}>
                                        <LinkIcon className="w-3 h-3" />
                                        {material.content}
                                    </div>
                                )}
                                {material.type === "file" && material.attachments?.length ? (
                                    <div className="flex items-center gap-1 text-emerald-600">
                                        <Download className="w-3 h-3" />
                                        {material.attachments.length} attachment(s)
                                    </div>
                                ) : null}
                                {material.type === "text" && material.content}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pr-1">
                        <Button
                            variant="secondary"
                            size="icon"
                            className={`h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:${theme.colors.accent.primary} hover:${theme.colors.accent.primary.replace('text-', 'bg-')}/10 transition-all active:scale-90`}
                            onClick={() => onEdit(item)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90"
                            onClick={() => onDelete(item.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Folder,
    FolderOpen,
    FileText,
    FileImage,
    FileVideo,
    FileAudio,
    File,
    Download,
    ChevronDown,
    ChevronUp,
    Edit,
    Trash2,
    Link as LinkIcon,
    ExternalLink,
    Eye,
} from "lucide-react";
import { Material, Attachment } from "@/services/classroom/types";
import { motion, AnimatePresence } from "framer-motion";

interface MaterialFolderCardProps {
    material: Material;
    onDownload: (material: Material, index: number) => void;
    onPreview?: (material: Material, index: number) => void;
    onEdit?: (material: Material) => void;
    onDelete?: (id: string) => void;
    variant?: "teacher" | "student";
}

// Get appropriate icon for file type
const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const imageExts = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
    const videoExts = ["mp4", "webm", "mov", "avi", "mkv"];
    const audioExts = ["mp3", "wav", "ogg", "flac", "aac"];
    const docExts = ["pdf", "doc", "docx", "txt", "rtf", "odt"];

    if (imageExts.includes(ext)) return FileImage;
    if (videoExts.includes(ext)) return FileVideo;
    if (audioExts.includes(ext)) return FileAudio;
    if (docExts.includes(ext)) return FileText;
    return File;
};

// Format file size
const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function MaterialFolderCard({
    material,
    onDownload,
    onPreview,
    onEdit,
    onDelete,
    variant = "student",
}: MaterialFolderCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const hasAttachments = material.attachments && material.attachments.length > 0;
    const isLink = material.type === "link";
    const isText = material.type === "text";
    const fileCount = material.attachments?.length || 0;

    return (
        <motion.div
            whileHover={{ scale: 1.002 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            <Card
                className={`group border-2 overflow-hidden transition-all duration-300 p-0 ${isExpanded
                    ? "border-cyan-200 shadow-xl shadow-cyan-100/40 rounded-[2rem]"
                    : "border-slate-100 hover:border-slate-200 hover:shadow-lg rounded-[2rem]"
                    }`}
            >
                {/* Folder Header */}
                <div
                    className={`p-5 cursor-pointer transition-colors ${isExpanded ? "bg-gradient-to-r from-cyan-50/50 to-white" : "bg-white hover:bg-slate-50/50"
                        }`}
                    onClick={() => hasAttachments && setIsExpanded(!isExpanded)}
                >
                    <div className="flex items-center gap-4">
                        {/* Folder Icon */}
                        <div
                            className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${isExpanded
                                ? "bg-cyan-500 text-white shadow-lg shadow-cyan-200"
                                : "bg-slate-100 text-slate-500 group-hover:bg-cyan-50 group-hover:text-cyan-600"
                                }`}
                        >
                            {isLink ? (
                                <LinkIcon className="h-6 w-6" />
                            ) : isExpanded ? (
                                <FolderOpen className="h-7 w-7" />
                            ) : (
                                <Folder className="h-7 w-7" />
                            )}
                        </div>

                        {/* Title & Meta */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <Badge
                                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isLink
                                        ? "bg-indigo-100 text-indigo-600"
                                        : isText
                                            ? "bg-amber-100 text-amber-600"
                                            : "bg-slate-100 text-slate-600"
                                        }`}
                                >
                                    {material.type}
                                </Badge>
                                {hasAttachments && (
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {fileCount} {fileCount === 1 ? "file" : "files"}
                                    </span>
                                )}
                            </div>
                            <h4 className="text-base font-black text-slate-900 tracking-tight truncate pr-4">
                                {material.title}
                            </h4>

                            {/* Link Preview */}
                            {isLink && material.content && (
                                <a
                                    href={material.content}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 mt-2 text-[10px] font-bold text-cyan-600 hover:text-cyan-700 uppercase tracking-widest group/link"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    <span className="truncate max-w-[200px]">{material.content}</span>
                                </a>
                            )}

                            {/* Content Preview (Text or File Description) */}
                            {(isText || !isLink) && material.content && (
                                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                                    {material.content}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Teacher Actions */}
                            {variant === "teacher" && (
                                <>
                                    {onEdit && (
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(material);
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(material.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </>
                            )}

                            {/* Expand/Collapse Button */}
                            {hasAttachments && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-10 w-10 rounded-xl transition-all ${isExpanded
                                        ? "bg-cyan-100 text-cyan-600"
                                        : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                                        }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsExpanded(!isExpanded);
                                    }}
                                >
                                    {isExpanded ? (
                                        <ChevronUp className="h-5 w-5" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expanded File List */}
                <AnimatePresence>
                    {isExpanded && hasAttachments && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="px-5 pb-5 pt-0">
                                <div className="border-t-2 border-dashed border-slate-100 pt-4">
                                    <div className="space-y-2">
                                        {material.attachments?.map((attachment, idx) => {
                                            const FileIcon = getFileIcon(attachment.name);
                                            const ext = attachment.name.split('.').pop()?.toLowerCase();
                                            const isPreviewable = ext === 'pdf' || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'doc', 'docx'].includes(ext || "");

                                            return (
                                                <motion.div
                                                    key={attachment.id || `${material.id}-${idx}`}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 hover:bg-cyan-50/70 group/file transition-all"
                                                >
                                                    {/* File Icon */}
                                                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/file:text-cyan-500 group-hover/file:border-cyan-200 transition-all shadow-sm">
                                                        <FileIcon className="h-5 w-5" />
                                                    </div>

                                                    {/* File Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-700 truncate group-hover/file:text-cyan-700 transition-colors">
                                                            {attachment.name}
                                                        </p>
                                                        {attachment.size && (
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                                {formatFileSize(attachment.size)}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-2">
                                                        {isPreviewable && onPreview && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-9 px-3 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-cyan-600 hover:border-cyan-200 hover:bg-cyan-50 font-bold text-[10px] uppercase tracking-widest transition-all shadow-sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onPreview(material, idx);
                                                                }}
                                                            >
                                                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                                                View
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-cyan-600 hover:border-cyan-200 hover:bg-cyan-50 transition-all shadow-sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDownload(material, idx);
                                                            }}
                                                            title="Download"
                                                        >
                                                            <Download className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    );
}

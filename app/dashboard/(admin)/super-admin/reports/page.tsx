"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
    FileText, 
    Download, 
    Calendar, 
    BarChart3, 
    Users, 
    BookOpen,
    TrendingUp,
    Clock,
    CheckCircle,
    FileSpreadsheet,
    PieChart,
    Activity
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { StatsCard } from "@/components/dashboard/shared/StatsCard";
import { cn } from "@/lib/utils";

interface Report {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    frequency: string;
    lastGenerated: string;
    category: string;
    color: string;
}

const reports: Report[] = [
    {
        id: "r1",
        title: "Monthly User Activity",
        description: "Comprehensive summary of user logins, registrations, and active sessions with engagement metrics.",
        icon: Users,
        frequency: "Monthly",
        lastGenerated: "2024-06-01",
        category: "User Analytics",
        color: "blue"
    },
    {
        id: "r2",
        title: "Course Enrollment Analysis",
        description: "Detailed breakdown of course popularity, drop rates, completion rates, and department performance.",
        icon: BookOpen,
        frequency: "Quarterly",
        lastGenerated: "2024-04-01",
        category: "Academic",
        color: "green"
    },
    {
        id: "r3",
        title: "System Performance Audit",
        description: "Technical report on server uptime, error rates, API latency trends, and resource utilization.",
        icon: BarChart3,
        frequency: "Daily",
        lastGenerated: "Today",
        category: "Technical",
        color: "purple"
    },
    {
        id: "r4",
        title: "Financial Overview",
        description: "Revenue from paid courses, resource allocations, operational costs, and budget analysis.",
        icon: FileSpreadsheet,
        frequency: "Monthly",
        lastGenerated: "2024-06-01",
        category: "Financial",
        color: "amber"
    },
    {
        id: "r5",
        title: "User Growth Trends",
        description: "Analysis of user acquisition, retention rates, and growth patterns across all user types.",
        icon: TrendingUp,
        frequency: "Weekly",
        lastGenerated: "2024-06-15",
        category: "User Analytics",
        color: "indigo"
    },
    {
        id: "r6",
        title: "System Usage Statistics",
        description: "Platform utilization metrics, feature adoption rates, and user behavior patterns.",
        icon: PieChart,
        frequency: "Monthly",
        lastGenerated: "2024-06-01",
        category: "Technical",
        color: "cyan"
    }
];

const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
        case "Daily": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
        case "Weekly": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
        case "Monthly": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
        case "Quarterly": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
        default: return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    }
};

const getCategoryColor = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
        blue: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
        green: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-600 dark:text-green-400", border: "border-green-200 dark:border-green-800" },
        purple: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
        amber: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-600 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
        indigo: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-200 dark:border-indigo-800" },
        cyan: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-200 dark:border-cyan-800" },
    };
    return colors[color] || colors.blue;
};

export default function SystemReportsPage() {
    const [generating, setGenerating] = useState<string | null>(null);
    const [generatedReports, setGeneratedReports] = useState<Set<string>>(new Set());

    const handleGenerate = async (id: string) => {
        setGenerating(id);
        // Simulate generation delay
        setTimeout(() => {
            setGenerating(null);
            setGeneratedReports(prev => new Set(prev).add(id));
            toast.success("Report generated successfully. Download starting...");
        }, 2000);
    };

    const stats = {
        total: reports.length,
        monthly: reports.filter(r => r.frequency === "Monthly").length,
        generated: generatedReports.size,
        categories: new Set(reports.map(r => r.category)).size
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <PageHeader
                title="System Reports"
                subtitle="Generate and download comprehensive system analytics and performance reports"
                icon={FileText}
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Reports"
                    value={stats.total}
                    icon={FileText}
                    className="border-l-4 border-l-slate-400"
                    iconClassName="text-slate-500"
                    iconBgClassName="bg-slate-500/10"
                />
                <StatsCard
                    title="Monthly Reports"
                    value={stats.monthly}
                    icon={Calendar}
                    className="border-l-4 border-l-purple-500"
                    iconClassName="text-purple-500"
                    iconBgClassName="bg-purple-500/10"
                />
                <StatsCard
                    title="Generated Today"
                    value={stats.generated}
                    icon={CheckCircle}
                    className="border-l-4 border-l-green-500"
                    iconClassName="text-green-500"
                    iconBgClassName="bg-green-500/10"
                />
                <StatsCard
                    title="Categories"
                    value={stats.categories}
                    icon={Activity}
                    className="border-l-4 border-l-blue-500"
                    iconClassName="text-blue-500"
                    iconBgClassName="bg-blue-500/10"
                />
            </div>

            {/* Reports Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {reports.map((report, index) => {
                        const colors = getCategoryColor(report.color);
                        const isGenerated = generatedReports.has(report.id);
                        const isGenerating = generating === report.id;
                        
                        return (
                            <motion.div
                                key={report.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className={cn(
                                    "flex flex-col h-full border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300",
                                    colors.border
                                )}>
                                    <CardHeader className="flex flex-row items-start gap-4 pb-3">
                                        <div className={cn(
                                            "p-3 rounded-xl shrink-0",
                                            colors.bg
                                        )}>
                                            <report.icon className={cn("h-6 w-6", colors.text)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <CardTitle className="text-lg">{report.title}</CardTitle>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getFrequencyColor(report.frequency)}>
                                                    {report.frequency}
                                                </Badge>
                                                <Badge variant="outline" className="text-xs">
                                                    {report.category}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                                            {report.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                <span>Last: {report.lastGenerated}</span>
                                            </div>
                                            {isGenerated && (
                                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                    <CheckCircle className="h-3 w-3" />
                                                    <span>Generated</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0">
                                        <Button
                                            className={cn(
                                                "w-full transition-all duration-300",
                                                isGenerated 
                                                    ? "bg-green-600 hover:bg-green-700 text-white" 
                                                    : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900"
                                            )}
                                            onClick={() => handleGenerate(report.id)}
                                            disabled={isGenerating}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <motion.div
                                                        animate={{ rotate: 360 }}
                                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                        className="h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"
                                                    />
                                                    Generating...
                                                </>
                                            ) : isGenerated ? (
                                                <>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download Again
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Generate & Download
                                                </>
                                            )}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Info Card */}
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-slate-50/50 dark:bg-slate-900/50">
                <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                            <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                                Report Generation
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Reports are generated in real-time and include the latest data from the system. 
                                Generated reports are available for download immediately and remain accessible for 30 days.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

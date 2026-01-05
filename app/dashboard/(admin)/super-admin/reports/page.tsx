"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, BarChart3, Users, BookOpen } from "lucide-react";
import { toast } from "sonner";

export default function SystemReportsPage() {
    const [generating, setGenerating] = useState<string | null>(null);

    const reports = [
        {
            id: "r1",
            title: "Monthly User Activity",
            description: "Comprehensive summary of user logins, registrations, and active sessions.",
            icon: Users,
            frequency: "Monthly",
            lastGenerated: "2024-06-01"
        },
        {
            id: "r2",
            title: "Course Enrollment Analysis",
            description: "Detailed breakdown of course popularity, drop rates, and department performance.",
            icon: BookOpen,
            frequency: "Quarterly",
            lastGenerated: "2024-04-01"
        },
        {
            id: "r3",
            title: "System Performance Audit",
            description: "Technical report on server uptime, error rates, and API latency trends.",
            icon: BarChart3,
            frequency: "Daily",
            lastGenerated: "Today"
        },
        {
            id: "r4",
            title: "Financial Overview",
            description: "Revenue from paid courses, resource allocations, and operational costs.",
            icon: FileText,
            frequency: "Monthly",
            lastGenerated: "2024-06-01"
        }
    ];

    const handleGenerate = async (id: string) => {
        setGenerating(id);
        // Simulate generation delay
        setTimeout(() => {
            setGenerating(null);
            toast.success("Report generated successfully. Download starting...");
        }, 2000);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Reports</h1>
                    <p className="text-muted-foreground">Generate and download comprehensive system analytics</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {reports.map((report) => (
                        <Card key={report.id} className="flex flex-col">
                            <CardHeader className="flex flex-row items-center gap-4 pb-2">
                                <div className="bg-primary/10 p-3 rounded-lg">
                                    <report.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>{report.title}</CardTitle>
                                    <CardDescription>{report.frequency} Report</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-muted-foreground mb-4">
                                    {report.description}
                                </p>
                                <div className="flex items-center text-xs text-muted-foreground">
                                    <Calendar className="mr-1 h-3 w-3" />
                                    Last generated: {report.lastGenerated}
                                </div>
                            </CardContent>
                            <CardFooter className="pt-0">
                                <Button
                                    className="w-full"
                                    variant="outline"
                                    onClick={() => handleGenerate(report.id)}
                                    disabled={generating === report.id}
                                >
                                    {generating === report.id ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current mr-2"></div>
                                            Generating...
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
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

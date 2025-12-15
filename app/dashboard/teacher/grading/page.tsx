"use client";

import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  DashboardHero,
  DashboardSkeleton,
} from "@/components/dashboard/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useRouter } from "next/navigation";
import {
  FileText,
  ArrowRight,
  AlertCircle,
  GraduationCap,
  ClipboardList,
} from "lucide-react";
import { useGradingWorkflowDashboard } from "@/hooks/queries/useTeacherQueries";
import { ResultWorkflow } from "@/services/enrollment/courseGrade.service";

type TabValue = "all" | "pending" | "submitted" | "returned" | "approved";

export default function GradingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>("all");

  // Use React Query hook for grading workflow
  const {
    all,
    pending,
    submitted,
    returned,
    approved,
    isLoading,
    isError,
    error,
    refetch,
  } = useGradingWorkflowDashboard();

  // Get workflows based on active tab
  const currentWorkflows = useMemo(() => {
    switch (activeTab) {
      case "pending":
        return pending;
      case "submitted":
        return submitted;
      case "returned":
        return returned;
      case "approved":
        return approved;
      default:
        return all;
    }
  }, [activeTab, all, pending, submitted, returned, approved]);

  // Calculate stats for hero
  const stats = useMemo(() => {
    return {
      total: all.length,
      pending: pending.length,
      submitted: submitted.length,
      returned: returned.length,
      approved: approved.length,
    };
  }, [all, pending, submitted, returned, approved]);

  // Loading state using DashboardSkeleton
  if (isLoading) {
    return <DashboardSkeleton layout="hero-table" rowCount={6} />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Section using DashboardHero component */}
        <DashboardHero
          icon={ClipboardList}
          label="Grading Workflow"
          title="Track and manage result submissions"
          description="View the status of your grade submissions and take action on returned items."
          actions={
            <>
              <Button
                size="sm"
                className="bg-white text-[#1a3d32] hover:bg-white/90 shadow-md"
                onClick={() => router.push("/dashboard/teacher/courses")}
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Input New Grades
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10"
                onClick={() => refetch()}
              >
                Refresh
              </Button>
            </>
          }
          stats={{
            label: "Total Workflows",
            value: stats.total.toString(),
            subtext: "submissions",
          }}
        >
          <div className="flex gap-4 mt-2 text-xs text-white/70">
            <span>Pending: {stats.pending}</span>
            <span>Submitted: {stats.submitted}</span>
            <span>Returned: {stats.returned}</span>
            <span>Approved: {stats.approved}</span>
          </div>
        </DashboardHero>

        {/* Error Alert */}
        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "Failed to load grading workflow."}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
          className="w-full"
        >
          <TabsList>
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="submitted">
              Submitted ({stats.submitted})
            </TabsTrigger>
            <TabsTrigger value="returned">
              Returned ({stats.returned})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({stats.approved})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <WorkflowTable workflows={currentWorkflows} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Workflow Table sub-component
function WorkflowTable({ workflows }: { workflows: ResultWorkflow[] }) {
  const router = useRouter();

  if (workflows.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground space-y-4">
          <FileText className="h-12 w-12 opacity-20" />
          <p>No grading workflows found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Action By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workflows.map((workflow) => (
            <WorkflowRow
              key={workflow.id}
              workflow={workflow}
              onView={() =>
                router.push(
                  `/dashboard/teacher/courses/${workflow.grade?.courseId}`,
                )
              }
            />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

// Workflow Row sub-component
function WorkflowRow({
  workflow,
  onView,
}: {
  workflow: ResultWorkflow;
  onView: () => void;
}) {
  const courseName = workflow.grade?.course?.name || "Unknown Course";
  const courseCode = workflow.grade?.course?.code || "";

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="dashboard-title">{courseName}</span>
          {courseCode && (
            <span className="text-xs text-muted-foreground">{courseCode}</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={workflow.status} />
      </TableCell>
      <TableCell className="text-muted-foreground">
        {workflow.actionBy || "—"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {workflow.actionAt
          ? new Date(workflow.actionAt).toLocaleDateString()
          : "—"}
      </TableCell>
      <TableCell>
        <Button size="sm" variant="ghost" onClick={onView}>
          View <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

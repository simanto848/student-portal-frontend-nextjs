"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  assessmentService,
  Assessment,
} from "@/services/enrollment/assessment.service";
import { Loader2, Plus, Edit, Trash2, Eye, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface AssessmentViewProps {
  courseId: string;
  batchId: string;
}

export function AssessmentView({ courseId, batchId }: AssessmentViewProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssessments();
  }, [courseId, batchId]);

  const fetchAssessments = async () => {
    setIsLoading(true);
    try {
      const data = await assessmentService.list({ courseId, batchId });
      setAssessments(data.assessments || []);
    } catch (error) {
      toast.error("Failed to fetch assessments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;
    try {
      await assessmentService.delete(id);
      toast.success("Assessment deleted");
      fetchAssessments();
    } catch (error) {
      toast.error("Failed to delete assessment");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await assessmentService.publish(id);
      toast.success("Assessment published");
      fetchAssessments();
    } catch (error) {
      toast.error("Failed to publish assessment");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Assessments</CardTitle>
            <Button className="bg-[#3e6253] hover:bg-[#2c463b]">
              <Plus className="mr-2 h-4 w-4" />
              Create Assessment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Total Marks</TableHead>
                  <TableHead>Weightage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.length > 0 ? (
                  assessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">
                        {assessment.title}
                      </TableCell>
                      <TableCell>{assessment.type?.name || "-"}</TableCell>
                      <TableCell>{assessment.totalMarks}</TableCell>
                      <TableCell>{assessment.weightPercentage}%</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            assessment.status === "published"
                              ? "bg-green-100 text-green-800"
                              : assessment.status === "draft"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {assessment.status.charAt(0).toUpperCase() +
                            assessment.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {assessment.dueDate
                          ? format(new Date(assessment.dueDate), "MMM d, yyyy")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {assessment.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePublish(assessment.id)}
                              title="Publish"
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(assessment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No assessments found. Create one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

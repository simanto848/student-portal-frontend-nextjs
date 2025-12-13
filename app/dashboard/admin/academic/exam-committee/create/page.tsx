"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { academicService, Department } from "@/services/academic.service";
import { examCommitteeService } from "@/services/academic/exam-committee.service";
import { teacherService, Teacher } from "@/services/teacher.service";

export default function CreateExamCommitteePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedShift, setSelectedShift] = useState<"day" | "evening">("day");

  const hasPermission = user?.role === "super_admin" || user?.role === "admin";

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (user && !hasPermission) {
      router.push("/dashboard/admin");
      return;
    }
    if (user && hasPermission) {
      fetchData();
    }
  }, [user?.role]);
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [deptsData, teachersData] = await Promise.all([
        academicService.getAllDepartments(),
        teacherService.getAllTeachers(),
      ]);
      setDepartments(Array.isArray(deptsData) ? deptsData : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
    } catch (error) {
      toast.error("Failed to load data");
      console.error("Fetch data error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDept || !selectedTeacher) {
      toast.error("Please select both department and teacher");
      return;
    }

    setIsSubmitting(true);
    try {
      await examCommitteeService.addMember({
        departmentId: selectedDept,
        teacherId: selectedTeacher,
        shift: selectedShift,
      });

      toast.success("Exam Committee member added successfully");
      router.push("/dashboard/admin/academic/exam-committee");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to add exam committee member";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#588157]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">
              Add Committee Member
            </h1>
            <p className="text-muted-foreground">
              Add a new teacher to the exam committee
            </p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Committee Member Details</CardTitle>
            <CardDescription>
              Fill in the information below to add a new exam committee member
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments
                      .filter((d) => d.status)
                      .map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name} ({dept.shortName})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacher">Teacher</Label>
                <Select
                  value={selectedTeacher}
                  onValueChange={setSelectedTeacher}
                >
                  <SelectTrigger id="teacher">
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.fullName} ({teacher.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <Select
                  value={selectedShift}
                  onValueChange={(v) =>
                    setSelectedShift(v as "day" | "evening")
                  }
                >
                  <SelectTrigger id="shift">
                    <SelectValue placeholder="Select a shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#3e6253] hover:bg-[#2c463b]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Member"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

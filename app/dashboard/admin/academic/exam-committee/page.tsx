"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { AddMemberModal } from "./components/add-member-modal";
import { EditMemberModal } from "./components/edit-member-modal";
import { ViewMemberModal } from "./components/view-member-modal";
import { examCommitteeService } from "@/services/academic/exam-committee.service";
import { departmentService } from "@/services/academic/department.service";
import { batchService } from "@/services/academic/batch.service";
import { ExamCommittee, Department, Batch } from "@/services/academic/types";

export default function ExamCommitteePage() {
  const [members, setMembers] = useState<ExamCommittee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedShift, setSelectedShift] = useState<string>("all");

  // Modal states
  const [selectedMember, setSelectedMember] = useState<ExamCommittee | null>(
    null
  );
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [selectedDept, selectedBatch, selectedShift]);

  const fetchInitialData = async () => {
    try {
      const [deptRes, batchRes] = await Promise.all([
        departmentService.getAllDepartments(),
        batchService.getAllBatches(),
      ]);
      setDepartments(deptRes);
      setBatches(batchRes);
    } catch (error) {
      console.error("Failed to load filter data", error);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const deptId = selectedDept === "all" ? undefined : selectedDept;
      const batchId = selectedBatch === "all" ? undefined : selectedBatch;
      const shift =
        selectedShift === "all"
          ? undefined
          : (selectedShift as "day" | "evening");
      const [committeeData, allTeachers] = await Promise.all([
        examCommitteeService.getMembers(deptId, batchId, shift),
        import("@/services/teacher.service").then((m) =>
          m.teacherService.getAllTeachers()
        ),
      ]);

      const enrichedMembers = committeeData.map((member) => {
        const teacher = allTeachers.find(
          (t: any) => (t.id || t._id) === member.teacherId
        );
        let departmentObj = member.department;
        if (
          !departmentObj &&
          typeof member.departmentId === "object" &&
          member.departmentId !== null
        ) {
          departmentObj = member.departmentId as any;
        }

        return {
          ...member,
          id: member.id || (member as any)._id,
          department: departmentObj,
          teacher: teacher
            ? {
                fullName: teacher.fullName,
                email: teacher.email,
                registrationNumber: teacher.registrationNumber,
              }
            : { fullName: "Unknown", email: "" },
        };
      });
      setMembers(enrichedMembers);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch committee members");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await examCommitteeService.removeMember(id);
      toast.success("Member removed successfully");
      fetchMembers();
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Exam Committee
            </h2>
            <p className="text-muted-foreground">
              Manage exam committee members for departments and batches.
            </p>
          </div>
          <AddMemberModal onSuccess={fetchMembers} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Committee Members</CardTitle>
            <CardDescription>
              List of all teachers assigned to exam committees.
            </CardDescription>
            <div className="flex gap-4 mt-4">
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Shifts</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          {member.teacher?.fullName}
                          <div className="text-xs text-muted-foreground">
                            {member.teacher?.email}
                          </div>
                        </TableCell>
                        <TableCell>{member.department?.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {member.shift}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {member.batch ? (
                            member.batch.name
                          ) : (
                            <Badge variant="secondary">General</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={member.status ? "default" : "secondary"}
                          >
                            {member.status ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedMember(member);
                                setViewOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedMember(member);
                                setEditOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive/90"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    remove the teacher from the exam committee.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(member.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <ViewMemberModal
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          member={selectedMember}
        />

        <EditMemberModal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          member={selectedMember}
          onSuccess={fetchMembers}
        />
      </div>
    </DashboardLayout>
  );
}

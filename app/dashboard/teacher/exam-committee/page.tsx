'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import { examCommitteeService } from '@/services/academic/exam-committee.service';
import { departmentService } from '@/services/academic/department.service';
import { batchService } from '@/services/academic/batch.service';
import { ExamCommittee, Department, Batch } from '@/services/academic/types';

export default function ExamCommitteeTeacherPage() {
  const [members, setMembers] = useState<ExamCommittee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<string>('all');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedDept !== 'all') {
      fetchMembers();
    } else {
      setMembers([]);
      setLoading(false);
    }
  }, [selectedDept, selectedBatch]);

  const fetchInitialData = async () => {
    try {
      const [deptRes, batchRes] = await Promise.all([
        departmentService.getAllDepartments(),
        batchService.getAllBatches(),
      ]);
      setDepartments(deptRes);
      setBatches(batchRes);
    } catch (error) {
      console.error('Failed to load filter data', error);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const deptId = selectedDept === 'all' ? undefined : selectedDept;
      const batchId = selectedBatch === 'all' ? undefined : selectedBatch;
      if (deptId) {
        const [committeeData, allTeachers] = await Promise.all([
          examCommitteeService.getMembers(deptId, batchId),
          import('@/services/teacher.service').then(m => m.teacherService.getAllTeachers())
        ]);

        const enrichedMembers = committeeData.map(member => {
          const teacher = allTeachers.find((t: any) => (t.id || t._id) === member.teacherId);

          let departmentObj = member.department;
          if (!departmentObj && typeof member.departmentId === 'object' && member.departmentId !== null) {
            departmentObj = member.departmentId as any;
          }

          return {
            ...member,
            id: member.id || (member as any)._id,
            department: departmentObj,
            teacher: teacher ? { fullName: teacher.fullName, email: teacher.email } : { fullName: 'Unknown', email: '' }
          };
        });
        setMembers(enrichedMembers);
      } else {
        setMembers([]);
      }
    } catch (error) {
      toast.error('Failed to fetch committee members');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Exam Committee</h2>
          <p className="text-muted-foreground">
            View exam committee members. Select a department to view.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Committee Members</CardTitle>
          <CardDescription>
            List of teachers in exam committees.
          </CardDescription>
          <div className="flex gap-4 mt-4">
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Select Department</SelectItem>
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
                  <TableHead>Batch</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && selectedDept !== 'all' ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : selectedDept === 'all' ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Please select a department to view committees.
                    </TableCell>
                  </TableRow>
                ) : members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.teacher?.fullName}
                        <div className="text-xs text-muted-foreground">{member.teacher?.email}</div>
                      </TableCell>
                      <TableCell>{member.department?.name}</TableCell>
                      <TableCell>
                        {member.batch ? member.batch.name : <Badge variant="secondary">General</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.status ? 'default' : 'secondary'}>
                          {member.status ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

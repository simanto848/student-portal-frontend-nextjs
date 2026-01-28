"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { workspaceService } from "@/services/classroom/workspace.service";
import { assignmentService } from "@/services/classroom/assignment.service";
import { materialService } from "@/services/classroom/material.service";
import {
  Workspace,
  Assignment,
  Material,
} from "@/services/classroom/types";
import { studentService, Student } from "@/services/user/student.service";
import { courseService } from "@/services/academic/course.service";
import { batchService } from "@/services/academic/batch.service";
import { teacherService, Teacher } from "@/services/user/teacher.service";
import { Loader2 } from "lucide-react";
import { notifyError } from "@/components/toast";
import { getErrorMessage } from "@/lib/utils/toastHelpers";
import { ClassroomDetailClient } from "../fragments/ClassroomDetailClient";

export default function TeacherClassroomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [ws, asgn, mat] = await Promise.all([
        workspaceService.getById(id),
        assignmentService.listByWorkspace(id),
        materialService.listByWorkspace(id),
      ]);
      setWorkspace(ws);
      setAssignments(asgn);
      setMaterials(mat);

      const batchId = ws?.batchId;
      const [courseDetail, batchDetail, batchStudents, teacherDetails] =
        await Promise.all([
          ws?.courseId ? courseService.getCourseById(ws.courseId) : null,
          batchId ? batchService.getBatchById(batchId) : null,
          batchId
            ? studentService
              .getAll({
                batchId,
                limit: 200,
              })
              .then((res) => res.students)
            : [],
          ws?.teacherIds?.length
            ? Promise.all(
              ws.teacherIds.map((teacherId) =>
                teacherService.getById(teacherId),
              ),
            )
            : [],
        ]);

      setStudents(batchStudents || []);
      setTeachers(teacherDetails || []);

      if (ws) {
        setWorkspace({
          ...ws,
          courseName: courseDetail?.name || ws.courseName,
          courseCode: courseDetail?.code || ws.courseCode,
          batchName: batchDetail?.name || ws.batchName,
        });
      }
    } catch (error) {
      const message = getErrorMessage(error, "Failed to load classroom data");
      notifyError(message);
      router.push("/dashboard/teacher/classroom");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-indigo-600 animate-spin" />
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-indigo-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!workspace) return null;

  return (
    <ClassroomDetailClient
      id={id}
      workspace={workspace}
      assignments={assignments}
      materials={materials}
      students={students}
      teachers={teachers}
      onRefresh={fetchData}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { studentService, Student } from "@/services/user/student.service";
import { studentProfileService, StudentProfile } from "@/services/user/studentProfile.service";
import { departmentService } from "@/services/academic/department.service";
import { programService } from "@/services/academic/program.service";
import { batchService } from "@/services/academic/batch.service";
import { sessionService } from "@/services/academic/session.service";
import { Loader2 } from "lucide-react";
import { notifyError } from "@/components/toast";
import { getErrorMessage } from "@/lib/utils/toastHelpers";
import { StudentDetailClient } from "../../fragments/StudentDetailClient";

export default function StudentProfilePage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const classroomId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchData();
    }
  }, [studentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        studentData,
        profileData,
        deptList,
        progList,
        batchList,
        sessionList
      ] = await Promise.all([
        studentService.getById(studentId),
        studentProfileService.get(studentId),
        departmentService.getAllDepartments(),
        programService.getAllPrograms(),
        batchService.getAllBatches(),
        sessionService.getAllSessions()
      ]);

      setStudent(studentData);
      setProfile(profileData);
      setDepartments(deptList || []);
      setPrograms(progList || []);
      setBatches(batchList || []);
      setSessions(sessionList || []);
    } catch (error) {
      const message = getErrorMessage(error, "Failed to load student profile");
      notifyError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-indigo-600 animate-spin" />
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-indigo-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="bg-white border text-center p-20 rounded-3xl">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Student data not found</p>
      </div>
    );
  }

  return (
    <StudentDetailClient
      student={student}
      profile={profile}
      departments={departments}
      programs={programs}
      batches={batches}
      sessions={sessions}
      classroomId={classroomId}
    />
  );
}

"use server";

import { notificationService } from "@/services/notification/notification.service";
import { requireUser } from "@/lib/auth/userAuth";
import { academicApi } from "@/services/academic/axios-instance";
import { getAuthToken } from "@/lib/authHelper";

export async function getDepartmentHeadNotificationTargetOptions() {
  try {
    const user = await requireUser();
    const isDeptHead = (user as any).isDepartmentHead === true || user.role === "department_head";
    if (!user || !isDeptHead) {
      return { options: [], canSend: false };
    }

    const scope = await notificationService.getMyScope().catch((err) => {
      return null;
    });

    return {
      options: scope?.options || [],
      canSend: scope?.canSend || false,
      userDepartmentId: (user as any).departmentId
    };
  } catch (error) {
    return { options: [], canSend: false };
  }
}

export interface UserOption {
  value: string;
  label: string;
  role: string;
}

export async function searchUsers(query: string): Promise<UserOption[]> {
  if (!query || query.length < 2) return [];

  try {
    const user = await requireUser();

    const [studentsRes, teachersRes, staffRes] = await Promise.all([
      academicApi.get("/user/students", {
        params: { searchTerm: query, limit: 10 },
        headers: { Authorization: `Bearer ${await getAuthToken()}` }
      }).catch(() => null),
      academicApi.get("/user/teachers", {
        params: { searchTerm: query, limit: 10 }
      }).catch(() => null),
      academicApi.get("/user/staffs", {
        params: { searchTerm: query, limit: 10 }
      }).catch(() => null),
    ]);

    const extract = (res: any, role: string) => {
      if (!res?.data?.data) return [];
      let items: any[] = [];
      const d = res.data.data;

      if (Array.isArray(d)) {
        items = d;
      } else if (typeof d === 'object') {
        if (d.students) items = d.students;
        else if (d.teachers) items = d.teachers;
        else if (d.staff) items = d.staff;
        else if (d.staffs) items = d.staffs;
        else if (d.data && Array.isArray(d.data)) items = d.data;
      }

      return items.map((u: any) => ({
        value: u.id || u._id,
        label: `${u.fullName} (${role}) - ${u.email || u.studentId || u.teacherId || u.employeeId || ''}`,
        role
      }));
    };

    const students = extract(studentsRes, 'student');
    const teachers = extract(teachersRes, 'teacher');
    const staff = extract(staffRes, 'staff');

    return [...students, ...teachers, ...staff];
  } catch (error) {
    return [];
  }
}


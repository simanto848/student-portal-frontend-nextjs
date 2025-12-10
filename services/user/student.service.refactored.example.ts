/**
 * Example: Refactored Student Service
 * This demonstrates how to use the new base classes
 */

import { BaseCrudService } from '@/lib/api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';
import { EnrollmentStatus } from '@/types/enums';

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  fatherName?: string;
  motherName?: string;
}

export interface Student {
  id: string;
  email: string;
  fullName: string;
  registrationNumber: string;
  departmentId: string;
  programId: string;
  batchId: string;
  sessionId: string;
  department?: any;
  program?: any;
  batch?: any;
  session?: any;
  enrollmentStatus: EnrollmentStatus;
  currentSemester: number;
  admissionDate: string;
  expectedGraduationDate?: string;
  actualGraduationDate?: string;
  profile?: Profile;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentCreateDTO {
  email: string;
  fullName: string;
  departmentId: string;
  programId: string;
  batchId: string;
  sessionId: string;
  admissionDate?: string;
  studentProfile?: any;
}

export interface StudentUpdateDTO {
  fullName?: string;
  departmentId?: string;
  programId?: string;
  batchId?: string;
  sessionId?: string;
  enrollmentStatus?: EnrollmentStatus;
  currentSemester?: number;
  admissionDate?: string;
  expectedGraduationDate?: string;
  actualGraduationDate?: string;
  profile?: any;
}

export interface StudentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  programId?: string;
  batchId?: string;
  sessionId?: string;
  enrollmentStatus?: string;
}

/**
 * Student Service
 * Extends BaseCrudService to inherit all CRUD operations
 * Only adds custom methods specific to students
 */
class StudentService extends BaseCrudService<
  Student,
  StudentCreateDTO,
  StudentUpdateDTO
> {
  constructor() {
    super(API_CONFIG.BASE_URL, API_ENDPOINTS.USERS.STUDENTS);
  }

  /**
   * Normalize student data from API response
   * Handles different response structures
   */
  private normalize(data: any): Student {
    return {
      id: data?.id || data?._id || '',
      email: data?.email || '',
      fullName: data?.fullName || '',
      registrationNumber: data?.registrationNumber || '',
      departmentId: data?.departmentId || '',
      programId: data?.programId || '',
      batchId: data?.batchId || '',
      sessionId: data?.sessionId || '',
      department: data?.department,
      program: data?.program,
      batch: data?.batch,
      session: data?.session,
      currentSemester: data?.currentSemester || 1,
      enrollmentStatus: data?.enrollmentStatus || EnrollmentStatus.NOT_ENROLLED,
      admissionDate: data?.admissionDate || '',
      expectedGraduationDate: data?.expectedGraduationDate,
      actualGraduationDate: data?.actualGraduationDate,
      profile: data?.profile
        ? {
            id: data.profile._id || data.profile.id,
            firstName: data.profile.firstName,
            lastName: data.profile.lastName,
            profilePicture: data.profile.profilePicture,
            fatherName: data.profile.fatherName,
            motherName: data.profile.motherName,
          }
        : undefined,
      createdAt: data?.createdAt,
      updatedAt: data?.updatedAt,
    };
  }

  /**
   * Override getAll to add normalization
   */
  async getAll(params?: StudentQueryParams) {
    const result = await super.getAll(params);
    return {
      ...result,
      data: result.data.map((student) => this.normalize(student)),
    };
  }

  /**
   * Override getById to add normalization
   */
  async getById(id: string): Promise<Student> {
    const data = await super.getById(id);
    return this.normalize(data);
  }

  /**
   * Override create to add normalization
   */
  async create(data: StudentCreateDTO | FormData): Promise<Student> {
    const result = await super.create(data);
    return this.normalize(result);
  }

  /**
   * Override update to add normalization
   */
  async update(id: string, data: StudentUpdateDTO | FormData): Promise<Student> {
    const result = await super.update(id, data);
    return this.normalize(result);
  }

  /**
   * Override restore to add normalization
   */
  async restore(id: string): Promise<Student> {
    const result = await super.restore(id);
    return this.normalize(result);
  }

  /**
   * Override getDeleted to add normalization
   */
  async getDeleted(): Promise<Student[]> {
    const data = await super.getDeleted();
    return data.map((student) => this.normalize(student));
  }

  // Custom methods specific to students can be added here
  // Example:
  // async getStudentsByBatch(batchId: string): Promise<Student[]> {
  //   return this.getList(`${this.resourcePath}/batch/${batchId}`);
  // }
}

// Export singleton instance
export const studentService = new StudentService();

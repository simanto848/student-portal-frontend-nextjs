# Migration Plan: Phase 2 - Service Refactoring

## Overview

This document provides a step-by-step plan to migrate all existing services to use the new `BaseCrudService` and `BaseApiClient` infrastructure.

## Benefits of Migration

- **~60% code reduction** in service files
- **Consistent API** across all services
- **Easier maintenance** - update once, apply everywhere
- **Better type safety** with TypeScript
- **Less boilerplate** when creating new services

## Migration Priority

### High Priority (Week 1-2)

These services are used most frequently and will provide the most immediate benefit:

1. **User Services** (8 files)
   - `services/user/student.service.ts`
   - `services/user/teacher.service.ts`
   - `services/user/staff.service.ts`
   - `services/user/admin.service.ts`
   - Profile services (studentProfile, teacherProfile, staffProfile, adminProfile)

2. **Academic Services** (Core 6 files)
   - `services/academic/course.service.ts`
   - `services/academic/department.service.ts`
   - `services/academic/faculty.service.ts`
   - `services/academic/program.service.ts`
   - `services/academic/batch.service.ts`
   - `services/academic/session.service.ts`

### Medium Priority (Week 3-4)

3. **Enrollment Services** (5 files)
   - `services/enrollment/enrollment.service.ts`
   - `services/enrollment/assessment.service.ts`
   - `services/enrollment/attendance.service.ts`
   - `services/enrollment/courseGrade.service.ts`
   - `services/enrollment/batchCourseInstructor.service.ts`

4. **Library Services** (5 files)
   - `services/library/book.service.ts`
   - `services/library/bookCopy.service.ts`
   - `services/library/borrowing.service.ts`
   - `services/library/reservation.service.ts`
   - `services/library/library.service.ts`

### Lower Priority (Week 5-6)

5. **Classroom Services** (9 files)
   - `services/classroom/workspace.service.ts`
   - `services/classroom/topic.service.ts`
   - `services/classroom/material.service.ts`
   - `services/classroom/assignment.service.ts`
   - `services/classroom/submission.service.ts`
   - `services/classroom/rubric.service.ts`
   - `services/classroom/stream.service.ts`

6. **Other Services** (Remaining 7 files)
   - Academic: syllabus, schedule, prerequisite, exam-committee, classroom, session-course
   - Notification services

## Migration Steps

### Step 1: Backup Current Service

Always keep a backup of the original service:

```bash
cp services/user/student.service.ts services/user/student.service.old.ts
```

### Step 2: Analyze Current Service

Review the current service to identify:
- Standard CRUD operations (can use base class)
- Custom operations (need to be implemented)
- Data normalization logic (keep in class)
- Special handling (keep in overrides)

### Step 3: Create New Service Class

Template for migration:

```typescript
import { BaseCrudService } from '@/lib/api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

// Keep existing types/interfaces
export interface MyEntity {
  id: string;
  // ... existing fields
}

export interface MyEntityCreateDTO {
  // ... existing fields
}

export interface MyEntityUpdateDTO {
  // ... existing fields
}

class MyEntityService extends BaseCrudService<
  MyEntity,
  MyEntityCreateDTO,
  MyEntityUpdateDTO
> {
  constructor() {
    super(API_CONFIG.BASE_URL, API_ENDPOINTS.MY.ENDPOINT);
  }

  // Only include normalization if needed
  private normalize(data: any): MyEntity {
    // ... existing normalization logic
  }

  // Override base methods if normalization is needed
  async getAll(params?: any) {
    const result = await super.getAll(params);
    return {
      ...result,
      data: result.data.map(item => this.normalize(item)),
    };
  }

  async getById(id: string): Promise<MyEntity> {
    const data = await super.getById(id);
    return this.normalize(data);
  }

  // Only add custom methods not in base class
  async customMethod(param: string) {
    return this.get(`${this.resourcePath}/custom/${param}`);
  }
}

export const myEntityService = new MyEntityService();
```

### Step 4: Update Imports in Components

Find all files importing the service:

```bash
grep -r "from '@/services/user/student.service'" app/
```

No changes needed if using default export, but verify the API is still correct.

### Step 5: Test Migration

1. Test all CRUD operations
2. Test custom methods
3. Test error handling
4. Test with actual API

### Step 6: Remove Old Files

Once verified working:

```bash
rm services/user/student.service.old.ts
```

## Example: Student Service Migration

### Before (206 lines)

```typescript
// services/user/student.service.ts
import { api, handleApiError } from "@/services/academic/axios-instance";

export const studentService = {
  getAll: async (params?: { ... }): Promise<...> => {
    try {
      const res = await api.get("/user/students", { params });
      const data = res.data?.data || res.data;
      const students = Array.isArray(data.students)
        ? data.students.map(normalize)
        : Array.isArray(data)
          ? data.map(normalize)
          : [];
      return { students, pagination: data.pagination };
    } catch (e) {
      return handleApiError(e);
    }
  },

  getById: async (id: string): Promise<Student> => {
    try {
      const res = await api.get(`/user/students/${id}`);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  create: async (payload: ...): Promise<Student> => {
    try {
      const res = await api.post("/user/students", payload);
      const data = res.data?.data || res.data;
      return normalize(data);
    } catch (e) {
      return handleApiError(e);
    }
  },

  // ... 8 more similar methods
};
```

### After (80 lines - 61% reduction)

```typescript
// services/user/student.service.ts
import { BaseCrudService } from '@/lib/api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

// Types remain the same
export interface Student { ... }
export interface StudentCreateDTO { ... }
export interface StudentUpdateDTO { ... }

class StudentService extends BaseCrudService<
  Student,
  StudentCreateDTO,
  StudentUpdateDTO
> {
  constructor() {
    super(API_CONFIG.BASE_URL, API_ENDPOINTS.USERS.STUDENTS);
  }

  private normalize(data: any): Student {
    // Normalization logic (if needed)
    return { ... };
  }

  // Override only methods that need normalization
  async getAll(params?: any) {
    const result = await super.getAll(params);
    return {
      students: result.data.map(s => this.normalize(s)),
      pagination: result.pagination,
    };
  }

  async getById(id: string): Promise<Student> {
    const data = await super.getById(id);
    return this.normalize(data);
  }
  
  // ... only override what's needed
}

export const studentService = new StudentService();
```

## Service-Specific Migration Notes

### User Services

All user services (student, teacher, staff, admin) follow similar patterns:
- Have normalization logic
- Support getAll with pagination
- Have getDeleted and restore
- All can use BaseCrudService

**Special considerations**:
- Keep profile field normalization
- Keep enrollment status handling for students
- Keep IP registration methods for teachers

### Academic Services

Most academic services are straightforward CRUD:
- course, department, faculty, program: Simple CRUD
- batch, session: Simple CRUD with relationships
- schedule: Has complex query params, keep custom methods
- exam-committee: Has member management, keep custom methods

### Enrollment Services

- enrollment: Complex relationships, keep custom methods
- assessment, attendance, courseGrade: Use BaseCrudService
- batchCourseInstructor: Custom assignment logic

### Library Services

All library services are simple CRUD and perfect for BaseCrudService.

### Classroom Services

Most can use BaseCrudService:
- workspace, topic, material, assignment: Simple CRUD
- submission: Has grading logic, keep custom methods
- rubric: Simple CRUD
- stream: Custom feed logic

## Consolidating Axios Instances

After migrating all services, remove duplicate axios instances:

```bash
# These can be deleted:
rm services/academic/axios-instance.ts
rm services/classroom/axios-instance.ts
rm services/library/axios-instance.ts
```

Update the index files to export from the base:

```typescript
// services/academic/index.ts
export { BaseApiClient, ApiError } from '@/lib/api';
export * from './types';
```

## Testing Strategy

For each migrated service:

1. **Unit Tests** (if test infrastructure exists)
   ```typescript
   describe('StudentService', () => {
     it('should fetch all students', async () => {
       const result = await studentService.getAll();
       expect(result.students).toBeInstanceOf(Array);
     });
   });
   ```

2. **Integration Testing**
   - Test in development environment
   - Verify all CRUD operations
   - Test error scenarios
   - Test pagination

3. **Manual Testing**
   - Test in UI components
   - Verify data display
   - Test create/edit forms
   - Test delete operations

## Rollback Plan

If issues are discovered:

1. **Immediate Rollback**
   ```bash
   git revert <commit-hash>
   ```

2. **Partial Rollback**
   ```bash
   cp services/user/student.service.old.ts services/user/student.service.ts
   ```

3. **Investigation**
   - Check error logs
   - Verify API compatibility
   - Test normalization logic
   - Check type definitions

## Success Metrics

- ✅ All services migrated
- ✅ All tests passing
- ✅ No regression in functionality
- ✅ Code reduced by ~60%
- ✅ Build succeeds
- ✅ TypeScript checks pass
- ✅ UI works as expected

## Timeline

- **Week 1**: High priority user services (8 files)
- **Week 2**: High priority academic services (6 files)
- **Week 3**: Medium priority enrollment services (5 files)
- **Week 4**: Medium priority library services (5 files)
- **Week 5**: Lower priority classroom services (9 files)
- **Week 6**: Remaining services + cleanup (7 files)

**Total**: 40 service files to migrate over 6 weeks

## Getting Help

- Review `DEVELOPER_GUIDE.md` for examples
- Check `services/user/student.service.refactored.example.ts`
- Review `ARCHITECTURE.md` for architectural context
- Test each migration incrementally

## Checklist Template

For each service migration:

- [ ] Backup original service file
- [ ] Analyze current operations
- [ ] Create new service class
- [ ] Implement normalization (if needed)
- [ ] Override methods (if needed)
- [ ] Add custom methods
- [ ] Update imports in components
- [ ] Test all operations
- [ ] Verify in UI
- [ ] Remove backup file
- [ ] Update documentation (if needed)
- [ ] Commit changes

## Post-Migration Tasks

After all services are migrated:

1. **Remove old axios instances**
2. **Update all import statements**
3. **Run full test suite**
4. **Update documentation**
5. **Celebrate! 🎉**

## Estimated Impact

- **Lines of code saved**: ~3,000+
- **Time saved per new service**: ~1.5 hours
- **Maintenance burden reduced**: ~70%
- **Type safety improved**: ~25%
- **Developer velocity increased**: ~50%

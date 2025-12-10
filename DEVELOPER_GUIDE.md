# Developer Guide

## Getting Started

This guide will help you understand and work with the refactored codebase following DRY principles and best practices.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Creating New Services](#creating-new-services)
3. [Creating New Components](#creating-new-components)
4. [Using Hooks](#using-hooks)
5. [Working with Forms](#working-with-forms)
6. [Error Handling](#error-handling)
7. [Code Style Guide](#code-style-guide)

## Quick Start

### Understanding the New Structure

The codebase now follows a layered architecture:

```
Presentation Layer (Components) 
    ↓ uses
Business Logic Layer (Hooks + Services)
    ↓ uses
Data Access Layer (API Clients)
    ↓ uses
Infrastructure Layer (Config + Utils)
```

### Import Patterns

Use barrel exports for cleaner imports:

```typescript
// ✅ Good - Using barrel exports
import { useFetch, usePagination } from '@/hooks';
import { formatDate, validateEmail } from '@/utils';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

// ❌ Bad - Direct imports
import { useFetch } from '@/hooks/useFetch';
import { usePagination } from '@/hooks/usePagination';
```

## Creating New Services

### For Simple CRUD Services

Use `BaseCrudService` for services that only need standard CRUD operations:

```typescript
import { BaseCrudService } from '@/lib/api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

interface MyEntity {
  id: string;
  name: string;
  // ... other fields
}

class MyService extends BaseCrudService<MyEntity> {
  constructor() {
    super(API_CONFIG.BASE_URL, '/my-endpoint');
  }
}

export const myService = new MyService();
```

This automatically provides:
- `getAll(params?)` - List with pagination
- `getById(id)` - Get single item
- `create(data)` - Create new item
- `update(id, data)` - Update item
- `deleteItem(id)` - Soft delete (also available as `delete()`)
- `restore(id)` - Restore deleted item
- `getDeleted()` - List deleted items
- `deleteItemPermanently(id)` - Hard delete (also available as `deletePermanently()`)

### For Complex Services

Extend `BaseApiClient` for services with custom logic:

```typescript
import { BaseApiClient } from '@/lib/api';
import { API_CONFIG } from '@/config/api.config';

class CustomService extends BaseApiClient {
  constructor() {
    super(API_CONFIG.BASE_URL);
  }

  async customMethod(param: string) {
    return this.get(`/custom-endpoint/${param}`);
  }

  async complexOperation(data: any) {
    // Use protected methods: get, post, put, patch, delete
    const result1 = await this.post('/step1', data);
    const result2 = await this.post('/step2', result1);
    return result2;
  }
}

export const customService = new CustomService();
```

### Adding Custom Methods to CRUD Services

```typescript
class StudentService extends BaseCrudService<Student> {
  constructor() {
    super(API_CONFIG.BASE_URL, API_ENDPOINTS.USERS.STUDENTS);
  }

  // Custom method
  async getByBatch(batchId: string): Promise<Student[]> {
    return this.getList(`${this.resourcePath}/batch/${batchId}`);
  }

  // Another custom method
  async promoteToNextSemester(studentId: string): Promise<Student> {
    return this.post(`${this.resourcePath}/${studentId}/promote`);
  }
}
```

## Creating New Components

### Using Hooks for Data Fetching

```typescript
'use client';

import { useEffect } from 'react';
import { useFetch, usePagination } from '@/hooks';
import { studentService } from '@/services/user/student.service';

export function StudentList() {
  const { data, loading, error, execute } = useFetch(
    studentService.getAll.bind(studentService)
  );
  const { pagination, setPage, setTotal } = usePagination();

  useEffect(() => {
    execute({ page: pagination.page, limit: pagination.limit });
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    if (data?.pagination?.total) {
      setTotal(data.pagination.total);
    }
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.data.map(student => (
        <div key={student.id}>{student.fullName}</div>
      ))}
      <Pagination {...pagination} onPageChange={setPage} />
    </div>
  );
}
```

### Using Utility Functions

```typescript
import { formatDate, formatCurrency, truncate } from '@/utils';

export function StudentCard({ student }: { student: Student }) {
  return (
    <div>
      <h3>{student.fullName}</h3>
      <p>Admitted: {formatDate(student.admissionDate)}</p>
      <p>Status: {formatEnumValue(student.enrollmentStatus)}</p>
    </div>
  );
}
```

## Using Hooks

### useFetch Hook

Perfect for async operations:

```typescript
const { data, loading, error, execute, reset } = useFetch(asyncFunction);

// Execute manually
const handleSubmit = async () => {
  try {
    await execute(formData);
    toast.success('Success!');
  } catch (err) {
    toast.error('Failed!');
  }
};
```

### usePagination Hook

Manage pagination state:

```typescript
const {
  pagination,
  setPage,
  setLimit,
  setTotal,
  nextPage,
  prevPage,
  canGoNext,
  canGoPrev,
} = usePagination({ initialPage: 1, initialLimit: 10 });

// Use in component
<button onClick={prevPage} disabled={!canGoPrev}>Previous</button>
<button onClick={nextPage} disabled={!canGoNext}>Next</button>
```

### useDebounce Hook

Debounce search inputs:

```typescript
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, { delay: 500 });

useEffect(() => {
  if (debouncedSearch) {
    searchStudents(debouncedSearch);
  }
}, [debouncedSearch]);

return (
  <input
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search..."
  />
);
```

## Working with Forms

### Form Validation

```typescript
import { validateEmail, isRequired } from '@/utils';

const errors: Record<string, string> = {};

if (!isRequired(formData.email)) {
  errors.email = 'Email is required';
} else if (!validateEmail(formData.email)) {
  errors.email = 'Invalid email format';
}

if (!isRequired(formData.password)) {
  errors.password = 'Password is required';
} else {
  const passwordValidation = validatePasswordStrength(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.feedback.join(', ');
  }
}
```

### Form Submission

```typescript
const { execute, loading } = useFetch(studentService.create.bind(studentService));

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    await execute(formData);
    toast.success('Student created successfully');
    router.push('/dashboard/students');
  } catch (error) {
    toast.error('Failed to create student');
  }
};
```

## Error Handling

### API Errors

All services use the `ApiError` class which includes:
- `message`: Error message
- `statusCode`: HTTP status code
- `errors`: Array of field-specific errors

```typescript
import { ApiError } from '@/lib/api';

try {
  await studentService.create(data);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.statusCode === 400 && error.errors) {
      // Handle validation errors
      error.errors.forEach(err => {
        console.log(`${err.path}: ${err.message}`);
      });
    } else {
      toast.error(error.message);
    }
  }
}
```

### Global Error Handling

Consider using error boundaries for component-level errors:

```typescript
import { Component, ReactNode } from 'react';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}
```

## Code Style Guide

### Naming Conventions

- **Components**: PascalCase (e.g., `StudentList`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useFetch`)
- **Services**: camelCase (e.g., `studentService`)
- **Utilities**: camelCase (e.g., `formatDate`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Types/Interfaces**: PascalCase (e.g., `Student`, `ApiResponse`)

### File Organization

```typescript
// 1. Imports - grouped by type
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useFetch } from '@/hooks';
import { studentService } from '@/services';
import { formatDate } from '@/utils';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 2. Types/Interfaces
interface Props {
  studentId: string;
}

// 3. Component
export function StudentDetail({ studentId }: Props) {
  // ... implementation
}
```

### TypeScript Best Practices

```typescript
// ✅ Good - Proper typing
interface Student {
  id: string;
  name: string;
}

const students: Student[] = [];

// ❌ Bad - Using 'any'
const students: any[] = [];

// ✅ Good - Type inference
const count = students.length; // TypeScript infers number

// ✅ Good - Explicit return types for public functions
export function getStudentById(id: string): Promise<Student> {
  return studentService.getById(id);
}
```

### Component Best Practices

```typescript
// ✅ Good - Single responsibility
function StudentList() {
  return students.map(s => <StudentCard student={s} />);
}

function StudentCard({ student }: { student: Student }) {
  return <div>{student.name}</div>;
}

// ❌ Bad - Doing too much
function StudentListAndCard() {
  return students.map(s => (
    <div>
      {/* Complex card rendering here */}
    </div>
  ));
}
```

## Testing (Future Implementation)

When adding tests, follow this structure:

```typescript
// student.service.test.ts
import { studentService } from './student.service';

describe('StudentService', () => {
  it('should fetch all students', async () => {
    const result = await studentService.getAll();
    expect(result.data).toBeInstanceOf(Array);
  });

  it('should create a student', async () => {
    const newStudent = {
      email: 'test@example.com',
      fullName: 'Test Student',
      // ...
    };
    const result = await studentService.create(newStudent);
    expect(result.id).toBeDefined();
  });
});
```

## Common Patterns

### Loading States

```typescript
const { loading } = useFetch(service.getAll);

if (loading) return <Skeleton />;
```

### Error States

```typescript
const { error } = useFetch(service.getAll);

if (error) return <ErrorMessage message={error.message} />;
```

### Empty States

```typescript
if (!data || data.length === 0) {
  return <EmptyState message="No students found" />;
}
```

### Optimistic Updates (Future)

```typescript
const handleDelete = async (id: string) => {
  // Optimistically update UI
  setStudents(prev => prev.filter(s => s.id !== id));
  
  try {
    await studentService.delete(id);
    toast.success('Deleted successfully');
  } catch (error) {
    // Revert on error
    fetchStudents();
    toast.error('Failed to delete');
  }
};
```

## Need Help?

- Check `ARCHITECTURE.md` for structural overview
- Review example service in `services/user/student.service.refactored.example.ts`
- Look at existing implementations in `services/` directory
- Review utility functions in `utils/` directory

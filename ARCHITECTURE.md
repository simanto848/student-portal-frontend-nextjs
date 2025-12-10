# Architecture Documentation

## Folder Structure

This project follows a feature-based architecture with clear separation of concerns:

```
├── app/                      # Next.js App Router pages
│   ├── dashboard/           # Dashboard pages by role
│   ├── login/               # Authentication pages
│   └── ...
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── classroom/          # Classroom-specific components
│   ├── dashboard/          # Dashboard components
│   ├── enrollment/         # Enrollment components
│   └── ui/                 # Reusable UI components (shadcn)
├── config/                  # Application configuration
│   └── api.config.ts       # API endpoints and configuration
├── constants/               # Application constants
│   └── app.constants.ts    # App-wide constants
├── contexts/               # React contexts
│   └── AuthContext.tsx     # Authentication context
├── hooks/                  # Custom React hooks
│   ├── useFetch.ts        # Async data fetching hook
│   ├── usePagination.ts   # Pagination state hook
│   ├── useDebounce.ts     # Debouncing hook
│   └── index.ts           # Barrel export
├── lib/                    # Shared libraries
│   ├── api/               # API client libraries
│   │   ├── base-api-client.ts    # Base API client class
│   │   ├── base-crud-service.ts  # Base CRUD service class
│   │   └── index.ts       # Barrel export
│   ├── utils.ts           # Utility functions
│   ├── logger.ts          # Logging utilities
│   └── ToastProvider.tsx  # Toast notification provider
├── services/              # API service layer
│   ├── academic/         # Academic module services
│   ├── classroom/        # Classroom module services
│   ├── enrollment/       # Enrollment module services
│   ├── library/          # Library module services
│   ├── user/             # User module services
│   └── auth.service.ts   # Authentication service
├── types/                # TypeScript type definitions
│   ├── api/             # API-related types
│   ├── entities/        # Entity types
│   └── enums/           # Enums
├── utils/               # Utility functions
│   ├── validation.ts    # Validation utilities
│   ├── formatting.ts    # Formatting utilities
│   └── index.ts         # Barrel export
└── public/              # Static assets
```

## Key Architectural Principles

### 1. DRY (Don't Repeat Yourself)

- **Base API Client**: All axios instances use a unified `BaseApiClient` class
- **Base CRUD Service**: Common CRUD operations are abstracted in `BaseCrudService`
- **Shared Utilities**: Common functions are centralized in `utils/`
- **Reusable Hooks**: Custom hooks eliminate duplicate state management
- **Centralized Configuration**: API endpoints and constants are defined once

### 2. Separation of Concerns

- **Services**: Handle API communication and data fetching
- **Components**: Focus on UI rendering and user interaction
- **Hooks**: Manage component state and side effects
- **Utils**: Provide pure utility functions
- **Types**: Define data structures and contracts

### 3. Type Safety

- TypeScript is used throughout the application
- Centralized type definitions in `types/` directory
- Enum-based constants for type-safe value constraints
- Interface-based API contracts

### 4. Scalability

- Feature-based folder structure allows easy addition of new modules
- Base classes enable quick creation of new services
- Consistent patterns across the codebase
- Modular architecture supports independent development

## Core Infrastructure

### Base API Client (`lib/api/base-api-client.ts`)

Provides common functionality for all API clients:
- Axios instance configuration
- Request/response interceptors
- Token management
- Error handling
- Response parsing

### Base CRUD Service (`lib/api/base-crud-service.ts`)

Extends `BaseApiClient` to provide standard CRUD operations:
- `getAll()` - List all items with pagination
- `getById()` - Get single item
- `create()` - Create new item
- `update()` - Update existing item
- `delete()` - Soft delete item
- `restore()` - Restore deleted item
- `getDeleted()` - List deleted items
- `deletePermanently()` - Hard delete item

### Custom Hooks

#### `useFetch`
Manages async operations with loading and error states:
```typescript
const { data, loading, error, execute } = useFetch(asyncFunction);
```

#### `usePagination`
Handles pagination state:
```typescript
const { pagination, setPage, nextPage, prevPage } = usePagination();
```

#### `useDebounce`
Debounces values and callbacks:
```typescript
const debouncedValue = useDebounce(value, { delay: 500 });
```

### Utility Functions

#### Validation (`utils/validation.ts`)
- Email validation
- Phone validation
- Password strength validation
- Date validation
- Required field validation

#### Formatting (`utils/formatting.ts`)
- Date/time formatting
- Number formatting
- Currency formatting
- Phone number formatting
- File size formatting
- Text truncation

## Configuration Management

### API Configuration (`config/api.config.ts`)

Centralized configuration for:
- API base URLs
- Endpoint definitions
- User roles
- Staff roles
- Application routes
- Storage keys

Example usage:
```typescript
import { API_ENDPOINTS, API_CONFIG } from '@/config/api.config';

const apiClient = new BaseApiClient(API_CONFIG.BASE_URL);
const response = await apiClient.get(API_ENDPOINTS.USERS.STUDENTS);
```

### Constants (`constants/app.constants.ts`)

Application-wide constants:
- Pagination defaults
- File upload limits
- Date/time formats
- Toast configuration
- Dropdown options

## Migration Strategy

### Migrating Existing Services

To migrate an existing service to use the new base classes:

1. **For simple CRUD services**:
```typescript
// Old way
export const studentService = {
  getAll: async () => { /* ... */ },
  getById: async (id) => { /* ... */ },
  // ... more methods
};

// New way
import { BaseCrudService } from '@/lib/api';
import { API_CONFIG, API_ENDPOINTS } from '@/config/api.config';

class StudentService extends BaseCrudService<Student> {
  constructor() {
    super(API_CONFIG.BASE_URL, API_ENDPOINTS.USERS.STUDENTS);
  }
  
  // Only add custom methods not covered by base class
}

export const studentService = new StudentService();
```

2. **For complex services with custom logic**:
```typescript
import { BaseApiClient } from '@/lib/api';

class CustomService extends BaseApiClient {
  constructor() {
    super(API_CONFIG.BASE_URL);
  }
  
  async customMethod() {
    return this.get('/custom-endpoint');
  }
}
```

### Migrating Components

1. **Use custom hooks for state management**:
```typescript
// Old way
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// New way
const { data, loading, error, execute } = useFetch(service.getAll);
```

2. **Use utility functions**:
```typescript
// Old way
const formattedDate = new Date(date).toLocaleDateString();

// New way
import { formatDate } from '@/utils';
const formattedDate = formatDate(date);
```

## Best Practices

1. **Always use the base classes** for new services
2. **Centralize configuration** in `config/`
3. **Use custom hooks** for state management
4. **Import from barrel exports** for cleaner imports
5. **Follow TypeScript best practices** with proper typing
6. **Keep components focused** on UI, move logic to hooks/services
7. **Use enums** instead of string literals
8. **Document complex logic** with comments

## Future Improvements

- [ ] Add comprehensive unit tests
- [ ] Implement error boundaries
- [ ] Add request caching layer
- [ ] Implement optimistic updates
- [ ] Add offline support
- [ ] Implement real-time updates
- [ ] Add performance monitoring
- [ ] Create component library documentation

export {
    createApiClient,
    api,
    academicApi,
    classroomApi,
    enrollmentApi,
    userApi,
    libraryApi,
    notificationApi,
    communicationApi,
    handleApiError,
    extractArrayData,
    extractItemData,
    extractPaginatedData,
} from './client';

export { ApiError } from '@/types/api';
export type {
    ApiResponse,
    ApiErrorResponse,
    ValidationError,
    Pagination,
    PaginatedResponse,
    CrudService,
    QueryOptions,
} from '@/types/api';

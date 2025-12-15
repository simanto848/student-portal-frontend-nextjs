import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ApiError } from "@/types/api";

export interface CrudServiceInterface<
  T,
  CreateDTO = Partial<T>,
  UpdateDTO = Partial<T>,
> {
  getAll: () => Promise<T[]>;
  getById?: (id: string) => Promise<T>;
  create: (data: CreateDTO) => Promise<T>;
  update: (id: string, data: UpdateDTO) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

interface UseCrudOptions<T, CreateDTO, UpdateDTO> {
  service: CrudServiceInterface<T, CreateDTO, UpdateDTO>;
  entityName: string;
  onSuccess?: () => void;
  messages?: {
    createSuccess?: string;
    updateSuccess?: string;
    deleteSuccess?: string;
    fetchError?: string;
    saveError?: string;
    deleteError?: string;
  };
}

interface UseCrudReturn<T, CreateDTO, UpdateDTO> {
  data: T[];
  isLoading: boolean;
  selectedItem: T | null;
  isFormModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  fetchData: () => Promise<void>;
  handleCreate: () => void;
  handleEdit: (item: T) => void;
  handleDeleteClick: (item: T) => void;
  handleSubmit: (formData: CreateDTO | UpdateDTO) => Promise<void>;
  handleConfirmDelete: () => Promise<void>;
  setIsFormModalOpen: (open: boolean) => void;
  setIsDeleteModalOpen: (open: boolean) => void;
  setSelectedItem: (item: T | null) => void;
  setData: (data: T[]) => void;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for standardized CRUD operations
 *
 * Provides common state management and handlers for CRUD functionality:
 * - Data fetching with loading states
 * - Create/Edit/Delete operations
 * - Modal state management
 * - Error handling with toast notifications
 * - Automatic data refresh after mutations
 *
 * @example
 * ```tsx
 * const {
 *   data: faculties,
 *   isLoading,
 *   isFormModalOpen,
 *   handleCreate,
 *   handleEdit,
 *   handleSubmit,
 *   // ... other returned values
 * } = useCrudOperations({
 *   service: facultyService,
 *   entityName: 'Faculty',
 * });
 * ```
 */
export function useCrudOperations<
  T extends { id: string },
  CreateDTO = Partial<T>,
  UpdateDTO = Partial<T>,
>({
  service,
  entityName,
  onSuccess,
  messages = {},
}: UseCrudOptions<T, CreateDTO, UpdateDTO>): UseCrudReturn<
  T,
  CreateDTO,
  UpdateDTO
> {
  // State management
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Default messages
  const defaultMessages = {
    createSuccess: `${entityName} created successfully`,
    updateSuccess: `${entityName} updated successfully`,
    deleteSuccess: `${entityName} deleted successfully`,
    fetchError: `Failed to load ${entityName.toLowerCase()}s`,
    saveError: `Failed to save ${entityName.toLowerCase()}`,
    deleteError: `Failed to delete ${entityName.toLowerCase()}`,
    ...messages,
  };

  /**
   * Fetch all data from the service
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await service.getAll();
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      const message = ApiError.isApiError(error)
        ? error.message
        : defaultMessages.fetchError;
      toast.error(message);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [service, defaultMessages.fetchError]);

  /**
   * Open form modal for creating a new item
   */
  const handleCreate = useCallback(() => {
    setSelectedItem(null);
    setIsFormModalOpen(true);
  }, []);

  /**
   * Open form modal for editing an existing item
   */
  const handleEdit = useCallback((item: T) => {
    setSelectedItem(item);
    setIsFormModalOpen(true);
  }, []);

  /**
   * Open delete confirmation modal for an item
   */
  const handleDeleteClick = useCallback((item: T) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  }, []);

  /**
   * Handle form submission for create/update operations
   */
  const handleSubmit = useCallback(
    async (formData: CreateDTO | UpdateDTO) => {
      setIsSubmitting(true);
      try {
        if (selectedItem) {
          // Update existing item
          await service.update(selectedItem.id, formData as UpdateDTO);
          toast.success(defaultMessages.updateSuccess);
        } else {
          // Create new item
          await service.create(formData as CreateDTO);
          toast.success(defaultMessages.createSuccess);
        }

        // Refresh data and close modal
        await fetchData();
        setIsFormModalOpen(false);
        setSelectedItem(null);
        onSuccess?.();
      } catch (error) {
        const message = ApiError.isApiError(error)
          ? error.message
          : defaultMessages.saveError;
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      selectedItem,
      service,
      fetchData,
      onSuccess,
      defaultMessages.createSuccess,
      defaultMessages.updateSuccess,
      defaultMessages.saveError,
    ],
  );

  /**
   * Handle delete confirmation
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedItem) return;

    setIsDeleting(true);
    try {
      await service.delete(selectedItem.id);
      toast.success(defaultMessages.deleteSuccess);

      // Refresh data and close modal
      await fetchData();
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      onSuccess?.();
    } catch (error) {
      const message = ApiError.isApiError(error)
        ? error.message
        : defaultMessages.deleteError;
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }, [
    selectedItem,
    service,
    fetchData,
    onSuccess,
    defaultMessages.deleteSuccess,
    defaultMessages.deleteError,
  ]);

  return {
    // State
    data,
    isLoading,
    selectedItem,
    isFormModalOpen,
    isDeleteModalOpen,
    isSubmitting,
    isDeleting,

    // Actions
    fetchData,
    handleCreate,
    handleEdit,
    handleDeleteClick,
    handleSubmit,
    handleConfirmDelete,

    // State setters
    setIsFormModalOpen,
    setIsDeleteModalOpen,
    setSelectedItem,
    setData,

    // Aliases
    refresh: fetchData,
  };
}

export default useCrudOperations;

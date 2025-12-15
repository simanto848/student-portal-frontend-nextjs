import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workspaceService } from "@/services/classroom/workspace.service";
import {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
} from "@/services/classroom/types";

// ==================================== Query Keys ========================================

export const classroomKeys = {
  all: ["classroom"] as const,

  // Workspaces
  workspaces: () => [...classroomKeys.all, "workspaces"] as const,
  workspacesList: (params?: Record<string, unknown>) =>
    [...classroomKeys.workspaces(), "list", params] as const,
  workspace: (id: string) => [...classroomKeys.workspaces(), id] as const,
  myWorkspaces: () => [...classroomKeys.workspaces(), "mine"] as const,
  pendingWorkspaces: () => [...classroomKeys.workspaces(), "pending"] as const,
};

// ====================================== Workspace Queries ======================================

// Fetch current user's workspaces (student or teacher)
export function useMyWorkspaces() {
  return useQuery({
    queryKey: classroomKeys.myWorkspaces(),
    queryFn: () => workspaceService.listMine(),
  });
}

// Fetch a single workspace by ID
export function useWorkspace(id: string) {
  return useQuery({
    queryKey: classroomKeys.workspace(id),
    queryFn: () => workspaceService.getById(id),
    enabled: !!id,
  });
}

// Fetch pending workspaces (courses available for classroom creation)
export function usePendingWorkspaces() {
  return useQuery({
    queryKey: classroomKeys.pendingWorkspaces(),
    queryFn: () => workspaceService.listPending(),
  });
}

// =======================================  Workspace Mutations =====================================

// Create workspace mutation
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspaceDto) => workspaceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.workspaces() });
      queryClient.invalidateQueries({
        queryKey: classroomKeys.pendingWorkspaces(),
      });
    },
  });
}

// Update workspace mutation
export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkspaceDto }) =>
      workspaceService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.workspaces() });
      queryClient.invalidateQueries({
        queryKey: classroomKeys.workspace(variables.id),
      });
    },
  });
}

// Delete workspace mutation
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workspaceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.workspaces() });
    },
  });
}

// Archive workspace mutation
export function useArchiveWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workspaceService.archive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: classroomKeys.workspaces() });
      queryClient.invalidateQueries({
        queryKey: classroomKeys.workspace(id),
      });
    },
  });
}

// Sync roster mutation
export function useSyncWorkspaceRoster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workspaceService.syncRoster(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: classroomKeys.workspace(id),
      });
    },
  });
}

// ===================================== Combined Hooks for Common Use Cases =======================================

// Hook for student classroom dashboard
export function useStudentClassrooms() {
  const query = useMyWorkspaces();

  return {
    workspaces: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// Hook for teacher classroom dashboard
export function useTeacherClassrooms() {
  const workspacesQuery = useMyWorkspaces();
  const pendingQuery = usePendingWorkspaces();

  return {
    workspaces: workspacesQuery.data ?? [],
    pendingCourses: pendingQuery.data ?? [],
    isLoading: workspacesQuery.isLoading || pendingQuery.isLoading,
    isError: workspacesQuery.isError || pendingQuery.isError,
    error: workspacesQuery.error || pendingQuery.error,
    refetch: () => {
      workspacesQuery.refetch();
      pendingQuery.refetch();
    },
  };
}

// Hook for workspace details page
export function useWorkspaceDetails(id: string) {
  const query = useWorkspace(id);
  const syncMutation = useSyncWorkspaceRoster();
  const updateMutation = useUpdateWorkspace();
  const archiveMutation = useArchiveWorkspace();

  return {
    workspace: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    syncRoster: () => syncMutation.mutate(id),
    isSyncing: syncMutation.isPending,
    updateWorkspace: (data: UpdateWorkspaceDto) =>
      updateMutation.mutate({ id, data }),
    isUpdating: updateMutation.isPending,
    archiveWorkspace: () => archiveMutation.mutate(id),
    isArchiving: archiveMutation.isPending,
  };
}

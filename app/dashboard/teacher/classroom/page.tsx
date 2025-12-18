"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { workspaceService } from "@/services/classroom/workspace.service";
import { Workspace, PendingWorkspace } from "@/services/classroom/types";
import { notifySuccess, notifyError } from "@/components/toast";
import { getErrorMessage, getSuccessMessage } from "@/lib/utils/toastHelpers";
import { useRouter } from "next/navigation";
import { BookOpen, Users, PlusCircle, Archive } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ClassroomsPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [pendingWorkspaces, setPendingWorkspaces] = useState<
    PendingWorkspace[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [creatingId, setCreatingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    fetchData();
  }, [authLoading, isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [active, pending] = await Promise.all([
        workspaceService.listMine(),
        workspaceService.listPending(),
      ]);
      setWorkspaces(active);
      setPendingWorkspaces(pending || []);
    } catch (error) {
      const message = getErrorMessage(error, "Failed to load classroom data");
      notifyError(message);
      router.push("/dashboard/teacher/classroom");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClassroom = async (pending: PendingWorkspace) => {
    setCreatingId(pending.batchId); // Use batchId as temp loader key
    try {
      const newWs = await workspaceService.create({
        courseId: pending.courseId,
        batchId: pending.batchId,
        title: `${pending.courseCode} - ${pending.batchName}`,
      });
      const message = getSuccessMessage(
        newWs,
        "Classroom created successfully",
      );
      notifySuccess(message);
      router.push(`/dashboard/teacher/classroom/${newWs.id}`);
    } catch (error) {
      const message = getErrorMessage(error, "Failed to create classroom");
      notifyError(message);
    } finally {
      setCreatingId(null);
    }
  };

  const handleArchiveClassroom = async (id: string) => {
    try {
      const res = await workspaceService.archive(id);
      const message = getSuccessMessage(res, "Classroom archived");
      notifySuccess(message);
      fetchData(); // Refresh list
    } catch (error) {
      const message = getErrorMessage(error, "Failed to archive classroom");
      notifyError(message);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1a3d32]">
            My Classrooms
          </h1>
          <p className="text-muted-foreground">
            Manage your active and pending course workspaces
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10">Loading classrooms...</div>
        ) : (
          <>
            {/* Pending Section */}
            {pendingWorkspaces.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[#1a3d32] border-b pb-2">
                  Pending Creations
                </h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {pendingWorkspaces.map((p, idx) => (
                    <Card
                      key={`${p.courseId}-${p.batchId}`}
                      className="border-dashed border-2 border-emerald-200 bg-emerald-50/30"
                    >
                      <CardHeader>
                        <CardTitle className="text-lg font-bold text-[#1a3d32]">
                          {p.courseName}
                        </CardTitle>
                        <p className="text-sm font-medium text-emerald-700">
                          {p.courseCode}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {p.batchName} • Semester {p.semester}
                        </p>
                      </CardHeader>
                      <CardFooter>
                        <Button
                          onClick={() => handleCreateClassroom(p)}
                          disabled={creatingId === p.batchId}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 hover:cursor-pointer"
                        >
                          {creatingId === p.batchId ? (
                            "Creating..."
                          ) : (
                            <>
                              <PlusCircle className="mr-2 h-4 w-4" /> Create
                              Classroom
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Active Section */}
            <section>
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h2 className="text-xl font-semibold text-[#1a3d32]">
                  Active Classrooms
                </h2>
                <span className="text-sm text-muted-foreground">
                  {workspaces.length} active
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {workspaces.length > 0 ? (
                  workspaces.map((workspace) => (
                    <Card
                      key={workspace.id}
                      className="flex flex-col border-none shadow-md hover:shadow-lg transition-shadow group relative pt-0"
                    >
                      <CardHeader className="bg-[#f8f9fa] border-b pt-4">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <CardTitle className="text-xl font-bold text-[#1a3d32] line-clamp-2">
                              {workspace.courseName || workspace.title}
                            </CardTitle>
                            {workspace.courseCode && (
                              <p className="text-sm font-medium text-emerald-700 mt-1">
                                {workspace.courseCode}
                              </p>
                            )}
                            {workspace.batchName && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {workspace.batchName}{" "}
                                {workspace.semester
                                  ? `• Semester ${workspace.semester}`
                                  : ""}
                              </p>
                            )}
                          </div>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-red-600"
                              >
                                <Archive className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Archive Classroom?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will move the classroom to the archive.
                                  Students will no longer be able to submit
                                  assignments. You can view archived classrooms
                                  in the archive tab (coming soon).
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleArchiveClassroom(workspace.id)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Archive
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 flex-1 space-y-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <BookOpen className="h-4 w-4" />
                          <span>Active</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Users className="h-4 w-4" />
                          <span>
                            {workspace.totalBatchStudents || 0} Students
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-4 border-t bg-gray-50/50">
                        <Button
                          className="w-full bg-[#1a3d32] hover:bg-[#142e26] text-white hover:cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/dashboard/teacher/classroom/${workspace.id}`,
                            )
                          }
                        >
                          Enter Classroom
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-10 text-muted-foreground">
                    No active classrooms found.{" "}
                    {pendingWorkspaces.length > 0
                      ? "Create one from the pending list above."
                      : "You have no assigned courses yet."}
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

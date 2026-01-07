/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { workspaceService } from "@/services/classroom/workspace.service";
import { Workspace, PendingWorkspace } from "@/services/classroom/types";
import { notifySuccess, notifyError } from "@/components/toast";
import { getErrorMessage, getSuccessMessage } from "@/lib/utils/toastHelpers";
import { useRouter } from "next/navigation";
import { Search, Sparkles, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";
import { ClassroomCard } from "./fragments/ClassroomCard";
import { PendingClassroomCard } from "./fragments/PendingClassroomCard";
import { Input } from "@/components/ui/input";

export default function ClassroomsPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [pendingWorkspaces, setPendingWorkspaces] = useState<
    PendingWorkspace[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClassroom = async (pending: PendingWorkspace) => {
    setCreatingId(pending.batchId);
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
      fetchData();
    } catch (error) {
      const message = getErrorMessage(error, "Failed to archive classroom");
      notifyError(message);
    }
  };

  const filteredWorkspaces = workspaces.filter(ws =>
    (ws.courseName || ws.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
    ws.courseCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <DashboardLayout>
      <div className="space-y-10 pb-20 max-w-7xl mx-auto">
        {/* Premium Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-indigo-950 via-indigo-900 to-slate-900 p-10 md:p-14 text-white shadow-2xl"
        >
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-[100px] opacity-50" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-indigo-600/10 blur-[100px] opacity-30" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em]">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Academic Streams</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                Command Center
              </h1>
              <p className="text-indigo-100/70 max-w-md text-lg font-medium leading-relaxed">
                Manage your virtual classrooms, engage with students, and coordinate academic delivery from a unified hub.
              </p>
            </div>

            <div className="w-full md:w-80 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-300 group-focus-within:text-white transition-colors" />
              <Input
                placeholder="Search classrooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 pr-4 rounded-2xl bg-white/10 border-white/10 text-white placeholder:text-indigo-300/50 focus:bg-white/20 focus:border-white/20 transition-all backdrop-blur-sm"
              />
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {/* Pending Section */}
            {pendingWorkspaces.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pending Infrastructure</h2>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                    {pendingWorkspaces.length} REQUIRED
                  </span>
                </div>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {pendingWorkspaces.map((p) => (
                    <motion.div key={`${p.courseId}-${p.batchId}`} variants={itemVariants}>
                      <PendingClassroomCard
                        pending={p}
                        onCreate={handleCreateClassroom}
                        isCreating={creatingId === p.batchId}
                      />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Active Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Classrooms</h2>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-4 py-1.5 rounded-full">
                  {workspaces.length} DEPLOYED
                </span>
              </div>

              {filteredWorkspaces.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {filteredWorkspaces.map((workspace) => (
                    <motion.div key={workspace.id} variants={itemVariants}>
                      <ClassroomCard
                        workspace={workspace}
                        onEnter={(id) => router.push(`/dashboard/teacher/classroom/${id}`)}
                        onArchive={handleArchiveClassroom}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center"
                >
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-50 mb-6">
                    <GraduationCap className="h-10 w-10 text-slate-200" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">No active classrooms detected</h3>
                  <p className="text-slate-500 font-medium">
                    {pendingWorkspaces.length > 0
                      ? "Initialize a classroom from the pending list above to get started."
                      : "You have no assigned courses for this orbital cycle."}
                  </p>
                </motion.div>
              )}
            </section>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}

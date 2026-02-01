 
"use client";

import { useEffect, useState } from "react";
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 100 } }
  };

  return (
    <div className="flex flex-col gap-6 font-display animate-in fade-in duration-500">
      {/* Header */}
      <header className="glass-panel rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="text-[#2dd4bf] w-6 h-6" />
            Classroom Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            You have <span className="text-[#2dd4bf] font-semibold">{workspaces.length} active</span> classrooms and <span className="text-orange-500 font-semibold">{pendingWorkspaces.length} pending</span> setup.
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              className="w-full bg-white/50 dark:bg-slate-800/50 border-0 ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-[#2dd4bf] placeholder-slate-400 transition-all shadow-sm outline-none"
              placeholder="Search classrooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

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
          className="flex flex-col gap-8"
        >
          {/* Pending Section */}
          {pendingWorkspaces.length > 0 && (
            <section className="glass-panel rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Pending Setup</h2>
                <span className="text-[10px] font-bold text-orange-500 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                  {pendingWorkspaces.length} REQUIRED
                </span>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            <div className="flex items-center justify-between mb-6 px-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#2dd4bf]" />
                  Active Classrooms
                </h2>
              </div>
            </div>

            {filteredWorkspaces.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                className="glass-panel rounded-[3rem] p-20 text-center flex flex-col items-center justify-center"
              >
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-50 dark:bg-slate-800 mb-6">
                  <GraduationCap className="h-10 w-10 text-slate-300 dark:text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No active classrooms</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
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
  );
}

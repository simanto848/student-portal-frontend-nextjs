"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  academicService,
  Batch,
  AcademicApiError,
} from "@/services/academic.service";
import { teacherService, Teacher } from "@/services/user/teacher.service";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  GraduationCap,
  Calendar,
  UserCheck,
  User,
  Edit2,
  Check,
  Layers,
  Search,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { studentService, Student } from "@/services/user/student.service";
import { Badge } from "@/components/ui/badge";

export default function TeacherBatchDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [batch, setBatch] = useState<Batch | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Counselor Assignment State
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedCounselor, setSelectedCounselor] = useState<Teacher | null>(
    null
  );
  const [assignedCounselor, setAssignedCounselor] = useState<
    Teacher | { fullName: string; email: string } | null
  >(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  const filteredStudents = students.filter(student =>
    student.fullName.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    student.registrationNumber.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  useEffect(() => {
    if (id) {
      fetchBatch();
      fetchStudents();
    }
  }, [id]);

  useEffect(() => {
    const fetchCounselor = async () => {
      if (batch?.counselor) {
        setAssignedCounselor(batch.counselor);
      }

      if (batch?.counselorId) {
        try {
          const teacher = await teacherService.getById(batch.counselorId);
          setAssignedCounselor(teacher);
        } catch (error) {
          console.error("Failed to fetch counselor details", error);
        }
      }
    };

    if (batch) {
      fetchCounselor();
    }
  }, [batch]);

  useEffect(() => {
    if (isAssignDialogOpen) {
      fetchTeachers();
    }
  }, [isAssignDialogOpen, searchQuery]);

  const fetchBatch = async () => {
    setIsLoading(true);
    try {
      const data = await academicService.getBatchById(id);
      setBatch(data);
    } catch (error) {
      const message =
        error instanceof AcademicApiError
          ? error.message
          : "Failed to load batch details";
      toast.error(message);
      router.push("/dashboard/teacher/department");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { students } = await studentService.getAll({ batchId: id, limit: 1000 });
      setStudents(students);
    } catch (error) {
      console.error("Failed to fetch students", error);
    }
  };

  const fetchTeachers = async () => {
    setIsSearching(true);
    try {
      const query: any = { search: searchQuery, limit: 10 };
      const { teachers } = await teacherService.getAll(query);
      setTeachers(teachers);
    } catch (error) {
      console.error("Failed to fetch teachers", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssignCounselor = async () => {
    if (!selectedCounselor || !batch) return;
    try {
      await academicService.assignCounselor(batch.id, selectedCounselor.id);
      toast.success("Counselor assigned successfully");
      setAssignedCounselor(selectedCounselor);
      setIsDialogOpen(false);
      fetchBatch();
      setIsAssignDialogOpen(false);
      setSelectedCounselor(null);
    } catch (error) {
      const message =
        error instanceof AcademicApiError
          ? error.message
          : "Failed to assign counselor";
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#2dd4bf]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Layers className="h-6 w-6 text-[#2dd4bf]/40 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!batch) {
    return null;
  }

  const batchDisplayName =
    batch.code ??
    (batch.shift
      ? `${batch.shift === "evening" ? "E" : "D"}-${batch.name}`
      : batch.name);

  const getName = (item: any): string => {
    if (!item) return "N/A";
    if (typeof item === "string") return item;
    if (typeof item === "object" && item.name) return item.name;
    return "N/A";
  };

  const InfoCard = ({ icon: Icon, title, children, className }: any) => (
    <GlassCard className={cn("p-8 border-slate-200/60 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-[#2dd4bf]/5 transition-all duration-500 overflow-hidden relative group", className)}>
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-700 pointer-events-none">
        <Icon className="w-24 h-24 text-slate-950 dark:text-white" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-[#2dd4bf]/10 text-[#0d9488] dark:text-[#2dd4bf] rounded-2xl ring-1 ring-[#2dd4bf]/20">
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
            {title}
          </h2>
        </div>
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </GlassCard>
  );

  const LabelValue = ({ label, value, subValue }: any) => (
    <div>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-1.5 block">
        {label}
      </label>
      <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">
        {value}
      </p>
      {subValue && (
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-tighter">{subValue}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Batch <span className="text-[#2dd4bf]">Control Node</span></h1>
              <Badge className="bg-[#2dd4bf]/10 text-[#0d9488] dark:text-[#2dd4bf] border-[#2dd4bf]/20 font-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-xl">
                {batch.status ? "Operational" : "Offline"}
              </Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm italic">Structured oversight of year-group assets and academic distribution.</p>
          </div>
        </div>

        <Button 
          className="h-14 px-8 rounded-2xl bg-slate-950 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Sparkles className="h-4 w-4 mr-2 text-[#2dd4bf]" />
          Generation Report
        </Button>
      </div>

      {/* Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Basic Info Card */}
        <InfoCard icon={Layers} title="Basic Information">
          <div className="grid grid-cols-2 gap-6">
            <LabelValue label="Batch Name" value={batchDisplayName} />
            <LabelValue label="Year" value={batch.year} />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <LabelValue label="Shift" value={batch.shift === "evening" ? "Evening" : "Day"} />
            <LabelValue label="Current Semester" value={`Level-Term ${batch.currentSemester}`} />
          </div>
          <LabelValue label="Session" value={getName(batch.sessionId)} />
        </InfoCard>

        {/* Academic Info Card */}
        <InfoCard icon={GraduationCap} title="Academic Parameters">
          <LabelValue label="Primary Program" value={getName(batch.programId)} />
          <LabelValue label="Department Hub" value={getName(batch.departmentId)} />
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
              <span className="block text-2xl font-black text-slate-900 dark:text-white leading-none mb-1">{batch.maxStudents}</span>
              <span className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.15em]">Slot Capacity</span>
            </div>
            <div className="bg-[#2dd4bf]/5 dark:bg-[#2dd4bf]/10 p-4 rounded-2xl border border-[#2dd4bf]/10 dark:border-[#2dd4bf]/20 shadow-inner">
              <span className="block text-2xl font-black text-[#0d9488] dark:text-[#2dd4bf] leading-none mb-1">{batch.currentStudents}</span>
              <span className="text-[8px] font-black text-[#0d9488]/60 dark:text-[#2dd4bf]/60 uppercase tracking-[0.15em]">Enrolled Nodes</span>
            </div>
          </div>
        </InfoCard>

        {/* Leadership & Duration Card (Combined or Separate) */}
        <div className="space-y-6">
          <InfoCard icon={UserCheck} title="Leadership">
            <div className="flex items-start justify-between">
              <LabelValue
                label="Academic Advisor"
                value={assignedCounselor?.fullName || "Awaiting Node"}
                subValue={assignedCounselor?.email}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-4 rounded-xl border border-[#2dd4bf]/20 text-[#0d9488] dark:text-[#2dd4bf] hover:bg-[#2dd4bf]/10 font-black text-[9px] uppercase tracking-widest"
                onClick={() => setIsAssignDialogOpen(true)}
              >
                <Edit2 className="h-3.5 w-3.5 mr-2" />
                Override
              </Button>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <LabelValue
                label="Class Representative"
                value={batch.classRepresentative?.fullName || "Not Assigned"}
                subValue={batch.classRepresentative?.registrationNumber ? `Reg: ${batch.classRepresentative.registrationNumber}` : undefined}
              />
            </div>
          </InfoCard>

          <InfoCard icon={Calendar} title="Duration" className="py-5">
            <div className="grid grid-cols-2 gap-4">
              <LabelValue
                label="Start Date"
                value={batch.startDate ? new Date(batch.startDate).toLocaleDateString() : "N/A"}
              />
              <LabelValue
                label="End Date"
                value={batch.endDate ? new Date(batch.endDate).toLocaleDateString() : "N/A"}
              />
            </div>
          </InfoCard>
        </div>
      </div>

      {/* Student List Section */}
      <GlassCard className="p-8 border-slate-200/60 dark:border-slate-700/50 shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/40 relative">
        <div className="flex flex-col md:flex-row items-baseline md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#2dd4bf]/10 text-[#0d9488] dark:text-[#2dd4bf] rounded-2xl ring-1 ring-[#2dd4bf]/20">
              <Users className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Resident Directory
              </h2>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">{students.length} Synchronized Student Nodes</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 w-full md:w-80 group">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#2dd4bf] transition-colors" />
              <input
                type="text"
                placeholder="Identify student node..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="w-full h-11 pl-12 pr-4 bg-transparent border-none text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200/60 dark:border-slate-800 overflow-hidden relative">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
                <TableRow className="hover:bg-transparent border-slate-200/60 dark:border-slate-800/50">
                  <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Vector</TableHead>
                  <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Node Identity</TableHead>
                  <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Registry ID</TableHead>
                  <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Communication Node</TableHead>
                  <TableHead className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 text-right pr-10">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] flex items-center justify-center shadow-inner ring-1 ring-slate-100 dark:ring-slate-700">
                            <Search className="h-10 w-10 text-slate-200 dark:text-slate-700" />
                          </div>
                          <p className="text-slate-400 dark:text-slate-500 font-black tracking-tight uppercase text-[10px] tracking-[0.2em]">Zero search matches in this node.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <motion.tr
                        key={student.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-[#2dd4bf]/5 transition-colors border-b border-slate-100 dark:border-slate-800/50 cursor-pointer group"
                        onClick={() => router.push(`/dashboard/teacher/department/student/${student.id}`)}
                      >
                        <TableCell className="p-6 text-[10px] font-black text-slate-300 dark:text-slate-700 font-mono">
                          {(index + 1).toString().padStart(3, '0')}
                        </TableCell>
                        <TableCell className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-2xl bg-[#2dd4bf]/10 dark:bg-[#2dd4bf]/20 text-[#0d9488] dark:text-[#2dd4bf] flex items-center justify-center text-sm font-black shadow-inner ring-1 ring-[#2dd4bf]/20">
                              {student.fullName.charAt(0)}
                            </div>
                            <span className="font-black text-slate-900 dark:text-white group-hover:text-[#2dd4bf] transition-colors leading-tight">{student.fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="p-6">
                           <span className="font-black text-slate-600 dark:text-slate-400 text-xs tracking-tight bg-slate-100/50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                            {student.registrationNumber}
                          </span>
                        </TableCell>
                        <TableCell className="p-6 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">{student.email}</TableCell>
                        <TableCell className="p-6 text-right pr-10">
                          <Badge
                            className={cn(
                              "capitalize border-2 font-black text-[9px] tracking-wider py-1 px-3 rounded-xl shadow-none",
                              student.enrollmentStatus === 'enrolled' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                              student.enrollmentStatus === 'graduated' && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                              student.enrollmentStatus === 'dropped_out' && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
                              (!student.enrollmentStatus || student.enrollmentStatus === 'suspended') && "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                            )}
                          >
                            {student.enrollmentStatus?.replace('_', ' ') || 'Unknown Signal'}
                          </Badge>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      </GlassCard>

      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-slate-200/60 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#2dd4bf]/20 text-[#0d9488] dark:text-[#2dd4bf] flex items-center justify-center mb-6 shadow-lg rotate-3 ring-1 ring-[#2dd4bf]/30">
              <UserCheck className="h-8 w-8" />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Assign Advisor Node</DialogTitle>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm pt-2 italic">Select a faculty member to oversee this academic vector.</p>
          </DialogHeader>

          <div className="px-8 pb-8">
            <Command className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-inner">
              <CommandInput
                placeholder="Search faculty directory..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="h-12 border-none focus:ring-0 font-bold text-sm"
              />
              <CommandList className="max-h-[280px] p-2">
                <CommandEmpty className="py-12 text-center">
                  <User className="h-10 w-10 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zero search results</p>
                </CommandEmpty>
                <CommandGroup>
                  {teachers.map((teacher) => (
                    <CommandItem
                      key={teacher.id}
                      value={teacher.fullName}
                      onSelect={() => setSelectedCounselor(teacher)}
                      className="cursor-pointer rounded-xl data-[selected=true]:bg-[#2dd4bf]/10 data-[selected=true]:text-[#0d9488] dark:data-[selected=true]:text-[#2dd4bf] my-1 p-3 transition-all"
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-500 ring-1 ring-slate-200/50 dark:ring-slate-700">
                            {teacher.fullName.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-sm text-slate-700 dark:text-slate-300 leading-tight">{teacher.fullName}</span>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-tighter">
                              {teacher.email}
                            </span>
                          </div>
                        </div>
                        {selectedCounselor?.id === teacher.id && (
                          <div className="h-6 w-6 rounded-full bg-[#2dd4bf] flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
          
          <DialogFooter className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsAssignDialogOpen(false)}
              className="rounded-xl h-12 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignCounselor}
              disabled={!selectedCounselor || isAssigning}
              className="rounded-xl h-12 px-8 bg-[#0d9488] dark:bg-[#2dd4bf] text-white dark:text-slate-900 hover:bg-[#0f766e] dark:hover:bg-[#14b8a6] shadow-xl shadow-teal-500/20 font-black text-[10px] uppercase tracking-widest flex-1 transition-all"
            >
              Commit Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

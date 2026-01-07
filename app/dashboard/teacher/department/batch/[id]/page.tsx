"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
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
} from "lucide-react";
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
      <DashboardLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
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
    <div className={cn("bg-white rounded-[1.5rem] shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow duration-300", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">
          {title}
        </h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  const LabelValue = ({ label, value, subValue }: any) => (
    <div>
      <label className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1 block">
        {label}
      </label>
      <p className="text-base font-bold text-slate-800">
        {value}
      </p>
      {subValue && (
        <p className="text-sm text-slate-400 mt-0.5">{subValue}</p>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black text-slate-900">Batch Details</h1>
              <Badge variant="outline" className="text-indigo-600 border-indigo-200 bg-indigo-50 font-bold">
                {batch.status ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </div>
            <p className="text-slate-500 font-medium">Manage batch information and students</p>
          </div>
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
          <InfoCard icon={GraduationCap} title="Academic Information">
            <LabelValue label="Program" value={getName(batch.programId)} />
            <LabelValue label="Department" value={getName(batch.departmentId)} />
            <div className="grid grid-cols-2 gap-6 py-2">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <span className="block text-xl font-black text-indigo-600">{batch.maxStudents}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">Max Students</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                <span className="block text-xl font-black text-emerald-600">{batch.currentStudents}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">Enrolled</span>
              </div>
            </div>
          </InfoCard>

          {/* Leadership & Duration Card (Combined or Separate) */}
          <div className="space-y-6">
            <InfoCard icon={UserCheck} title="Leadership">
              <div className="flex items-start justify-between">
                <LabelValue
                  label="Counselor"
                  value={assignedCounselor?.fullName || "Not Assigned"}
                  subValue={assignedCounselor?.email}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 font-semibold"
                  onClick={() => setIsAssignDialogOpen(true)}
                >
                  <Edit2 className="h-3 w-3 mr-1.5" />
                  {batch.counselor ? "Change" : "Assign"}
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
        <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Enrolled Students
                </h2>
                <p className="text-sm text-slate-500 font-medium">Total: {students.length} students</p>
              </div>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="w-full h-10 pl-11 pr-4 bg-slate-50 border border-slate-200 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="hover:bg-transparent border-slate-200">
                  <TableHead className="w-[80px] font-bold text-slate-700">#</TableHead>
                  <TableHead className="font-bold text-slate-700">Student Info</TableHead>
                  <TableHead className="font-bold text-slate-700">Registration ID</TableHead>
                  <TableHead className="font-bold text-slate-700">Email Address</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-400 py-6">
                        <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                          <Search className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="font-medium">No students found matching your search.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student, index) => (
                    <TableRow
                      key={student.id}
                      className="hover:bg-indigo-50/30 transition-colors border-slate-100 cursor-pointer group"
                      onClick={() => router.push(`/dashboard/teacher/department/student/${student.id}`)}
                    >
                      <TableCell className="font-medium text-slate-500 pl-6 group-hover:text-indigo-600 transition-colors">
                        {(index + 1).toString().padStart(2, '0')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 text-xs shadow-sm">
                            {student.fullName.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-700">{student.fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold text-slate-500 bg-slate-100/50 py-1 px-2 rounded w-fit">
                        {student.registrationNumber}
                      </TableCell>
                      <TableCell className="text-slate-600 font-medium">{student.email}</TableCell>
                      <TableCell className="text-right pr-6">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "capitalize font-bold border-0 shadow-none",
                            student.enrollmentStatus === 'enrolled' && "bg-emerald-100 text-emerald-700",
                            student.enrollmentStatus === 'graduated' && "bg-blue-100 text-blue-700",
                            student.enrollmentStatus === 'dropped_out' && "bg-rose-100 text-rose-700",
                            (!student.enrollmentStatus || student.enrollmentStatus === 'suspended') && "bg-slate-100 text-slate-600"
                          )}
                        >
                          {student.enrollmentStatus?.replace('_', ' ') || 'Unknown'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 text-center text-xs font-medium text-slate-400">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </div>

        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white rounded-2xl border-0 shadow-xl">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-xl font-bold text-slate-900">Assign Batch Counselor</DialogTitle>
            </DialogHeader>
            <div className="px-4 pb-4">
              <Command className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <CommandInput
                  placeholder="Search teachers..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="border-none focus:ring-0"
                />
                <CommandList className="max-h-[300px] overflow-y-auto p-1">
                  <CommandEmpty className="py-6 text-center text-sm text-slate-500">No teachers found.</CommandEmpty>
                  <CommandGroup>
                    {teachers.map((teacher) => (
                      <CommandItem
                        key={teacher.id}
                        value={teacher.fullName}
                        onSelect={() => setSelectedCounselor(teacher)}
                        className="cursor-pointer rounded-lg data-[selected=true]:bg-indigo-50 data-[selected=true]:text-indigo-700 my-1 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        <div className="flex items-center justify-between w-full p-1">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                              {teacher.fullName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold">{teacher.fullName}</span>
                              <span className="text-xs text-slate-500">
                                {teacher.email}
                              </span>
                            </div>
                          </div>
                          {selectedCounselor?.id === teacher.id && (
                            <Check className="h-4 w-4 text-indigo-600" />
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
            <DialogFooter className="p-6 pt-2 flex gap-2 bg-slate-50 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setIsAssignDialogOpen(false)}
                className="rounded-xl border-slate-200 hover:bg-white hover:text-slate-900"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignCounselor}
                disabled={!selectedCounselor}
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
              >
                Assign Selected
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

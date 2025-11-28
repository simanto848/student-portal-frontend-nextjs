"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { teacherService, Teacher, TeacherDesignation } from "@/services/user/teacher.service";
import { toast } from "sonner";
import { GraduationCap, Search, Plus, Eye, Edit, Trash2, Loader2 } from "lucide-react";

const designationLabel: Record<TeacherDesignation, string> = {
  professor: "Professor",
  associate_professor: "Associate Professor",
  assistant_professor: "Assistant Professor",
  lecturer: "Lecturer",
  senior_lecturer: "Senior Lecturer",
};

const designationColor: Record<TeacherDesignation, string> = {
  professor: "bg-purple-500",
  associate_professor: "bg-blue-500",
  assistant_professor: "bg-cyan-500",
  lecturer: "bg-green-500",
  senior_lecturer: "bg-teal-500",
};

export default function TeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<any>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedTeachers, setDeletedTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    fetchTeachers();
    if (showDeleted) fetchDeleted();
  }, [showDeleted]);

  const fetchTeachers = async (searchTerm = "") => {
    setIsLoading(true);
    try {
      const data = await teacherService.getAll({ search: searchTerm, limit: 50 });
      setTeachers(data.teachers);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load teachers");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeleted = async () => {
    try {
      const list = await teacherService.getDeleted();
      setDeletedTeachers(list);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load deleted teachers");
    }
  };

  const handleSearch = () => {
    fetchTeachers(search);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await teacherService.delete(id);
      toast.success("Teacher deleted successfully");
      fetchTeachers(search);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete teacher");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await teacherService.restore(id);
      toast.success("Teacher restored");
      fetchDeleted();
      fetchTeachers(search);
    } catch (e: any) {
      toast.error(e?.message || "Restore failed");
    }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await teacherService.deletePermanently(id);
      toast.success("Teacher permanently deleted");
      fetchDeleted();
    } catch (e: any) {
      toast.error(e?.message || "Permanent delete failed");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#588157]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Faculty Management"
          subtitle="Manage teachers and instructors"
          icon={GraduationCap}
          actionLabel="Add New Teacher"
          onAction={() => router.push("/dashboard/admin/users/faculty/create")}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={showDeleted ? "default" : "outline"}
              onClick={() => setShowDeleted((v) => !v)}
              className={
                showDeleted
                  ? "bg-[#588157] text-white"
                  : "border-[#a3b18a] text-[#344e41]"
              }
            >
              {showDeleted ? "Showing Deleted" : "Show Deleted"}
            </Button>
          </div>
        </div>

        {!showDeleted && (
          <Card className="border-[#a3b18a]/30">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 flex gap-2">
                  <Input
                    placeholder="Search teachers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                  />
                  <Button
                    onClick={handleSearch}
                    className="bg-[#588157] hover:bg-[#3a5a40] text-white"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  onClick={() => router.push("/dashboard/admin/users/faculty/create")}
                  className="bg-[#588157] hover:bg-[#3a5a40] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Teacher
                </Button>
              </div>

              {teachers.length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap className="h-12 w-12 mx-auto text-[#a3b18a] mb-4" />
                  <p className="text-[#344e41]/60">No teachers found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#dad7cd]/40">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-[#344e41]">
                          Name
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-[#344e41]">
                          Email
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-[#344e41]">
                          Designation
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-[#344e41]">
                          Department
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-[#344e41]">
                          Registration No.
                        </th>
                        <th className="text-right p-4 text-sm font-semibold text-[#344e41]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((teacher) => (
                        <tr
                          key={teacher.id}
                          className="border-b border-[#a3b18a]/20 hover:bg-[#dad7cd]/20 transition-colors"
                        >
                          <td className="p-4">
                            <p className="font-medium text-[#344e41]">
                              {teacher.fullName}
                            </p>
                          </td>
                          <td className="p-4 text-sm text-[#344e41]/80">
                            {teacher.email}
                          </td>
                          <td className="p-4">
                            {teacher.designation && (
                              <Badge
                                className={`${
                                  designationColor[teacher.designation]
                                } text-white`}
                              >
                                {designationLabel[teacher.designation]}
                              </Badge>
                            )}
                          </td>
                          <td className="p-4 text-sm text-[#344e41]/80">
                            {teacher.department?.name || teacher.departmentId}
                          </td>
                          <td className="p-4 text-sm text-[#344e41]/80 font-mono">
                            {teacher.registrationNumber}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(`/dashboard/admin/users/faculty/${teacher.id}`)
                                }
                                className="text-[#588157] hover:text-[#3a5a40] hover:bg-[#588157]/10"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/admin/users/faculty/${teacher.id}/edit`
                                  )
                                }
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(teacher.id, teacher.fullName)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {pagination && pagination.total > 0 && (
                <div className="mt-6 flex items-center justify-between text-sm text-[#344e41]/60">
                  <p>
                    Showing {teachers.length} of {pagination.total} teachers
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {showDeleted && (
          <Card className="border-[#a3b18a]/30">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#344e41] mb-4">
                Deleted Teachers
              </h2>
              {deletedTeachers.length === 0 ? (
                <p className="text-sm text-[#344e41]/60">
                  No deleted teachers.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#dad7cd]/40">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-[#344e41]">
                          Name
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-[#344e41]">
                          Email
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-[#344e41]">
                          Designation
                        </th>
                        <th className="text-left p-4 text-sm font-semibold text-[#344e41]">
                          Department
                        </th>
                        <th className="text-right p-4 text-sm font-semibold text-[#344e41]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {deletedTeachers.map((t) => (
                        <tr
                          key={t.id}
                          className="border-b border-[#a3b18a]/20 hover:bg-[#dad7cd]/20 transition-colors"
                        >
                          <td className="p-4">
                            <p className="font-medium text-[#344e41]">{t.fullName}</p>
                          </td>
                          <td className="p-4 text-sm text-[#344e41]/80">{t.email}</td>
                          <td className="p-4">
                            {t.designation && (
                              <Badge className="bg-[#588157] text-white">
                                {t.designation}
                              </Badge>
                            )}
                          </td>
                          <td className="p-4 text-sm text-[#344e41]/80">
                            {t.department?.name || t.departmentId}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestore(t.id)}
                                className="border-[#588157] text-[#588157]"
                              >
                                Restore
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handlePermanentDelete(t.id, t.fullName)
                                }
                                className="border-red-500 text-red-600"
                              >
                                Delete Permanently
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}


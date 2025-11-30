"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { staffService, Staff, StaffRole } from "@/services/user/staff.service";
import { toast } from "sonner";
import { Users, Search, Plus, Eye, Edit, Trash2, Loader2 } from "lucide-react";

const roleLabel: Record<StaffRole, string> = {
  program_controller: "Program Controller",
  admission: "Admission",
  library: "Library",
  it: "IT",
};

const roleColor: Record<StaffRole, string> = {
  program_controller: "bg-purple-500",
  admission: "bg-blue-500",
  library: "bg-green-500",
  it: "bg-cyan-500",
};

export default function StaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
  } | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [deletedStaff, setDeletedStaff] = useState<Staff[]>([]);

  useEffect(() => {
    fetchStaff();
    if (showDeleted) fetchDeleted();
  }, [showDeleted]);

  const fetchStaff = async (searchTerm = "") => {
    setIsLoading(true);
    try {
      const data = await staffService.getAll({ search: searchTerm, limit: 50 });
      setStaff(data.staff);
      setPagination(data.pagination || null);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load staff"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeleted = async () => {
    try {
      const list = await staffService.getDeleted();
      setDeletedStaff(list);
    } catch (e) {
      const error = e as Error;
      toast.error(error?.message || "Failed to load deleted staff");
    }
  };

  const handleSearch = () => {
    fetchStaff(search);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await staffService.delete(id);
      toast.success("Staff deleted successfully");
      fetchStaff(search);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete staff"
      );
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await staffService.restore(id);
      toast.success("Staff restored");
      fetchDeleted();
      fetchStaff(search);
    } catch (e) {
      const error = e as Error;
      toast.error(error?.message || "Restore failed");
    }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return;
    try {
      await staffService.deletePermanently(id);
      toast.success("Staff permanently deleted");
      fetchDeleted();
    } catch (e) {
      const error = e as Error;
      toast.error(error?.message || "Permanent delete failed");
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
          title="Staff Management"
          subtitle="Manage administrative staff members"
          icon={Users}
          actionLabel="Add New Staff"
          onAction={() => router.push("/dashboard/admin/users/staff/create")}
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
                    placeholder="Search staff..."
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
                  onClick={() =>
                    router.push("/dashboard/admin/users/staff/create")
                  }
                  className="bg-[#588157] hover:bg-[#3a5a40] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Staff
                </Button>
              </div>

              {staff.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-[#a3b18a] mb-4" />
                  <p className="text-[#344e41]/60">No staff found</p>
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
                          Role
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
                      {staff.map((member) => (
                        <tr
                          key={member.id}
                          className="border-b border-[#a3b18a]/20 hover:bg-[#dad7cd]/20 transition-colors"
                        >
                          <td className="p-4">
                            <p className="font-medium text-[#344e41]">
                              {member.fullName}
                            </p>
                          </td>
                          <td className="p-4 text-sm text-[#344e41]/80">
                            {member.email}
                          </td>
                          <td className="p-4">
                            {member.role && (
                              <Badge
                                className={`${
                                  roleColor[member.role]
                                } text-white`}
                              >
                                {roleLabel[member.role]}
                              </Badge>
                            )}
                          </td>
                          <td className="p-4 text-sm text-[#344e41]/80">
                            {member.department?.name || member.departmentId}
                          </td>
                          <td className="p-4 text-sm text-[#344e41]/80 font-mono">
                            {member.registrationNumber}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  router.push(
                                    `/dashboard/admin/users/staff/${member.id}`
                                  )
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
                                    `/dashboard/admin/users/staff/${member.id}/edit`
                                  )
                                }
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDelete(member.id, member.fullName)
                                }
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
                    Showing {staff.length} of {pagination.total} staff members
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
                Deleted Staff
              </h2>
              {deletedStaff.length === 0 ? (
                <p className="text-sm text-[#344e41]/60">No deleted staff.</p>
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
                          Role
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
                      {deletedStaff.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-[#a3b18a]/20 hover:bg-[#dad7cd]/20 transition-colors"
                        >
                          <td className="p-4">
                            <p className="font-medium text-[#344e41]">
                              {s.fullName}
                            </p>
                          </td>
                          <td className="p-4 text-sm text-[#344e41]/80">
                            {s.email}
                          </td>
                          <td className="p-4">
                            {s.role && (
                              <Badge className="bg-[#588157] text-white">
                                {roleLabel[s.role]}
                              </Badge>
                            )}
                          </td>
                          <td className="p-4 text-sm text-[#344e41]/80">
                            {s.department?.name || s.departmentId}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestore(s.id)}
                                className="border-[#588157] text-[#588157]"
                              >
                                Restore
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handlePermanentDelete(s.id, s.fullName)
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

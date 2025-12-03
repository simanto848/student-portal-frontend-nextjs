"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { borrowingService } from "@/services/library/borrowing.service";
import { bookCopyService } from "@/services/library/bookCopy.service";
import { libraryService } from "@/services/library/library.service";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Calendar, BookOpen, User } from "lucide-react";

import { studentService } from "@/services/user/student.service";
import { teacherService } from "@/services/user/teacher.service";
import { staffService } from "@/services/user/staff.service";
import { adminService } from "@/services/user/admin.service";

export default function IssueBookPage() {
  const router = useRouter();
  const [payload, setPayload] = useState({
    userType: "student" as "student" | "teacher" | "staff" | "admin",
    borrowerId: "",
    copyId: "",
    libraryId: "",
    dueDate: "",
    notes: "",
  });

  const [copies, setCopies] = useState<{ label: string; value: string; libraryId?: string }[]>([]);
  const [libraries, setLibraries] = useState<{ label: string; value: string }[]>([]);
  const [borrowers, setBorrowers] = useState<{ label: string; value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (payload.userType) {
      fetchBorrowers(payload.userType);
    }
  }, [payload.userType]);

  const fetchBorrowers = async (type: string) => {
    try {
      let data: any[] = [];
      switch (type) {
        case 'student':
          const sRes = await studentService.getAll({ limit: 100 });
          data = sRes.students || [];
          break;
        case 'teacher':
          const tRes = await teacherService.getAll({ limit: 100 });
          data = tRes.teachers || [];
          break;
        case 'staff':
          const stRes = await staffService.getAll({ limit: 100 });
          data = stRes.staff || [];
          break;
        case 'admin':
          const aRes = await adminService.getAll({ limit: 100 });
          data = aRes.admins || [];
          break;
      }
      setBorrowers(data?.map(u => ({
        label: `${u.fullName} (${u.email || u.username})`,
        value: u.id
      })) || []);
    } catch (error) {
      console.error("Failed to fetch borrowers", error);
      toast.error("Failed to load borrower list");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [copiesRes, librariesRes] = await Promise.all([
          bookCopyService.getAll({ limit: 1000 }), // Fetch available copies
          libraryService.getAll({ limit: 100 }),
        ]);

        // Filter only available copies
        const availableCopies = copiesRes.bookCopies
          .filter(c => c.status === 'available')
          .map(c => ({
            label: `${c.book?.title} (Copy: ${c.copyNumber})`,
            value: c.id,
            libraryId: c.libraryId
          }));

        setCopies(availableCopies);

        setLibraries(
          librariesRes.libraries.map((l) => ({
            label: `${l.name} (${l.code})`,
            value: l.id,
          }))
        );
      } catch {
        toast.error("Failed to load form data");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Auto-select library when copy is selected
  useEffect(() => {
    if (payload.copyId) {
      const selectedCopy = copies.find(c => c.value === payload.copyId);
      if (selectedCopy && selectedCopy.libraryId) {
        setPayload(prev => ({ ...prev, libraryId: selectedCopy.libraryId! }));
      }
    }
  }, [payload.copyId, copies]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload.copyId || !payload.libraryId || !payload.borrowerId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const created = await borrowingService.borrow(payload);
      toast.success("Book issued successfully");
      router.push(`/dashboard/staff/library/borrowings/${created.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to issue book");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#344e41]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#344e41]">Issue Book</h1>
            <p className="text-sm text-gray-500">Create a new borrowing record</p>
          </div>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-lg font-medium">Borrowing Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Borrower Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-[#344e41] font-medium border-b pb-2">
                    <User className="h-4 w-4" />
                    Borrower Information
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>User Type</Label>
                      <Select
                        value={payload.userType}
                        onValueChange={(val) =>
                          setPayload({ ...payload, userType: val as any, borrowerId: "" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Borrower</Label>
                      <SearchableSelect
                        options={borrowers}
                        value={payload.borrowerId}
                        onChange={(val) => setPayload({ ...payload, borrowerId: val })}
                        placeholder="Select borrower..."
                        disabled={!payload.userType}
                      />
                      <p className="text-xs text-gray-500">Search by name or email.</p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Book Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-[#344e41] font-medium border-b pb-2">
                    <BookOpen className="h-4 w-4" />
                    Book Information
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Book Copy</Label>
                      <SearchableSelect
                        options={copies}
                        value={payload.copyId}
                        onChange={(val) => setPayload({ ...payload, copyId: val })}
                        placeholder="Search available copies..."
                      />
                      <p className="text-xs text-gray-500">Only available copies are shown.</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Library Branch</Label>
                      <SearchableSelect
                        options={libraries}
                        value={payload.libraryId}
                        onChange={(val) => setPayload({ ...payload, libraryId: val })}
                        placeholder="Select library..."
                        disabled={!!payload.copyId} // Auto-filled usually
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Width: Dates & Notes */}
              <div className="space-y-6 pt-2">
                <div className="flex items-center gap-2 text-[#344e41] font-medium border-b pb-2">
                  <Calendar className="h-4 w-4" />
                  Transaction Details
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <Label>Due Date (Optional Override)</Label>
                    <Input
                      type="date"
                      value={payload.dueDate}
                      onChange={(e) =>
                        setPayload({ ...payload, dueDate: e.target.value })
                      }
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <p className="text-xs text-gray-500">Leave blank to use default borrowing period.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={payload.notes}
                      onChange={(e) =>
                        setPayload({ ...payload, notes: e.target.value })
                      }
                      placeholder="Any initial notes (e.g. existing damage)..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#344e41] hover:bg-[#2a3f34] min-w-[120px]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Issuing...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Issue Book
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

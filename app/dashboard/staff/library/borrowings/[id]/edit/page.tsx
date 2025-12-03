"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { borrowingService } from "@/services/library/borrowing.service";
import { libraryService } from "@/services/library/library.service";
import { bookCopyService } from "@/services/library/bookCopy.service";
import { studentService } from "@/services/user/student.service";
import { teacherService } from "@/services/user/teacher.service";
import { staffService } from "@/services/user/staff.service";
import { adminService } from "@/services/user/admin.service";
import type {
  BorrowingUpdatePayload,
  Borrowing,
  BorrowingStatus,
  Library,
  BookCopy,
} from "@/services/library";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, AlertTriangle, User, BookOpen, Building2, Calendar, DollarSign, FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Separator } from "@/components/ui/separator";

export default function EditBorrowingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Borrowing | null>(null);
  const [payload, setPayload] = useState<BorrowingUpdatePayload>({});
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data for selects
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [borrowers, setBorrowers] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (!id) return;
    fetchInitialData();
  }, [id]);

  useEffect(() => {
    if (payload.userType) {
      fetchBorrowers(payload.userType);
    }
  }, [payload.userType]);

  const fetchInitialData = async () => {
    try {
      const [borrowingList, libraryList, copyList] = await Promise.all([
        borrowingService.getAll({ limit: 100 }),
        libraryService.getAll({ limit: 100 }),
        bookCopyService.getAll({ limit: 100 })
      ]);

      const found = borrowingList.borrowings.find((b) => b.id === id) ?? null;

      if (found) {
        setItem(found);
        setPayload({
          userType: found.userType,
          borrowerId: found.borrowerId,
          copyId: found.copyId,
          libraryId: found.libraryId,
          status: found.status as BorrowingStatus,
          notes: found.notes ?? "",
          returnDate: found.returnDate ? new Date(found.returnDate).toISOString().split('T')[0] : "",
          dueDate: found.dueDate ? new Date(found.dueDate).toISOString().split('T')[0] : "",
          fineAmount: found.fineAmount ?? 0,
          finePaid: found.finePaid ?? false,
        });

        // Initial fetch of borrowers based on existing userType
        if (found.userType) {
          fetchBorrowers(found.userType);
        }
      }

      setLibraries(libraryList.libraries || []);
      setCopies(copyList.bookCopies || []);

    } catch {
      toast.error("Failed to load borrowing details");
    } finally {
      setIsLoading(false);
    }
  };

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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      // Clean up payload
      const finalPayload = { ...payload };
      if (!finalPayload.returnDate) delete finalPayload.returnDate;

      const updated = await borrowingService.updateStatus(id, finalPayload);
      toast.success("Borrowing updated successfully");
      router.push(`/dashboard/staff/library/borrowings/${updated.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update borrowing");
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

  if (!item) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
          <h2 className="text-xl font-semibold">Record Not Found</h2>
          <Button onClick={() => router.back()} variant="outline">Go Back</Button>
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
            <h1 className="text-2xl font-bold text-[#344e41]">Edit Borrowing</h1>
            <p className="text-sm text-gray-500">Update transaction details and status</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-8">
          {/* Transaction Info */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#588157]" />
                Transaction Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={payload.status}
                  onValueChange={(val) =>
                    setPayload({ ...payload, status: val as BorrowingStatus })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrowed">Borrowed</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Borrower Info */}
            <Card className="border-none shadow-sm h-full">
              <CardHeader className="border-b bg-gray-50/50 pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-[#588157]" />
                  Borrower Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
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
                    options={borrowers || []}
                    value={payload.borrowerId}
                    onChange={(val) => setPayload({ ...payload, borrowerId: val })}
                    placeholder="Select borrower..."
                    disabled={!payload.userType}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Book & Library Info */}
            <Card className="border-none shadow-sm h-full">
              <CardHeader className="border-b bg-gray-50/50 pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#588157]" />
                  Book & Library
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label>Library</Label>
                  <SearchableSelect
                    options={libraries?.map(l => ({ label: l.name, value: l.id })) || []}
                    value={payload.libraryId}
                    onChange={(val) => setPayload({ ...payload, libraryId: val })}
                    placeholder="Select library..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Book Copy</Label>
                  <SearchableSelect
                    options={copies?.map(c => ({
                      label: `${c.book?.title} (${c.copyNumber})`,
                      value: c.id
                    })) || []}
                    value={payload.copyId}
                    onChange={(val) => setPayload({ ...payload, copyId: val })}
                    placeholder="Select book copy..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dates & Financials */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#588157]" />
                Dates & Financials
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={payload.dueDate as string}
                    onChange={(e) =>
                      setPayload({ ...payload, dueDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Return Date</Label>
                  <Input
                    type="date"
                    value={payload.returnDate as string}
                    onChange={(e) =>
                      setPayload({ ...payload, returnDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fine Amount ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-9"
                      value={payload.fineAmount}
                      onChange={(e) =>
                        setPayload({ ...payload, fineAmount: parseFloat(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="finePaid"
                    checked={payload.finePaid}
                    onCheckedChange={(checked) =>
                      setPayload({ ...payload, finePaid: checked as boolean })
                    }
                  />
                  <Label htmlFor="finePaid" className="text-sm font-medium leading-none cursor-pointer">
                    Fine Paid
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-none shadow-sm">
            <CardHeader className="border-b bg-gray-50/50 pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#588157]" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea
                value={payload.notes}
                onChange={(e) =>
                  setPayload({ ...payload, notes: e.target.value })
                }
                rows={4}
                placeholder="Add any additional notes about this transaction..."
                className="resize-none"
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-4">
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
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

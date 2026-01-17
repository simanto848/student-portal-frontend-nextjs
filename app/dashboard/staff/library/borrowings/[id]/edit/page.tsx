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
import { ArrowLeft, Save, Loader2, AlertTriangle, User, BookOpen, Calendar, DollarSign, FileText, BookUp, Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

  // Date picker states
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [returnDate, setReturnDate] = useState<Date | undefined>();

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

        // Set date picker states
        if (found.dueDate) setDueDate(new Date(found.dueDate));
        if (found.returnDate) setReturnDate(new Date(found.returnDate));

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "borrowed": return "bg-teal-100 text-teal-800 border-teal-200";
      case "returned": return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "overdue": return "bg-rose-100 text-rose-800 border-rose-200";
      case "lost": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <div className="p-4 bg-amber-50 rounded-full">
            <AlertTriangle className="h-12 w-12 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Record Not Found</h2>
          <p className="text-slate-500">The borrowing record you're trying to edit doesn't exist.</p>
          <Button onClick={() => router.back()} variant="outline" className="border-slate-200 hover:bg-slate-50">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto pb-10">
        {/* Header Section - Teal Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-teal-800 to-cyan-700 p-6 text-white shadow-xl">
          <div className="relative z-10 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                <BookUp className="h-6 w-6 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">Edit Borrowing</h1>
                  <Badge className={cn("capitalize", getStatusColor(item.status))}>
                    {item.status}
                  </Badge>
                </div>
                <p className="text-cyan-100 text-sm">Update transaction details and status</p>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent skew-x-12 transform translate-x-12" />
          <div className="absolute right-10 bottom-0 h-20 w-20 rounded-full bg-cyan-400/20 blur-2xl" />
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Status Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-orange-500 border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-md transition-all p-0">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50/50 to-orange-50/30 py-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                <div className="p-1.5 bg-orange-50 rounded-lg">
                  <Settings className="h-4 w-4 text-orange-600" />
                </div>
                Transaction Status
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700">Status</Label>
                <Select
                  value={payload.status}
                  onValueChange={(val) =>
                    setPayload({ ...payload, status: val as BorrowingStatus })
                  }
                >
                  <SelectTrigger className="border-slate-200 focus:ring-teal-500 focus:border-teal-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrowed">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                        Borrowed
                      </div>
                    </SelectItem>
                    <SelectItem value="returned">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-cyan-500"></span>
                        Returned
                      </div>
                    </SelectItem>
                    <SelectItem value="overdue">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                        Overdue
                      </div>
                    </SelectItem>
                    <SelectItem value="lost">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                        Lost
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Borrower Info */}
            <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-teal-500 border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-md transition-all p-0">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50/50 to-teal-50/30 py-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-teal-50 rounded-lg">
                    <User className="h-4 w-4 text-teal-600" />
                  </div>
                  Borrower Details
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">User Type</Label>
                  <Select
                    value={payload.userType}
                    onValueChange={(val) =>
                      setPayload({ ...payload, userType: val as any, borrowerId: "" })
                    }
                  >
                    <SelectTrigger className="border-slate-200 focus:ring-teal-500 focus:border-teal-500">
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
                  <Label className="text-slate-700">Borrower</Label>
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
            <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-cyan-500 border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-md transition-all p-0">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50/50 to-cyan-50/30 py-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-cyan-50 rounded-lg">
                    <BookOpen className="h-4 w-4 text-cyan-600" />
                  </div>
                  Book & Library
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">Library</Label>
                  <SearchableSelect
                    options={libraries?.map(l => ({ label: l.name, value: l.id })) || []}
                    value={payload.libraryId}
                    onChange={(val) => setPayload({ ...payload, libraryId: val })}
                    placeholder="Select library..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Book Copy</Label>
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
          <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-violet-500 border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-md transition-all p-0">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50/50 to-violet-50/30 py-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                <div className="p-1.5 bg-violet-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-violet-600" />
                </div>
                Dates & Financials
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700">Due Date</Label>
                  <DatePicker
                    date={dueDate}
                    onChange={(date) => {
                      setDueDate(date);
                      setPayload({ ...payload, dueDate: date?.toISOString().split('T')[0] });
                    }}
                    placeholder="Select due date"
                    className="h-10 rounded-lg border-slate-200 bg-white hover:border-teal-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Return Date</Label>
                  <DatePicker
                    date={returnDate}
                    onChange={(date) => {
                      setReturnDate(date);
                      setPayload({ ...payload, returnDate: date?.toISOString().split('T')[0] });
                    }}
                    placeholder="Select return date"
                    className="h-10 rounded-lg border-slate-200 bg-white hover:border-teal-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Fine Amount ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-9 border-slate-200 focus:ring-teal-500 focus:border-teal-500"
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
                  <Label htmlFor="finePaid" className="text-sm font-medium leading-none cursor-pointer text-slate-700">
                    Fine Paid
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-sky-500 border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-md transition-all p-0">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50/50 to-sky-50/30 py-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                <div className="p-1.5 bg-sky-50 rounded-lg">
                  <FileText className="h-4 w-4 text-sky-600" />
                </div>
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6">
              <Textarea
                value={payload.notes}
                onChange={(e) =>
                  setPayload({ ...payload, notes: e.target.value })
                }
                rows={4}
                placeholder="Add any additional notes about this transaction..."
                className="resize-none border-slate-200 focus:ring-teal-500 focus:border-teal-500"
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
              className="border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 min-w-[140px] shadow-lg text-white"
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

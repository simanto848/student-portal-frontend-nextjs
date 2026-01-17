"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { DatePicker } from "@/components/ui/date-picker";
import { borrowingService } from "@/services/library/borrowing.service";
import { bookCopyService } from "@/services/library/bookCopy.service";
import { libraryService } from "@/services/library/library.service";
import { bookService } from "@/services/library/book.service";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Calendar, BookOpen, User, BookUp, FileText } from "lucide-react";

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

  const [books, setBooks] = useState<{ label: string; value: string }[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [copies, setCopies] = useState<{ label: string; value: string; libraryId?: string }[]>([]);
  const [libraries, setLibraries] = useState<{ label: string; value: string }[]>([]);
  const [borrowers, setBorrowers] = useState<{ label: string; value: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCopies, setLoadingCopies] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Date picker state
  const [dueDate, setDueDate] = useState<Date | undefined>();

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

  // Initial data fetch: books and libraries
  useEffect(() => {
    (async () => {
      try {
        const [booksRes, librariesRes] = await Promise.all([
          bookService.getAll({ limit: 100 }),
          libraryService.getAll({ limit: 100 }),
        ]);

        setBooks(
          booksRes.books.map((b) => ({
            label: `${b.title} (${b.author})`,
            value: b.id,
          }))
        );

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

  // Fetch copies when a book is selected
  useEffect(() => {
    if (!selectedBookId) {
      setCopies([]);
      return;
    }

    (async () => {
      setLoadingCopies(true);
      try {
        const copiesRes = await bookCopyService.getAvailableCopiesByBook(selectedBookId);
        const availableCopies = copiesRes.map(c => ({
          label: `Copy: ${c.copyNumber} (${c.location || 'No Location'})`,
          value: c.id,
          libraryId: c.libraryId
        }));
        setCopies(availableCopies);
      } catch {
        toast.error("Failed to load book copies");
      } finally {
        setLoadingCopies(false);
      }
    })();
  }, [selectedBookId]);

  // Reset copy selection and fetch when book changes
  const handleBookChange = (bookId: string) => {
    setSelectedBookId(bookId);
    setPayload(prev => ({ ...prev, copyId: "", libraryId: "" }));
  };

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
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
                <h1 className="text-2xl font-bold tracking-tight">Issue Book</h1>
                <p className="text-cyan-100 text-sm">Create a new borrowing record</p>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent skew-x-12 transform translate-x-12" />
          <div className="absolute right-10 bottom-0 h-20 w-20 rounded-full bg-cyan-400/20 blur-2xl" />
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Borrower Info */}
            <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-teal-500 border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-md transition-all p-0">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50/50 to-teal-50/30 py-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-teal-50 rounded-lg">
                    <User className="h-4 w-4 text-teal-600" />
                  </div>
                  Borrower Information
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">User Type <span className="text-rose-500">*</span></Label>
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
                  <Label className="text-slate-700">Borrower <span className="text-rose-500">*</span></Label>
                  <SearchableSelect
                    options={borrowers}
                    value={payload.borrowerId}
                    onChange={(val) => setPayload({ ...payload, borrowerId: val })}
                    placeholder="Select borrower..."
                    disabled={!payload.userType}
                  />
                  <p className="text-xs text-slate-500">Search by name or email.</p>
                </div>
              </CardContent>
            </Card>

            {/* Book Info */}
            <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-cyan-500 border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-md transition-all p-0">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50/50 to-cyan-50/30 py-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-cyan-50 rounded-lg">
                    <BookOpen className="h-4 w-4 text-cyan-600" />
                  </div>
                  Book Information
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">Select Book <span className="text-rose-500">*</span></Label>
                  <SearchableSelect
                    options={books}
                    value={selectedBookId}
                    onChange={handleBookChange}
                    placeholder="Search books..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 flex items-center gap-2">
                    Select Book Copy <span className="text-rose-500">*</span>
                    {loadingCopies && <Loader2 className="h-3 w-3 animate-spin text-teal-600" />}
                  </Label>
                  <SearchableSelect
                    options={copies}
                    value={payload.copyId}
                    onChange={(val) => setPayload({ ...payload, copyId: val })}
                    placeholder={selectedBookId ? "Search available copies..." : "Select a book first"}
                    disabled={!selectedBookId || loadingCopies}
                  />
                  <p className="text-xs text-slate-500">Only available copies are shown.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Library Branch <span className="text-rose-500">*</span></Label>
                  <SearchableSelect
                    options={libraries}
                    value={payload.libraryId}
                    onChange={(val) => setPayload({ ...payload, libraryId: val })}
                    placeholder="Select library..."
                    disabled={!!payload.copyId}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Details */}
          <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-orange-500 border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-md transition-all p-0">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50/50 to-orange-50/30 py-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                <div className="p-1.5 bg-orange-50 rounded-lg">
                  <Calendar className="h-4 w-4 text-orange-600" />
                </div>
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-slate-700">Due Date (Optional Override)</Label>
                  <DatePicker
                    date={dueDate}
                    onChange={(date) => {
                      setDueDate(date);
                      setPayload({ ...payload, dueDate: date?.toISOString().split('T')[0] || "" });
                    }}
                    placeholder="Select due date"
                    className="h-10 rounded-lg border-slate-200 bg-white hover:border-teal-400"
                  />
                  <p className="text-xs text-slate-500">Leave blank to use default borrowing period.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Notes</Label>
                  <Textarea
                    value={payload.notes}
                    onChange={(e) =>
                      setPayload({ ...payload, notes: e.target.value })
                    }
                    placeholder="Any initial notes (e.g. existing damage)..."
                    rows={3}
                    className="resize-none border-slate-200 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
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
      </div>
    </DashboardLayout>
  );
}

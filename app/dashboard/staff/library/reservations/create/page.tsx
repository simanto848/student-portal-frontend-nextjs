"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reservationService } from "@/services/library/reservation.service";
import { libraryService } from "@/services/library/library.service";
import { bookCopyService } from "@/services/library/bookCopy.service";
import { studentService } from "@/services/user/student.service";
import { teacherService } from "@/services/user/teacher.service";
import { staffService } from "@/services/user/staff.service";
import { adminService } from "@/services/user/admin.service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { ArrowLeft, Save, Loader2, User, BookOpen, FileText, CalendarClock, Sparkles } from "lucide-react";
import type { Library, BookCopy } from "@/services/library";

export default function CreateReservationPage() {
  const router = useRouter();
  const [payload, setPayload] = useState({
    userType: "",
    userId: "",
    copyId: "",
    libraryId: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data for selects
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [borrowers, setBorrowers] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (payload.userType) {
      fetchBorrowers(payload.userType);
    }
  }, [payload.userType]);

  const fetchInitialData = async () => {
    try {
      const [libraryList, copyList] = await Promise.all([
        libraryService.getAll({ limit: 100 }),
        bookCopyService.getAll({ limit: 100 })
      ]);
      setLibraries(libraryList.libraries || []);
      setCopies(copyList.bookCopies || []);
    } catch {
      toast.error("Failed to load initial data");
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
    if (!payload.userType || !payload.userId || !payload.copyId || !payload.libraryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const created = await reservationService.create(payload);
      toast.success("Reservation created successfully");
      router.push(`/dashboard/staff/library/reservations/${created.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create reservation");
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
                <CalendarClock className="h-6 w-6 text-cyan-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">New Reservation</h1>
                <p className="text-cyan-100 text-sm">Create a new book reservation</p>
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
                  Borrower Details
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-700">User Type <span className="text-rose-500">*</span></Label>
                  <Select
                    value={payload.userType}
                    onValueChange={(val) =>
                      setPayload({ ...payload, userType: val, userId: "" })
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
                    value={payload.userId}
                    onChange={(val) => setPayload({ ...payload, userId: val })}
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
                  <Label className="text-slate-700">Library <span className="text-rose-500">*</span></Label>
                  <SearchableSelect
                    options={libraries.map(l => ({ label: l.name, value: l.id }))}
                    value={payload.libraryId}
                    onChange={(val) => setPayload({ ...payload, libraryId: val })}
                    placeholder="Select library..."
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700">Book Copy <span className="text-rose-500">*</span></Label>
                  <SearchableSelect
                    options={copies.map(c => ({
                      label: `${c.book?.title} (${c.copyNumber})`,
                      value: c.id
                    }))}
                    value={payload.copyId}
                    onChange={(val) => setPayload({ ...payload, copyId: val })}
                    placeholder="Select book copy..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

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
                placeholder="Add any additional notes..."
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Reservation
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

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
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Badge } from "@/components/ui/badge";
import { reservationService } from "@/services/library/reservation.service";
import { bookService } from "@/services/library/book.service";
import { bookCopyService } from "@/services/library/bookCopy.service";
import { studentService } from "@/services/user/student.service";
import { teacherService } from "@/services/user/teacher.service";
import { staffService } from "@/services/user/staff.service";
import { adminService } from "@/services/user/admin.service";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/utils";
import { ArrowLeft, Save, Loader2, CalendarClock, BookOpen, User, FileText, Search, UserCheck } from "lucide-react";
import type { BookCopy } from "@/services/library";

export default function CreateReservationPage() {
  const router = useRouter();
  const [payload, setPayload] = useState({
    userType: "student" as "student" | "teacher" | "staff" | "admin",
    userId: "",
    copyId: "",
    libraryId: "", // Will be auto-set from selected copy
    notes: "",
  });

  const [books, setBooks] = useState<{ label: string; value: string }[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>("");
  const [availableCopies, setAvailableCopies] = useState<BookCopy[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // User Search State
  const [regNo, setRegNo] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Loading indicator for copying fetching
  const [loadingCopies, setLoadingCopies] = useState(false);

  useEffect(() => {
    // Reset user info when userType changes if needed (though we auto-set it from search)
  }, [payload.userType]);

  const handleUserSearch = async () => {
    if (!regNo.trim()) return;
    setSearchingUser(true);
    setSelectedUser(null);
    try {
      const types: ("student" | "teacher" | "staff" | "admin")[] = ['student', 'teacher', 'staff', 'admin'];
      let foundUser = null;
      let foundType: "student" | "teacher" | "staff" | "admin" = 'student';

      for (const type of types) {
        let res: any;
        if (type === 'student') res = await studentService.getAll({ search: regNo });
        else if (type === 'teacher') res = await teacherService.getAll({ search: regNo });
        else if (type === 'staff') res = await staffService.getAll({ search: regNo });
        else if (type === 'admin') res = await adminService.getAll({ search: regNo });

        // Handle inconsistent API responses (some return { users: [] }, some { students: [] }...)
        const items = res.students || res.teachers || res.staff || res.admins || res.users || res;
        const user = Array.isArray(items) ? items.find((u: any) => u.registrationNumber === regNo) : null;

        if (user) {
          foundUser = user;
          foundType = type;
          break;
        }
      }

      if (foundUser) {
        setSelectedUser(foundUser);
        setPayload((prev) => ({ ...prev, userType: foundType, userId: foundUser.id }));
        toast.success(`User found: ${foundUser.fullName}`);
      } else {
        toast.error("No user found with this registration number");
      }
    } catch (error) {
      toast.error("Failed to search user");
    } finally {
      setSearchingUser(false);
    }
  };

  // Initial data fetch: books
  useEffect(() => {
    (async () => {
      try {
        const booksRes = await bookService.getAll({ limit: 100 });
        setBooks(
          booksRes.books.map((b) => ({
            label: `${b.title} (${b.author})`,
            value: b.id,
          }))
        );
      } catch {
        toast.error("Failed to load books");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Fetch available copies when a book is selected
  useEffect(() => {
    if (!selectedBookId) {
      setAvailableCopies([]);
      setPayload(prev => ({ ...prev, copyId: "", libraryId: "" }));
      return;
    }

    (async () => {
      setLoadingCopies(true);
      try {
        // Fetch copies for the book. 
        // Ideally we should use getAvailableCopiesByBook but if that's not restricted to 'available' status only, we might filters.
        // Assuming we want to show all copies or just available? For reservation, usually implies the copy is currently checked out (reserved for future) OR available to be held now.
        // If we want to reserve a specific copy that is currently Borrowed, we need to fetch ALL copies.
        // However, if we want to "Reserve" (Hold) an available book, we need available copies.
        // Let's assume we want to show all copies so staff can reserve a currently borrowed book too.

        // Actually, reservation usually means "Hold this book when it comes back".
        // But in this system, maybe it means "Put this copy on hold".
        // Let's use `bookCopyService.getAll({ bookId: selectedBookId })` to see all to be safe, or just available?
        // If I use `getAvailableCopiesByBook`, it returns available ones.
        // But if I want to reserve a book that is borrowed... I need to see borrowed copies too.
        // For simplicity and matching "Issue Book" flow (which picks available), let's stick to what allows us to create a reservation.
        // If I can reserve ANY copy, I should fetch all.

        const res = await bookCopyService.getAll({ bookId: selectedBookId, limit: 50 });
        setAvailableCopies(res.bookCopies);
      } catch {
        toast.error("Failed to load book copies");
      } finally {
        setLoadingCopies(false);
      }
    })();
  }, [selectedBookId]);

  const handleBookChange = (bookId: string) => {
    setSelectedBookId(bookId);
    setPayload(prev => ({ ...prev, copyId: "", libraryId: "" })); // Reset copy selection
  };

  const handleCopyChange = (copyId: string) => {
    const copy = availableCopies.find(c => c.id === copyId);
    if (copy) {
      setPayload(prev => ({
        ...prev,
        copyId,
        libraryId: typeof copy.libraryId === 'object' ? (copy.libraryId as any).id : copy.libraryId
      }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payload.userId || !payload.copyId || !payload.libraryId) {
      toast.error("Please select a user, a book, and a copy");
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
        {/* Header Section - Teal Gradient matches Borrowing Page */}
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
                  Borrower Information
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6 space-y-6">
                <div className="space-y-4">
                  <Label className="text-slate-700 font-medium">Search by Registration Number</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Enter unique registration number..."
                        value={regNo}
                        onChange={(e) => setRegNo(e.target.value)}
                        className="pl-9 border-slate-200 focus:ring-teal-500"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUserSearch())}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleUserSearch}
                      disabled={searchingUser || !regNo}
                      className="bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                    >
                      {searchingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                    </Button>
                  </div>
                </div>

                {selectedUser ? (
                  <div className="relative overflow-hidden rounded-xl border border-teal-100 bg-gradient-to-br from-teal-50/50 to-white p-4 shadow-inner">
                    <div className="flex items-start gap-4">
                      <div className="h-20 w-20 rounded-lg overflow-hidden border-2 border-white shadow-md bg-slate-200 flex-shrink-0">
                        {selectedUser.profile?.profilePicture ? (
                          <img
                            src={getImageUrl(selectedUser.profile.profilePicture)}
                            alt={selectedUser.fullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
                            <User className="h-10 w-10" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800">{selectedUser.fullName}</h3>
                          <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 border-teal-200 uppercase text-[10px]">
                            {payload.userType}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                          {selectedUser.registrationNumber}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-[200px]">{selectedUser.email}</p>
                        {selectedUser.department?.name && (
                          <p className="text-xs font-medium text-teal-700 bg-teal-50/50 inline-block px-1.5 py-0.5 rounded">
                            {selectedUser.department.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="absolute top-2 right-2">
                      <div className="p-1 bg-teal-100 rounded-full">
                        <UserCheck className="h-4 w-4 text-teal-600" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/30">
                    <User className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Search for a borrower to associate.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Book & Copy Info */}
            <Card className="bg-white/80 backdrop-blur-sm border-l-4 border-l-cyan-500 border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-md transition-all p-0">
              <CardHeader className="border-b bg-gradient-to-r from-slate-50/50 to-cyan-50/30 py-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                  <div className="p-1.5 bg-cyan-50 rounded-lg">
                    <BookOpen className="h-4 w-4 text-cyan-600" />
                  </div>
                  Book & Copy
                </CardTitle>
              </CardHeader>
              <CardContent className="py-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Select Book <span className="text-rose-500">*</span></Label>
                  <SearchableSelect
                    options={books}
                    value={selectedBookId}
                    onChange={handleBookChange}
                    placeholder="Search books by title or author..."
                  />
                </div>

                {selectedBookId && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-slate-700 font-medium">Select Copy <span className="text-rose-500">*</span></Label>
                    {loadingCopies ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading copies...
                      </div>
                    ) : (
                      <Select
                        value={payload.copyId}
                        onValueChange={handleCopyChange}
                      >
                        <SelectTrigger className="border-slate-200 focus:ring-cyan-500 focus:border-cyan-500">
                          <SelectValue placeholder="Select a copy" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCopies.length > 0 ? (
                            availableCopies.map((copy) => (
                              <SelectItem key={copy.id} value={copy.id}>
                                Action: {copy.copyNumber} - {copy.status} {copy.location ? `(${copy.location})` : ''}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-slate-500 text-center">No copies found</div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                    <p className="text-[10px] text-slate-500">
                      Selecting a copy will automatically link the library.
                    </p>
                  </div>
                )}

                {!selectedBookId && (
                  <div className="p-4 border border-dashed rounded-xl bg-slate-50 text-center">
                    <p className="text-xs text-slate-400">First select a book to see available copies.</p>
                  </div>
                )}
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
                Reservation Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="py-6">
              <Textarea
                value={payload.notes}
                onChange={(e) =>
                  setPayload({ ...payload, notes: e.target.value })
                }
                rows={4}
                placeholder="Add any additional notes for this reservation..."
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

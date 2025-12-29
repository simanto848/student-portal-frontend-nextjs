"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { ArrowLeft, BookPlus, Check, ChevronsUpDown, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { borrowingService } from "@/services/library/borrowing.service";
import { studentService } from "@/services/user/student.service";
import { teacherService } from "@/services/user/teacher.service";
import { staffService } from "@/services/user/staff.service";
import { bookService } from "@/services/library/book.service";
import { bookCopyService } from "@/services/library/bookCopy.service";
import { libraryService } from "@/services/library/library.service";
import type { Book, BookCopy, Library } from "@/services/library";

type UserType = "student" | "teacher" | "staff";

interface SelectOption {
  label: string;
  value: string;
  details?: string;
}

export default function IssueBookPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [userType, setUserType] = useState<UserType>("student");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [selectedCopyId, setSelectedCopyId] = useState("");
  const [selectedLibraryId, setSelectedLibraryId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  // Data State
  const [users, setUsers] = useState<SelectOption[]>([]);
  const [books, setBooks] = useState<SelectOption[]>([]);
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [libraries, setLibraries] = useState<Library[]>([]);

  // UI State
  const [openUserSelect, setOpenUserSelect] = useState(false);
  const [openBookSelect, setOpenBookSelect] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingCopies, setLoadingCopies] = useState(false);

  // Fetch Libraries and Books on Mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingBooks(true);
      try {
        const [booksRes, libsRes] = await Promise.all([
          bookService.getAll({ limit: 1000, status: 'active' }),
          libraryService.getAll({ limit: 100, status: 'active' })
        ]);

        setBooks(booksRes.books.map(b => ({
          label: b.title,
          value: b.id,
          details: b.author
        })));
        setLibraries(libsRes.libraries);
      } catch (error) {
        toast.error("Failed to load initial data");
      } finally {
        setLoadingBooks(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch Users when User Type changes
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setUsers([]);
      setSelectedUserId(""); // Reset selection
      try {
        let data: any[] = [];
        if (userType === 'student') {
          const res = await studentService.getAll({ limit: 1000 });
          data = res.students;
        } else if (userType === 'teacher') {
          const res = await teacherService.getAll({ limit: 1000 });
          data = res.teachers;
        } else if (userType === 'staff') {
          const res = await staffService.getAll({ limit: 1000 });
          data = res.staff;
        }

        setUsers(data.map(u => ({
          label: u.fullName,
          value: u.id,
          details: u.email || u.registrationNumber
        })));
      } catch (error) {
        toast.error("Failed to fetch users");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [userType]);

  // Fetch Copies when Book changes
  useEffect(() => {
    const fetchCopies = async () => {
      if (!selectedBookId) {
        setCopies([]);
        return;
      }
      setLoadingCopies(true);
      setSelectedCopyId(""); // Reset copy selection
      try {
        const res = await bookCopyService.getAvailableCopiesByBook(selectedBookId);
        setCopies(res);
      } catch (error) {
        toast.error("Failed to fetch book copies");
      } finally {
        setLoadingCopies(false);
      }
    };
    fetchCopies();
  }, [selectedBookId]);

  // Auto-select library when copy is selected
  useEffect(() => {
    if (selectedCopyId) {
      const copy = copies.find(c => c.id === selectedCopyId);
      if (copy && copy.libraryId) {
        setSelectedLibraryId(copy.libraryId);
      }
    }
  }, [selectedCopyId, copies]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedCopyId || !selectedLibraryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const created = await borrowingService.borrow({
        userType,
        borrowerId: selectedUserId,
        copyId: selectedCopyId,
        libraryId: selectedLibraryId,
        dueDate: dueDate || undefined,
        notes,
      });
      toast.success("Book issued successfully");
      router.push(`/dashboard/admin/library/borrowings/${created.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to issue book");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Issue Book</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new borrowing record.
            </p>
          </div>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookPlus className="h-5 w-5 text-muted-foreground" />
              Borrowing Details
            </CardTitle>
            <CardDescription>
              Select the borrower and the book copy to issue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-8">

              {/* Borrower Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Borrower Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>User Type</Label>
                    <Select
                      value={userType}
                      onValueChange={(v: UserType) => setUserType(v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <Label>Select User</Label>
                    <Popover open={openUserSelect} onOpenChange={setOpenUserSelect}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openUserSelect}
                          className="w-full justify-between"
                          disabled={loadingUsers}
                        >
                          {selectedUserId
                            ? users.find((u) => u.value === selectedUserId)?.label
                            : loadingUsers ? "Loading users..." : "Select user..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0">
                        <Command>
                          <CommandInput placeholder="Search user..." />
                          <CommandEmpty>No user found.</CommandEmpty>
                          <CommandGroup className="max-h-[200px] overflow-y-auto">
                            {users.map((user) => (
                              <CommandItem
                                key={user.value}
                                value={user.label}
                                onSelect={() => {
                                  setSelectedUserId(user.value === selectedUserId ? "" : user.value);
                                  setOpenUserSelect(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedUserId === user.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{user.label}</span>
                                  <span className="text-xs text-muted-foreground">{user.details}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Book Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Book Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2 flex flex-col">
                    <Label>Select Book</Label>
                    <Popover open={openBookSelect} onOpenChange={setOpenBookSelect}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openBookSelect}
                          className="w-full justify-between"
                          disabled={loadingBooks}
                        >
                          {selectedBookId
                            ? books.find((b) => b.value === selectedBookId)?.label
                            : loadingBooks ? "Loading books..." : "Select book..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <Command>
                          <CommandInput placeholder="Search book..." />
                          <CommandEmpty>No book found.</CommandEmpty>
                          <CommandGroup className="max-h-[200px] overflow-y-auto">
                            {books.map((book) => (
                              <CommandItem
                                key={book.value}
                                value={book.label}
                                onSelect={() => {
                                  setSelectedBookId(book.value === selectedBookId ? "" : book.value);
                                  setOpenBookSelect(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedBookId === book.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{book.label}</span>
                                  <span className="text-xs text-muted-foreground">{book.details}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {selectedBookId && (
                    <>
                      {loadingCopies ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Checking availability...
                        </div>
                      ) : copies.length === 0 ? (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>No Copies Available</AlertTitle>
                          <AlertDescription>
                            There are no available copies of this book to borrow.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Select Copy</Label>
                            <Select
                              value={selectedCopyId}
                              onValueChange={setSelectedCopyId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a copy" />
                              </SelectTrigger>
                              <SelectContent>
                                {copies.map((copy) => (
                                  <SelectItem key={copy.id} value={copy.id}>
                                    {copy.copyNumber} ({copy.condition})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Library</Label>
                            <Select
                              value={selectedLibraryId}
                              onValueChange={setSelectedLibraryId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select library" />
                              </SelectTrigger>
                              <SelectContent>
                                {libraries.map((lib) => (
                                  <SelectItem key={lib.id} value={lib.id}>
                                    {lib.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-[0.8rem] text-muted-foreground">
                              Automatically selected based on copy location.
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Loan Details */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Loan Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Due Date (Optional)</Label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                    <p className="text-[0.8rem] text-muted-foreground">
                      Leave blank to use the default loan period.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="Any additional notes..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
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
                  disabled={submitting || !selectedUserId || !selectedCopyId || !selectedLibraryId}
                  className="bg-[#344e41] hover:bg-[#344e41]/90"
                >
                  {submitting ? "Issuing..." : "Issue Book"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

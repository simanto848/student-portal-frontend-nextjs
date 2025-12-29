"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Check, ChevronsUpDown, User, BookOpen, Library as LibraryIcon, Search, ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

import { reservationService } from "@/services/library/reservation.service";
import { bookService } from "@/services/library/book.service";
import { bookCopyService } from "@/services/library/bookCopy.service";
import { libraryService } from "@/services/library/library.service";
import { studentService } from "@/services/user/student.service";
import { teacherService } from "@/services/user/teacher.service";
import { staffService } from "@/services/user/staff.service";

import type { Book, BookCopy, Library } from "@/services/library";

type UserType = "student" | "teacher" | "staff";

interface UserData {
  id: string;
  fullName: string;
  email: string;
  registrationNumber?: string;
  departmentName?: string;
}

export default function CreateReservationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: User Selection
  const [userType, setUserType] = useState<UserType>("student");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userSearchOpen, setUserSearchOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Step 2: Book Selection
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookSearchOpen, setBookSearchOpen] = useState(false);
  const [bookSearchQuery, setBookSearchQuery] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(false);

  // Step 3: Copy Selection
  const [selectedCopy, setSelectedCopy] = useState<BookCopy | null>(null);
  const [availableCopies, setAvailableCopies] = useState<BookCopy[]>([]);
  const [loadingCopies, setLoadingCopies] = useState(false);
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibraryId, setSelectedLibraryId] = useState<string>("all");

  // Step 4: Final Details
  const [notes, setNotes] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(false);

  // Fetch Users based on type and search query
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        let res;
        const params = { search: userSearchQuery, limit: 10 };
        if (userType === "student") res = await studentService.getAll(params);
        else if (userType === "teacher") res = await teacherService.getAll(params);
        else res = await staffService.getAll(params);

        const data = userType === "student" ? (res as any).students : userType === "teacher" ? (res as any).teachers : (res as any).staff;
        setUsers(data.map((u: any) => ({
          id: u.id,
          fullName: u.fullName,
          email: u.email,
          registrationNumber: u.registrationNumber || u.employeeId,
          departmentName: u.department?.name
        })));
      } catch (error) {
        console.error("Failed to fetch users", error);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [userSearchQuery, userType]);

  // Fetch Books based on search query
  useEffect(() => {
    const fetchBooks = async () => {
      setLoadingBooks(true);
      try {
        const res = await bookService.getAll({ search: bookSearchQuery, limit: 10, status: "active" });
        setBooks(res.books);
      } catch (error) {
        console.error("Failed to fetch books", error);
        setBooks([]);
      } finally {
        setLoadingBooks(false);
      }
    };

    const debounce = setTimeout(fetchBooks, 300);
    return () => clearTimeout(debounce);
  }, [bookSearchQuery]);

  // Fetch Available Copies when book is selected
  useEffect(() => {
    if (selectedBook) {
      fetchCopies();
      fetchLibraries();
    }
  }, [selectedBook]);

  const fetchCopies = async () => {
    if (!selectedBook) return;
    setLoadingCopies(true);
    try {
      const copies = await bookCopyService.getAvailableCopiesByBook(selectedBook.id);
      setAvailableCopies(copies);
    } catch (error) {
      toast.error("Failed to fetch available copies");
    } finally {
      setLoadingCopies(false);
    }
  };

  const fetchLibraries = async () => {
    try {
      const res = await libraryService.getAll({ limit: 100 });
      setLibraries(res.libraries);
    } catch (error) {
      console.error("Failed to fetch libraries", error);
    }
  };

  const handleCreate = async () => {
    if (!selectedUser || !selectedCopy || !selectedCopy.id || !selectedCopy.libraryId) {
      toast.error("Please select all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: selectedUser.id,
        userType,
        copyId: selectedCopy.id,
        libraryId: selectedCopy.libraryId,
        notes,
      };

      const created = await reservationService.create(payload);
      toast.success("Reservation created successfully");
      router.push(`/dashboard/admin/library/reservations/${created.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create reservation");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCopies = selectedLibraryId === "all"
    ? availableCopies
    : availableCopies.filter(c => {
      const libId = typeof c.libraryId === 'object' ? (c.libraryId as any).id || (c.libraryId as any)._id : c.libraryId;
      return libId === selectedLibraryId;
    });

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Create New Reservation</h1>
          <div className="text-sm text-muted-foreground">Step {step} of 4</div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            {/* Step 1: Select User */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-medium flex items-center gap-2">
                    <User className="h-5 w-5" /> Select User
                  </h2>
                  <p className="text-sm text-muted-foreground">Choose the user type and search for the user.</p>
                </div>

                <div className="flex gap-4">
                  {(["student", "teacher", "staff"] as UserType[]).map((type) => (
                    <Button
                      key={type}
                      variant={userType === type ? "default" : "outline"}
                      onClick={() => { setUserType(type); setSelectedUser(null); }}
                      className="capitalize flex-1"
                    >
                      {type}
                    </Button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Search User</Label>
                  <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={userSearchOpen}
                        className="w-full justify-between"
                      >
                        {selectedUser ? selectedUser.fullName : "Search by name or ID..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search users..."
                          value={userSearchQuery}
                          onValueChange={setUserSearchQuery}
                        />
                        <CommandList>
                          {loadingUsers && <div className="p-4 text-sm text-center text-muted-foreground">Searching...</div>}
                          {!loadingUsers && users.length === 0 && userSearchQuery && (
                            <CommandEmpty>No users found.</CommandEmpty>
                          )}
                          {!loadingUsers && users.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={user.id}
                              onSelect={() => {
                                setSelectedUser(user);
                                setUserSearchOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{user.fullName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {user.registrationNumber} • {user.email}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {/* Step 2: Select Book */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-medium flex items-center gap-2">
                    <BookOpen className="h-5 w-5" /> Select Book
                  </h2>
                  <p className="text-sm text-muted-foreground">Search for the book to reserve.</p>
                </div>

                <div className="space-y-2">
                  <Label>Search Book</Label>
                  <Popover open={bookSearchOpen} onOpenChange={setBookSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={bookSearchOpen}
                        className="w-full justify-between"
                      >
                        {selectedBook ? selectedBook.title : "Search by title, author, or ISBN..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Search books..."
                          value={bookSearchQuery}
                          onValueChange={setBookSearchQuery}
                        />
                        <CommandList>
                          {loadingBooks && <div className="p-4 text-sm text-center text-muted-foreground">Searching...</div>}
                          {!loadingBooks && books.length === 0 && bookSearchQuery && (
                            <CommandEmpty>No books found.</CommandEmpty>
                          )}
                          {!loadingBooks && books.map((book) => (
                            <CommandItem
                              key={book.id}
                              value={book.id}
                              onSelect={() => {
                                setSelectedBook(book);
                                setBookSearchOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedBook?.id === book.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{book.title}</span>
                                <span className="text-xs text-muted-foreground">
                                  by {book.author} • ISBN: {book.isbn}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {selectedBook && (
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <h3 className="font-medium mb-2">Selected Book</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-muted-foreground">Title:</span> {selectedBook.title}</div>
                      <div><span className="text-muted-foreground">Author:</span> {selectedBook.author}</div>
                      <div><span className="text-muted-foreground">ISBN:</span> {selectedBook.isbn}</div>
                      <div><span className="text-muted-foreground">Category:</span> {selectedBook.category}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Select Copy */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-medium flex items-center gap-2">
                    <LibraryIcon className="h-5 w-5" /> Select Copy
                  </h2>
                  <p className="text-sm text-muted-foreground">Choose an available copy from a library.</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label>Filter by Library</Label>
                    <Popover open={libraryOpen} onOpenChange={setLibraryOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={libraryOpen}
                          className="w-full justify-between mt-1"
                        >
                          {selectedLibraryId === "all"
                            ? "All Libraries"
                            : libraries.find((lib) => lib.id === selectedLibraryId)?.name || "Select Library..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                        <Command>
                          <CommandInput placeholder="Search library..." />
                          <CommandList>
                            <CommandEmpty>No library found.</CommandEmpty>
                            <CommandItem
                              value="all"
                              onSelect={() => {
                                setSelectedLibraryId("all");
                                setLibraryOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedLibraryId === "all" ? "opacity-100" : "opacity-0"
                                )}
                              />
                              All Libraries
                            </CommandItem>
                            {libraries.map((lib) => (
                              <CommandItem
                                key={lib.id}
                                value={lib.name}
                                onSelect={() => {
                                  setSelectedLibraryId(lib.id);
                                  setLibraryOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedLibraryId === lib.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {lib.name} ({lib.code})
                              </CommandItem>
                            ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Copy Number</TableHead>
                        <TableHead>Library</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingCopies ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">Loading copies...</TableCell>
                        </TableRow>
                      ) : filteredCopies.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No available copies found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCopies.map((copy) => (
                          <TableRow key={copy.id}>
                            <TableCell className="font-mono">{copy.copyNumber}</TableCell>
                            <TableCell>
                              {copy.library?.name || (typeof copy.libraryId === 'object' ? (copy.libraryId as any).name : '-')}
                            </TableCell>
                            <TableCell>{copy.location || "-"}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={selectedCopy?.id === copy.id ? "default" : "outline"}
                                onClick={() => setSelectedCopy(copy)}
                              >
                                {selectedCopy?.id === copy.id ? "Selected" : "Select"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Step 4: Review & Confirm */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-lg font-medium flex items-center gap-2">
                    <Check className="h-5 w-5" /> Review & Confirm
                  </h2>
                  <p className="text-sm text-muted-foreground">Review the reservation details before creating.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium border-b pb-2">User Details</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Name:</span> <span>{selectedUser?.fullName}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Email:</span> <span>{selectedUser?.email}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">ID:</span> <span>{selectedUser?.registrationNumber}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Type:</span> <span className="capitalize">{userType}</span></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium border-b pb-2">Book Details</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">Title:</span> <span>{selectedBook?.title}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Author:</span> <span>{selectedBook?.author}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Copy:</span> <span className="font-mono">{selectedCopy?.copyNumber}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Location:</span> <span>{selectedCopy?.location}</span></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Input
                    placeholder="Add any notes for this reservation..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setStep(s => Math.max(1, s - 1))}
                disabled={step === 1 || submitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>

              {step < 4 ? (
                <Button
                  onClick={() => setStep(s => Math.min(4, s + 1))}
                  disabled={
                    (step === 1 && !selectedUser) ||
                    (step === 2 && !selectedBook) ||
                    (step === 3 && !selectedCopy)
                  }
                >
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleCreate}
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {submitting ? "Creating..." : "Confirm Reservation"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

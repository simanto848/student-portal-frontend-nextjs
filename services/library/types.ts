export interface Library {
  id: string;
  name: string;
  code: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  operatingHours?: Record<string, string>;
  maxBorrowLimit: number;
  borrowDuration: number;
  finePerDay?: number;
  reservationHoldDays?: number;
  status: "active" | "inactive" | "maintenance";
  createdAt?: string;
  updatedAt?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publicationYear?: number;
  edition?: string;
  category: string;
  subject?: string;
  description?: string;
  language: string;
  pages?: number;
  price?: number;
  status: "active" | "inactive" | "archived";
  libraryId: string;
  library?: Library;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookCopy {
  id: string;
  copyNumber: string;
  location?: string;
  condition?: string;
  status: "available" | "reserved" | "borrowed" | "maintenance" | "lost";
  bookId: string;
  book?: Book;
  libraryId: string;
  library?: Library;
  acquisitionDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Borrowing {
  id: string;
  userType: "student" | "teacher" | "staff" | "admin";
  borrowerId: string;
  copyId: string;
  copy?: BookCopy;
  libraryId: string;
  library?: Library;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: "borrowed" | "returned" | "overdue";
  fineAmount: number;
  finePaid: boolean;
  processedById?: string;
  notes?: string;
  borrower?: {
    id: string;
    fullName: string;
    email?: string;
    departmentId?: string;
    departmentName?: string;
    registrationNumber?: string;
    error?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Reservation {
  id: string;
  userType: "student" | "teacher" | "staff" | "admin";
  userId: string;
  copyId: string;
  copy?: BookCopy;
  libraryId: string;
  library?: Library;
  reservationDate: string;
  expiryDate: string;
  status: "pending" | "fulfilled" | "expired" | "cancelled";
  pickupById?: string;
  fulfilledAt?: string;
  notes?: string;
  hoursUntilExpiry?: number;
  isExpired?: boolean;
  canCancel?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type LibraryStatus = "active" | "inactive" | "maintenance";
export type BookStatus = "active" | "inactive" | "archived";
export type BookCopyStatus =
  | "available"
  | "reserved"
  | "borrowed"
  | "maintenance"
  | "lost";
export type BorrowingStatus = "borrowed" | "returned" | "overdue";
export type ReservationStatus =
  | "pending"
  | "fulfilled"
  | "expired"
  | "cancelled";

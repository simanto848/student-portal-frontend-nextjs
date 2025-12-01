"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { libraryService } from "@/services/library/library.service";
import { bookService } from "@/services/library/book.service";
import { bookCopyService } from "@/services/library/bookCopy.service";
import { borrowingService } from "@/services/library/borrowing.service";
import { reservationService } from "@/services/library/reservation.service";
import { toast } from "sonner";
import Link from "next/link";
import { BookOpen, Library, Users, Clock, TrendingUp } from "lucide-react";

interface DashboardStats {
  libraries: number;
  books: number;
  copies: number;
  borrowings: number;
  reservations: number;
  pendingReservations: number;
  overdueBorrowings: number;
}

export default function LibrarianDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    libraries: 0,
    books: 0,
    copies: 0,
    borrowings: 0,
    reservations: 0,
    pendingReservations: 0,
    overdueBorrowings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [
        librariesRes,
        booksRes,
        copiesRes,
        borrowingsRes,
        reservationsRes,
        pendingRes,
        overdueRes,
      ] = await Promise.all([
        libraryService.getAll({ limit: 1 }),
        bookService.getAll({ limit: 1 }),
        bookCopyService.getAll({ limit: 1 }),
        borrowingService.getAll({ limit: 1 }),
        reservationService.getAll({ limit: 1 }),
        reservationService.getAll({ status: "pending", limit: 1 }),
        borrowingService.getAll({ status: "overdue", limit: 1 }),
      ]);

      setStats({
        libraries: librariesRes.pagination?.total || 0,
        books: booksRes.pagination?.total || 0,
        copies: copiesRes.pagination?.total || 0,
        borrowings: borrowingsRes.pagination?.total || 0,
        reservations: reservationsRes.pagination?.total || 0,
        pendingReservations: pendingRes.pagination?.total || 0,
        overdueBorrowings: overdueRes.pagination?.total || 0,
      });
    } catch (error) {
      toast.error("Failed to load dashboard stats");
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Libraries",
      description: "Manage library branches and settings",
      icon: Library,
      href: "/dashboard/admin/library/libraries",
      count: stats.libraries,
      color: "bg-indigo-500",
    },
    {
      title: "Books",
      description: "Catalog and manage books",
      icon: BookOpen,
      href: "/dashboard/admin/library/books",
      count: stats.books,
      color: "bg-blue-500",
    },
    {
      title: "Book Copies",
      description: "Manage physical book copies",
      icon: BookOpen,
      href: "/dashboard/admin/library/copies",
      count: stats.copies,
      color: "bg-green-500",
    },
    {
      title: "Borrowings",
      description: "Track borrowed books and returns",
      icon: Users,
      href: "/dashboard/admin/library/borrowings",
      count: stats.borrowings,
      color: "bg-purple-500",
    },
    {
      title: "Reservations",
      description: "Manage book reservations",
      icon: Clock,
      href: "/dashboard/admin/library/reservations",
      count: stats.reservations,
      color: "bg-orange-500",
    },
    {
      title: "Pending Reservations",
      description: "Reservations awaiting pickup",
      icon: Clock,
      href: "/dashboard/admin/library/reservations?status=pending",
      count: stats.pendingReservations,
      color: "bg-yellow-500",
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#344e41]">
            Library Management
          </h1>
          <p className="text-[#588157] mt-1">
            Manage library catalog, borrowings, and reservations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4">
          <Card className="bg-white border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Libraries</p>
                  <p className="text-2xl font-bold text-[#344e41]">
                    {stats.libraries}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Library className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Books</p>
                  <p className="text-2xl font-bold text-[#344e41]">
                    {stats.books}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Copies</p>
                  <p className="text-2xl font-bold text-[#344e41]">
                    {stats.copies}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Borrowings</p>
                  <p className="text-2xl font-bold text-[#344e41]">
                    {stats.borrowings}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Reservations</p>
                  <p className="text-2xl font-bold text-[#344e41]">
                    {stats.reservations}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm border-l-4 border-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Pickup</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.pendingReservations}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm border-l-4 border-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Overdue</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.overdueBorrowings}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-[#344e41] mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="bg-white border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg ${action.color}/20 flex items-center justify-center`}
                      >
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg leading-tight">
                          {action.title}
                        </CardTitle>
                        {action.count !== undefined && (
                          <span className="text-xs text-gray-500">
                            {action.count} items
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{action.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

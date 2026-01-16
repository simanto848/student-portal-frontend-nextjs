"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { libraryService } from "@/services/library/library.service";
import { bookService } from "@/services/library/book.service";
import { bookCopyService } from "@/services/library/bookCopy.service";
import { borrowingService } from "@/services/library/borrowing.service";
import { reservationService } from "@/services/library/reservation.service";
import { Borrowing, Reservation } from "@/services/library/types";
import { toast } from "sonner";
import Link from "next/link";
import {
  BookOpen,
  Library,
  Users,
  Clock,
  AlertTriangle,
  ArrowRight,
  Plus,
  RefreshCw,
  BookCopy,
  CalendarClock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DashboardStats {
  libraries: number;
  books: number;
  copies: number;
  borrowings: number;
  reservations: number;
  pendingReservations: number;
  overdueBorrowings: number;
  availableCopies: number;
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
    availableCopies: 0,
  });
  const [recentBorrowings, setRecentBorrowings] = useState<Borrowing[]>([]);
  const [pendingReservations, setPendingReservations] = useState<Reservation[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
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
        availableRes,
        recentBorrowingsRes,
        pendingReservationsRes,
      ] = await Promise.all([
        libraryService.getAll({ limit: 1 }),
        bookService.getAll({ limit: 1 }),
        bookCopyService.getAll({ limit: 1 }),
        borrowingService.getAll({ limit: 1 }),
        reservationService.getAll({ limit: 1 }),
        reservationService.getAll({ status: "pending", limit: 1 }),
        borrowingService.getAll({ status: "overdue", limit: 1 }),
        bookCopyService.getAll({ status: "available", limit: 1 }),
        borrowingService.getAll({ limit: 5 }),
        reservationService.getAll({ status: "pending", limit: 5 }),
      ]);

      setStats({
        libraries: librariesRes.pagination?.total || 0,
        books: booksRes.pagination?.total || 0,
        copies: copiesRes.pagination?.total || 0,
        borrowings: borrowingsRes.pagination?.total || 0,
        reservations: reservationsRes.pagination?.total || 0,
        pendingReservations: pendingRes.pagination?.total || 0,
        overdueBorrowings: overdueRes.pagination?.total || 0,
        availableCopies: availableRes.pagination?.total || 0,
      });

      setRecentBorrowings(recentBorrowingsRes.borrowings || []);
      setPendingReservations(pendingReservationsRes.reservations || []);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
    toast.success("Dashboard refreshed");
  };

  const quickActions = [
    {
      title: "Libraries",
      description: "Manage branches",
      icon: Library,
      href: "/dashboard/staff/library/libraries",
      count: stats.libraries,
      color: "text-teal-600",
      bg: "bg-teal-50",
      hover: "hover:bg-teal-50",
      border: "hover:border-teal-300"
    },
    {
      title: "Books",
      description: "Book catalog",
      icon: BookOpen,
      href: "/dashboard/staff/library/books",
      count: stats.books,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      hover: "hover:bg-cyan-50",
      border: "hover:border-cyan-300"
    },
    {
      title: "Copies",
      description: "Physical inventory",
      icon: BookCopy,
      href: "/dashboard/staff/library/copies",
      count: stats.copies,
      color: "text-sky-600",
      bg: "bg-sky-50",
      hover: "hover:bg-sky-50",
      border: "hover:border-sky-300"
    },
    {
      title: "Borrowings",
      description: "Circulation",
      icon: Users,
      href: "/dashboard/staff/library/borrowings",
      count: stats.borrowings,
      color: "text-orange-600",
      bg: "bg-orange-50",
      hover: "hover:bg-orange-50",
      border: "hover:border-orange-300"
    },
    {
      title: "Reservations",
      description: "Book holds",
      icon: CalendarClock,
      href: "/dashboard/staff/library/reservations",
      count: stats.reservations,
      color: "text-rose-600",
      bg: "bg-rose-50",
      hover: "hover:bg-rose-50",
      border: "hover:border-rose-300"
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-8">
        {/* Header Section - UNIQUE TEAL GRADIENT */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-teal-800 to-cyan-700 p-8 text-white shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur">
                  <Sparkles className="h-6 w-6 text-cyan-300" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Library Dashboard</h1>
              </div>
              <p className="text-cyan-100 text-lg max-w-2xl">
                Manage catalog, borrowings, and reservations efficiently.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white gap-2 backdrop-blur"
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                Refresh
              </Button>
              <Link href="/dashboard/staff/library/borrowings/create">
                <Button className="bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:from-orange-600 hover:to-rose-600 gap-2 font-semibold shadow-lg">
                  <Plus className="h-4 w-4" />
                  New Borrowing
                </Button>
              </Link>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/5 to-transparent skew-x-12 transform translate-x-12" />
          <div className="absolute right-20 bottom-0 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute left-10 top-0 h-32 w-32 rounded-full bg-teal-400/10 blur-2xl" />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Books"
            value={stats.books}
            icon={BookOpen}
            trend="Catalog size"
            color="text-cyan-600"
            bg="bg-cyan-50"
            borderColor="border-l-cyan-500"
          />
          <StatsCard
            title="Active Borrowings"
            value={stats.borrowings}
            icon={Users}
            trend="Currently out"
            color="text-teal-600"
            bg="bg-teal-50"
            borderColor="border-l-teal-500"
          />
          <StatsCard
            title="Available Copies"
            value={stats.availableCopies}
            icon={CheckCircle2}
            trend="Ready to borrow"
            color="text-sky-600"
            bg="bg-sky-50"
            borderColor="border-l-sky-500"
          />
          <StatsCard
            title="Pending Reservations"
            value={stats.pendingReservations}
            icon={CalendarClock}
            trend="Needs action"
            color="text-orange-600"
            bg="bg-orange-50"
            borderColor="border-l-orange-500"
            highlight={stats.pendingReservations > 0}
          />
        </div>

        {/* Action Required Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alerts & Recent Activity Column */}
          <div className="lg:col-span-2 space-y-6">
            {(stats.overdueBorrowings > 0 || stats.pendingReservations > 0) && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                  Attention Required
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.pendingReservations > 0 && (
                    <AlertCard
                      title="Pending Reservations"
                      value={stats.pendingReservations}
                      description="Requests waiting for approval"
                      href="/dashboard/staff/library/reservations?status=pending"
                      type="warning"
                    />
                  )}
                  {stats.overdueBorrowings > 0 && (
                    <AlertCard
                      title="Overdue Returns"
                      value={stats.overdueBorrowings}
                      description="Books past due date"
                      href="/dashboard/staff/library/borrowings?status=overdue"
                      type="danger"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Recent Borrowings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-teal-600" />
                  Recent Activity
                </h2>
                <Link href="/dashboard/staff/library/borrowings">
                  <Button variant="ghost" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {recentBorrowings.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50 text-teal-300" />
                    <p>No recent borrowings</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentBorrowings.map((borrowing) => (
                      <Link
                        key={borrowing.id}
                        href={`/dashboard/staff/library/borrowings/${borrowing.id}`}
                        className="block hover:bg-slate-50 transition-colors"
                      >
                        <div className="p-4 flex items-center gap-4">
                          <div
                            className={cn(
                              "p-3 rounded-full flex-shrink-0",
                              borrowing.status === "borrowed"
                                ? "bg-teal-50 text-teal-600"
                                : borrowing.status === "overdue"
                                  ? "bg-rose-50 text-rose-600"
                                  : "bg-sky-50 text-sky-600"
                            )}
                          >
                            {borrowing.status === "returned" ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : borrowing.status === "overdue" ? (
                              <AlertTriangle className="h-5 w-5" />
                            ) : (
                              <BookOpen className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 truncate">
                              {borrowing.copy?.book?.title || "Unknown Book"}
                            </p>
                            <p className="text-sm text-slate-500 truncate">
                              {borrowing.borrower?.fullName || borrowing.borrowerId}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                borrowing.status === "borrowed"
                                  ? "bg-teal-100 text-teal-800"
                                  : borrowing.status === "overdue"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-sky-100 text-sky-800"
                              )}
                            >
                              {borrowing.status}
                            </span>
                            <p className="text-xs text-slate-400 mt-1">
                              {borrowing.dueDate
                                ? format(new Date(borrowing.dueDate), "MMM d")
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Navigation Column */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-cyan-600" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <div className={cn(
                    "group flex items-center gap-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm transition-all duration-200",
                    action.hover,
                    action.border,
                    "hover:shadow-md hover:scale-[1.02]"
                  )}>
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-colors", action.bg)}>
                      <action.icon className={cn("h-6 w-6", action.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">{action.title}</h3>
                        <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", action.bg, action.color)}>
                          {action.count}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{action.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-teal-500 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatsCard({ title, value, icon: Icon, trend, color, bg, borderColor, highlight }: any) {
  return (
    <Card className={cn(
      "border-l-4 border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-md transition-all duration-200 bg-white",
      borderColor,
      highlight && "ring-2 ring-orange-200"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
            <p className={cn("text-xs font-medium mt-2 px-2.5 py-1 rounded-full w-fit", bg, color)}>
              {trend}
            </p>
          </div>
          <div className={cn("p-3 rounded-xl", bg)}>
            <Icon className={cn("h-6 w-6", color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertCard({ title, value, description, href, type }: any) {
  const isDanger = type === 'danger';
  return (
    <Link href={href}>
      <Card className={cn(
        "border-l-4 border-t-0 border-r-0 border-b-0 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer h-full bg-white",
        isDanger ? "border-l-rose-500" : "border-l-orange-500"
      )}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={cn(
              "p-2.5 rounded-xl",
              isDanger ? "bg-rose-50 text-rose-600" : "bg-orange-50 text-orange-600"
            )}>
              {isDanger ? <AlertTriangle className="h-6 w-6" /> : <Clock className="h-6 w-6" />}
            </div>
            <span className={cn(
              "text-3xl font-bold",
              isDanger ? "text-rose-600" : "text-orange-600"
            )}>{value}</span>
          </div>
          <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

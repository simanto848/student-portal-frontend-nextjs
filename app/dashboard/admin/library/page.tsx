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
import {
  BookOpen,
  Library,
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  BookCopy
} from "lucide-react";
import { cn } from "@/lib/utils";

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
      title: "Manage Libraries",
      description: "Configure branches & locations",
      icon: Library,
      href: "/dashboard/admin/library/libraries",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      hover: "hover:bg-indigo-50",
      border: "hover:border-indigo-200"
    },
    {
      title: "Book Catalog",
      description: "Add or edit book details",
      icon: BookOpen,
      href: "/dashboard/admin/library/books",
      color: "text-blue-600",
      bg: "bg-blue-50",
      hover: "hover:bg-blue-50",
      border: "hover:border-blue-200"
    },
    {
      title: "Inventory",
      description: "Track physical copies",
      icon: BookCopy,
      href: "/dashboard/admin/library/copies",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      hover: "hover:bg-emerald-50",
      border: "hover:border-emerald-200"
    },
    {
      title: "Circulation",
      description: "Check-in / Check-out",
      icon: Users,
      href: "/dashboard/admin/library/borrowings",
      color: "text-purple-600",
      bg: "bg-purple-50",
      hover: "hover:bg-purple-50",
      border: "hover:border-purple-200"
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#588157]" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#344e41] to-[#588157] p-8 text-white shadow-xl">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight mb-2">Library Command Center</h1>
            <p className="text-emerald-100 text-lg max-w-2xl">
              Overview of your library system's performance, circulation stats, and inventory health.
            </p>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-12" />
          <div className="absolute right-20 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Books"
            value={stats.books}
            icon={BookOpen}
            trend="+12% this month"
            color="text-blue-600"
            bg="bg-blue-50"
          />
          <StatsCard
            title="Active Borrowings"
            value={stats.borrowings}
            icon={Users}
            trend="High activity"
            color="text-purple-600"
            bg="bg-purple-50"
          />
          <StatsCard
            title="Total Copies"
            value={stats.copies}
            icon={BookCopy}
            trend="Inventory stable"
            color="text-emerald-600"
            bg="bg-emerald-50"
          />
          <StatsCard
            title="Libraries"
            value={stats.libraries}
            icon={Library}
            trend="Active branches"
            color="text-indigo-600"
            bg="bg-indigo-50"
          />
        </div>

        {/* Action Required Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alerts Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-[#344e41] flex items-center gap-2">
              <AlertCircle className="h-6 w-6" />
              Attention Required
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AlertCard
                title="Pending Reservations"
                value={stats.pendingReservations}
                description="Requests waiting for approval or pickup"
                href="/dashboard/admin/library/reservations?status=pending"
                type="warning"
              />
              <AlertCard
                title="Overdue Returns"
                value={stats.overdueBorrowings}
                description="Books that have exceeded their due date"
                href="/dashboard/admin/library/borrowings?status=overdue"
                type="danger"
              />
            </div>
          </div>

          {/* Quick Navigation Column */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#344e41] flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <div className={cn(
                    "group flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm transition-all duration-200",
                    action.hover,
                    action.border,
                    "hover:shadow-md hover:scale-[1.02]"
                  )}>
                    <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center transition-colors", action.bg)}>
                      <action.icon className={cn("h-6 w-6", action.color)} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#344e41] transition-colors">{action.title}</h3>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-[#344e41] transition-colors" />
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

function StatsCard({ title, value, icon: Icon, trend, color, bg }: any) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
            <p className={cn("text-xs font-medium mt-2 px-2 py-1 rounded-full w-fit", bg, color)}>
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
        "border-l-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer h-full",
        isDanger ? "border-l-red-500" : "border-l-amber-500"
      )}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={cn(
              "p-2 rounded-lg",
              isDanger ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
            )}>
              <Clock className="h-6 w-6" />
            </div>
            <span className={cn(
              "text-3xl font-bold",
              isDanger ? "text-red-600" : "text-amber-600"
            )}>{value}</span>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

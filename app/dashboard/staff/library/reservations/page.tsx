"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reservationService } from "@/services/library/reservation.service";
import type { Reservation, ReservationStatus } from "@/services/library";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Plus, Edit, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

function ReservationsContent() {
  const [items, setItems] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const allowed: ReservationStatus[] = [
    "pending",
    "fulfilled",
    "expired",
    "cancelled",
  ];
  const status: ReservationStatus | undefined = allowed.includes(
    statusParam as ReservationStatus
  )
    ? (statusParam as ReservationStatus)
    : undefined;

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const res = await reservationService.getAll({
          limit: 50,
          status,
          search: debouncedSearch || undefined,
        });
        setItems(res.reservations);
      } catch {
        toast.error("Failed to load reservations");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [status, debouncedSearch]);

  const getStatusBadge = (status: string, expiryDate?: string) => {
    const now = new Date();
    const isExpired = expiryDate && now > new Date(expiryDate);

    if (status === "pending" && isExpired) {
      return (
        <Badge
          variant="destructive"
          className="bg-rose-100 text-rose-700 hover:bg-rose-100"
        >
          Expired
        </Badge>
      );
    }

    switch (status) {
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-amber-100 text-amber-800 hover:bg-amber-100"
          >
            Pending
          </Badge>
        );
      case "fulfilled":
        return (
          <Badge
            variant="secondary"
            className="bg-teal-100 text-teal-800 hover:bg-teal-100"
          >
            Fulfilled
          </Badge>
        );
      case "expired":
        return (
          <Badge
            variant="destructive"
            className="bg-rose-100 text-rose-700 hover:bg-rose-100"
          >
            Expired
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-700">
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Reservations {status ? `(${status})` : ""}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage book reservations
            </p>
          </div>
          <Link href="/dashboard/staff/library/reservations/create">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg">
              <Plus className="mr-2 h-4 w-4" />
              New Reservation
            </Button>
          </Link>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-none shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50/50 to-teal-50/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-slate-800">All Reservations</CardTitle>
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search book, borrower or reg no..."
                  className="pl-9 bg-white/50 border-slate-200 focus:bg-white transition-all shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-slate-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4" />
                Loading...
              </div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                No reservations found
              </div>
            ) : (
              <div className="rounded-md border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow>
                        <TableHead className="min-w-[200px]">Book</TableHead>
                        <TableHead className="whitespace-nowrap">Copy</TableHead>
                        <TableHead className="min-w-[150px]">User</TableHead>
                        <TableHead className="whitespace-nowrap">User Type</TableHead>
                        <TableHead className="min-w-[200px]">Department</TableHead>
                        <TableHead className="whitespace-nowrap">Reg No</TableHead>
                        <TableHead className="min-w-[150px]">Dates</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((r) => (
                        <TableRow key={r.id} className="hover:bg-teal-50/30">
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium line-clamp-2" title={r.copy?.book?.title}>
                                {r.copy?.book?.title || "Unknown Book"}
                              </span>
                              <span className="text-xs text-slate-500 line-clamp-1">
                                {r.copy?.book?.author}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs whitespace-nowrap bg-teal-50 text-teal-700 border-teal-200">
                              {r.copy?.copyNumber || r.copyId}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm whitespace-nowrap">
                                {r.user?.fullName || "Unknown User"}
                              </span>
                              {r.user?.email && (
                                <span className="text-xs text-slate-500 truncate max-w-[180px]" title={r.user.email}>
                                  {r.user.email}
                                </span>
                              )}
                              {!r.user && (
                                <span className="font-mono text-[10px] text-slate-500">
                                  ID: {r.userId.substring(0, 8)}...
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "capitalize whitespace-nowrap",
                                r.userType === 'student' && "bg-cyan-100 text-cyan-800 hover:bg-cyan-100",
                                r.userType === 'teacher' && "bg-violet-100 text-violet-800 hover:bg-violet-100",
                                r.userType === 'staff' && "bg-amber-100 text-amber-800 hover:bg-amber-100",
                              )}
                            >
                              {r.userType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {r.user?.departmentName ? (
                              <span className="text-xs line-clamp-2" title={r.user.departmentName}>
                                {r.user.departmentName}
                              </span>
                            ) : r.user?.departmentId ? (
                              <span className="font-mono text-xs text-slate-500" title={r.user.departmentId}>
                                {r.user.departmentId.substring(0, 8)}...
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {r.user?.registrationNumber ? (
                              <span className="font-mono text-xs whitespace-nowrap">
                                {r.user.registrationNumber}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-1 min-w-[140px]">
                              <div className="flex justify-between gap-2">
                                <span className="text-slate-500">Reserved:</span>
                                <span className="font-medium">{new Date(r.reservationDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between gap-2">
                                <span className="text-slate-500">Expires:</span>
                                <span className={cn(
                                  "font-medium",
                                  new Date() > new Date(r.expiryDate) && r.status === 'pending' ? "text-rose-600" : ""
                                )}>
                                  {new Date(r.expiryDate).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(r.status, r.expiryDate)}</TableCell>
                          <TableCell className="text-right">
                            <Link href={`/dashboard/staff/library/reservations/${r.id}/edit`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/dashboard/staff/library/reservations/${r.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-teal-700 hover:bg-teal-50">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function ReservationsPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </DashboardLayout>
    }>
      <ReservationsContent />
    </Suspense>
  );
}

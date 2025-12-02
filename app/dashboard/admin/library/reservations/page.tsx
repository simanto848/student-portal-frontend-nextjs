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
import { Eye, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReservationsPage() {
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

  useEffect(() => {
    (async () => {
      try {
        const res = await reservationService.getAll({
          limit: 50,
          status,
        });
        setItems(res.reservations);
      } catch {
        toast.error("Failed to load reservations");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [status]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "fulfilled":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Fulfilled</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Reservations {status ? `(${status})` : ""}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage book reservations
            </p>
          </div>
          <Link href="/dashboard/admin/library/reservations/create">
            <Button className="bg-[#344e41] hover:bg-[#344e41]/90">
              <Plus className="mr-2 h-4 w-4" />
              New Reservation
            </Button>
          </Link>
        </div>

        <Card className="bg-white border-none shadow-sm">
          <CardHeader>
            <CardTitle>All Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading...</div>
            ) : items.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No reservations found
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/50">
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
                        <TableRow key={r.id} className="hover:bg-muted/5">
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="font-medium line-clamp-2" title={r.copy?.book?.title}>
                                {r.copy?.book?.title || "Unknown Book"}
                              </span>
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {r.copy?.book?.author}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs whitespace-nowrap">
                              {r.copy?.copyNumber || r.copyId}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm whitespace-nowrap">
                                {r.user?.fullName || "Unknown User"}
                              </span>
                              {r.user?.email && (
                                <span className="text-xs text-muted-foreground truncate max-w-[180px]" title={r.user.email}>
                                  {r.user.email}
                                </span>
                              )}
                              {!r.user && (
                                <span className="font-mono text-[10px] text-muted-foreground">
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
                                r.userType === 'student' && "bg-blue-100 text-blue-800 hover:bg-blue-100",
                                r.userType === 'teacher' && "bg-purple-100 text-purple-800 hover:bg-purple-100",
                                r.userType === 'staff' && "bg-orange-100 text-orange-800 hover:bg-orange-100",
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
                              <span className="font-mono text-xs text-muted-foreground" title={r.user.departmentId}>
                                {r.user.departmentId.substring(0, 8)}...
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {r.user?.registrationNumber ? (
                              <span className="font-mono text-xs whitespace-nowrap">
                                {r.user.registrationNumber}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-1 min-w-[140px]">
                              <div className="flex justify-between gap-2">
                                <span className="text-muted-foreground">Reserved:</span>
                                <span className="font-medium">{new Date(r.reservationDate).toLocaleDateString()}</span>
                              </div>
                              <div className="flex justify-between gap-2">
                                <span className="text-muted-foreground">Expires:</span>
                                <span className={cn(
                                  "font-medium",
                                  new Date() > new Date(r.expiryDate) && r.status === 'pending' ? "text-red-600" : ""
                                )}>
                                  {new Date(r.expiryDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(r.status)}</TableCell>
                          <TableCell className="text-right">
                            <Link href={`/dashboard/admin/library/reservations/${r.id}`}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
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

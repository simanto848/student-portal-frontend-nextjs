"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookCopyService } from "@/services/library/bookCopy.service";
import type { BookCopy } from "@/services/library";
import Link from "next/link";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, Loader2, Eye, Edit } from "lucide-react";

export default function CopiesPage() {
  const [items, setItems] = useState<BookCopy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await bookCopyService.getAll({ limit: 50 });
        setItems(res.bookCopies);
      } catch {
        toast.error("Failed to load copies");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700 hover:bg-green-100/80";
      case "reserved":
        return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80";
      case "borrowed":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100/80";
      case "maintenance":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100/80";
      case "lost":
        return "bg-red-100 text-red-700 hover:bg-red-100/80";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100/80";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Book Copies</h1>
            <p className="text-muted-foreground">
              Manage physical copies of books in the library.
            </p>
          </div>
          <Link href="/dashboard/admin/library/copies/create">
            <Button className="bg-[#344e41] hover:bg-[#2a3f34]">
              <Plus className="w-4 h-4 mr-2" />
              Add New Copy
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Copies</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Copy Number</TableHead>
                      <TableHead>Book</TableHead>
                      <TableHead>Library</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No copies found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((copy) => (
                        <TableRow key={copy.id}>
                          <TableCell className="font-medium">
                            {copy.copyNumber}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {copy.book?.title || "Unknown Book"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {copy.book?.author}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {copy.library?.name || "Unknown Library"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={getStatusColor(copy.status)}
                            >
                              {copy.status.charAt(0).toUpperCase() + copy.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">
                            {copy.condition || "N/A"}
                          </TableCell>
                          <TableCell>{copy.location || "N/A"}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <Link href={`/dashboard/admin/library/copies/${copy.id}`}>
                                  <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                </Link>
                                <Link href={`/dashboard/admin/library/copies/${copy.id}/edit`}>
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Copy
                                  </DropdownMenuItem>
                                </Link>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

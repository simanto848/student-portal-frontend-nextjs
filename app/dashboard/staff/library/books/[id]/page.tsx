"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bookService } from "@/services/library/book.service";
import { bookCopyService } from "@/services/library/bookCopy.service";
import type { Book, BookCopy } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Edit,
  Info,
  Library as LibraryIcon,
  Trash2,
  User,
  Tag,
  Globe,
  FileText,
  DollarSign,
  Layers,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select as SelectUI,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ViewBookPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Book | null>(null);
  const [copies, setCopies] = useState<BookCopy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [generateData, setGenerateData] = useState({
    count: 1,
    location: "",
    condition: "excellent",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [bookRes, copiesRes] = await Promise.all([
          bookService.getById(id),
          bookCopyService.getAll({ bookId: id, limit: 100 }),
        ]);
        setItem(bookRes);
        setCopies(copiesRes.bookCopies);
      } catch {
        toast.error("Failed to load book details");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    setIsDeleting(true);
    try {
      await bookService.delete(id);
      toast.success("Book deleted successfully");
      router.push("/dashboard/staff/library/books");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete book");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateCopies = async () => {
    setIsGenerating(true);
    try {
      await bookService.generateCopies(
        id,
        generateData.count,
        generateData.condition,
        generateData.location
      );
      toast.success(`${generateData.count} copies generated successfully`);
      setIsGenerateModalOpen(false);
      // Reset state
      setGenerateData({ count: 1, location: "", condition: "excellent" });

      // Refresh copies list
      const copiesRes = await bookCopyService.getAll({ bookId: id, limit: 100 });
      setCopies(copiesRes.bookCopies);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate copies");
    } finally {
      setIsGenerating(false);
    }
  };

  const getCopyStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-teal-100 text-teal-700 hover:bg-teal-100/80";
      case "borrowed":
        return "bg-cyan-100 text-cyan-700 hover:bg-cyan-100/80";
      case "maintenance":
        return "bg-amber-100 text-amber-700 hover:bg-amber-100/80";
      case "lost":
        return "bg-rose-100 text-rose-700 hover:bg-rose-100/80";
      case "reserved":
        return "bg-sky-100 text-sky-700 hover:bg-sky-100/80";
      default:
        return "bg-slate-100 text-slate-700 hover:bg-slate-100/80";
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-500" />
          <h2 className="text-xl font-semibold">Book Not Found</h2>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full hover:bg-teal-50 hover:text-teal-600"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800">{item.title}</h1>
                <Badge
                  className={
                    item.status === "active"
                      ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0"
                      : "bg-slate-100 text-slate-700 border-0"
                  }
                >
                  {item.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {item.author}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" />
                  {item.category}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/dashboard/staff/library/books/${id}/edit`}>
              <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 gap-2 shadow-lg">
                <Edit className="h-4 w-4" />
                Edit Book
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => setIsGenerateModalOpen(true)}
              className="gap-2 border-teal-200 text-teal-700 hover:bg-teal-50"
            >
              <Layers className="h-4 w-4" />
              Generate Copies
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Information */}
            <Card className="border-none shadow-sm border-l-4 border-l-teal-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <Info className="h-5 w-5 text-teal-600" />
                  Book Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Description</h3>
                  <p className="text-slate-700 leading-relaxed">
                    {item.description || "No description provided."}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Tag className="h-5 w-5 text-teal-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">ISBN</h3>
                        <p className="text-sm text-slate-500 font-mono">{item.isbn || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <BookOpen className="h-5 w-5 text-teal-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Publisher</h3>
                        <p className="text-sm text-slate-500">{item.publisher || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-teal-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Publication Year</h3>
                        <p className="text-sm text-slate-500">{item.publicationYear || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Layers className="h-5 w-5 text-cyan-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Edition</h3>
                        <p className="text-sm text-slate-500">{item.edition || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-5 w-5 text-cyan-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Language</h3>
                        <p className="text-sm text-slate-500">{item.language || "English"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-cyan-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Pages</h3>
                        <p className="text-sm text-slate-500">{item.pages || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Copies Section */}
            <Card className="border-none shadow-sm border-l-4 border-l-cyan-500">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <Layers className="h-5 w-5 text-cyan-600" />
                  Book Copies ({copies.length})
                </CardTitle>
                <Link href={`/dashboard/staff/library/copies/create?bookId=${id}`}>
                  <Button size="sm" className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 gap-2 shadow-md">
                    <Plus className="h-4 w-4" />
                    Add Copy
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {copies.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    No copies available for this book.
                  </div>
                ) : (
                  <div className="rounded-md border border-slate-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50">
                          <TableHead>Copy Number</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {copies.map((copy) => (
                          <TableRow key={copy.id} className="hover:bg-teal-50/30">
                            <TableCell className="font-medium font-mono">
                              {copy.copyNumber}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={getCopyStatusColor(copy.status)}
                              >
                                {copy.status.charAt(0).toUpperCase() +
                                  copy.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{copy.condition || "N/A"}</TableCell>
                            <TableCell>{copy.location || "N/A"}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Link
                                  href={`/dashboard/staff/library/copies/${copy.id}`}
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="View Details"
                                    className="h-8 w-8 hover:bg-teal-50 hover:text-teal-600"
                                  >
                                    <Eye className="h-4 w-4 text-slate-500" />
                                  </Button>
                                </Link>
                                <Link
                                  href={`/dashboard/staff/library/copies/${copy.id}/edit`}
                                >
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Edit Copy"
                                    className="h-8 w-8 hover:bg-teal-50 hover:text-teal-600"
                                  >
                                    <Edit className="h-4 w-4 text-slate-500" />
                                  </Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Column */}
          <div className="space-y-6">
            {/* Availability Card */}
            <Card className="border-none shadow-sm bg-gradient-to-br from-slate-50 to-teal-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <CheckCircle className="h-5 w-5 text-teal-600" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-slate-700">Available Copies</span>
                  </div>
                  <div className="pl-12">
                    <p className="text-2xl font-bold text-slate-900">
                      {copies.filter((c) => c.status === "available").length}
                    </p>
                    <p className="text-xs text-slate-500">Currently in library</p>
                  </div>
                </div>

                {item.library && (
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
                        <LibraryIcon className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-slate-700">Library Branch</span>
                    </div>
                    <div className="pl-12">
                      <p className="text-lg font-semibold text-slate-900">{item.library.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{item.library.code}</p>
                    </div>
                  </div>
                )}

                {item.price && (
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <span className="font-medium text-slate-700">Price</span>
                    </div>
                    <div className="pl-12">
                      <p className="text-xl font-bold text-slate-900">{item.price} TK</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate Book Copies</DialogTitle>
            <DialogDescription>
              Automatically create multiple copies of this book.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="count" className="text-right">
                Count
              </Label>
              <Input
                id="count"
                type="number"
                min="1"
                className="col-span-3"
                value={generateData.count}
                onChange={(e) => setGenerateData({ ...generateData, count: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g. Shelf A-1"
                className="col-span-3"
                value={generateData.location}
                onChange={(e) => setGenerateData({ ...generateData, location: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="condition" className="text-right">
                Condition
              </Label>
              <SelectUI
                value={generateData.condition}
                onValueChange={(value) => setGenerateData({ ...generateData, condition: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </SelectUI>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGenerateModalOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerateCopies}
              disabled={isGenerating || generateData.count < 1}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white"
            >
              {isGenerating ? "Generating..." : "Generate Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

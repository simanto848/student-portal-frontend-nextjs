"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { bookService } from "@/services/library/book.service";
import type { Book } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";
import {
  BookOpen,
  Plus,
  Search,
  MoreVertical,
  Library as LibraryIcon,
  Calendar,
  User,
  Tag
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BooksPage() {
  const [items, setItems] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      const res = await bookService.getAll({ limit: 50 });
      setItems(res.books);
    } catch {
      toast.error("Failed to load books");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.isbn?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'archived':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#344e41]">Books</h1>
            <p className="text-gray-500 mt-1">Manage your library collection</p>
          </div>
          <Link href="/dashboard/staff/library/books/create">
            <Button className="bg-[#344e41] hover:bg-[#588157] text-white gap-2">
              <Plus className="h-4 w-4" />
              Add New Book
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search books by title, author, or ISBN..."
            className="pl-10 bg-white border-gray-200 focus:border-[#344e41] focus:ring-[#344e41]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-64 animate-pulse bg-gray-100 border-none" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No books found</h3>
            <p className="text-gray-500 mt-1">Get started by adding a new book to the collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((book) => (
              <Card key={book.id} className="group hover:shadow-lg transition-all duration-300 border-gray-100 overflow-hidden flex flex-col">
                <div className="h-2 bg-[#a3b18a]" />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          {book.category}
                        </Badge>
                        <Badge variant="outline" className={`${getStatusColor(book.status)} text-xs`}>
                          {book.status}
                        </Badge>
                      </div>
                      <Link href={`/dashboard/staff/library/books/${book.id}`} className="block">
                        <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight min-h-[3rem] hover:text-[#344e41] transition-colors">
                          {book.title}
                        </CardTitle>
                      </Link>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/dashboard/staff/library/books/${book.id}`}>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                        </Link>
                        <Link href={`/dashboard/staff/library/books/${book.id}/edit`}>
                          <DropdownMenuItem>Edit Book</DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm flex-1">
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="h-4 w-4 text-[#344e41]" />
                    <span className="font-medium truncate">{book.author}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5" />
                      <span className="truncate">ISBN: {book.isbn || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{book.publicationYear || "N/A"}</span>
                    </div>
                  </div>

                  {book.library && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-2">
                      <LibraryIcon className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500 truncate">
                        {book.library.name}
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-3 pb-4 border-t bg-gray-50/50 flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-700">{book.edition ? `${book.edition} Ed.` : ''}</span>
                  </div>
                  <Link href={`/dashboard/staff/library/books/${book.id}`}>
                    <Button variant="ghost" size="sm" className="text-[#344e41] hover:text-[#344e41] hover:bg-[#344e41]/10 h-7 px-2 text-xs">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

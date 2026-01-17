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
        return 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0';
      case 'inactive':
        return 'bg-slate-100 text-slate-600 border-0';
      case 'archived':
        return 'bg-amber-100 text-amber-700 border-0';
      default:
        return 'bg-slate-100 text-slate-600 border-0';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Books</h1>
            <p className="text-slate-500 mt-1">Manage your library collection</p>
          </div>
          <Link href="/dashboard/staff/library/books/create">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white gap-2 shadow-lg">
              <Plus className="h-4 w-4" />
              Add New Book
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search books by title, author, or ISBN..."
            className="pl-10 bg-white border-slate-200 focus:border-teal-500 focus:ring-teal-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-64 animate-pulse bg-slate-100 border-none" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <BookOpen className="h-12 w-12 text-teal-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No books found</h3>
            <p className="text-slate-500 mt-1">Get started by adding a new book to the collection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((book) => (
              <Card
                key={book.id}
                className="group relative hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 overflow-hidden bg-white flex flex-col"
              >
                {/* Animated gradient border on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-[2px] bg-white rounded-lg" />

                {/* Header gradient strip */}
                <div className="relative h-3 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 group-hover:from-teal-400 group-hover:via-cyan-300 group-hover:to-teal-400 transition-all duration-300" />

                <CardHeader className="relative pb-3 pt-4">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-gradient-to-r from-cyan-50 to-teal-50 text-teal-700 border-teal-200 text-xs">
                          {book.category}
                        </Badge>
                        <Badge className={`${getStatusColor(book.status)} text-xs`}>
                          <span className={book.status === 'active' ? 'inline-block w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse' : 'hidden'} />
                          {book.status}
                        </Badge>
                      </div>
                      <Link href={`/dashboard/staff/library/books/${book.id}`} className="block">
                        <CardTitle className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight min-h-[3rem] group-hover:text-teal-700 transition-colors">
                          {book.title}
                        </CardTitle>
                      </Link>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="shadow-xl border-slate-200 bg-white">
                        <Link href={`/dashboard/staff/library/books/${book.id}`}>
                          <DropdownMenuItem className="cursor-pointer focus:bg-teal-50 focus:text-teal-700 hover:bg-teal-50 hover:text-teal-700">View Details</DropdownMenuItem>
                        </Link>
                        <Link href={`/dashboard/staff/library/books/${book.id}/edit`}>
                          <DropdownMenuItem className="cursor-pointer focus:bg-teal-50 focus:text-teal-700 hover:bg-teal-50 hover:text-teal-700">Edit Book</DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="relative space-y-3 text-sm flex-1 pb-4">
                  <div className="flex items-center gap-3 text-slate-700 group/item hover:text-teal-700 transition-colors">
                    <div className="p-1.5 rounded-lg bg-teal-50 group-hover/item:bg-teal-100 transition-colors">
                      <User className="h-3.5 w-3.5 text-teal-600" />
                    </div>
                    <span className="font-medium truncate">{book.author}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-2 group/item hover:text-teal-600 transition-colors">
                      <div className="p-1 rounded bg-slate-50 group-hover/item:bg-teal-50 transition-colors">
                        <Tag className="h-3 w-3" />
                      </div>
                      <span className="truncate">ISBN: {book.isbn || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 group/item hover:text-teal-600 transition-colors">
                      <div className="p-1 rounded bg-slate-50 group-hover/item:bg-teal-50 transition-colors">
                        <Calendar className="h-3 w-3" />
                      </div>
                      <span>{book.publicationYear || "N/A"}</span>
                    </div>
                  </div>

                  {book.library && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                      <div className="p-1 rounded bg-cyan-50">
                        <LibraryIcon className="h-3 w-3 text-cyan-600" />
                      </div>
                      <span className="text-xs text-slate-500 truncate">
                        {book.library.name}
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="relative pt-3 pb-4 border-t border-slate-100 bg-gradient-to-r from-slate-50/80 to-teal-50/30 flex justify-between items-center text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-slate-700">{book.edition ? `${book.edition} Ed.` : ''}</span>
                  </div>
                  <Link href={`/dashboard/staff/library/books/${book.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-teal-600 hover:text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 h-7 px-3 text-xs rounded-full font-medium transition-all duration-300"
                    >
                      View Details →
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

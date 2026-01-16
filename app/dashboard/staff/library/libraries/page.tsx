"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { libraryService } from "@/services/library/library.service";
import type { Library } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  Plus,
  Search,
  MoreVertical,
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

export default function LibrariesPage() {
  const [items, setItems] = useState<Library[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLibraries();
  }, []);

  const fetchLibraries = async () => {
    try {
      setIsLoading(true);
      const res = await libraryService.getAll({ limit: 50 });
      setItems(res.libraries);
    } catch {
      toast.error("Failed to load libraries");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Libraries</h1>
            <p className="text-slate-500 mt-1">Manage your library branches and locations</p>
          </div>
          <Link href="/dashboard/staff/library/libraries/create">
            <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white gap-2 shadow-lg">
              <Plus className="h-4 w-4" />
              Add New Library
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search libraries by name or code..."
            className="pl-10 bg-white border-slate-200 focus:border-teal-500 focus:ring-teal-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-64 animate-pulse bg-slate-100 border-none" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <Building2 className="h-12 w-12 text-teal-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No libraries found</h3>
            <p className="text-slate-500 mt-1">Get started by adding a new library branch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((lib) => (
              <Card
                key={lib.id}
                className="group relative hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border-0 overflow-hidden bg-white"
              >
                {/* Animated gradient border on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-[2px] bg-white rounded-lg" />

                {/* Header gradient strip */}
                <div className="relative h-3 bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-500 group-hover:from-teal-400 group-hover:via-cyan-300 group-hover:to-teal-400 transition-all duration-300" />

                {/* Decorative corner element */}
                <div className="absolute top-3 right-0 w-20 h-20 bg-gradient-to-bl from-teal-100/50 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardHeader className="relative pb-4 pt-5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="bg-gradient-to-r from-teal-50 to-cyan-50 text-teal-700 border-teal-200 font-mono text-xs">
                          {lib.code}
                        </Badge>
                        <Badge
                          className={lib.status === 'active'
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 shadow-sm'
                            : 'bg-slate-100 text-slate-600 border-0'
                          }
                        >
                          <span className={lib.status === 'active' ? 'inline-block w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-pulse' : 'hidden'} />
                          {lib.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-teal-700 transition-colors duration-300">
                        {lib.name}
                      </CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="shadow-xl border-slate-200">
                        <Link href={`/dashboard/staff/library/libraries/${lib.id}`}>
                          <DropdownMenuItem className="cursor-pointer hover:bg-teal-50 hover:text-teal-700">View Details</DropdownMenuItem>
                        </Link>
                        <Link href={`/dashboard/staff/library/libraries/${lib.id}/edit`}>
                          <DropdownMenuItem className="cursor-pointer hover:bg-teal-50 hover:text-teal-700">Edit Library</DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="relative space-y-4 text-sm pb-4">
                  {lib.description && (
                    <p className="text-slate-500 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                      {lib.description}
                    </p>
                  )}

                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center gap-3 text-slate-600 group/item hover:text-teal-700 transition-colors">
                      <div className="p-1.5 rounded-lg bg-teal-50 group-hover/item:bg-teal-100 transition-colors">
                        <MapPin className="h-3.5 w-3.5 text-teal-600" />
                      </div>
                      <span className="truncate text-sm">{lib.address || "No address provided"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 group/item hover:text-teal-700 transition-colors">
                      <div className="p-1.5 rounded-lg bg-cyan-50 group-hover/item:bg-cyan-100 transition-colors">
                        <Phone className="h-3.5 w-3.5 text-cyan-600" />
                      </div>
                      <span className="truncate text-sm">{lib.phone || "No phone provided"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 group/item hover:text-teal-700 transition-colors">
                      <div className="p-1.5 rounded-lg bg-sky-50 group-hover/item:bg-sky-100 transition-colors">
                        <Mail className="h-3.5 w-3.5 text-sky-600" />
                      </div>
                      <span className="truncate text-sm">{lib.email || "No email provided"}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="relative pt-4 border-t border-slate-100 bg-gradient-to-r from-slate-50/80 to-teal-50/30 flex justify-between items-center text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Updated {lib.updatedAt ? new Date(lib.updatedAt).toLocaleDateString() : "N/A"}</span>
                  </div>
                  <Link href={`/dashboard/staff/library/libraries/${lib.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-teal-600 hover:text-white hover:bg-gradient-to-r hover:from-teal-500 hover:to-cyan-500 h-8 px-4 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md"
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

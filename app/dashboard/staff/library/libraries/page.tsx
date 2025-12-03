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
            <h1 className="text-3xl font-bold text-[#344e41]">Libraries</h1>
            <p className="text-gray-500 mt-1">Manage your library branches and locations</p>
          </div>
          <Link href="/dashboard/staff/library/libraries/new">
            <Button className="bg-[#344e41] hover:bg-[#588157] text-white gap-2">
              <Plus className="h-4 w-4" />
              Add New Library
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search libraries by name or code..."
            className="pl-10 bg-white border-gray-200 focus:border-[#344e41] focus:ring-[#344e41]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="h-64 animate-pulse bg-gray-100 border-none" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No libraries found</h3>
            <p className="text-gray-500 mt-1">Get started by adding a new library branch.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((lib) => (
              <Card key={lib.id} className="group hover:shadow-lg transition-all duration-300 border-gray-100 overflow-hidden">
                <div className="h-2 bg-[#344e41]" />
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-[#344e41]/5 text-[#344e41] border-[#344e41]/20">
                          {lib.code}
                        </Badge>
                        <Badge variant={lib.status === 'active' ? 'default' : 'secondary'} className={lib.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                          {lib.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1">
                        {lib.name}
                      </CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/dashboard/staff/library/libraries/${lib.id}`}>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                        </Link>
                        <Link href={`/dashboard/staff/library/libraries/${lib.id}/edit`}>
                          <DropdownMenuItem>Edit Library</DropdownMenuItem>
                        </Link>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {lib.description && (
                    <p className="text-gray-500 line-clamp-2 h-10">
                      {lib.description}
                    </p>
                  )}

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center gap-3 text-gray-600">
                      <MapPin className="h-4 w-4 text-[#344e41]" />
                      <span className="truncate">{lib.address || "No address provided"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Phone className="h-4 w-4 text-[#344e41]" />
                      <span className="truncate">{lib.phone || "No phone provided"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <Mail className="h-4 w-4 text-[#344e41]" />
                      <span className="truncate">{lib.email || "No email provided"}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t bg-gray-50/50 flex justify-between items-center text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Updated {lib.updatedAt ? new Date(lib.updatedAt).toLocaleDateString() : "N/A"}</span>
                  </div>
                  <Link href={`/dashboard/staff/library/libraries/${lib.id}`}>
                    <Button variant="ghost" size="sm" className="text-[#344e41] hover:text-[#344e41] hover:bg-[#344e41]/10 h-8 px-3">
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

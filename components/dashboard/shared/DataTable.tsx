"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
    header: string;
    accessorKey: keyof T;
    cell?: (item: T) => React.ReactNode;
    hideOnMobile?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onView?: (item: T) => void;
    searchKey: keyof T;
    searchPlaceholder?: string;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    onEdit,
    onDelete,
    onView,
    searchKey,
    searchPlaceholder = "Search...",
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Filter data
    const filteredData = data.filter((item) => {
        const value = item[searchKey];
        if (typeof value === "string") {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
    });

    // Pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // Generate page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex items-center bg-[#dad7cd] p-2 sm:p-3 rounded-lg">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#344e41]/60" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="pl-9 bg-white border-none shadow-sm text-[#344e41] placeholder:text-[#344e41]/50 focus-visible:ring-[#588157]"
                    />
                </div>
            </div>

            {/* Table - Desktop */}
            <div className="hidden md:block rounded-lg overflow-hidden border border-[#a3b18a]/30">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#a3b18a]/40 hover:bg-[#a3b18a]/40 border-b border-[#a3b18a]/30">
                            {columns.map((column) => (
                                <TableHead 
                                    key={String(column.accessorKey)} 
                                    className="text-[#344e41] font-bold uppercase text-xs tracking-wider py-4"
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                            <TableHead className="text-right text-[#344e41] font-bold uppercase text-xs tracking-wider py-4">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="h-24 text-center bg-[#dad7cd]/50 text-[#344e41]">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((item, index) => (
                                <TableRow 
                                    key={item.id} 
                                    className={`
                                        border-b border-[#a3b18a]/20 hover:bg-[#a3b18a]/20 transition-colors
                                        ${index % 2 === 0 ? 'bg-[#dad7cd]/30' : 'bg-[#dad7cd]/50'}
                                    `}
                                >
                                    {columns.map((column) => (
                                        <TableCell 
                                            key={String(column.accessorKey)} 
                                            className="font-medium text-[#344e41] py-4"
                                        >
                                            {column.cell ? column.cell(item) : (item[column.accessorKey] as React.ReactNode)}
                                        </TableCell>
                                    ))}
                                    <TableCell className="text-right space-x-1 py-4">
                                        {onView && (
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => onView(item)} 
                                                className="h-8 w-8 text-[#344e41] hover:text-[#588157] hover:bg-[#588157]/10"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {onEdit && (
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => onEdit(item)} 
                                                className="h-8 w-8 text-[#344e41] hover:text-[#588157] hover:bg-[#588157]/10"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {onDelete && (
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => onDelete(item)} 
                                                className="h-8 w-8 text-[#344e41] hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {paginatedData.length === 0 ? (
                    <div className="text-center py-8 bg-[#dad7cd]/50 rounded-lg text-[#344e41]">
                        No results found.
                    </div>
                ) : (
                    paginatedData.map((item) => (
                        <div 
                            key={item.id} 
                            className="bg-[#dad7cd]/50 rounded-lg p-4 border border-[#a3b18a]/30"
                        >
                            {columns.map((column) => (
                                <div key={String(column.accessorKey)} className="flex justify-between py-2 border-b border-[#a3b18a]/20 last:border-0">
                                    <span className="text-xs font-bold uppercase text-[#344e41]/60">{column.header}</span>
                                    <span className="font-medium text-[#344e41] text-right">
                                        {column.cell ? column.cell(item) : (item[column.accessorKey] as React.ReactNode)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-[#a3b18a]/30">
                                {onView && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => onView(item)}
                                        className="text-[#344e41] border-[#a3b18a] hover:bg-[#588157]/10"
                                    >
                                        <Eye className="h-4 w-4 mr-1" /> View
                                    </Button>
                                )}
                                {onEdit && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => onEdit(item)}
                                        className="text-[#344e41] border-[#a3b18a] hover:bg-[#588157]/10"
                                    >
                                        <Edit className="h-4 w-4 mr-1" /> Edit
                                    </Button>
                                )}
                                {onDelete && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => onDelete(item)}
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                <div className="text-sm text-[#344e41]/70 order-2 sm:order-1">
                    Showing {filteredData.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} results
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0 bg-[#dad7cd] border-[#a3b18a]/30 hover:bg-[#a3b18a]/30 disabled:opacity-50"
                    >
                        <ChevronLeft className="h-4 w-4 text-[#344e41]" />
                    </Button>
                    {getPageNumbers().map((page, index) => (
                        typeof page === 'number' ? (
                            <Button
                                key={index}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={`h-8 w-8 p-0 border-none ${
                                    currentPage === page 
                                        ? 'bg-[#588157] text-white hover:bg-[#3a5a40]' 
                                        : 'bg-[#dad7cd] hover:bg-[#a3b18a]/30 text-[#344e41]'
                                }`}
                            >
                                {page}
                            </Button>
                        ) : (
                            <span key={index} className="px-1 text-[#344e41]/50">...</span>
                        )
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0 bg-[#dad7cd] border-[#a3b18a]/30 hover:bg-[#a3b18a]/30 disabled:opacity-50"
                    >
                        <ChevronRight className="h-4 w-4 text-[#344e41]" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

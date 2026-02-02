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
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { motion, AnimatePresence } from "framer-motion";

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
    renderExtraActions?: (item: T) => React.ReactNode;
    searchKey: keyof T;
    searchPlaceholder?: string;
}

export function DataTable<T extends { id: string | number }>({
    data,
    columns,
    onEdit,
    onDelete,
    onView,
    renderExtraActions,
    searchKey,
    searchPlaceholder = "Search...",
}: DataTableProps<T>) {
    const theme = useDashboardTheme();
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter data
    const filteredData = data.filter((item) => {
        const value = item[searchKey];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
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
            <div className={`flex items-center ${theme.colors.sidebar.activeBgSubtle} p-2 sm:p-3 rounded-xl border ${theme.colors.sidebar.borderSubtle}`}>
                <div className="relative w-full sm:w-80">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${theme.colors.sidebar.text}/50`} />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className={`pl-10 bg-white dark:bg-slate-900/50 border-${theme.colors.sidebar.border.replace('border-', '')} shadow-sm focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-${theme.colors.accent.secondary.replace('bg-', '')} rounded-lg h-10 dark:text-white`}
                    />
                </div>
            </div>

            {/* Table - Desktop */}
            <div className={`hidden md:block rounded-xl overflow-hidden border ${theme.colors.sidebar.borderSubtle} shadow-sm`}>
                <Table>
                    <TableHeader>
                        <TableRow className={`${theme.colors.sidebar.activeBgSubtle} hover:bg-${theme.colors.sidebar.activeBgSubtle.replace('bg-', '')} border-b ${theme.colors.sidebar.borderSubtle}`}>
                            {columns.map((column) => (
                                <TableHead
                                    key={String(column.accessorKey)}
                                    className={`${theme.colors.sidebar.activeText} font-semibold uppercase text-xs tracking-wider py-4`}
                                >
                                    {column.header}
                                </TableHead>
                            ))}
                            <TableHead className={`text-right ${theme.colors.sidebar.activeText} font-semibold uppercase text-xs tracking-wider py-4 pr-6`}>
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence mode="wait">
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length + 1} className={`h-32 text-center text-${theme.colors.sidebar.text.replace('text-', '')}/60 bg-white dark:bg-slate-900/20`}>
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <Search className="h-8 w-8 opacity-20" />
                                            <p>No results found matching your search.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((item, index) => (
                                    <motion.tr
                                        key={item.id}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className={`
                                            group border-b ${theme.colors.sidebar.borderSubtle} hover:bg-${theme.colors.sidebar.active.replace('bg-', '')}/30 transition-colors
                                            ${index % 2 === 0 ? 'bg-white/50 dark:bg-slate-900/50' : 'bg-transparent'}
                                        `}
                                    >
                                        {columns.map((column) => (
                                            <TableCell
                                                key={String(column.accessorKey)}
                                                className={`font-medium ${theme.colors.header.text} py-4`}
                                            >
                                                {column.cell ? column.cell(item) : (item[column.accessorKey] as React.ReactNode)}
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-right space-x-1 py-4 pr-6">
                                            <div className="flex items-center justify-end gap-1">
                                                {renderExtraActions && renderExtraActions(item)}
                                                {onView && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onView(item)}
                                                        className={`h-9 w-9 text-${theme.colors.sidebar.text.replace('text-', '')}/60 hover:${theme.colors.accent.primary} hover:${theme.colors.sidebar.activeBgSubtle} rounded-lg transition-colors`}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {onEdit && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onEdit(item)}
                                                        className={`h-9 w-9 text-${theme.colors.sidebar.text.replace('text-', '')}/60 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors`}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {onDelete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onDelete(item)}
                                                        className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                ))
                            )}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                <AnimatePresence mode="wait">
                    {paginatedData.length === 0 ? (
                        <div className={`text-center py-12 bg-white dark:bg-slate-900/50 rounded-xl border ${theme.colors.sidebar.borderSubtle} text-${theme.colors.sidebar.text.replace('text-', '')}/60 shadow-sm`}>
                            No results found.
                        </div>
                    ) : (
                        paginatedData.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-white dark:bg-slate-900/50 rounded-xl p-5 border ${theme.colors.sidebar.borderSubtle} shadow-sm group active:scale-[0.99] transition-transform`}
                            >
                                {columns.map((column) => (
                                    <div key={String(column.accessorKey)} className={`flex justify-between py-2.5 border-b ${theme.colors.sidebar.borderSubtle}/50 last:border-0`}>
                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${theme.colors.sidebar.text}/50`}>{column.header}</span>
                                        <span className={`font-semibold ${theme.colors.header.text} text-sm text-right`}>
                                            {column.cell ? column.cell(item) : (item[column.accessorKey] as React.ReactNode)}
                                        </span>
                                    </div>
                                ))}
                                <div className={`flex justify-end gap-3 mt-4 pt-4 border-t ${theme.colors.sidebar.borderSubtle}`}>
                                    {renderExtraActions && renderExtraActions(item)}
                                    {onView && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onView(item)}
                                            className={`text-${theme.colors.sidebar.text.replace('text-', '')} border-${theme.colors.sidebar.border.replace('border-', '')} hover:${theme.colors.sidebar.activeBgSubtle} rounded-lg font-medium`}
                                        >
                                            <Eye className="h-4 w-4 mr-2" /> View
                                        </Button>
                                    )}
                                    {onEdit && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(item)}
                                            className="text-amber-700 border-amber-200 hover:bg-amber-50 rounded-lg font-medium"
                                        >
                                            <Edit className="h-4 w-4 mr-2" /> Edit
                                        </Button>
                                    )}
                                    {onDelete && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onDelete(item)}
                                            className="text-red-600 border-red-200 hover:bg-red-50 rounded-lg font-medium"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-2">
                <div className={`text-xs font-medium ${theme.colors.sidebar.text}/70 order-2 sm:order-1`}>
                    Showing <span className="text-slate-900 dark:text-white font-bold">{filteredData.length > 0 ? startIndex + 1 : 0}</span> to <span className="text-slate-900 dark:text-white font-bold">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> of <span className="text-slate-900 dark:text-white font-bold">{filteredData.length}</span> entries
                </div>
                <div className="flex items-center space-x-1 sm:space-x-1.5 order-1 sm:order-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`h-9 w-9 p-0 hover:${theme.colors.sidebar.activeBgSubtle} rounded-lg disabled:opacity-30`}
                    >
                        <ChevronLeft className={`h-4 w-4 ${theme.colors.sidebar.activeText}`} />
                    </Button>
                    <div className="flex items-center gap-1.5">
                        {getPageNumbers().map((page, index) => (
                            typeof page === 'number' ? (
                                <Button
                                    key={index}
                                    variant={currentPage === page ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className={`h-9 min-w-[36px] p-0 font-bold rounded-lg transition-all ${currentPage === page
                                        ? `${theme.colors.accent.secondary} text-white shadow-sm ring-1 ring-offset-1 ring-${theme.colors.accent.secondary.replace('bg-', '')}/30`
                                        : `text-${theme.colors.sidebar.text.replace('text-', '')}/60 hover:${theme.colors.sidebar.activeBgSubtle} hover:${theme.colors.sidebar.activeText}`
                                        }`}
                                >
                                    {page}
                                </Button>
                            ) : (
                                <span key={index} className="px-1.5 text-slate-400 font-medium">...</span>
                            )
                        ))}
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`h-9 w-9 p-0 hover:${theme.colors.sidebar.activeBgSubtle} rounded-lg disabled:opacity-30`}
                    >
                        <ChevronRight className={`h-4 w-4 ${theme.colors.sidebar.activeText}`} />
                    </Button>
                </div>
            </div>
        </div>
    );
}

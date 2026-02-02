"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Admin as Moderator,
} from "@/services/user/admin.service";
import {
    Search,
    Mail,
    Plus,
    Hash,
    Eye,
    Edit,
    Trash2,
    RotateCcw,
    XCircle,
    Shield,
    Ban,
    Unlock,
    RefreshCw
} from "lucide-react";
import { adminService } from "@/services/user/admin.service";
import { getImageUrl, cn } from "@/lib/utils";
import { notifySuccess, notifyError } from "@/components/toast";
import { motion, AnimatePresence } from "framer-motion";
import { deleteModeratorAction, restoreModeratorAction, permanentDeleteModeratorAction } from "../actions";

interface ModeratorManagementClientProps {
    initialModerators: Moderator[];
    initialDeletedModerators: Moderator[];
}

export function ModeratorManagementClient({
    initialModerators,
    initialDeletedModerators
}: ModeratorManagementClientProps) {
    const router = useRouter();
    const [moderators, setModerators] = useState(initialModerators);
    const [deletedModerators, setDeletedModerators] = useState(initialDeletedModerators);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("active");
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const [mods, deleted] = await Promise.all([
                adminService.getAll({ role: "moderator", limit: 50 }),
                adminService.getDeleted()
            ]);
            setModerators(mods.admins);
            setDeletedModerators(deleted.filter((a: any) => a.role === "moderator"));
            notifySuccess("Data refreshed");
        } catch (error) {
            notifyError("Failed to refresh data");
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleDelete = async (moderator: Moderator) => {
        if (!confirm(`Are you sure you want to delete ${moderator.fullName}?`)) return;

        try {
            const formData = new FormData();
            const result = await deleteModeratorAction(moderator.id, {}, formData);
            if (result.success) {
                notifySuccess(`${moderator.fullName} moved to trash`);
                setModerators(moderators.filter(m => m.id !== moderator.id));
                setDeletedModerators([moderator, ...deletedModerators]);
            } else {
                notifyError(result.message || "Failed to delete moderator");
            }
        } catch (error) {
            notifyError("An error occurred during deletion");
        }
    };

    const handleRestore = async (moderator: Moderator) => {
        try {
            const formData = new FormData();
            const result = await restoreModeratorAction(moderator.id, {}, formData);
            if (result.success) {
                notifySuccess(`${moderator.fullName} restored successfully`);
                setDeletedModerators(deletedModerators.filter(m => m.id !== moderator.id));
                setModerators([moderator, ...moderators]);
            } else {
                notifyError(result.message || "Failed to restore moderator");
            }
        } catch (error) {
            notifyError("An error occurred during restoration");
        }
    };

    const handlePermanentDelete = async (moderator: Moderator) => {
        if (!confirm(`WARNING: This will permanently delete ${moderator.fullName}. This action cannot be undone. Continue?`)) return;

        try {
            const formData = new FormData();
            const result = await permanentDeleteModeratorAction(moderator.id, {}, formData);
            if (result.success) {
                notifySuccess(`${moderator.fullName} permanently deleted`);
                setDeletedModerators(deletedModerators.filter(m => m.id !== moderator.id));
            } else {
                notifyError(result.message || "Failed to delete permanently");
            }
        } catch (error) {
            notifyError("An error occurred during permanent deletion");
        }
    };

    const handleBlock = async (moderator: Moderator) => {
        const reason = window.prompt(`Enter block reason for ${moderator.fullName}:`);
        if (reason === null) return;
        if (!reason.trim()) {
            notifyError("Reason is required to block a user");
            return;
        }

        try {
            await adminService.blockUser("admin", moderator.id, reason);
            notifySuccess(`${moderator.fullName} blocked successfully`);
            setModerators(moderators.map(m => m.id === moderator.id ? { ...m, isBlocked: true } : m));
        } catch (error) {
            notifyError(error instanceof Error ? error.message : "Failed to block moderator");
        }
    };

    const handleUnblock = async (moderator: Moderator) => {
        if (!confirm(`Are you sure you want to unblock ${moderator.fullName}?`)) return;
        try {
            await adminService.unblockUser("admin", moderator.id);
            notifySuccess(`${moderator.fullName} unblocked successfully`);
            setModerators(moderators.map(m => m.id === moderator.id ? { ...m, isBlocked: false } : m));
        } catch (error) {
            notifyError(error instanceof Error ? error.message : "Failed to unblock moderator");
        }
    };

    const filteredModerators = (activeTab === "active" ? moderators : deletedModerators).filter(m => {
        const term = searchTerm.toLowerCase();
        return m.fullName.toLowerCase().includes(term) ||
            m.email.toLowerCase().includes(term) ||
            m.registrationNumber.toLowerCase().includes(term);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Moderator Management</h1>
                    <p className="text-slate-500">View and manage system moderators.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="rounded-xl"
                    >
                        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                    </Button>
                    <Button onClick={() => router.push("/dashboard/admin/users/moderators/create")} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Moderator
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-slate-50/50">
                <CardContent className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search by name, email or registration number..."
                            className="pl-10 bg-white border-slate-200 rounded-xl focus:ring-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
                <div className="flex items-center justify-between mb-4">
                    <TabsList className="bg-slate-100 p-1 rounded-xl">
                        <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Active Moderators
                            <Badge variant="secondary" className="ml-2 bg-slate-200 text-slate-700">
                                {moderators.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="deleted" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Trash
                            <Badge variant="secondary" className="ml-2 bg-slate-200 text-slate-700">
                                {deletedModerators.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="active" className="m-0">
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[300px]">Moderator</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead>Registration</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence mode="popLayout">
                                    {filteredModerators.map((m) => (
                                        <motion.tr
                                            key={m.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="group hover:bg-slate-50/50 transition-colors"
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push(`/dashboard/admin/users/moderators/${m.id}`)}>
                                                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100 shadow-sm overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform">
                                                        {m.profile?.profilePicture ? (
                                                            <img src={getImageUrl(m.profile.profilePicture)} alt={m.fullName} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Shield className="w-6 h-6 text-blue-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{m.fullName}</div>
                                                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <Shield className="w-3 h-3" />
                                                            System Moderator
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                        {m.email}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm font-mono text-slate-600">
                                                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                                                    {m.registrationNumber}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {m.isBlocked ? (
                                                    <Badge className="bg-red-50 text-red-600 border-red-100 animate-pulse">
                                                        Blocked
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100">
                                                        Active
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/admin/users/moderators/${m.id}`)} className="h-10 w-10 rounded-xl hover:bg-white hover:text-blue-600 hover:shadow-md active:scale-95 transition-all">
                                                        <Eye className="w-4.5 h-4.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/admin/users/moderators/${m.id}/edit`)} className="h-10 w-10 rounded-xl hover:bg-white hover:text-amber-600 hover:shadow-md active:scale-95 transition-all">
                                                        <Edit className="w-4.5 h-4.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => m.isBlocked ? handleUnblock(m) : handleBlock(m)}
                                                        className={cn(
                                                            "h-10 w-10 rounded-xl hover:bg-white hover:shadow-md active:scale-95 transition-all",
                                                            m.isBlocked ? "text-emerald-600 hover:text-emerald-700" : "text-red-500 hover:text-red-600"
                                                        )}
                                                        title={m.isBlocked ? "Unblock Moderator" : "Block Moderator"}
                                                    >
                                                        {m.isBlocked ? <Unlock className="w-4.5 h-4.5" /> : <Ban className="w-4.5 h-4.5" />}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(m)} className="h-10 w-10 rounded-xl hover:bg-white hover:text-red-600 hover:shadow-md active:scale-95 transition-all">
                                                        <Trash2 className="w-4.5 h-4.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                                {filteredModerators.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-72 text-center">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center">
                                                    <Search className="h-8 w-8 text-slate-300" />
                                                </div>
                                                <div className="text-slate-500 font-medium">No moderators found matching your criteria</div>
                                                <Button variant="link" onClick={() => setSearchTerm("")} className="text-blue-600">Clear all filters</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>

                <TabsContent value="deleted" className="m-0">
                    <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="w-[300px]">Moderator</TableHead>
                                    <TableHead>Contact Info</TableHead>
                                    <TableHead>Registration</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredModerators.map((m) => (
                                    <TableRow key={m.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 grayscale opacity-70">
                                                    <Shield className="w-6 h-6 text-slate-400" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-500 line-through">{m.fullName}</div>
                                                    <div className="text-xs text-slate-400 italic">Moderator (Trashed)</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-400">{m.email}</TableCell>
                                        <TableCell className="text-slate-400 font-mono text-sm">{m.registrationNumber}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleRestore(m)} className="h-10 w-10 rounded-xl hover:bg-white hover:text-emerald-600 hover:shadow-md active:scale-95 transition-all" title="Restore">
                                                    <RotateCcw className="w-4.5 h-4.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handlePermanentDelete(m)} className="h-10 w-10 rounded-xl hover:bg-white hover:text-red-700 hover:shadow-md active:scale-95 transition-all" title="Purge Record">
                                                    <XCircle className="w-4.5 h-4.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredModerators.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-32 text-center text-slate-400 italic">
                                            Trash is empty
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

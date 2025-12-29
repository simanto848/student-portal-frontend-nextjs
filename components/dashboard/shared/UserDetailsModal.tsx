"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RoleBadge } from "./RoleBadge";
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Shield,
    Clock,
    Globe,
    Ban,
    CheckCircle,
    AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UserDetails {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    userType: string;
    role?: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    loginSummary?: {
        lastLoginAt?: string;
        lastLoginIp?: string;
        registeredIps?: string[];
    };
    accountStatus?: {
        isActive: boolean;
        isBlocked: boolean;
        blockedAt?: string;
        blockedBy?: string;
        blockReason?: string;
        twoFactorEnabled: boolean;
        emailUpdatesEnabled: boolean;
    };
    createdAt?: string;
    updatedAt?: string;
}

interface UserDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserDetails | null;
    onBlock?: () => void;
    onUnblock?: () => void;
    isLoading?: boolean;
}

export function UserDetailsModal({
    isOpen,
    onClose,
    user,
    onBlock,
    onUnblock,
    isLoading = false,
}: UserDetailsModalProps) {
    if (!user) return null;

    const formatDate = (date?: string) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatAddress = (addr?: UserDetails["address"]) => {
        if (!addr) return "Not provided";
        const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "Not provided";
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        User Details
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Header Section */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-[#dad7cd] flex items-center justify-center">
                                    <span className="text-2xl font-bold text-[#344e41]">
                                        {user.fullName.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-[#344e41]">{user.fullName}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <RoleBadge role={user.role || user.userType} />
                                        {user.accountStatus?.isBlocked && (
                                            <Badge variant="destructive" className="flex items-center gap-1">
                                                <Ban className="h-3 w-3" />
                                                Blocked
                                            </Badge>
                                        )}
                                        {user.accountStatus?.isActive === false && (
                                            <Badge variant="secondary">Inactive</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-2">
                                {user.accountStatus?.isBlocked ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onUnblock}
                                        className="text-green-600 border-green-600"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Unblock
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onBlock}
                                        className="text-red-600 border-red-600"
                                    >
                                        <Ban className="h-4 w-4 mr-1" />
                                        Block
                                    </Button>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Block Reason Alert */}
                        {user.accountStatus?.isBlocked && user.accountStatus.blockReason && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium text-red-800">User is blocked</p>
                                        <p className="text-sm text-red-700 mt-1">
                                            <strong>Reason:</strong> {user.accountStatus.blockReason}
                                        </p>
                                        {user.accountStatus.blockedAt && (
                                            <p className="text-xs text-red-600 mt-1">
                                                Blocked {formatDistanceToNow(new Date(user.accountStatus.blockedAt), { addSuffix: true })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contact Information */}
                        <div>
                            <h4 className="font-medium text-[#344e41] mb-3">Contact Information</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.phoneNumber || "Not provided"}</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm col-span-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                    <span>{formatAddress(user.address)}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Personal Information */}
                        <div>
                            <h4 className="font-medium text-[#344e41] mb-3">Personal Information</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>DOB: {formatDate(user.dateOfBirth)}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>Gender: {user.gender || "Not specified"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <span>Nationality: {user.nationality || "Not specified"}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Account Security */}
                        <div>
                            <h4 className="font-medium text-[#344e41] mb-3">Account Security</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        2FA: {user.accountStatus?.twoFactorEnabled ? (
                                            <Badge variant="default" className="bg-green-100 text-green-800 ml-1">Enabled</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="ml-1">Disabled</Badge>
                                        )}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        Email Updates: {user.accountStatus?.emailUpdatesEnabled ? "Enabled" : "Disabled"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Login History */}
                        <div>
                            <h4 className="font-medium text-[#344e41] mb-3">Login History</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        Last Login: {user.loginSummary?.lastLoginAt
                                            ? formatDistanceToNow(new Date(user.loginSummary.lastLoginAt), { addSuffix: true })
                                            : "Never"}
                                    </span>
                                </div>
                                {user.loginSummary?.lastLoginIp && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <span>Last IP: {user.loginSummary.lastLoginIp}</span>
                                    </div>
                                )}
                                {user.loginSummary?.registeredIps && user.loginSummary.registeredIps.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-muted-foreground mb-1">Registered IPs:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {user.loginSummary.registeredIps.map((ip) => (
                                                <Badge key={ip} variant="outline" className="text-xs">
                                                    {ip}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timestamps */}
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                            <p>Account created: {formatDate(user.createdAt)}</p>
                            {user.updatedAt && <p>Last updated: {formatDate(user.updatedAt)}</p>}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default UserDetailsModal;

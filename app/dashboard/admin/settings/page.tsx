"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
    Shield,
    Server,
    Database,
    Lock,
    CheckCircle,
    RefreshCw,
} from "lucide-react";

interface SystemSettings {
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    emailNotificationsEnabled: boolean;
    maxLoginAttempts: number;
    sessionTimeoutMinutes: number;
    allowPasswordReset: boolean;
    twoFactorRequired: boolean;
}

export default function SystemSettingsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Mock settings state - in production, these would come from an API
    const [settings, setSettings] = useState<SystemSettings>({
        maintenanceMode: false,
        registrationEnabled: true,
        emailNotificationsEnabled: true,
        maxLoginAttempts: 5,
        sessionTimeoutMinutes: 60,
        allowPasswordReset: true,
        twoFactorRequired: false,
    });

    useEffect(() => {
        // Check if user is super_admin
        if (user && user.role !== "super_admin") {
            toast.error("Access denied. Super admin only.");
            router.push("/dashboard/admin");
            return;
        }

        // Simulate loading settings
        setTimeout(() => setIsLoading(false), 500);
    }, [user, router]);

    const handleSettingChange = (key: keyof SystemSettings, value: boolean | number) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // In production, this would call an API
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast.success("Settings saved successfully");
        } catch {
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center py-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader
                    title="System Settings"
                    subtitle="Configure global system settings (Super Admin only)"
                    icon={Shield}
                />

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
                    <Shield className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-purple-800">Super Admin Access</p>
                        <p className="text-sm text-purple-700">
                            These settings affect the entire system. Changes here will impact all users.
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* General Settings */}
                    <Card className="border-[#a3b18a]/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Server className="h-5 w-5" />
                                General Settings
                            </CardTitle>
                            <CardDescription>
                                Core system configuration options
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="font-medium">Maintenance Mode</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Disable access for non-admin users
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {settings.maintenanceMode && (
                                        <Badge variant="destructive" className="text-xs">Active</Badge>
                                    )}
                                    <Switch
                                        checked={settings.maintenanceMode}
                                        onCheckedChange={(v) => handleSettingChange("maintenanceMode", v)}
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="font-medium">User Registration</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Allow new users to register
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.registrationEnabled}
                                    onCheckedChange={(v) => handleSettingChange("registrationEnabled", v)}
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="font-medium">Email Notifications</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Enable system-wide email notifications
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.emailNotificationsEnabled}
                                    onCheckedChange={(v) => handleSettingChange("emailNotificationsEnabled", v)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Settings */}
                    <Card className="border-[#a3b18a]/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Lock className="h-5 w-5" />
                                Security Settings
                            </CardTitle>
                            <CardDescription>
                                Authentication and access control
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label className="font-medium">Max Login Attempts</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={settings.maxLoginAttempts}
                                    onChange={(e) => handleSettingChange("maxLoginAttempts", parseInt(e.target.value) || 5)}
                                    className="w-24"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Account locked after this many failed attempts
                                </p>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <Label className="font-medium">Session Timeout (minutes)</Label>
                                <Input
                                    type="number"
                                    min={15}
                                    max={480}
                                    value={settings.sessionTimeoutMinutes}
                                    onChange={(e) => handleSettingChange("sessionTimeoutMinutes", parseInt(e.target.value) || 60)}
                                    className="w-24"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Auto logout after inactivity
                                </p>
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="font-medium">Password Reset</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Allow users to reset passwords via email
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.allowPasswordReset}
                                    onCheckedChange={(v) => handleSettingChange("allowPasswordReset", v)}
                                />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="font-medium">Require 2FA</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Enforce two-factor authentication
                                    </p>
                                </div>
                                <Switch
                                    checked={settings.twoFactorRequired}
                                    onCheckedChange={(v) => handleSettingChange("twoFactorRequired", v)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* System Status */}
                <Card className="border-[#a3b18a]/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Database className="h-5 w-5" />
                            System Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-800">Database</p>
                                    <p className="text-xs text-green-600">Connected</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-800">Gateway</p>
                                    <p className="text-xs text-green-600">Running</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-800">Email Service</p>
                                    <p className="text-xs text-green-600">Operational</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-green-800">Storage</p>
                                    <p className="text-xs text-green-600">Available</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#588157] hover:bg-[#3a5a40]"
                    >
                        {isSaving ? (
                            <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
}

"use client";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Lock, Globe, Mail } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {

    const handleSave = () => {
        toast.success("Settings saved successfully");
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
                    <p className="text-muted-foreground">Global configuration and preferences</p>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Configuration</CardTitle>
                            <CardDescription>Basic system information and display settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="site_name">Site Name</Label>
                                <Input id="site_name" defaultValue="Student Portal" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="support_email">Support Email</Label>
                                <Input id="support_email" defaultValue="support@university.edu" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Security & Access</CardTitle>
                            <CardDescription>Control system access and maintenance modes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Lock className="h-4 w-4" />
                                        <Label className="text-base">Maintenance Mode</Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Disable access for non-admin users
                                    </p>
                                </div>
                                <Switch />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        <Label className="text-base">Public Registration</Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Allow new users to register accounts
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between space-x-2">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        <Label className="text-base">Email Notifications</Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Enable system-wide email alerts
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end">
                        <Button onClick={handleSave} className="gap-2">
                            <Save className="h-4 w-4" />
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

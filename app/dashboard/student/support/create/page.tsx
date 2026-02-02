"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    supportTicketService,
    TicketCategory,
    TicketPriority,
} from "@/services/user/supportTicket.service";
import { toast } from "sonner";
import { MessageSquare, Send, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react";

const categories = [
    { label: "Account Issue", value: "account" },
    { label: "Technical Support", value: "technical" },
    { label: "Academic Inquiry", value: "academic" },
    { label: "Payment & Fees", value: "payment" },
    { label: "Library Support", value: "library" },
    { label: "General Inquiry", value: "general" },
    { label: "Other", value: "other" },
];

const priorities = [
    { label: "Low", value: "low" },
    { label: "Medium", value: "medium" },
    { label: "High", value: "high" },
    { label: "Urgent", value: "urgent" },
];

export default function CreateTicketPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        category: "general" as TicketCategory,
        priority: "medium" as TicketPriority,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.subject.trim() || !formData.description.trim()) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            const ticket = await supportTicketService.create(formData);
            toast.success(`Ticket #${ticket.ticketNumber} created successfully`);
            router.push("/dashboard/student/support");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to create ticket");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.back()}
                    className="rounded-full"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Create Support Ticket</h1>
                    <p className="text-slate-500 text-sm italic">Tell us what's on your mind, we're here to help.</p>
                </div>
            </div>

            <Card className="border-slate-200 shadow-lg overflow-hidden">
                <CardHeader className="bg-indigo-600 text-white p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/20">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">New Support Request</CardTitle>
                            <CardDescription className="text-indigo-100">
                                Please provide as much detail as possible so we can assist you better.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-sm font-semibold text-slate-700">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(v) => setFormData({ ...formData, category: v as TicketCategory })}
                                >
                                    <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-indigo-500">
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority" className="text-sm font-semibold text-slate-700">Priority Level</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(v) => setFormData({ ...formData, priority: v as TicketPriority })}
                                >
                                    <SelectTrigger className="bg-slate-50 border-slate-200 focus:ring-indigo-500">
                                        <SelectValue placeholder="Select Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorities.map((p) => (
                                            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-sm font-semibold text-slate-700">Subject</Label>
                            <Input
                                id="subject"
                                placeholder="E.g., Unable to access portal, Error in grade calculation..."
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="bg-slate-50 border-slate-200 focus:ring-indigo-500 h-11"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center mb-1">
                                <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Detailed Description</Label>
                                <span className={`text-[10px] uppercase font-bold ${formData.description.length < 20 ? 'text-amber-500' : 'text-slate-400'}`}>
                                    {formData.description.length < 20 ? 'Needs more detail' : 'Looks good'}
                                </span>
                            </div>
                            <Textarea
                                id="description"
                                placeholder="Describe your issue in detail. Include any steps taken or error messages received."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="min-h-[180px] bg-slate-50 border-slate-200 focus:ring-indigo-500 resize-none py-3"
                                required
                            />
                        </div>

                        <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex gap-3 text-amber-800 text-sm">
                            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
                            <p>
                                Tickets are typically reviewed within 24-48 hours. For urgent academic matters,
                                please visit the department office.
                            </p>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                className="px-6 border-slate-200 text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-indigo-600 hover:bg-indigo-700 px-8 h-11 transition-all shadow-md active:scale-95"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Submitting...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Send className="h-4 w-4" />
                                        Submit Ticket
                                    </div>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

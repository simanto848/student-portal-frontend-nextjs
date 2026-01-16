"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { libraryService } from "@/services/library/library.service";
import type {
  LibraryUpdatePayload,
  Library,
  LibraryStatus,
} from "@/services/library";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Building2, MapPin, Settings } from "lucide-react";

export default function EditLibraryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Library | null>(null);
  const [payload, setPayload] = useState<LibraryUpdatePayload>({});
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await libraryService.getById(id);
        setItem(res);
        setPayload({
          name: res.name,
          code: res.code,
          status: res.status,
          description: res.description,
          address: res.address,
          phone: res.phone,
          email: res.email,
          maxBorrowLimit: res.maxBorrowLimit,
          borrowDuration: res.borrowDuration,
          finePerDay: res.finePerDay,
          reservationHoldDays: res.reservationHoldDays,
        });
      } catch {
        toast.error("Failed to load library");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await libraryService.update(id, payload);
      toast.success("Library updated successfully");
      router.push(`/dashboard/staff/library/libraries/${id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update library");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <h2 className="text-xl font-semibold">Library Not Found</h2>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full hover:bg-teal-50 hover:text-teal-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Edit Library</h1>
            <p className="text-sm text-slate-500">Update library details and configuration</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <Card className="border-none shadow-sm border-l-4 border-l-teal-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <Building2 className="h-5 w-5 text-teal-600" />
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Library Name</Label>
                <Input
                  id="name"
                  className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  value={payload.name ?? ""}
                  onChange={(e) => setPayload({ ...payload, name: e.target.value })}
                  required
                  placeholder="e.g. Central Library"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Library Code</Label>
                <Input
                  id="code"
                  className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  value={payload.code ?? ""}
                  onChange={(e) => setPayload({ ...payload, code: e.target.value })}
                  required
                  placeholder="e.g. CLIB"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  className="border-slate-200 focus:border-teal-500 focus:ring-teal-500 h-24 resize-none"
                  value={payload.description ?? ""}
                  onChange={(e) => setPayload({ ...payload, description: e.target.value })}
                  placeholder="Brief description of the library..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={payload.status}
                  onValueChange={(value) =>
                    setPayload({ ...payload, status: value as LibraryStatus })
                  }
                >
                  <SelectTrigger className="border-slate-200 focus:border-teal-500 focus:ring-teal-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm border-l-4 border-l-cyan-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <MapPin className="h-5 w-5 text-cyan-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  value={payload.address ?? ""}
                  onChange={(e) => setPayload({ ...payload, address: e.target.value })}
                  placeholder="Full address..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  value={payload.phone ?? ""}
                  onChange={(e) => setPayload({ ...payload, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  value={payload.email ?? ""}
                  onChange={(e) => setPayload({ ...payload, email: e.target.value })}
                  placeholder="library@university.edu"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm border-l-4 border-l-sky-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                <Settings className="h-5 w-5 text-sky-600" />
                Rules & Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxBorrowLimit">Max Borrow Limit</Label>
                <Input
                  id="maxBorrowLimit"
                  type="number"
                  min="0"
                  className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  value={payload.maxBorrowLimit ?? 0}
                  onChange={(e) =>
                    setPayload({ ...payload, maxBorrowLimit: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-slate-500">Maximum books a user can borrow at once</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="borrowDuration">Borrow Duration (Days)</Label>
                <Input
                  id="borrowDuration"
                  type="number"
                  min="1"
                  className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  value={payload.borrowDuration ?? 0}
                  onChange={(e) =>
                    setPayload({ ...payload, borrowDuration: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-slate-500">Standard loan period in days</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="finePerDay">Fine Per Day ($)</Label>
                <Input
                  id="finePerDay"
                  type="number"
                  min="0"
                  step="0.01"
                  className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  value={payload.finePerDay ?? 0}
                  onChange={(e) =>
                    setPayload({ ...payload, finePerDay: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-slate-500">Late fee amount per day</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reservationHoldDays">Reservation Hold (Days)</Label>
                <Input
                  id="reservationHoldDays"
                  type="number"
                  min="1"
                  className="border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                  value={payload.reservationHoldDays ?? 0}
                  onChange={(e) =>
                    setPayload({ ...payload, reservationHoldDays: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-slate-500">Days to hold a reserved book</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 min-w-[150px] shadow-lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

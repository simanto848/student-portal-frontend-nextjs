"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { libraryService } from "@/services/library/library.service";
import type { LibraryUpdatePayload, Library } from "@/services/library";
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
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

export default function EditLibraryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Library | null>(null);
  const [payload, setPayload] = useState<LibraryUpdatePayload>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

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
          maxBorrowLimit: res.maxBorrowLimit,
          borrowDuration: res.borrowDuration,
          finePerDay: res.finePerDay,
          reservationHoldDays: res.reservationHoldDays,
          address: res.address,
          phone: res.phone,
          email: res.email,
          operatingHours: res.operatingHours || {},
        });
      } catch {
        toast.error("Failed to load library");
      } finally {
        setLoading(false);
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
      router.push(`/dashboard/admin/library/libraries/${id}`);
    } catch {
      toast.error("Failed to update library");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <h2 className="text-xl font-semibold">Library not found</h2>
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/library/libraries">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Libraries
            </Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/admin/library/libraries/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Library</h1>
            <p className="text-muted-foreground">
              Update the details and settings for {item.name}
            </p>
          </div>
        </div>

        <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Library Information</CardTitle>
            <CardDescription>
              Configure the basic information and rules for this library.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Central Library"
                    value={payload.name ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, name: e.target.value })
                    }
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    placeholder="e.g. LIB-001"
                    value={payload.code ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, code: e.target.value })
                    }
                    required
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={payload.status}
                    onValueChange={(value: any) =>
                      setPayload({ ...payload, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBorrowLimit">Max Borrow Limit</Label>
                  <Input
                    id="maxBorrowLimit"
                    type="number"
                    min="0"
                    value={payload.maxBorrowLimit ?? 0}
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        maxBorrowLimit: Number(e.target.value),
                      })
                    }
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="borrowDuration">Borrow Duration (days)</Label>
                  <Input
                    id="borrowDuration"
                    type="number"
                    min="0"
                    value={payload.borrowDuration ?? 0}
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        borrowDuration: Number(e.target.value),
                      })
                    }
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="finePerDay">Fine Per Day</Label>
                  <Input
                    id="finePerDay"
                    type="number"
                    min="0"
                    step="0.01"
                    value={payload.finePerDay ?? 0}
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        finePerDay: Number(e.target.value),
                      })
                    }
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reservationHoldDays">Reservation Hold Days</Label>
                  <Input
                    id="reservationHoldDays"
                    type="number"
                    min="0"
                    value={payload.reservationHoldDays ?? 0}
                    onChange={(e) =>
                      setPayload({
                        ...payload,
                        reservationHoldDays: Number(e.target.value),
                      })
                    }
                    className="bg-white"

                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    placeholder="e.g. 123 University Ave"
                    value={payload.address ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, address: e.target.value })
                    }
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="e.g. +1 234 567 890"
                    value={payload.phone ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, phone: e.target.value })
                    }
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. library@university.edu"
                    value={payload.email ?? ""}
                    onChange={(e) =>
                      setPayload({ ...payload, email: e.target.value })
                    }
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Operating Hours</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <div key={day} className="space-y-2">
                      <Label htmlFor={`hours-${day}`} className="text-xs text-muted-foreground">{day}</Label>
                      <Input
                        id={`hours-${day}`}
                        placeholder="e.g. 9:00 AM - 5:00 PM"
                        value={payload.operatingHours?.[day] ?? ""}
                        onChange={(e) =>
                          setPayload({
                            ...payload,
                            operatingHours: {
                              ...payload.operatingHours,
                              [day]: e.target.value,
                            },
                          })
                        }
                        className="bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter a brief description of the library..."
                  className="min-h-[100px] bg-white"
                  value={payload.description ?? ""}
                  onChange={(e) =>
                    setPayload({ ...payload, description: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={submitting} className="min-w-[150px]">
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

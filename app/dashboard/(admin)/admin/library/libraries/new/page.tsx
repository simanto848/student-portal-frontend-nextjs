"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { libraryService } from "@/services/library/library.service";
import type { LibraryCreatePayload } from "@/services/library";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import Link from "next/link";

export default function CreateLibraryPage() {
  const router = useRouter();
  const [payload, setPayload] = useState<LibraryCreatePayload>({
    name: "",
    code: "",
    status: "active",
    maxBorrowLimit: 3,
    borrowDuration: 14,
    finePerDay: 0,
    reservationHoldDays: 2,
    address: "",
    phone: "",
    email: "",
    operatingHours: {},
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await libraryService.create(payload);
      toast.success("Library created successfully");
      router.push(`/dashboard/admin/library/libraries/${created.id}`);
    } catch {
      toast.error("Failed to create library");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/admin/library/libraries">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create Library</h1>
            <p className="text-muted-foreground">
              Add a new library to the system
            </p>
          </div>
        </div>

        <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Library Details</CardTitle>
            <CardDescription>
              Enter the information for the new library.
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
                    value={payload.name}
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
                    value={payload.code}
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
                    <SelectTrigger className="bg-white">
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
                  className="bg-white"
                />
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
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Library
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout >
  );
}

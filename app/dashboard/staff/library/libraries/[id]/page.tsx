"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { libraryService } from "@/services/library/library.service";
import type { Library } from "@/services/library";
import Link from "next/link";
import { toast } from "sonner";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Clock,
  BookOpen,
  Calendar,
  AlertCircle,
  Edit,
  Trash2,
  ArrowLeft,
  Info,
  ShieldCheck,
  Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ViewLibraryPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<Library | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await libraryService.getById(id);
        setItem(res);
      } catch {
        toast.error("Failed to load library");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this library?")) return;
    setIsDeleting(true);
    try {
      await libraryService.delete(id);
      toast.success("Library deleted successfully");
      router.push("/dashboard/staff/library/libraries");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete library");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
          <AlertCircle className="h-12 w-12 text-rose-500" />
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
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800">{item.name}</h1>
                <Badge
                  variant={item.status === "active" ? "default" : "secondary"}
                  className={
                    item.status === "active"
                      ? "bg-teal-100 text-teal-700 hover:bg-teal-100"
                      : "bg-slate-100 text-slate-700"
                  }
                >
                  {item.status}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                <span className="font-mono bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-xs">
                  {item.code}
                </span>
                <span>•</span>
                <span>Created {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href={`/dashboard/staff/library/libraries/${id}/edit`}>
              <Button className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 gap-2 shadow-lg">
                <Edit className="h-4 w-4" />
                Edit Library
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Information */}
            <Card className="border-none shadow-sm border-l-4 border-l-teal-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <Info className="h-5 w-5 text-teal-600" />
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-1">Description</h3>
                  <p className="text-slate-700 leading-relaxed">
                    {item.description || "No description provided."}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-teal-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Address</h3>
                        <p className="text-sm text-slate-500">{item.address || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-teal-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Phone</h3>
                        <p className="text-sm text-slate-500">{item.phone || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-teal-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Email</h3>
                        <p className="text-sm text-slate-500">{item.email || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-teal-500 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">Last Updated</h3>
                        <p className="text-sm text-slate-500">
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card className="border-none shadow-sm border-l-4 border-l-cyan-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <Clock className="h-5 w-5 text-cyan-600" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                {item.operatingHours && Object.keys(item.operatingHours).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(item.operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="capitalize font-medium text-slate-700">{day}</span>
                        <span className="text-sm text-slate-600 font-mono bg-white px-2 py-1 rounded border">
                          {hours as string}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No operating hours configured.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Rules & Policies Column */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-gradient-to-br from-slate-50 to-teal-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <ShieldCheck className="h-5 w-5 text-teal-600" />
                  Rules & Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-cyan-50 rounded-lg text-cyan-600">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-slate-700">Borrow Limit</span>
                  </div>
                  <div className="pl-12">
                    <p className="text-2xl font-bold text-slate-900">{item.maxBorrowLimit}</p>
                    <p className="text-xs text-slate-500">Books per user</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-slate-700">Duration</span>
                  </div>
                  <div className="pl-12">
                    <p className="text-2xl font-bold text-slate-900">{item.borrowDuration}</p>
                    <p className="text-xs text-slate-500">Days per borrow</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                      <Banknote className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-slate-700">Late Fine</span>
                  </div>
                  <div className="pl-12">
                    <p className="text-2xl font-bold text-slate-900">{item.finePerDay} TK</p>
                    <p className="text-xs text-slate-500">Per day overdue</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                      <Clock className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-slate-700">Reservation Hold</span>
                  </div>
                  <div className="pl-12">
                    <p className="text-2xl font-bold text-slate-900">{item.reservationHoldDays}</p>
                    <p className="text-xs text-slate-500">Days to pickup</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

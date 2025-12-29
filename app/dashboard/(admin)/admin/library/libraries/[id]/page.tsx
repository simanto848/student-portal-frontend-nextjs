"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Settings,
  Calendar,
  AlertCircle,
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle
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
    if (!id || id === 'new') return;
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
      router.push("/dashboard/admin/library/libraries");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete library");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4 mr-1" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 mr-1" />;
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4 mr-1" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
              <div className="h-48 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded-xl"></div>
              <div className="h-48 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Building2 className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Library Not Found</h2>
          <p className="text-gray-500 mt-2 mb-6">The library you are looking for does not exist or has been removed.</p>
          <Link href="/dashboard/admin/library/libraries">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Libraries
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link href="/dashboard/admin/library/libraries" className="hover:text-[#344e41] transition-colors">
                Libraries
              </Link>
              <span>/</span>
              <span>Details</span>
            </div>
            <h1 className="text-3xl font-bold text-[#344e41] flex items-center gap-3">
              {item.name}
              <Badge variant="outline" className="text-base font-normal py-1 px-3 border-[#344e41]/20 text-[#344e41] bg-[#344e41]/5">
                {item.code}
              </Badge>
            </h1>
            <div className="flex items-center gap-3">
              <Badge className={`${getStatusColor(item.status)} border px-3 py-1 flex items-center w-fit`}>
                {getStatusIcon(item.status)}
                <span className="capitalize">{item.status}</span>
              </Badge>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Created {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/dashboard/admin/library/libraries/${id}/edit`}>
              <Button className="bg-[#344e41] hover:bg-[#2a3f34] text-white">
                <Pencil className="w-4 h-4 mr-2" />
                Edit Library
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 shadow-none"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info Card */}
            <Card className="border-none shadow-md overflow-hidden">
              <div className="h-2 bg-[#344e41]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building2 className="w-5 h-5 text-[#344e41]" />
                  General Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {item.description || "No description provided."}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Address
                    </h3>
                    <p className="text-gray-900 font-medium">{item.address || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Phone
                    </h3>
                    <p className="text-gray-900 font-medium">{item.phone || "N/A"}</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </h3>
                    <p className="text-gray-900 font-medium">{item.email || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours Card */}
            <Card className="border-none shadow-md overflow-hidden">
              <div className="h-2 bg-[#a3b18a]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Clock className="w-5 h-5 text-[#344e41]" />
                  Operating Hours
                </CardTitle>
                <CardDescription>Standard opening and closing times</CardDescription>
              </CardHeader>
              <CardContent>
                {item.operatingHours && Object.keys(item.operatingHours).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(item.operatingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <span className="capitalize font-medium text-gray-700">{day}</span>
                        <span className="text-sm text-[#344e41] font-semibold bg-[#344e41]/10 px-2 py-1 rounded">
                          {hours}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p>No operating hours configured</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-8">
            {/* Settings Card */}
            <Card className="border-none shadow-md overflow-hidden">
              <div className="h-2 bg-[#588157]" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Settings className="w-5 h-5 text-[#344e41]" />
                  Configuration
                </CardTitle>
                <CardDescription>Rules and limits for this library</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full shadow-sm text-[#344e41]">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Max Borrow Limit</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{item.maxBorrowLimit}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full shadow-sm text-[#344e41]">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Borrow Duration</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{item.borrowDuration} <span className="text-xs font-normal text-gray-500">days</span></span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full shadow-sm text-[#344e41]">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Fine Per Day</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">${item.finePerDay || 0}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full shadow-sm text-[#344e41]">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-600">Reservation Hold</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{item.reservationHoldDays || 0} <span className="text-xs font-normal text-gray-500">days</span></span>
                </div>
              </CardContent>
            </Card>

            {/* Metadata Card */}
            <Card className="border-none shadow-sm bg-gray-50/50">
              <CardContent className="pt-6 space-y-3 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Library ID:</span>
                  <span className="font-mono">{item.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span>{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

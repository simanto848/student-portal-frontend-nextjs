"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PageHeader } from "@/components/dashboard/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { staffService, Staff, StaffRole } from "@/services/user/staff.service";
import {
  staffProfileService,
  StaffProfile,
} from "@/services/user/staffProfile.service";
import { departmentService } from "@/services/academic/department.service";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Network,
  User as UserIcon,
  Trash2,
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";

const roleLabel: Record<StaffRole, string> = {
  program_controller: "Program Controller",
  admission: "Admission",
  library: "Library",
  it: "IT",
};

export default function StaffDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [staff, setStaff] = useState<Staff | null>(null);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [departments, setDepartments] = useState<
    Array<{ id?: string; _id?: string; name: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ipInput, setIpInput] = useState("");
  const [isIpUpdating, setIsIpUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const s = await staffService.getById(id);
      setStaff(s);
      try {
        const p = await staffProfileService.get(id);
        setProfile(p);
      } catch {
        setProfile(null);
      }
      try {
        const d = await departmentService.getAllDepartments();
        setDepartments(Array.isArray(d) ? d : []);
      } catch { }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load staff"
      );
      router.push("/dashboard/admin/users/staff");
    } finally {
      setIsLoading(false);
    }
  };

  const addIp = async () => {
    if (!staff || !ipInput.trim()) {
      toast.error("Enter an IP");
      return;
    }
    setIsIpUpdating(true);
    try {
      const updated = await staffService.addRegisteredIp(
        staff.id,
        ipInput.trim()
      );
      setStaff(updated);
      setIpInput("");
      toast.success("IP added");
    } catch (e) {
      const error = e as Error;
      toast.error(error?.message || "Failed to add IP");
    } finally {
      setIsIpUpdating(false);
    }
  };
  const removeIp = async (ip: string) => {
    if (!staff) return;
    setIsIpUpdating(true);
    try {
      const updated = await staffService.removeRegisteredIp(staff.id, ip);
      setStaff(updated);
      toast.success("IP removed");
    } catch (e) {
      const error = e as Error;
      toast.error(error?.message || "Failed to remove IP");
    } finally {
      setIsIpUpdating(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!staff) return;
    if (!confirm(`Delete ${staff.fullName}?`)) return;
    setIsDeleting(true);
    try {
      await staffService.delete(staff.id);
      toast.success("Staff deleted");
      router.push("/dashboard/admin/users/staff");
    } catch (e) {
      const error = e as Error;
      toast.error(error?.message || "Failed to delete staff");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#588157]" />
        </div>
      </DashboardLayout>
    );
  }

  if (!staff) return null;
  const departmentName =
    departments.find((d) => (d.id || d._id) === staff.departmentId)?.name ||
    staff.department?.name ||
    staff.departmentId;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-[#dad7cd] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#344e41]" />
          </button>
          <PageHeader
            title={staff.fullName}
            subtitle="Staff profile overview"
            icon={Users}
            actionLabel="Edit"
            onAction={() =>
              router.push(`/dashboard/admin/users/staff/${staff.id}/edit`)
            }
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteStaff}
            disabled={isDeleting}
            className="ml-auto border-red-500 text-red-600"
          >
            {isDeleting ? (
              "Deleting..."
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 border-[#a3b18a]/30">
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={Mail} label="Email" value={staff.email} />
                <InfoRow
                  icon={MapPin}
                  label="Registration"
                  value={staff.registrationNumber}
                />
                <InfoRow
                  icon={Users}
                  label="Role"
                  value={staff.role ? roleLabel[staff.role] : "Not set"}
                />
                <InfoRow
                  icon={Calendar}
                  label="Joining Date"
                  value={
                    staff.joiningDate
                      ? new Date(staff.joiningDate).toLocaleDateString()
                      : "Not set"
                  }
                />
                <InfoRow
                  icon={Network}
                  label="Department"
                  value={departmentName}
                />
                <InfoRow
                  icon={Phone}
                  label="Phone"
                  value={profile?.phoneNumber || "Not provided"}
                />
              </div>

              {profile && (
                <div className="bg-gradient-to-br from-[#dad7cd]/60 to-[#a3b18a]/20 rounded-lg p-5 space-y-4 border border-[#a3b18a]/20">
                  <div className="flex items-center justify-between pb-3 border-b border-[#a3b18a]/30">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-[#588157]/20 border-2 border-[#588157] overflow-hidden flex items-center justify-center flex-shrink-0">
                        {profile?.profilePicture ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getImageUrl(profile.profilePicture)}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-8 w-8 text-[#588157]" />
                        )}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-[#344e41]">
                          Profile Information
                        </p>
                        <p className="text-xs text-[#344e41]/60">
                          Extended personal details
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-[#588157] text-white">Complete</Badge>
                  </div>
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ProfileField
                        label="First Name"
                        value={profile.firstName}
                      />
                      <ProfileField
                        label="Last Name"
                        value={profile.lastName}
                      />
                      {profile.middleName && (
                        <ProfileField
                          label="Middle Name"
                          value={profile.middleName}
                        />
                      )}
                      <ProfileField
                        label="Full Name"
                        value={`${profile.firstName} ${profile.middleName ? profile.middleName + " " : ""
                          }${profile.lastName}`}
                        highlighted
                      />
                    </div>
                    {(profile.dateOfBirth || profile.gender) && (
                      <div className="grid gap-3 sm:grid-cols-2 pt-3 border-t border-[#a3b18a]/20">
                        {profile.dateOfBirth && (
                          <ProfileField
                            label="Date of Birth"
                            value={new Date(
                              profile.dateOfBirth
                            ).toLocaleDateString()}
                          />
                        )}
                        {profile.dateOfBirth && (
                          <ProfileField
                            label="Age"
                            value={`${Math.floor(
                              (Date.now() -
                                new Date(profile.dateOfBirth).getTime()) /
                              (365.25 * 24 * 60 * 60 * 1000)
                            )} years`}
                          />
                        )}
                        {profile.gender && (
                          <ProfileField label="Gender" value={profile.gender} />
                        )}
                      </div>
                    )}
                    {profile.phoneNumber && (
                      <div className="pt-3 border-t border-[#a3b18a]/20">
                        <ProfileField
                          label="Phone Number"
                          value={profile.phoneNumber}
                          icon={Phone}
                        />
                      </div>
                    )}
                    {profile.addresses && profile.addresses.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-[#a3b18a]/20">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#344e41]/70">
                          Addresses
                        </p>
                        <div className="space-y-2">
                          {profile.addresses.map((addr, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg bg-white/70 border border-[#a3b18a]/30"
                            >
                              <p className="text-sm font-medium text-[#344e41]">
                                {[addr.street, addr.city, addr.state]
                                  .filter(Boolean)
                                  .join(", ") || "(No street)"}
                              </p>
                              <p className="text-xs text-[#344e41]/70">
                                {[addr.country, addr.zipCode]
                                  .filter(Boolean)
                                  .join(" - ") || "(No country)"}{" "}
                                {addr.isPrimary && (
                                  <span className="ml-2 inline-block px-2 py-0.5 text-[10px] rounded bg-[#588157] text-white">
                                    PRIMARY
                                  </span>
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!profile && (
                <div className="bg-[#dad7cd]/60 rounded-lg p-5 border border-[#a3b18a]/20">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#344e41]/10">
                      <UserIcon className="h-5 w-5 text-[#344e41]/60" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#344e41] mb-1">
                        No Profile Information
                      </p>
                      <p className="text-xs text-[#344e41]/60 mb-3">
                        This staff member doesn&apos;t have an extended profile
                        yet.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#588157] text-[#588157] hover:bg-[#588157] hover:text-white"
                        onClick={() =>
                          router.push(
                            `/dashboard/admin/users/staff/${staff.id}/edit`
                          )
                        }
                      >
                        <UserIcon className="h-3 w-3 mr-1" /> Add Profile
                        Information
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#a3b18a]/30">
            <CardContent className="p-6 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#344e41]/70">
                Registered IP Addresses
              </p>
              <div className="flex gap-2">
                <Input
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  placeholder="Add IP"
                  className="bg-white border-[#a3b18a]/60 text-[#344e41]"
                />
                <Button
                  onClick={addIp}
                  disabled={isIpUpdating}
                  className="bg-[#588157] text-white"
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {staff.registeredIpAddress &&
                  staff.registeredIpAddress.length > 0 ? (
                  staff.registeredIpAddress.map((ip) => (
                    <Badge
                      key={ip}
                      className="bg-[#588157] text-white flex items-center gap-1"
                    >
                      {ip}
                      <button
                        type="button"
                        onClick={() => removeIp(ip)}
                        className="ml-1 text-white/80 hover:text-white"
                      >
                        ×
                      </button>
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-[#344e41]/60">No IPs registered</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-[#344e41]/50">
        {label}
      </p>
      <div className="flex items-center gap-2 text-sm text-[#344e41]">
        <Icon className="h-4 w-4 text-[#344e41]/60" />
        <span>{value}</span>
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  highlighted,
  icon: Icon,
  mono,
}: {
  label: string;
  value: string;
  highlighted?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  mono?: boolean;
}) {
  return (
    <div
      className={`text-sm ${highlighted ? "font-semibold text-[#344e41]" : "text-[#344e41]/80"
        } ${mono ? "font-mono" : ""} flex items-center gap-2`}
    >
      {Icon && <Icon className="h-4 w-4 text-[#344e41]/60" />}
      <span className="text-[#344e41]/60 font-medium mr-1">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

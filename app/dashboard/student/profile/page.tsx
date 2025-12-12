"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Award,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { studentService } from "@/services/user/student.service";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentProfilePage() {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const studentId = user.id || user._id;

      // Fetch student details and profile
      const [student, profile] = await Promise.all([
        studentService.getById(studentId),
        studentService.getProfile(studentId).catch(() => null), // Profile might not exist
      ]);

      setStudentData(student);
      setProfileData(profile);
    } catch (err: any) {
      console.error("Failed to fetch profile", err);
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-[200px] w-full rounded-3xl" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-[400px] w-full lg:col-span-2" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const student = studentData || user;
  const profile = profileData;

  // Extract program/batch info
  const program =
    typeof student.programId === "object" ? student.programId : null;
  const batch = typeof student.batchId === "object" ? student.batchId : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-3xl bg-linear-to-r from-[#0b3b2a] via-[#1f5a44] to-[#3e6253] text-white p-6 md:p-8 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.08),_transparent_40%)]" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                {student.profilePicture ? (
                  <img
                    src={student.profilePicture}
                    alt="Profile"
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-white" />
                )}
              </div>
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">
                  {student.fullName || "Student"}
                </h1>
                <p className="text-white/80 text-sm">
                  {student.studentId || student.email}
                </p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white hover:bg-white/30">
                    {student.enrollmentStatus || "Active"}
                  </Badge>
                  {program && (
                    <Badge
                      variant="outline"
                      className="border-white/40 text-white"
                    >
                      {program.name || program.code}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                size="sm"
                className="bg-white text-[#1a3d32] hover:bg-white/90 shadow-md"
                onClick={() =>
                  window.alert("Edit profile functionality - Coming soon")
                }
              >
                Edit Profile
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-none shadow-sm lg:col-span-2 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                <User className="h-4 w-4 text-[#3e6253]" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Full Name
                  </p>
                  <p className="text-sm font-semibold text-[#1a3d32]">
                    {student.fullName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Student ID
                  </p>
                  <p className="text-sm font-semibold text-[#1a3d32]">
                    {student.studentId || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </p>
                  <p className="text-sm font-semibold text-[#1a3d32]">
                    {student.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone
                  </p>
                  <p className="text-sm font-semibold text-[#1a3d32]">
                    {student.phone || profile?.contactNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Date of Birth
                  </p>
                  <p className="text-sm font-semibold text-[#1a3d32]">
                    {student.dateOfBirth
                      ? new Date(student.dateOfBirth).toLocaleDateString()
                      : profile?.dateOfBirth
                      ? new Date(profile.dateOfBirth).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Gender
                  </p>
                  <p className="text-sm font-semibold text-[#1a3d32]">
                    {student.gender || profile?.gender || "N/A"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Address
                  </p>
                  <p className="text-sm font-semibold text-[#1a3d32]">
                    {profile?.address || student.address || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#3e6253]" /> Academic Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Program
                </p>
                <p className="text-sm font-semibold text-[#1a3d32]">
                  {program?.name || program?.code || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Batch</p>
                <p className="text-sm font-semibold text-[#1a3d32]">
                  {batch?.name || batch?.batchCode || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Current Semester
                </p>
                <p className="text-sm font-semibold text-[#1a3d32]">
                  {batch?.currentSemester || student.currentSemester || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Admission Date
                </p>
                <p className="text-sm font-semibold text-[#1a3d32]">
                  {student.admissionDate
                    ? new Date(student.admissionDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Status
                </p>
                <Badge
                  className={
                    student.enrollmentStatus === "enrolled"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {student.enrollmentStatus || "Unknown"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {profile?.previousEducation && profile.previousEducation.length > 0 && (
          <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                <Award className="h-4 w-4 text-[#3e6253]" /> Education History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.previousEducation.map((edu: any, idx: number) => (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-100 p-4 hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1a3d32]">
                        {edu.institutionName || "Unknown Institution"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {edu.degree || "N/A"} • {edu.fieldOfStudy || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {edu.startYear || "N/A"} - {edu.endYear || "Present"}
                      </p>
                      {edu.grade && (
                        <p className="text-xs text-[#3e6253] font-semibold mt-1">
                          Grade: {edu.grade}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {profile?.emergencyContact && (
          <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-[#1a3d32] flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#3e6253]" /> Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Name
                  </p>
                  <p className="text-sm font-semibold text-[#1a3d32]">
                    {profile.emergencyContact.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Relationship
                  </p>
                  <p className="text-sm font-semibold text-[#1a3d32]">
                    {profile.emergencyContact.relationship || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Phone
                  </p>
                  <p className="text-sm font-semibold text-[#1a3d32]">
                    {profile.emergencyContact.phone || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

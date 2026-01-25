"use client";

import { User, isStudentUser } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassCard } from "@/components/dashboard/shared/GlassCard";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";
import { motion } from "framer-motion";
import { User as UserIcon, Mail, Phone, MapPin, GraduationCap, Building, Calendar, Camera } from "lucide-react";
import { cn, getImageUrl } from "@/lib/utils";

interface ProfileTabProps {
  user: User | null;
  refreshUser: () => Promise<void>;
}

export function ProfileTab({ user }: ProfileTabProps) {
  const theme = useDashboardTheme();

  const getNameParts = (fullName: string = "") => {
    const parts = fullName.split(" ");
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(" "),
    };
  };

  const { firstName, lastName } = getNameParts(user?.fullName);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Header Card */}
        <motion.div variants={itemVariants} className="md:col-span-1">
          <GlassCard className="p-8 h-full flex flex-col items-center text-center justify-center space-y-6">
            <div className="relative group cursor-pointer">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 opacity-20 group-hover:opacity-40 transition-opacity blur-md" />
              <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-700 shadow-xl ring-1 ring-slate-100 dark:ring-slate-600 relative overflow-hidden">
                <AvatarImage src={getImageUrl((user as any)?.profile?.profilePicture || user?.profileImage)} alt={user?.fullName} className="object-cover" />
                <AvatarFallback className="text-3xl font-black bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-300">
                  {getInitials(user?.fullName || "User")}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{user.fullName}</h3>
              <p className="text-sm font-bold text-[#0d9488] uppercase tracking-widest mt-1">{user.role}</p>
              <div className="flex items-center justify-center gap-1.5 mt-3 text-slate-400 dark:text-slate-500 font-medium text-xs">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Personal Information */}
        <motion.div variants={itemVariants} className="md:col-span-2">
          <GlassCard className="p-8 h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-[#2dd4bf]/10 ring-1 ring-[#2dd4bf]/20">
                <UserIcon className="h-5 w-5 text-[#2dd4bf]" />
              </div>
              <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Personal Information</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">First Name</Label>
                <Input
                  value={firstName}
                  disabled
                  className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Last Name</Label>
                <Input
                  value={lastName}
                  disabled
                  className="h-12 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-500" />
                  <Input
                    value={user.phone || ""}
                    disabled
                    className="h-12 pl-11 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200"
                    placeholder="No phone provided"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mailing Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-500" />
                  <Input
                    value={isStudentUser(user) && user.address?.present ? user.address.present : ""}
                    disabled
                    className="h-12 pl-11 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200"
                    placeholder="No address provided"
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Academic Information (If Student) */}
      {isStudentUser(user) && (
        <motion.div variants={itemVariants}>
          <GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-blue-50 ring-1 ring-blue-200/50">
                <GraduationCap className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">Academic Profile</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student ID</Label>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-sm font-black text-slate-700">{user.registrationNumber}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</Label>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  <p className="text-sm font-black text-slate-700">{user.departmentId}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Degree Program</Label>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-sm font-black text-slate-700">{user.programId}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Enrollment Year</Label>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <p className="text-sm font-black text-slate-700">
                    {user.admissionDate ? new Date(user.admissionDate).getFullYear() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </motion.div>
  );
}

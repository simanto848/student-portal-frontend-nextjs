"use client";

import { User, isStudentUser } from "@/types/user";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileTabProps {
  user: User | null;
  refreshUser: () => Promise<void>;
}

export function ProfileTab({ user }: ProfileTabProps) {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>Your profile photo</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-border">
            <AvatarImage src={user?.profileImage} alt={user?.fullName} />
            <AvatarFallback className="text-lg">
              {getInitials(user?.fullName || "User")}
            </AvatarFallback>
          </Avatar>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={user.phone || ""}
                disabled
                className="bg-muted"
                placeholder="Not provided"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={
                isStudentUser(user) && user.address?.present
                  ? user.address.present
                  : ""
              }
              disabled
              className="bg-muted"
              placeholder="Not provided"
            />
          </div>
        </CardContent>
      </Card>

      {isStudentUser(user) && (
        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
            <CardDescription>Your academic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Student ID</Label>
                <Input
                  value={user.registrationNumber}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={user.departmentId}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Program</Label>
                <Input value={user.programId} disabled className="bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Enrollment Year</Label>
                <Input
                  value={
                    user.admissionDate
                      ? new Date(user.admissionDate).getFullYear().toString()
                      : ""
                  }
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

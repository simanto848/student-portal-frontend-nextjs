"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, X } from "lucide-react";
import { studentService } from "@/services/user/student.service";
import { useAuth } from "@/contexts/AuthContext";

interface EditStudentProfileDialogProps {
    student: any;
    profile: any;
    onProfileUpdated: () => void;
    trigger?: React.ReactNode;
}

export function EditStudentProfileDialog({
    student,
    profile,
    onProfileUpdated,
    trigger,
}: EditStudentProfileDialogProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        profile?.profilePicture || null
    );

    const [formData, setFormData] = useState({
        fullName: student?.fullName || "",
        studentMobile: profile?.studentMobile || "",
        personalEmail: profile?.personalEmail || "",
        gender: profile?.gender || "",
        bloodGroup: profile?.bloodGroup || "",
        dateOfBirth: profile?.dateOfBirth
            ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
            : "",
        permanentAddress: {
            street: profile?.permanentAddress?.street || "",
            city: profile?.permanentAddress?.city || "",
            country: profile?.permanentAddress?.country || "Bangladeshi",
        },
        emergencyContact: {
            name: profile?.emergencyContact?.name || "",
            cell: profile?.emergencyContact?.cell || "",
            relation: profile?.emergencyContact?.relation || "",
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            setLoading(true);
            const data = new FormData();

            // Append generic profile data
            data.append(
                "data",
                JSON.stringify({
                    fullName: formData.fullName,
                    profile: {
                        studentMobile: formData.studentMobile,
                        personalEmail: formData.personalEmail,
                        gender: formData.gender,
                        bloodGroup: formData.bloodGroup,
                        dateOfBirth: formData.dateOfBirth,
                        permanentAddress: formData.permanentAddress,
                        emergencyContact: formData.emergencyContact,
                    },
                })
            );

            if (selectedFile) {
                data.append("profilePicture", selectedFile);
            }


            const studentId = user.id || user._id;
            if (!studentId) {
                throw new Error("User ID is missing");
            }
            await studentService.update(studentId, data);

            onProfileUpdated();
            setOpen(false);
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm" className="bg-white text-[#1a3d32] shadow-md">
                        Edit Profile
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-slate-200">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <Upload size={24} />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Label
                                htmlFor="picture"
                                className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-md transition-colors text-sm font-medium"
                            >
                                Change Photo
                            </Label>
                            <Input
                                id="picture"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            {selectedFile && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setPreviewUrl(profile?.profilePicture || null);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input
                                value={formData.fullName}
                                onChange={(e) =>
                                    setFormData({ ...formData, fullName: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Mobile Number</Label>
                            <Input
                                value={formData.studentMobile}
                                onChange={(e) =>
                                    setFormData({ ...formData, studentMobile: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Personal Email</Label>
                            <Input
                                value={formData.personalEmail}
                                onChange={(e) =>
                                    setFormData({ ...formData, personalEmail: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <Input
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={(e) =>
                                    setFormData({ ...formData, dateOfBirth: e.target.value })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(val) =>
                                    setFormData({ ...formData, gender: val })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Blood Group</Label>
                            <Select
                                value={formData.bloodGroup}
                                onValueChange={(val) =>
                                    setFormData({ ...formData, bloodGroup: val })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select blood group" />
                                </SelectTrigger>
                                <SelectContent>
                                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm text-slate-900 border-b pb-1">Address</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Street</Label>
                                <Input
                                    value={formData.permanentAddress.street}
                                    onChange={e => setFormData({
                                        ...formData,
                                        permanentAddress: { ...formData.permanentAddress, street: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>City</Label>
                                <Input
                                    value={formData.permanentAddress.city}
                                    onChange={e => setFormData({
                                        ...formData,
                                        permanentAddress: { ...formData.permanentAddress, city: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-3">
                        <h4 className="font-medium text-sm text-slate-900 border-b pb-1">Emergency Contact</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={formData.emergencyContact.name}
                                    onChange={e => setFormData({
                                        ...formData,
                                        emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={formData.emergencyContact.cell}
                                    onChange={e => setFormData({
                                        ...formData,
                                        emergencyContact: { ...formData.emergencyContact, cell: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Relationship</Label>
                                <Input
                                    value={formData.emergencyContact.relation}
                                    onChange={e => setFormData({
                                        ...formData,
                                        emergencyContact: { ...formData.emergencyContact, relation: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

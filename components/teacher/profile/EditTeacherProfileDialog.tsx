"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Loader2,
    Upload,
    X,
    User,
    Phone,
    MapPin,
    Briefcase,
    Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { teacherService } from "@/services/user/teacher.service";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface EditTeacherProfileDialogProps {
    teacher: any;
    profile: any;
    open: boolean;
    setOpen: (open: boolean) => void;
    onProfileUpdated: () => void;
}

export function EditTeacherProfileDialog({
    teacher,
    profile,
    open,
    setOpen,
    onProfileUpdated,
}: EditTeacherProfileDialogProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        profile?.profilePicture ? `http://localhost:5000/${profile.profilePicture}` : null
    );

    // Form states
    const [fullName, setFullName] = useState(teacher?.fullName || "");
    const [phone, setPhone] = useState(teacher?.phone || "");
    const [address, setAddress] = useState(profile?.address || "");
    const [bio, setBio] = useState(profile?.bio || "");
    const [designation, setDesignation] = useState(teacher?.designation || "");

    // Read-only fields
    const departmentName = teacher?.department?.name || "N/A";
    const joiningDate = teacher?.joiningDate ? new Date(teacher.joiningDate).toLocaleDateString() : "N/A";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("fullName", fullName);
            formData.append("phone", phone);

            // For profile nested object, we need to handle it carefully.
            // The backend transformBody middleware handles file and body parsing.
            // We'll append profile data as a stringified object if needed, or flat fields if the backend supports it.
            // Based on student profile implementation, it likely expects structured data.
            // However, `teacherService.update` takes a payload. If we send FormData, fields are sent as parts.

            // Backend `teacherController.update` uses `teacherService.update`.
            // User `transformBody` middleware:
            // if (req.file) ...
            // if (req.body.profile) req.body.profile.profilePicture = filePath;

            // So we should structure the JSON data within FormData if possible, or send individual fields 
            // and ensure the backend can reconstruct them. 
            // A common pattern with Multer + complex body is sending a 'data' field with JSON string,
            // OR sending flattened fields like 'profile[address]'.

            // Let's try flattened fields for profile properties as they are often handled by body-parser/multer extended mode.
            formData.append("profile[address]", address);
            formData.append("profile[bio]", bio);

            // Designation update might need specific permission, but let's include it if editable
            formData.append("designation", designation);

            if (selectedFile) {
                formData.append("profilePicture", selectedFile);
            }

            const teacherId = user?.id || user?._id;
            if (!teacherId) throw new Error("Teacher ID not found");

            await teacherService.update(teacherId, formData);

            toast.success("Profile updated successfully");
            onProfileUpdated();
            setOpen(false);
        } catch (error: any) {
            console.error("Failed to update profile", error);
            toast.error(error.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-[#1a3d32] flex items-center gap-2">
                        <User className="h-5 w-5" /> Edit Profile
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Profile Picture */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm group">
                            {previewUrl ? (
                                <img
                                    src={previewUrl}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-gray-50 flex items-center justify-center text-gray-400">
                                    <User className="h-10 w-10" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <label htmlFor="picture-upload" className="cursor-pointer text-white text-xs font-medium flex flex-col items-center">
                                    <Upload className="h-4 w-4 mb-1" />
                                    Change
                                </label>
                            </div>
                            <input
                                id="picture-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">Profile Photo</p>
                            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="pl-9"
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="pl-9"
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="pl-9"
                                    placeholder="Full address"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="bio">Bio / Professional Summary</Label>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Brief professional summary..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="designation">Designation</Label>
                            <div className="relative">
                                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                                <Select value={designation} onValueChange={setDesignation}>
                                    <SelectTrigger className="pl-9">
                                        <SelectValue placeholder="Select Designation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lecturer">Lecturer</SelectItem>
                                        <SelectItem value="senior_lecturer">Senior Lecturer</SelectItem>
                                        <SelectItem value="assistant_professor">Assistant Professor</SelectItem>
                                        <SelectItem value="associate_professor">Associate Professor</SelectItem>
                                        <SelectItem value="professor">Professor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Department (Read-only)</Label>
                            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 text-muted-foreground items-center">
                                {departmentName}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Joining Date (Read-only)</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <div className="flex h-10 w-full rounded-md border border-input bg-muted pl-9 pr-3 py-2 text-sm text-muted-foreground items-center">
                                    {joiningDate}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-[#1a3d32] hover:bg-[#2d5246] text-white">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

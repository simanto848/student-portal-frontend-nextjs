import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, UserMinus, UserCheck } from "lucide-react";
import { Batch } from "@/services/academic/types";
import { batchService } from "@/services/academic/batch.service";
import { enrollmentService } from "@/services/enrollment/enrollment.service"; // You might need this to get students of a batch
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// We need a way to get students of a batch. 
// Assuming enrollmentService has a way or we need to add it.
// For now, let's assume we can fetch enrollments for the batch.

interface CRManagementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    batch: Batch | null;
    onSuccess: () => void;
}

export function CRManagementDialog({ open, onOpenChange, batch, onSuccess }: CRManagementDialogProps) {
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<any[]>([]); // Enrollments/Students
    const [search, setSearch] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open && batch) {
            fetchStudents();
        }
    }, [open, batch]);

    const fetchStudents = async () => {
        if (!batch) return;
        setLoading(true);
        try {
            const data = await enrollmentService.listEnrollments({
                batchId: batch.id,
                semester: batch.currentSemester,
                status: 'active',
                limit: 1000
            });

            const enrollments = (data as any).enrollments || [];

            const uniqueStudentsMap = new Map();
            enrollments.forEach((enrollment: any) => {
                if (enrollment.studentId && !uniqueStudentsMap.has(enrollment.studentId)) {
                    uniqueStudentsMap.set(enrollment.studentId, enrollment);
                }
            });

            setStudents(Array.from(uniqueStudentsMap.values()));
        } catch (error) {
            console.error("Fetch students error:", error);
            toast.error("Failed to load students");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (studentId: string) => {
        if (!batch) return;
        setProcessing(true);
        try {
            await batchService.assignClassRepresentative(batch.id, studentId);
            toast.success("Class Representative assigned successfully");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Assign CR error:", error);
            toast.error("Failed to assign Class Representative");
        } finally {
            setProcessing(false);
        }
    };

    const handleRemove = async () => {
        if (!batch) return;
        setProcessing(true);
        try {
            await batchService.removeClassRepresentative(batch.id);
            toast.success("Class Representative removed successfully");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Remove CR error:", error);
            toast.error("Failed to remove Class Representative");
        } finally {
            setProcessing(false);
        }
    };

    const filteredStudents = students.filter(s =>
    (s.student?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        s.student?.registrationNumber?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage Class Representative</DialogTitle>
                    <DialogDescription>
                        Assign or remove the CR for batch <strong>{batch?.name}</strong>.
                    </DialogDescription>
                </DialogHeader>

                {batch?.classRepresentativeId && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-800">Current CR</p>
                            <p className="text-lg font-bold text-amber-900">{(batch.classRepresentativeId as any).fullName}</p>
                            <p className="text-xs text-amber-700">{(batch.classRepresentativeId as any).registrationNumber}</p>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleRemove}
                            disabled={processing}
                        >
                            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4 mr-2" />}
                            Remove
                        </Button>
                    </div>
                )}

                <div className="relative mb-4">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search student by name or ID..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="text-sm font-medium text-muted-foreground mb-2">Select a student to assign:</div>

                <ScrollArea className="h-[300px] border rounded-md">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredStudents.length > 0 ? (
                        <div className="p-2 space-y-1">
                            {filteredStudents.map((enrollment) => (
                                <div
                                    key={enrollment.studentId}
                                    className="flex items-center justify-between p-2 hover:bg-slate-100 rounded-md transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{enrollment.student?.fullName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium text-sm text-slate-900">{enrollment.student?.fullName}</p>
                                            <p className="text-xs text-muted-foreground">{enrollment.student?.registrationNumber}</p>
                                        </div>
                                    </div>
                                    {batch?.classRepresentativeId === enrollment.studentId ? (
                                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Current CR</Badge>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="opacity-0 group-hover:opacity-100 h-8"
                                            onClick={() => handleAssign(enrollment.studentId)}
                                            disabled={processing}
                                        >
                                            Assign
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            No students found.
                        </div>
                    )}
                </ScrollArea>

                <DialogFooter className="sm:justify-start">
                    <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

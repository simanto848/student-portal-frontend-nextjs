import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ExamCommittee } from "@/services/academic/types";
import { Label } from "@/components/ui/label";

interface ViewMemberModalProps {
  member: ExamCommittee | null;
  open: boolean;
  onClose: () => void;
}

export function ViewMemberModal({
  member,
  open,
  onClose,
}: ViewMemberModalProps) {
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Committee Member Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-muted-foreground">
              Teacher Name
            </Label>
            <div className="col-span-3 font-medium">
              {member.teacher?.fullName || "Unknown"}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-muted-foreground">Email</Label>
            <div className="col-span-3">{member.teacher?.email || "N/A"}</div>
          </div>
          {member.teacher?.registrationNumber && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-muted-foreground">Reg No</Label>
              <div className="col-span-3">
                {member.teacher.registrationNumber}
              </div>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-muted-foreground">
              Department
            </Label>
            <div className="col-span-3">{member.department?.name || "N/A"}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-muted-foreground">Shift</Label>
            <div className="col-span-3">
              <Badge variant="secondary" className="capitalize">
                {member.shift}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-muted-foreground">Batch</Label>
            <div className="col-span-3">
              {member.batch ? (
                member.batch.name
              ) : (
                <Badge variant="secondary">General</Badge>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-muted-foreground">Status</Label>
            <div className="col-span-3">
              <Badge variant={member.status ? "default" : "destructive"}>
                {member.status ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-muted-foreground">
              Member ID
            </Label>
            <div className="col-span-3 text-xs text-muted-foreground">
              {member.id}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { examCommitteeService } from "@/services/academic/exam-committee.service";
import { batchService } from "@/services/academic/batch.service";
import { ExamCommittee, Batch } from "@/services/academic/types";

const formSchema = z.object({
  shift: z.enum(["day", "evening"]),
  batchId: z.string().optional(),
  status: z.boolean(),
});

interface EditMemberModalProps {
  member: ExamCommittee | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditMemberModal({
  member,
  open,
  onClose,
  onSuccess,
}: EditMemberModalProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shift: "day",
      batchId: "null",
      status: true,
    },
  });

  useEffect(() => {
    if (open && member) {
      fetchBatches();
      form.reset({
        shift: (member.shift || "day") as any,
        batchId: member.batchId || "null",
        status: member.status,
      });
    }
  }, [open, member, form]);

  const fetchBatches = async () => {
    try {
      // Fetch ALL batches or filter by member's department if logic allows.
      // If member has deptId, better to fetch batches of that dept?
      // For now, fetching all (or assume pre-fetched in parent to save calls, but fetching here for isolation).
      // Optimization: Pass batches props from parent. But fetching here is safe.
      const response = await batchService.getAllBatches();
      // Filter batches by member's department if available
      const deptId =
        typeof member?.departmentId === "object"
          ? member.departmentId.id
          : member?.departmentId;
      const filtered = deptId
        ? response.filter(
            (b) =>
              (typeof b.departmentId === "object"
                ? b.departmentId.id
                : b.departmentId) === deptId
          )
        : response;
      setBatches(filtered);
    } catch (error) {
      console.error("Failed to load batches");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!member) return;
    setLoading(true);
    try {
      const payload = {
        shift: values.shift,
        batchId:
          values.batchId === "null" || !values.batchId
            ? "null"
            : values.batchId,
        status: values.status,
      };

      await examCommitteeService.updateMember(member.id, payload as any);
      toast.success("Member updated");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to update member");
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Committee Member</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Editing member:{" "}
              <span className="font-semibold">{member.teacher?.fullName}</span>
            </div>

            <FormField
              control={form.control}
              name="shift"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shift</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="batchId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batch</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "null"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="null">
                        General / All Batches
                      </SelectItem>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {field.value ? "Active" : "Inactive"}
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

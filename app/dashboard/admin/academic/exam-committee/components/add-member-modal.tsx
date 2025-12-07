import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { departmentService } from '@/services/academic/department.service';
import { batchService } from '@/services/academic/batch.service';
import { teacherService } from '@/services/teacher.service'; // Adjust path if needed
import { examCommitteeService } from '@/services/academic/exam-committee.service';
import { Department, Batch } from '@/services/academic/types';

const formSchema = z.object({
    departmentId: z.string().min(1, 'Department is required'),
    teacherId: z.string().min(1, 'Teacher is required'),
    batchId: z.string().optional(),
});

interface AddMemberModalProps {
    onSuccess: () => void;
}

export function AddMemberModal({ onSuccess }: AddMemberModalProps) {
    const [open, setOpen] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]); // Using any for now until Teacher type is confirmed
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            departmentId: '',
            teacherId: '',
            batchId: 'null', // Use string 'null' or empty for optional selectivity if needed, or just undefined
        },
    });

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);

    const fetchData = async () => {
        try {
            const [deptRes, batchRes, teacherRes] = await Promise.all([
                departmentService.getAllDepartments(),
                batchService.getAllBatches(),
                teacherService.getAllTeachers(),
            ]);
            setDepartments(deptRes);
            setBatches(batchRes);
            setTeachers(teacherRes);
        } catch (error) {
            console.error('Failed to fetch data', error);
            toast.error('Failed to load form data');
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setLoading(true);
        try {
            // Handle optional batchId
            const payload = {
                departmentId: values.departmentId,
                teacherId: values.teacherId,
                batchId: values.batchId === 'all' || !values.batchId ? undefined : values.batchId
            };

            await examCommitteeService.addMember(payload);
            toast.success('Member added to committee');
            setOpen(false);
            form.reset();
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || 'Failed to add member');
        } finally {
            setLoading(false);
        }
    };

    const selectedDept = form.watch('departmentId');
    const filteredBatches = selectedDept
        ? batches.filter(b => typeof b.departmentId === 'object' ? b.departmentId.id === selectedDept : b.departmentId === selectedDept)
        : batches;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Member
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Committee Member</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="departmentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id}>
                                                    {dept.name}
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
                            name="batchId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Batch (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select batch (Optional)" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                All Batches / General
                                            </SelectItem>
                                            {filteredBatches.map((batch) => (
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
                            name="teacherId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teacher</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select teacher" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {teachers.map((teacher) => (
                                                <SelectItem key={teacher.id || teacher._id} value={teacher.id || teacher._id}>
                                                    {teacher.fullName || teacher.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Member'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

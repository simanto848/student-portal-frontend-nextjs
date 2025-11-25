import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface ActionItem {
    id: string;
    request: string;
    requestor: string;
    date: string;
    status?: "pending" | "approved" | "denied";
}

interface ActionTableProps {
    items: ActionItem[];
    onApprove: (id: string) => void;
    onDeny: (id: string) => void;
}

export function ActionTable({ items, onApprove, onDeny }: ActionTableProps) {
    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Request</TableHead>
                        <TableHead>Requestor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.id}>
                            <TableCell className="font-medium">
                                {item.request}
                            </TableCell>
                            <TableCell>{item.requestor}</TableCell>
                            <TableCell>{item.date}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="bg-red-100 text-red-700 hover:bg-red-200 border-none shadow-none"
                                    onClick={() => onDeny(item.id)}
                                >
                                    Deny
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-none"
                                    onClick={() => onApprove(item.id)}
                                >
                                    Approve
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

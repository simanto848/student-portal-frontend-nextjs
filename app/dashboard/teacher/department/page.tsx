"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { batchService } from "@/services/academic/batch.service";
import { departmentService } from "@/services/academic/department.service";
import { useAuth } from "@/contexts/AuthContext";
import { Batch } from "@/services/academic/types";
import { Search, Plus, Eye, ArrowLeft, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DepartmentResultsView } from "./DepartmentResultsView";

export default function DepartmentBatchesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [department, setDepartment] = useState<any>(null);

  useEffect(() => {
    const deptId = (user as any)?.departmentId;
    if (deptId) {
      fetchData(deptId);
    }
  }, [user]);

  const fetchData = async (departmentId: string) => {
    setIsLoading(true);
    try {
      const [deptData, batchesData] = await Promise.all([
        departmentService.getDepartmentById(departmentId),
        batchService.getAllBatches({ departmentId: departmentId }),
      ]);

      setDepartment(deptData);
      setBatches(batchesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load department data");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBatches = batches.filter((batch) =>
    (
      batch.code ??
      (batch.shift
        ? `${batch.shift === "evening" ? "E" : "D"}-${batch.name}`
        : batch.name)
    )
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-[#344e41] hover:text-[#588157] hover:bg-[#588157]/10"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#344e41]">
              Department Batches
            </h1>
            <p className="text-[#344e41]/70">
              {department?.name || "Loading..."}
            </p>
          </div>
        </div>

        <Tabs defaultValue="batches" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="results">Results & Publishing</TabsTrigger>
          </TabsList>

          <TabsContent value="batches">
            <div className="bg-white rounded-xl shadow-sm border border-[#a3b18a]/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search batches..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Batch Name</TableHead>
                      <TableHead>Year</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Counselor</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : filteredBatches.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No batches found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredBatches.map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell className="font-medium">
                            {batch.code ??
                              (batch.shift
                                ? `${batch.shift === "evening" ? "E" : "D"}${batch.name
                                }`
                                : batch.name)}
                          </TableCell>
                          <TableCell>{batch.year}</TableCell>
                          <TableCell>
                            {batch.currentStudents}/{batch.maxStudents}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${batch.status
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                            >
                              {batch.status ? "Active" : "Inactive"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {(batch.counselorId as any)?.fullName || "Not Assigned"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                router.push(
                                  `/dashboard/teacher/department/batch/${batch.id}`
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results">
            <DepartmentResultsView />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

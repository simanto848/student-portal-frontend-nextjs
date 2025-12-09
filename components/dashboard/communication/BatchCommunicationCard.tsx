import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserCog, MessageSquare, GraduationCap } from "lucide-react";
import { Batch } from "@/services/academic/types";

interface BatchCommunicationCardProps {
    batch: Batch;
    onOpenChat: (batch: Batch) => void;
    onManageCR: (batch: Batch) => void;
    enteringChat: boolean;
}

export function BatchCommunicationCard({ batch, onOpenChat, onManageCR, enteringChat }: BatchCommunicationCardProps) {
    return (
        <Card className="flex flex-col border-none shadow-md hover:shadow-lg transition-shadow p-0">
            <CardHeader className="bg-[#f0f4f8] border-b py-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <GraduationCap className="h-4 w-4 text-[#1a3d32]" />
                            <span className="text-xs font-semibold text-[#1a3d32] uppercase tracking-wider">Counselling Batch</span>
                        </div>
                        <CardTitle className="text-lg font-bold text-[#1a3d32] line-clamp-1">
                            {batch.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{(batch.programId as any)?.name}</p>
                    </div>
                    <Badge variant="outline" className="bg-white text-xs">
                        {batch.currentSemester}th Sem
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{batch.currentStudents || 0} Students</span>
                    </div>
                    {batch.classRepresentativeId ? (
                        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-2 py-1.5 rounded-md border border-emerald-100">
                            <UserCog className="h-4 w-4" />
                            <span className="font-medium">CR: {(batch.classRepresentativeId as any).fullName || "Assigned"}</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 px-2 py-1.5 rounded-md border border-amber-100">
                            <UserCog className="h-4 w-4" />
                            <span className="italic">No CR Assigned</span>
                        </div>
                    )}
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="w-full border-slate-200 mb-4"
                        onClick={() => onManageCR(batch)}
                    >
                        Manage CR
                    </Button>
                    <Button
                        className="w-full bg-[#1a3d32] hover:bg-[#142e26] text-white"
                        onClick={() => onOpenChat(batch)}
                        disabled={enteringChat}
                    >
                        {enteringChat ? "..." : "Chat"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

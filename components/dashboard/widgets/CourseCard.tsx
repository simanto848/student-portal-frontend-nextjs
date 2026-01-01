import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface CourseCardProps {
    title: string;
    code?: string;
    batchName?: string;
    studentCount: number;
    progress: {
        current: number;
        total: number;
        label: string;
    };
    variant?: "teacher" | "student"; // Teacher sees grading progress, Student sees grade
}

export function CourseCard({ title, code, batchName, studentCount, progress, variant = "teacher" }: CourseCardProps) {
    const percentage = (progress.current / progress.total) * 100;

    return (
        <Card className="bg-[#e4e4dc] border-none shadow-sm"> {/* Beige background */}
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                        <CardTitle className="text-lg font-bold text-[#1a3d32] line-clamp-2">{title}</CardTitle>
                        {batchName && (
                            <p className="text-xs font-medium text-emerald-700">{batchName}</p>
                        )}
                    </div>
                    {code && (
                        <span className="text-xs font-mono bg-[#1a3d32]/10 text-[#1a3d32] px-2 py-1 rounded shrink-0">
                            {code}
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-600">{studentCount} Students</p>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="flex justify-between text-sm mb-2 font-medium text-[#1a3d32]">
                    <span>{progress.label}</span>
                    <span>{progress.current}/{progress.total} {variant === 'teacher' ? 'Graded' : 'Classes'}</span>
                </div>
                <Progress value={percentage} className="h-2 bg-gray-300" />
            </CardContent>
            <CardFooter className="pt-4">
                <Button className="w-full bg-[#3e6253] hover:bg-[#2c4a3e] text-white">
                    View Course
                </Button>
            </CardFooter>
        </Card>
    );
}

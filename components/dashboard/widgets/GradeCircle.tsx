"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";

interface GradeCircleProps {
    grade: string;
    percentage: number;
    subject: string;
    color?: string;
}

export function GradeCircle({ grade, percentage, subject, color = "#3e6253" }: GradeCircleProps) {
    const data = [
        { name: "Score", value: percentage },
        { name: "Remaining", value: 100 - percentage },
    ];

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-[#f9f9f7] rounded-lg">
            <div className="h-32 w-32 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={55}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell key="score" fill={color} />
                            <Cell key="remaining" fill="#e5e7eb" />
                            <Label
                                value={grade}
                                position="center"
                                className="text-2xl font-bold fill-[#1a3d32]"
                                style={{ fontSize: '24px', fontWeight: 'bold' }}
                            />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="text-center mt-2">
                <p className="font-bold text-[#1a3d32]">{subject}</p>
                <p className="text-sm text-gray-500">{percentage}%</p>
            </div>
        </div>
    );
}

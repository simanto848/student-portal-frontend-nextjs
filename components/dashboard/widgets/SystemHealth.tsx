import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ServiceHealth {
    name: string;
    status: "operational" | "degraded" | "down";
}

const services: ServiceHealth[] = [
    { name: "User Service", status: "operational" },
    { name: "Academic Service", status: "operational" },
    { name: "Library Service", status: "operational" },
    { name: "Notification Service", status: "operational" },
    { name: "Enrollment Service", status: "degraded" },
    { name: "Hostel & Facilities", status: "operational" },
    { name: "Database", status: "down" },
    { name: "API Gateway", status: "operational" },
];

export function SystemHealth() {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "operational": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case "degraded": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case "down": return <XCircle className="h-4 w-4 text-red-500" />;
            default: return <CheckCircle2 className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">System Health Monitor</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        <CheckCircle2 className="h-4 w-4" />
                        All systems operational
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {services.map((service) => (
                        <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(service.status)}
                                <span className="text-sm font-medium">{service.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                                {service.status === 'operational' ? '99.9%' : 'Checking...'}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

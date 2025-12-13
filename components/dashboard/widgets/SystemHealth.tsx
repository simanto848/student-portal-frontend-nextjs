"use client";

import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { api as apiClient } from "@/services/academic/axios-instance";

type ServiceStatus = "operational" | "degraded" | "down";

interface ServiceHealth {
  key: string;
  name: string;
  status: ServiceStatus;
  httpStatus?: number | null;
  responseTimeMs?: number;
}

interface SystemHealthResponse {
  checkedAt: string;
  overallStatus: ServiceStatus;
  services: ServiceHealth[];
}

export function SystemHealth() {
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);

  const getStatusIcon = (status: ServiceStatus) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "down":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const summary = useMemo(() => {
    const status = health?.overallStatus || "degraded";
    if (status === "operational") {
      return {
        icon: <CheckCircle2 className="h-4 w-4" />,
        text: "All systems operational",
        className: "text-green-600 bg-green-50",
      };
    }
    if (status === "down") {
      return {
        icon: <XCircle className="h-4 w-4" />,
        text: "System outage detected",
        className: "text-red-600 bg-red-50",
      };
    }
    return {
      icon: <AlertTriangle className="h-4 w-4" />,
      text: "Some systems degraded",
      className: "text-yellow-700 bg-yellow-50",
    };
  }, [health?.overallStatus]);

  useEffect(() => {
    let intervalId: number | undefined;
    let cancelled = false;

    const fetchHealth = async () => {
      try {
        const response = await apiClient.get("/system-health");
        const payload = response.data?.data as SystemHealthResponse | undefined;
        if (!cancelled && payload?.services) {
          setHealth(payload);
        }
      } catch {
        if (!cancelled) {
          setHealth(
            (prev) =>
              prev || {
                checkedAt: new Date().toISOString(),
                overallStatus: "down",
                services: [],
              }
          );
        }
      }
    };

    fetchHealth();
    intervalId = window.setInterval(fetchHealth, 10_000);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, []);

  const services = health?.services ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            System Health Monitor
          </CardTitle>
          <div
            className={`flex items-center gap-2 text-sm px-2 py-1 rounded-full ${summary.className}`}
          >
            {summary.icon}
            {summary.text}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                {getStatusIcon(service.status)}
                <span className="text-sm font-medium">{service.name}</span>
              </div>
              <span className="text-xs text-gray-500">
                {typeof service.responseTimeMs === "number"
                  ? `${service.responseTimeMs}ms`
                  : service.status === "down"
                  ? "Down"
                  : "Checking..."}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

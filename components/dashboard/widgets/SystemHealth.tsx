"use client";

import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { academicApi as apiClient } from "@/services/academic/axios-instance";
import { Button } from "@/components/ui/button";

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

interface ServiceLogEntry {
  at: string;
  status: ServiceStatus;
  httpStatus: number | null;
  responseTimeMs: number;
}

interface ServiceInspectResponse {
  checkedAt: string;
  service: { key: string; name: string; url?: string };
  current: ServiceHealth;
}

export function SystemHealth() {
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [inspect, setInspect] = useState<ServiceInspectResponse | null>(null);
  const [logs, setLogs] = useState<ServiceLogEntry[] | null>(null);
  const [isLoadingInspect, setIsLoadingInspect] = useState(false);

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
    intervalId = window.setInterval(fetchHealth, 5_000);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!selectedKey) return;

    let cancelled = false;
    let intervalId: number | undefined;

    const tick = async () => {
      if (cancelled) return;
      try {
        const [inspectRes, logsRes] = await Promise.all([
          apiClient.get(`/system-health/${selectedKey}/inspect`),
          apiClient.get(`/system-health/${selectedKey}/logs`, {
            params: { limit: 25 },
          }),
        ]);

        const inspectPayload = inspectRes.data?.data as
          | ServiceInspectResponse
          | undefined;
        const logsPayload = logsRes.data?.data as
          | { entries: ServiceLogEntry[] }
          | undefined;

        if (!cancelled) {
          setInspect(inspectPayload || null);
          setLogs(logsPayload?.entries || []);
        }
      } catch {
        if (!cancelled) {
          setInspect(null);
          setLogs([]);
        }
      }
    };

    tick();
    intervalId = window.setInterval(tick, 2_000);

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [selectedKey]);

  const services = health?.services ?? [];

  const selectedService = useMemo(() => {
    if (!selectedKey) return null;
    return services.find((s) => s.key === selectedKey) || null;
  }, [selectedKey, services]);

  const loadInspectAndLogs = async (serviceKey: string) => {
    setSelectedKey(serviceKey);
    setIsLoadingInspect(true);
    setInspect(null);
    setLogs(null);
    try {
      const [inspectRes, logsRes] = await Promise.all([
        apiClient.get(`/system-health/${serviceKey}/inspect`),
        apiClient.get(`/system-health/${serviceKey}/logs`, {
          params: { limit: 25 },
        }),
      ]);

      const inspectPayload = inspectRes.data?.data as
        | ServiceInspectResponse
        | undefined;
      const logsPayload = logsRes.data?.data as
        | { entries: ServiceLogEntry[] }
        | undefined;

      setInspect(inspectPayload || null);
      setLogs(logsPayload?.entries || []);
    } catch {
      setInspect(null);
      setLogs([]);
    } finally {
      setIsLoadingInspect(false);
    }
  };

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
            <button
              key={service.key}
              type="button"
              onClick={() => loadInspectAndLogs(service.key)}
              className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg text-left hover:bg-gray-100 transition-colors ${selectedKey === service.key
                  ? "ring-2 ring-offset-2 ring-gray-200"
                  : ""
                }`}
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
            </button>
          ))}
        </div>

        {selectedKey && (
          <div className="mt-6 rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedService?.status || "degraded")}
                  <p className="text-sm font-semibold truncate">
                    {selectedService?.name ||
                      inspect?.service?.name ||
                      "Service"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {inspect?.service?.url || ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadInspectAndLogs(selectedKey)}
                  disabled={isLoadingInspect}
                >
                  {isLoadingInspect ? "Refreshing…" : "Refresh"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedKey(null);
                    setInspect(null);
                    setLogs(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="text-sm font-medium">
                  {inspect?.current?.status || selectedService?.status || "—"}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">HTTP</p>
                <p className="text-sm font-medium">
                  {typeof inspect?.current?.httpStatus === "number"
                    ? inspect?.current?.httpStatus
                    : "—"}
                </p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Response</p>
                <p className="text-sm font-medium">
                  {typeof inspect?.current?.responseTimeMs === "number"
                    ? `${inspect.current.responseTimeMs}ms`
                    : "—"}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm font-semibold">Logs</p>
              <p className="text-xs text-muted-foreground">
                Recent health probes (latest first)
              </p>

              <div className="mt-2 max-h-56 overflow-auto rounded-md border bg-background">
                {isLoadingInspect && !logs ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    Loading logs…
                  </div>
                ) : (logs || []).length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">
                    Waiting for logs…
                  </div>
                ) : (
                  <div className="divide-y">
                    {(logs || []).map((entry, idx) => (
                      <div
                        key={`${entry.at}-${idx}`}
                        className="flex items-center justify-between gap-3 p-3"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {getStatusIcon(entry.status)}
                          <span className="text-sm font-medium truncate">
                            {entry.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {typeof entry.httpStatus === "number"
                              ? `HTTP ${entry.httpStatus}`
                              : "No response"}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {entry.responseTimeMs}ms
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, FileImage, ShieldCheck } from "lucide-react";

export function Overview() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:5000/api/training_metrics")
            .then(res => res.json())
            .then(data => {
                if (!data.error) setMetrics(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse font-medium">Loading model metrics...</div>;

    if (!metrics) return (
        <Card className="border-amber-100 shadow-sm bg-amber-50/30">
            <CardContent className="p-12 text-center">
                <ShieldCheck className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700">No Metrics Available</h3>
                <p className="text-slate-500 mt-2">The model has not been trained yet. Please refer to the Training Console to initialize the dataset.</p>
            </CardContent>
        </Card>
    );

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-amber-100 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Activity className="h-24 w-24 text-emerald-500" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-bold tracking-wide uppercase text-slate-500">Model Accuracy</CardTitle>
                    <Activity className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-black text-slate-800">{metrics.accuracy.toFixed(1)}%</div>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Cross-validation score</p>
                </CardContent>
            </Card>

            <Card className="border-amber-100 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Users className="h-24 w-24 text-blue-500" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-bold tracking-wide uppercase text-slate-500">Unique Persons</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-black text-slate-800">{metrics.uniquePersons || metrics.unique_persons}</div>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Total modeled individuals</p>
                </CardContent>
            </Card>

            <Card className="border-amber-100 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <FileImage className="h-24 w-24 text-purple-500" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-bold tracking-wide uppercase text-slate-500">Total Encodings</CardTitle>
                    <FileImage className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-3xl font-black text-slate-800">{metrics.totalEncodings || metrics.total_encodings}</div>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Trained face variants</p>
                </CardContent>
            </Card>

            <Card className="border-amber-100 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <ShieldCheck className="h-24 w-24 text-amber-500" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-bold tracking-wide uppercase text-slate-500">Last Trained</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent className="relative z-10">
                    <div className="text-2xl font-black text-slate-800 truncate">
                        {new Date(metrics.trainedAt || metrics.trained_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <p className="text-xs font-semibold text-slate-400 mt-1">
                        {new Date(metrics.trainedAt || metrics.trained_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

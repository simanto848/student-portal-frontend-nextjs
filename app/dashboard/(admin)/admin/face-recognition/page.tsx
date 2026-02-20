"use client";

import { Overview } from "./Overview";
import { DatasetManager } from "./DatasetManager";
import { TrainingManager } from "./TrainingManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanFace } from "lucide-react";

export default function FaceRecognitionPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10 mt-4">
            <div className="bg-white p-6 rounded-xl border border-amber-100 shadow-sm">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-800">
                    <ScanFace className="h-8 w-8 text-amber-600" />
                    Smart Face Detection Engine
                </h1>
                <p className="text-slate-500 mt-2">Manage enrolled face datasets, view engine metrics, and trigger model training pipelines directly from the portal.</p>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-white border text-black border-amber-100 p-1 rounded-lg">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all rounded-md px-4">Overview</TabsTrigger>
                    <TabsTrigger value="dataset" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all rounded-md px-4">Dataset Manager</TabsTrigger>
                    <TabsTrigger value="training" className="data-[state=active]:bg-amber-500 data-[state=active]:text-white transition-all rounded-md px-4">Training Console</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="outline-none">
                    <Overview />
                </TabsContent>

                <TabsContent value="dataset" className="outline-none">
                    <DatasetManager />
                </TabsContent>

                <TabsContent value="training" className="outline-none">
                    <TrainingManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}

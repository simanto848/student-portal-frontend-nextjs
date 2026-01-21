import { Zap } from "lucide-react";

export default function StudentLoading() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-[2rem] bg-[#0D9488]/10 animate-bounce">
                <Zap className="h-10 w-10 text-[#0D9488]" />
            </div>
            <p className="text-[#0D9488] font-black uppercase tracking-[0.2em] animate-pulse">Loading...</p>
        </div>
    );
}
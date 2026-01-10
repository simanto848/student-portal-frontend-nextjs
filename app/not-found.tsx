"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, Compass, Sparkles } from "lucide-react";
import Link from "next/link";

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
};

const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 100 },
    },
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-sky-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-400/10 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-indigo-400/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 text-center max-w-2xl mx-auto"
            >
                {/* 404 Number */}
                <motion.div variants={itemVariants} className="relative mb-8">
                    <div className="text-[180px] md:text-[220px] font-black text-transparent bg-clip-text bg-gradient-to-br from-slate-200 via-cyan-100 to-slate-200 leading-none select-none">
                        404
                    </div>
                    {/* Floating Elements */}
                    <motion.div
                        animate={{
                            y: [0, -15, 0],
                            rotate: [0, 10, 0],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute top-8 left-8 md:left-16"
                    >
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center shadow-xl shadow-cyan-500/30">
                            <Compass className="h-8 w-8 text-white" />
                        </div>
                    </motion.div>
                    <motion.div
                        animate={{
                            y: [0, 15, 0],
                            rotate: [0, -10, 0],
                        }}
                        transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.5,
                        }}
                        className="absolute bottom-8 right-8 md:right-16"
                    >
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
                            <Search className="h-6 w-6 text-white" />
                        </div>
                    </motion.div>
                    <motion.div
                        animate={{
                            y: [0, -10, 0],
                            x: [0, 10, 0],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 1,
                        }}
                        className="absolute top-1/2 right-4 md:right-8"
                    >
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                            <Sparkles className="h-5 w-5 text-white" />
                        </div>
                    </motion.div>
                </motion.div>

                {/* Glass Card */}
                <motion.div
                    variants={itemVariants}
                    className="relative overflow-hidden rounded-[2.5rem] border-2 border-white/60 bg-white/70 backdrop-blur-xl shadow-2xl shadow-slate-200/50 p-10 md:p-14"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-cyan-50/30" />
                    <div className="relative z-10">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                            Page Not Found
                        </h1>
                        <p className="text-slate-500 text-lg font-medium mb-8 max-w-md mx-auto leading-relaxed">
                            The page you&apos;re looking for doesn&apos;t exist or has been moved to another dimension.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    asChild
                                    className="h-14 px-8 rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-base shadow-xl shadow-cyan-500/25 transition-all"
                                >
                                    <Link href="/">
                                        <Home className="mr-2 h-5 w-5" />
                                        Back to Home
                                    </Link>
                                </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    onClick={() => window.history.back()}
                                    variant="outline"
                                    className="h-14 px-8 rounded-2xl border-2 border-slate-200 bg-white/80 hover:bg-slate-50 text-slate-700 font-bold text-base shadow-lg transition-all"
                                >
                                    <ArrowLeft className="mr-2 h-5 w-5" />
                                    Go Back
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Help Text */}
                <motion.p
                    variants={itemVariants}
                    className="mt-8 text-sm font-medium text-slate-400"
                >
                    Need help?{" "}
                    <Link href="/contact" className="text-cyan-600 hover:text-cyan-500 font-bold transition-colors">
                        Contact Support
                    </Link>
                </motion.p>
            </motion.div>
        </div>
    );
}

"use client";

import { motion } from "framer-motion";

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    onClick?: () => void;
}

export const GlassCard = ({ children, className = "", delay = 0, onClick }: GlassCardProps) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
            type: "spring",
            stiffness: 100,
            delay
        }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
        onClick={onClick}
        className={`relative overflow-hidden rounded-[2rem] border border-white/20 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/60 backdrop-blur-xl shadow-xl shadow-cyan-500/5 dark:shadow-slate-900/20 transition-all duration-300 ${className}`}
    >
        {children}
    </motion.div>
);


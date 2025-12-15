import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface HeroStatsProps {
  label: string;
  value: string | number;
  subtext?: string;
  progress?: number;
  progressMax?: number;
}

export interface DashboardHeroProps {
  /** Icon to display in the label area */
  icon: LucideIcon;
  /** Small label text above the title */
  label: string;
  /** Main heading text */
  title: string;
  /** Optional description text below the title */
  description?: string;
  /** Optional action buttons or elements */
  actions?: ReactNode;
  /** Optional stats card on the right side */
  stats?: HeroStatsProps;
  /** Optional additional content in the hero area */
  children?: ReactNode;
  /** Optional custom className for the container */
  className?: string;
}

function HeroStatsCard({
  label,
  value,
  subtext,
  progress,
  progressMax = 100,
}: HeroStatsProps) {
  const progressValue =
    progress !== undefined ? (progress / progressMax) * 100 : undefined;

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur p-4 min-w-[220px] shadow-lg">
      <p className="text-xs uppercase tracking-wide text-white/80">{label}</p>
      <div className="flex items-end gap-2 mt-2">
        <span className="text-4xl font-bold">{value}</span>
        {subtext && <span className="text-sm text-white/70">{subtext}</span>}
      </div>
      {progressValue !== undefined && (
        <Progress value={progressValue} className="mt-3 bg-white/20" />
      )}
    </div>
  );
}

export function DashboardHero({
  icon: Icon,
  label,
  title,
  description,
  actions,
  stats,
  children,
  className,
}: DashboardHeroProps) {
  return (
    <div
      className={cn(
        "rounded-3xl dashboard-hero-gradient text-white p-6 md:p-8 shadow-lg relative overflow-hidden",
        className,
      )}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 dashboard-hero-overlay" />

      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2 flex-1">
          {/* Label with icon */}
          <p className="text-sm text-white/70 flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {label}
          </p>

          {/* Main title */}
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>

          {/* Optional description */}
          {description && (
            <p className="text-white/75 max-w-2xl">{description}</p>
          )}

          {/* Optional action buttons */}
          {actions && (
            <div className="flex gap-3 flex-wrap pt-1">{actions}</div>
          )}

          {/* Optional additional content */}
          {children}
        </div>

        {/* Optional stats card */}
        {stats && <HeroStatsCard {...stats} />}
      </div>
    </div>
  );
}

// Export sub-component for custom usage
DashboardHero.StatsCard = HeroStatsCard;

export default DashboardHero;

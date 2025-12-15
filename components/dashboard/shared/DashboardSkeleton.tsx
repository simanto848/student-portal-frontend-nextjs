import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export type SkeletonLayout =
  | "hero-cards"
  | "hero-grid"
  | "hero-table"
  | "simple"
  | "cards-only"
  | "table-only";

export interface DashboardSkeletonProps {
  /** The layout type for the skeleton */
  layout?: SkeletonLayout;
  /** Number of card skeletons to show (for cards layouts) */
  cardCount?: number;
  /** Number of table rows to show (for table layouts) */
  rowCount?: number;
  /** Whether to wrap in DashboardLayout */
  withLayout?: boolean;
  /** Optional custom className */
  className?: string;
}

function HeroSkeleton() {
  return <Skeleton className="h-[200px] w-full rounded-3xl" />;
}

function CardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[180px] w-full rounded-xl" />
      ))}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Skeleton className="h-[300px] w-full lg:col-span-2 rounded-xl" />
      <Skeleton className="h-[300px] w-full rounded-xl" />
    </div>
  );
}

function TableSkeleton({ rowCount = 5 }: { rowCount?: number }) {
  return (
    <div className="rounded-xl border bg-card">
      {/* Header */}
      <div className="border-b p-4">
        <Skeleton className="h-6 w-48" />
      </div>
      {/* Table header */}
      <div className="border-b p-4 flex gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>
      {/* Table rows */}
      <div className="p-4 space-y-3">
        {Array.from({ length: rowCount }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonContent({
  layout = "hero-cards",
  cardCount = 3,
  rowCount = 5,
  className,
}: Omit<DashboardSkeletonProps, "withLayout">) {
  const content = () => {
    switch (layout) {
      case "hero-cards":
        return (
          <>
            <HeroSkeleton />
            <CardsSkeleton count={cardCount} />
          </>
        );

      case "hero-grid":
        return (
          <>
            <HeroSkeleton />
            <GridSkeleton />
          </>
        );

      case "hero-table":
        return (
          <>
            <HeroSkeleton />
            <TableSkeleton rowCount={rowCount} />
          </>
        );

      case "simple":
        return (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
            <GridSkeleton />
          </>
        );

      case "cards-only":
        return <CardsSkeleton count={cardCount} />;

      case "table-only":
        return <TableSkeleton rowCount={rowCount} />;

      default:
        return <HeroSkeleton />;
    }
  };

  return <div className={cn("space-y-6", className)}>{content()}</div>;
}

export function DashboardSkeleton({
  layout = "hero-cards",
  cardCount = 3,
  rowCount = 5,
  withLayout = true,
  className,
}: DashboardSkeletonProps) {
  const skeletonContent = (
    <SkeletonContent
      layout={layout}
      cardCount={cardCount}
      rowCount={rowCount}
      className={className}
    />
  );

  if (withLayout) {
    return <DashboardLayout>{skeletonContent}</DashboardLayout>;
  }

  return skeletonContent;
}

// Export sub-components for custom usage
DashboardSkeleton.Hero = HeroSkeleton;
DashboardSkeleton.Cards = CardsSkeleton;
DashboardSkeleton.Grid = GridSkeleton;
DashboardSkeleton.Table = TableSkeleton;

export default DashboardSkeleton;

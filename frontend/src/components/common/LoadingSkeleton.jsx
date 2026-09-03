import React from "react";

function SkeletonLine({ w = "w-full", h = "h-4" }) {
  return <div className={`skeleton rounded-lg ${w} ${h}`} />;
}

function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 space-y-3">
      <div className="skeleton w-8 h-8 rounded-xl" />
      <SkeletonLine w="w-16" h="h-7" />
      <SkeletonLine w="w-24" h="h-3" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 space-y-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <SkeletonLine w="w-32" h="h-4" />
          <SkeletonLine w="w-20" h="h-3" />
        </div>
      </div>
      <SkeletonLine h="h-3" />
      <SkeletonLine w="w-3/4" h="h-3" />
      <SkeletonLine w="w-1/2" h="h-3" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <SkeletonLine w="w-40" h="h-5" />
      </div>
      <div className="divide-y divide-slate-100">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="skeleton w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonLine w="w-28" h="h-3.5" />
              <SkeletonLine w="w-44" h="h-3" />
            </div>
            <SkeletonLine w="w-16" h="h-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoadingSkeleton({ type = "card", count = 3 }) {
  if (type === "stat") {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-${Math.min(count, 5)} gap-3`}>
        {[...Array(count)].map((_, i) => <StatSkeleton key={i} />)}
      </div>
    );
  }
  if (type === "table") return <TableSkeleton />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

import React from "react";

const SkeletonLoader = ({
  variant = "text",
  rows = 5,
  columns = 4,
  className = "",
}) => {
  if (variant === "table") {
    return (
      <div className={`w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 ${className}`}>
        <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/90 p-4">
          <div className="grid grid-cols-12 gap-4">
            {Array.from({ length: columns }).map((_, i) => (
              <div
                key={i}
                className={`h-4 bg-slate-200 dark:bg-slate-800/70 rounded animate-pulse ${
                  i === 0 ? "col-span-4" : i === 1 ? "col-span-3" : "col-span-2"
                }`}
              ></div>
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-800/60">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="p-4 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800/80 animate-pulse shrink-0"></div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800/80 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800/50 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
              <div className="col-span-3">
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800/70 rounded-full animate-pulse"></div>
              </div>
              <div className="col-span-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-800/60 rounded w-24 animate-pulse"></div>
              </div>
              <div className="col-span-2 flex justify-end">
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800/70 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className={`p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 ${className}`}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3 animate-pulse"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800/60 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-800/70 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800/50 rounded w-4/5 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (variant === "avatar") {
    return (
      <div className={`w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse ${className}`}></div>
    );
  }

  return (
    <div className={`h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse ${className}`}></div>
  );
};

export default SkeletonLoader;

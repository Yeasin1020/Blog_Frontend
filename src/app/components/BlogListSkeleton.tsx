"use client";

import React from "react";

// Skeleton Card component
const SkeletonCard = () => {
  return (
    <div className="relative rounded-xl p-[1px] animate-pulse">
      <div className="bg-white rounded-xl p-5 space-y-3">
        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="flex justify-between mt-3 text-xs">
          <div className="h-3 bg-gray-300 rounded w-1/3"></div>
          <div className="h-3 bg-gray-300 rounded w-1/6"></div>
        </div>
      </div>
    </div>
  );
};

// Skeleton Loader Grid
export default function BlogListSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
}

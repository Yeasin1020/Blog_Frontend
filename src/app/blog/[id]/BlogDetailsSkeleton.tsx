"use client";

import React from "react";

export default function DetailsPageSkeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button Placeholder */}
      <div className="mb-6 w-24 h-4 bg-gray-300 rounded animate-pulse"></div>

      {/* Post Card Skeleton */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6 sm:p-8 animate-pulse space-y-4">
        {/* Header */}
        <div className="bg-gray-300 rounded h-8 w-3/4 sm:h-10 sm:w-1/2"></div>
        <div className="flex justify-between mt-1">
          <div className="bg-gray-200 h-3 w-1/4 rounded"></div>
          <div className="bg-gray-200 h-3 w-1/6 rounded"></div>
        </div>

        {/* Content */}
        <div className="space-y-3 mt-4">
          <div className="bg-gray-200 h-3 w-full rounded"></div>
          <div className="bg-gray-200 h-3 w-full rounded"></div>
          <div className="bg-gray-200 h-3 w-5/6 rounded"></div>
          <div className="bg-gray-200 h-3 w-4/6 rounded"></div>
        </div>

        {/* CTA Button */}
        <div className="mt-6 h-10 w-32 bg-gray-300 rounded mx-auto"></div>
      </div>
    </main>
  );
}

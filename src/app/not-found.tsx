// src/app/not-found.tsx

import Link from "next/link";
import { Frown } from "lucide-react"; // lucide-react ব্যবহার করে আইকন ইমপোর্ট করা হয়েছে

export default function NotFound() {
  // Option 1: আপনি যদি কোনো সার্ভার-সাইড কম্পোনেন্টের মধ্যে থাকেন, তবে notFound() কল করলে এটি অবিলম্বে নিকটবর্তী not-found.tsx ফাইলটিকে ট্রিগার করে।
  // যেহেতু এটি নিজেই not-found.tsx, তাই এটি প্রয়োজন নেই, কিন্তু জানা জরুরি।
  // notFound();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-center py-20 bg-gray-50">
      <Frown className="w-16 h-16 text-blue-600 mb-4" />
      <h1 className="text-6xl font-extrabold text-gray-900 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-6">
        Page Not Found
      </h2>

      <p className="text-lg text-gray-500 mb-8 max-w-md">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>

      <Link
        href="/"
        className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition duration-150 shadow-md"
      >
        Go back to Homepage
      </Link>

      <div className="mt-10 p-4 bg-yellow-100 border border-yellow-300 rounded-md text-sm text-yellow-800">
        <p>
          💡 **Debug Note:** If you see this page, it means Next.js
          couldn&apos;t match the URL.
        </p>
      </div>
    </div>
  );
}

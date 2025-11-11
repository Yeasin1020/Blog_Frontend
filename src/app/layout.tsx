import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast"; // ✅ NEW: Toaster ইমপোর্ট করা হলো

// 💡 Note: NavbarClientWrapper এবং Footer import এখান থেকে সরিয়ে দেওয়া হয়েছে।

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "E-Shop | The Best Online Shopping Destination",
  description:
    "Find the best deals on electronics, fashion, and home goods. Fast shipping and easy returns guaranteed.",
};

// রুট লেআউটে শুধুমাত্র HTML এবং Body ট্যাগ থাকবে
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 1. Toaster Provider যুক্ত করা হলো - এটি সকল পেজে কাজ করবে */}
        <Toaster
          position="top-center" // টোস্ট স্ক্রিনের উপরে মাঝে দেখাবে
          reverseOrder={false}
          toastOptions={{
            // অ্যাডমিন UI এর সাথে মানানসই ডার্ক স্টাইল
            style: {
              background: "#27272a", // zinc-800 এর কাছাকাছি
              color: "#e4e4e7", // text-zinc-200
            },
          }}
        />

        {/* children এর মাধ্যমে (commonLayout) এর layout.tsx এবং অন্যান্য পেজ লোড হবে */}
        <main>{children}</main>
      </body>
    </html>
  );
}

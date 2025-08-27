import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlogMaster - Share Your Stories & Insights",
  description:
    "BlogMaster is a community-driven blog platform where anyone can share knowledge, experiences, and creative ideas. Join now and start blogging!",
  openGraph: {
    title: "BlogMaster - Share Your Stories & Insights",
    description:
      "A community-driven blog platform to share knowledge, stories, and creative ideas.",
    url: "https://blogfrontend-brown.vercel.app",
    siteName: "BlogMaster",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dwg8d0bfp/image/upload/v1756258771/9626fca3-b2e6-4a6f-ba57-0066d758ef9d_tjvmyy-removebg-preview_qfcuuv.png",
        width: 1200,
        height: 630,
        alt: "BlogMaster",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BlogMaster - Share Your Stories & Insights",
    description:
      "A community-driven blog platform to share knowledge, stories, and creative ideas.",
    creator: "@YourTwitterHandle",
    images: ["https://yourdomain.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

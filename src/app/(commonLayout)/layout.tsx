import React from "react";
import NavbarClientWrapper from "../components/NavbarClientWrapper";
import Footer from "../components/Footer";

// 💡 Path Fix: components are now accessed relatively from the group folder

// এই লেআউটটি /dashboard/ এর বাইরের সকল রুটে (যেমন /, /login, /contact, /products) প্রয়োগ হবে।
export default function CommonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Navbar and Auth State Provider */}
      <NavbarClientWrapper></NavbarClientWrapper>
      {/* 2. Main Content of the inner pages (children) */}
      <main className="flex-grow"> {children} </main>
      {/* 3. Footer */}
      <Footer />
    </div>
  );
}

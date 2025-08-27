/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "bn">("en");
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/" },
    { name: "Blogs List", href: "/blogs-list" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Create Post", href: "/create-post" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <a
          href="/"
          className="text-2xl font-bold text-indigo-600 tracking-tight hover:text-indigo-700 transition"
        >
          Blog<span className="text-gray-800">Master</span>
        </a>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`font-medium transition-colors duration-200 px-3 py-1 rounded-md ${
                  pathname === link.href
                    ? "text-indigo-600 bg-indigo-50 shadow-sm"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
                }`}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            className="p-2 rounded-md hover:bg-gray-100 transition"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-800" />
            ) : (
              <Menu className="w-6 h-6 text-gray-800" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white px-4 pb-4 border-t border-gray-200 shadow-sm"
          >
            <ul className="flex flex-col gap-2 pt-2">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`block font-medium transition px-3 py-2 rounded-md ${
                      pathname === link.href
                        ? "text-indigo-600 bg-indigo-50 shadow-sm"
                        : "text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
                    }`}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

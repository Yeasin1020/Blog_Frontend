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
    { name: lang === "en" ? "Home" : "হোম", href: "/" },
    { name: lang === "en" ? "About" : "আমাদের সম্পর্কে", href: "/about" },
    { name: lang === "en" ? "Contact" : "যোগাযোগ", href: "/contact" },
    { name: lang === "en" ? "New Post" : "নতুন পোস্ট", href: "/new" },
  ];

  return (
    <nav className="bg-gray-50 border-b border-gray-200 sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <a
          href="/"
          className="text-xl font-bold text-indigo-600 tracking-tight"
        >
          My<span className="text-gray-800">Blog</span>
        </a>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`font-medium transition-colors duration-200 px-2 py-1 rounded-md ${
                  pathname === link.href
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-gray-100"
                }`}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="px-3 py-1 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
          >
            {lang === "en" ? "বাংলা" : "EN"}
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
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

      {/* Mobile Menu with Animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-gray-50 px-4 pb-4 border-t border-gray-200"
          >
            <ul className="flex flex-col gap-2 pt-2">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={`block font-medium transition px-2 py-2 rounded-md ${
                      pathname === link.href
                        ? "text-indigo-600 bg-indigo-50"
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

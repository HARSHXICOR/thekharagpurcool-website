"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import logoSmall from "../../imports/logo_small.png";
import { useAuth } from "../context/AuthContext";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/services", label: "Services" },
    { path: "/portfolio", label: "Portfolio" },
    { path: "/pricing", label: "Pricing" },
    { path: "/blog", label: "Blog" },
    { path: "/contact", label: "Contact" },
  ];

  const { user, logout } = useAuth();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src={logoSmall} alt="The Kharagpur Wala" className="h-10 w-10" />
          <span className="text-xl font-bold tracking-tight">
            The <span className="text-gradient">Kharagpur</span> Wala
          </span>
        </Link>
 
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`relative transition-colors ${
                pathname === link.path
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {link.label}
              {pathname === link.path && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 gradient-purple-teal rounded-full"
                />
              )}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              {["super_admin", "admin", "account_manager"].includes(user.defaultRole) && (
                <Link
                  href="/admin/inquiries"
                  className={`px-4 py-2 text-sm transition-colors ${
                    pathname.startsWith("/admin/inquiries") ? "text-teal-400 font-semibold" : "text-white/80 hover:text-teal-300"
                  }`}
                >
                  Inquiries Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className={`px-4 py-2 text-sm transition-colors ${
                  pathname === "/dashboard" ? "text-purple-400 font-semibold" : "text-white/80 hover:text-white"
                }`}
              >
                Client Console
              </Link>
              <button
                onClick={logout}
                className="p-2 rounded-full glass-light hover:glass text-gray-400 hover:text-red-400 transition-colors flex items-center justify-center cursor-pointer"
                title="Log Out"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 text-sm text-white/80 hover:text-white transition-colors"
            >
              Client Login
            </Link>
          )}
          <Link
            href="/contact"
            className="px-6 py-2.5 rounded-full gradient-purple-teal hover:glow-purple transition-all"
          >
            Book Free Call
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-white p-2"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass mt-4"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`py-2 ${
                    pathname === link.path
                      ? "text-white text-gradient"
                      : "text-gray-400"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  {["super_admin", "admin", "account_manager"].includes(user.defaultRole) && (
                    <Link
                      href="/admin/inquiries"
                      onClick={() => setIsOpen(false)}
                      className="py-2 text-teal-400 font-semibold"
                    >
                      Inquiries Admin
                    </Link>
                  )}
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="py-2 text-gradient font-semibold"
                  >
                    Client Console
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      logout();
                    }}
                    className="py-2 text-left text-red-400 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="py-2 text-gray-400 hover:text-white"
                >
                  Client Login
                </Link>
              )}
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 rounded-full gradient-purple-teal text-center"
              >
                Book Free Call
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

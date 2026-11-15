import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Droplet, Menu, X, LogIn, HeartHandshake } from "lucide-react";
import Button from "./Button";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile drawer on route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent background page scrolling while mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (location.pathname !== "/") {
      navigate(`/#${targetId}`);
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#A61B2B] flex items-center justify-center text-white shadow-xs transition-colors">
              <Droplet className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-base font-bold text-[#1E293B] dark:text-zinc-100 tracking-tight">
                Blood<span className="text-[#A61B2B]">Ward</span>
              </span>
              <span className="block text-[9px] font-semibold text-[#64748B] dark:text-zinc-400 -mt-0.5 tracking-wider uppercase font-sans">
                Clinical Network
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Large Screens lg+) */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-[#475569] dark:text-zinc-300">
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, "home")}
              className="hover:text-[#1E293B] dark:hover:text-white transition-colors cursor-pointer"
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleNavClick(e, "how-it-works")}
              className="hover:text-[#1E293B] dark:hover:text-white transition-colors cursor-pointer"
            >
              How It Works
            </a>
            <a
              href="#donation-process"
              onClick={(e) => handleNavClick(e, "donation-process")}
              className="hover:text-[#1E293B] dark:hover:text-white transition-colors cursor-pointer"
            >
              Donation Process
            </a>
            <a
              href="#why-bloodward"
              onClick={(e) => handleNavClick(e, "why-bloodward")}
              className="hover:text-[#1E293B] dark:hover:text-white transition-colors cursor-pointer"
            >
              Why BloodWard
            </a>
            <a
              href="#safety"
              onClick={(e) => handleNavClick(e, "safety")}
              className="hover:text-[#1E293B] dark:hover:text-white transition-colors cursor-pointer"
            >
              Safety & Trust
            </a>
            <a
              href="#faq"
              onClick={(e) => handleNavClick(e, "faq")}
              className="hover:text-[#1E293B] dark:hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </a>
          </nav>

          {/* 1. DESKTOP BAR (lg+ only) */}
          <div className="hidden lg:flex items-center gap-2.5">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/login")}
              className="font-medium text-xs text-[#1E293B] dark:text-[#F1F5F9] border-[#E2E8F0] dark:border-[#343B47]"
            >
              <LogIn className="w-3.5 h-3.5 mr-1 text-[#64748B]" />
              Sign In
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/register/donor")}
              className="font-semibold text-xs"
            >
              <HeartHandshake className="w-3.5 h-3.5 mr-1" />
              Donate
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/register/recipient")}
              className="font-semibold text-xs"
            >
              Request Blood
            </Button>
          </div>

          {/* 2. TABLET BAR (sm to lg) */}
          <div className="hidden sm:flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/login")}
              className="font-medium text-xs text-[#1E293B] dark:text-[#F1F5F9] border-[#E2E8F0] dark:border-[#343B47]"
            >
              <LogIn className="w-3.5 h-3.5 mr-1 text-[#64748B]" />
              Sign In
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#475569] dark:text-[#CBD5E1] hover:text-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#20242C] cursor-pointer"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#1E293B] dark:text-white" /> : <Menu className="w-5 h-5 text-[#1E293B] dark:text-white" />}
            </button>
          </div>

          {/* 3. MOBILE BAR (< sm only) - ThemeToggle ALWAYS stays in header row */}
          <div className="flex sm:hidden items-center gap-1.5 xs:gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 xs:p-2 rounded-lg text-[#475569] dark:text-[#CBD5E1] hover:text-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#20242C] cursor-pointer"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#1E293B] dark:text-white" /> : <Menu className="w-5 h-5 text-[#1E293B] dark:text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b-2 border-[#CBD5E1] dark:border-[#343B47] bg-white dark:bg-[#181B21] px-4 pt-3 pb-6 space-y-3 shadow-2xl max-h-[calc(100dvh-3.5rem)] sm:max-h-[calc(100dvh-4rem)] overflow-y-auto overflow-x-hidden overscroll-contain animate-in slide-in-from-top-2 duration-150">
          <nav className="space-y-0.5">
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, "home")}
              className="block py-2 px-2.5 rounded-lg text-sm font-medium text-[#475569] dark:text-zinc-300 hover:bg-[#F8FAFC] dark:hover:bg-zinc-800 hover:text-[#1E293B] dark:hover:text-white cursor-pointer transition-colors"
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleNavClick(e, "how-it-works")}
              className="block py-2 px-2.5 rounded-lg text-sm font-medium text-[#475569] dark:text-zinc-300 hover:bg-[#F8FAFC] dark:hover:bg-zinc-800 hover:text-[#1E293B] dark:hover:text-white cursor-pointer transition-colors"
            >
              How It Works
            </a>
            <a
              href="#donation-process"
              onClick={(e) => handleNavClick(e, "donation-process")}
              className="block py-2 px-2.5 rounded-lg text-sm font-medium text-[#475569] dark:text-zinc-300 hover:bg-[#F8FAFC] dark:hover:bg-zinc-800 hover:text-[#1E293B] dark:hover:text-white cursor-pointer transition-colors"
            >
              Donation Process
            </a>
            <a
              href="#why-bloodward"
              onClick={(e) => handleNavClick(e, "why-bloodward")}
              className="block py-2 px-2.5 rounded-lg text-sm font-medium text-[#475569] dark:text-zinc-300 hover:bg-[#F8FAFC] dark:hover:bg-zinc-800 hover:text-[#1E293B] dark:hover:text-white cursor-pointer transition-colors"
            >
              Why BloodWard
            </a>
            <a
              href="#safety"
              onClick={(e) => handleNavClick(e, "safety")}
              className="block py-2 px-2.5 rounded-lg text-sm font-medium text-[#475569] dark:text-zinc-300 hover:bg-[#F8FAFC] dark:hover:bg-zinc-800 hover:text-[#1E293B] dark:hover:text-white cursor-pointer transition-colors"
            >
              Safety & Trust
            </a>
            <a
              href="#faq"
              onClick={(e) => handleNavClick(e, "faq")}
              className="block py-2 px-2.5 rounded-lg text-sm font-medium text-[#475569] dark:text-zinc-300 hover:bg-[#F8FAFC] dark:hover:bg-zinc-800 hover:text-[#1E293B] dark:hover:text-white cursor-pointer transition-colors"
            >
              FAQ
            </a>
          </nav>

          <div className="pt-3 border-t border-[#E2E8F0] dark:border-zinc-800 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-center text-xs font-semibold"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/login");
              }}
            >
              <LogIn className="w-3.5 h-3.5 mr-1 text-[#64748B]" />
              Sign In
            </Button>
            <Button
              variant="primary"
              className="w-full justify-center text-xs font-semibold"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/register/donor");
              }}
            >
              <HeartHandshake className="w-3.5 h-3.5 mr-1" />
              Donate Blood
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-center text-xs font-semibold"
              onClick={() => {
                setMobileMenuOpen(false);
                navigate("/register/recipient");
              }}
            >
              Request Blood
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

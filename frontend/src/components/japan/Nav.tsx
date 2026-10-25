import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "/itineraryPlanner", label: "Plan my trip", isRoute: true },
  { href: "/translator", label: "Translator", isRoute: true },
  { href: "/foodScanner", label: "Food Scanner", isRoute: true },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = location.pathname === "/";

  return (
    <header
      className={cn(
        "fixed left-1/2 top-4 z-50 w-[94%] max-w-6xl -translate-x-1/2 rounded-full border border-[#E8E2D5] bg-[#FAF6F0] transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md",
        scrolled ? "py-2 px-5 sm:px-7 shadow-[0_6px_28px_rgba(0,0,0,0.1)]" : "py-2.5 px-6 sm:px-8",
      )}
    >
      <nav className="flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="group flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#CF3A24] font-display text-lg font-medium text-white shadow-xs transition-transform duration-300 group-hover:scale-105">
            日
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-[#1C1917]">
            Nihon.
          </span>
        </Link>

        {/* Navigation links */}
        <ul className="hidden items-center gap-6 lg:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              {link.isRoute ? (
                <Link
                  to={link.href}
                  className="whitespace-nowrap text-sm font-medium text-[#4A4540] transition-colors hover:text-[#1C1917]"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={isHome ? link.href : `/${link.href}`}
                  className="whitespace-nowrap text-sm font-medium text-[#4A4540] transition-colors hover:text-[#1C1917]"
                >
                  {link.label}
                </a>
              )}
            </li>
          ))}
        </ul>

        {/* CTA Button: Opens Login if not logged in, or Plan if logged in */}
        <Link
          to={user ? "/itineraryPlanner" : "/login"}
          className="shrink-0 rounded-full bg-[#CF3A24] px-5 py-2 text-sm font-medium text-white shadow-xs transition-all duration-300 hover:bg-[#B7331F] hover:-translate-y-0.5"
        >
          {user ? (user.name ? `Hi, ${user.name.split(" ")[0]}` : "Plan my trip") : "Start planning"}
        </Link>
      </nav>
    </header>
  );
}

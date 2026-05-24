import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Pill } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/hooks/use-auth";

export function Navigation() {
  const [location] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/products", label: "Products" },
    ...(user ? [{ href: "/orders", label: "My Orders" }] : []),
    { href: "/become-partner", label: "Become a Partner" },
    { href: "/contact", label: "Contact" },
  ];


  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
          ? "bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100"
          : "bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100"
        }`}
    >
      <div className="container mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 bg-gradient-to-br from-[#0d3d2e] to-[#0a5240] shadow-lg">
            <Pill className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[#0d3d2e]">
            MediPillar
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link, index) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className={`font-medium text-base px-5 py-2 rounded-full transition-all duration-300 ${isActive(link.href)
                    ? "text-[#0d3d2e] bg-[#0d3d2e]/10"
                    : "text-gray-600 hover:text-[#0d3d2e] hover:bg-[#0d3d2e]/5"
                  }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                data-testid={`link-${link.label.toLowerCase().replace(" ", "-")}`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {user && (
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-[#0d3d2e] hover:bg-[#0d3d2e]/5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
              </Button>
            </Link>
          )}
          <AuthModal />
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full transition-all duration-300 text-[#0d3d2e] hover:bg-[#0d3d2e]/10"
              data-testid="button-mobile-menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-white/95 backdrop-blur-xl border-l border-white/20">
            <div className="flex items-center gap-3 mb-8 mt-4">
              <div className="w-11 h-11 bg-gradient-to-br from-[#0d3d2e] to-[#0a5240] rounded-xl flex items-center justify-center shadow-lg">
                <Pill className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[#0d3d2e]">MediPillar</span>
            </div>
            <nav className="flex flex-col gap-2">
              {[
                ...navLinks,
                ...(user ? [{ href: "/cart", label: "Shopping Cart" }] : []),
              ].map((link, index) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start font-medium text-base py-3 rounded-xl transition-all duration-300 animate-slide-in-left ${isActive(link.href)
                        ? "text-[#0d3d2e] bg-[#0d3d2e]/10"
                        : "text-gray-600 hover:text-[#0d3d2e] hover:bg-gray-100"
                      }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                    data-testid={`link-mobile-${link.label.toLowerCase().replace(" ", "-")}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              <Link href="/contact" className="mt-4">
                <Button
                  className="w-full bg-gradient-to-r from-[#0d3d2e] to-[#0a5240] text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 btn-shine animate-slide-in-left"
                  style={{ animationDelay: '0.4s' }}
                >
                  Get Started
                </Button>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

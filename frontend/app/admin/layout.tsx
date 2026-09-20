"use client";

import { useAuth } from "@/components/AuthProvider";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Settings,
  HelpCircle,
  QrCode,
  LogOut,
  Menu,
  X,
  Star,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  { name: "Questions", href: "/admin/questions", icon: HelpCircle },
  { name: "QR Code", href: "/admin/qr", icon: QrCode },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

function Sidebar({ pathname, logout, onClose }: { pathname: string; logout: () => void; onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-border/60">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Star className="h-4 w-4" />
          </div>
          <span className="text-[15px] font-semibold text-foreground">ReviewFlow</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1 -mr-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                isActive
                  ? "bg-primary/8 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <item.icon
                className={`h-[18px] w-[18px] flex-shrink-0 ${
                  isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground"
                }`}
                strokeWidth={isActive ? 2 : 1.75}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border/60 p-3">
        <button
          onClick={() => { logout(); onClose?.(); }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Star className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col border-r border-border/60 bg-card">
        <Sidebar pathname={pathname} logout={logout} />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 h-full w-64 bg-card shadow-xl">
            <Sidebar pathname={pathname} logout={logout} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 items-center gap-3 border-b border-border/60 bg-card px-4 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 -ml-1.5 text-muted-foreground hover:text-foreground">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Star className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold text-foreground">ReviewFlow</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

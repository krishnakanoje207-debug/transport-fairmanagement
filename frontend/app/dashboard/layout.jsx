"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Home, MapPin, Users, CreditCard, Bell, Settings, LogOut, Menu, X, ChevronRight, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { clearSession, getUser } from "@/lib/auth";
const navItems = [
    { label: "Dashboard", href: "/dashboard/guardian", icon: Home },
    { label: "Live Tracking", href: "/dashboard/guardian/tracking", icon: MapPin },
    { label: "Linked Users", href: "/dashboard/guardian/users", icon: Users },
    { label: "Schedule Ride", href: "/dashboard/guardian/schedule-ride", icon: Navigation },
    { label: "Payments", href: "/dashboard/guardian/payments", icon: CreditCard },
    { label: "Notifications", href: "/dashboard/guardian/notifications", icon: Bell },
    { label: "Settings", href: "/dashboard/guardian/settings", icon: Settings },
];
export default function DashboardLayout({ children, }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);

    // If current path is for partner, admin, user, or self-travel portals,
    // just pass through — those portals have their own layout.
    const isGuardianRoute = pathname.startsWith("/dashboard/guardian") || pathname === "/dashboard";
    const isOtherPortal = pathname.startsWith("/dashboard/partner") || pathname.startsWith("/dashboard/admin") || pathname.startsWith("/dashboard/user") || pathname.startsWith("/dashboard/self-travel");

    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser) {
            router.replace("/login");
            return;
        }
        setUser(currentUser);
    }, [router]);

    // If this is a non-guardian portal, render children directly without guardian sidebar
    if (isOtherPortal) {
        return <>{children}</>;
    }

    const handleLogout = () => {
        clearSession();
        router.push("/login");
    };
    return (<div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 border-r border-border bg-sidebar">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground"/>
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">Safe</span>
              <span className="text-foreground">Route</span>
            </span>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (<Link key={item.href} href={item.href} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200", isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>
                <item.icon className="w-5 h-5"/>
                <span className="font-medium">{item.label}</span>
                {isActive && (<ChevronRight className="w-4 h-4 ml-auto"/>)}
              </Link>);
        })}
        </nav>
        
        {/* User section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "User"}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">Guardian</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full mt-3 flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="w-5 h-5"/>
            <span className="font-medium">Sign out</span>
          </button>
        </div>
      </aside>
      
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (<>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}/>
            <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border z-50 lg:hidden">
              <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary-foreground"/>
                  </div>
                  <span className="text-xl font-bold">
                    <span className="gradient-text">Safe</span>
                    <span className="text-foreground">Route</span>
                  </span>
                </Link>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg hover:bg-sidebar-accent">
                  <X className="w-5 h-5"/>
                </button>
              </div>
              
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (<Link key={item.href} href={item.href} onClick={() => setIsSidebarOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200", isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>
                      <item.icon className="w-5 h-5"/>
                      <span className="font-medium">{item.label}</span>
                    </Link>);
            })}
              </nav>
            </motion.aside>
          </>)}
      </AnimatePresence>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg hover:bg-secondary">
            <Menu className="w-6 h-6"/>
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground"/>
            </div>
            <span className="font-bold">SafeRoute</span>
          </Link>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm">
            JD
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>);
}

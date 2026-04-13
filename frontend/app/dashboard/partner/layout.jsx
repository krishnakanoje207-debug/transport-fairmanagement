"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Navigation, QrCode, Users, Clock, Settings, LogOut, Menu, X, ChevronRight, Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { clearSession, getUser } from "@/lib/auth";
const navItems = [
    { label: "Dashboard", href: "/dashboard/partner", icon: Home },
    { label: "Active Route", href: "/dashboard/partner/route", icon: Navigation },
    { label: "QR Scanner", href: "/dashboard/partner/scanner", icon: QrCode },
    { label: "Passengers", href: "/dashboard/partner/passengers", icon: Users },
    { label: "Trip History", href: "/dashboard/partner/history", icon: Clock },
    { label: "Settings", href: "/dashboard/partner/settings", icon: Settings },
];
export default function PartnerLayout({ children, }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState(null);
    useEffect(() => {
        const currentUser = getUser();
        if (!currentUser || currentUser.role !== "travel_partner") {
            router.replace("/partner/login");
            return;
        }
        setUser(currentUser);
    }, [router]);
    const handleLogout = () => {
        clearSession();
        router.push("/partner/login");
    };
    return (<div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 border-r border-border bg-sidebar">
        <div className="p-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-chart-3 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground"/>
            </div>
            <div>
              <span className="text-xl font-bold text-foreground">SafeRoute</span>
              <p className="text-xs text-muted-foreground">Travel Partner</p>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (<Link key={item.href} href={item.href} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200", isActive
                    ? "bg-chart-3 text-primary-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")}>
                <item.icon className="w-5 h-5"/>
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto"/>}
              </Link>);
        })}
        </nav>
        
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/50">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-chart-3 to-chart-4 flex items-center justify-center text-primary-foreground font-semibold">
              RK
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "Partner"}</p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user?.company_name || "Travel Partner"}</p>
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
                  <div className="w-10 h-10 rounded-xl bg-chart-3 flex items-center justify-center">
                    <Car className="w-5 h-5 text-primary-foreground"/>
                  </div>
                  <span className="text-xl font-bold text-foreground">SafeRoute</span>
                </Link>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-lg hover:bg-sidebar-accent">
                  <X className="w-5 h-5"/>
                </button>
              </div>
              
              <nav className="p-4 space-y-2">
                {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (<Link key={item.href} href={item.href} onClick={() => setIsSidebarOpen(false)} className={cn("flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200", isActive
                        ? "bg-chart-3 text-primary-foreground"
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
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between p-4 border-b border-border bg-background/95 backdrop-blur-sm">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-lg hover:bg-secondary">
            <Menu className="w-6 h-6"/>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-chart-3 flex items-center justify-center">
              <Car className="w-4 h-4 text-primary-foreground"/>
            </div>
            <span className="font-bold">SafeRoute</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-chart-3 to-chart-4 flex items-center justify-center text-primary-foreground font-semibold text-sm">
            RK
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>);
}

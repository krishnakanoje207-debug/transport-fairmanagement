"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Bus,
  MapPin,
  CreditCard,
  AlertTriangle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  BarChart3,
  Route,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const adminNavItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard/admin" },
  { icon: Users, label: "Users", href: "/dashboard/admin/users" },
  { icon: Building2, label: "Partners", href: "/dashboard/admin/partners" },
  { icon: Bus, label: "Vehicles", href: "/dashboard/admin/vehicles" },
  { icon: Route, label: "Routes", href: "/dashboard/admin/routes" },
  { icon: MapPin, label: "Stops", href: "/dashboard/admin/stops" },
  { icon: CreditCard, label: "Transactions", href: "/dashboard/admin/transactions" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/admin/analytics" },
  { icon: AlertTriangle, label: "SOS Alerts", href: "/dashboard/admin/alerts" },
  { icon: Settings, label: "Settings", href: "/dashboard/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-full bg-card border-r border-border z-50 flex flex-col"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <span className="font-bold text-lg gradient-text">SafeRoute</span>
                  <span className="text-xs text-destructive font-medium ml-2 px-1.5 py-0.5 bg-destructive/10 rounded">
                    ADMIN
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <TooltipProvider delayDuration={0}>
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="admin-nav-indicator"
                            className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                          />
                        )}
                        <item.icon className={cn("w-5 h-5 shrink-0", collapsed && "mx-auto")} />
                        <AnimatePresence mode="wait">
                          {!collapsed && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              className="font-medium whitespace-nowrap"
                            >
                              {item.label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </Link>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </nav>
        </TooltipProvider>

        {/* Admin Profile */}
        <div className="border-t border-border p-4">
          <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
            <Avatar className="h-10 w-10 ring-2 ring-primary/50">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className="bg-primary/20 text-primary font-bold">SA</AvatarFallback>
            </Avatar>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="font-medium text-sm truncate">Super Admin</p>
                  <p className="text-xs text-muted-foreground truncate">admin@saferoute.com</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <Link href="/login">
                <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300",
          collapsed ? "ml-20" : "ml-[280px]"
        )}
      >
        {children}
      </main>
    </div>
  );
}

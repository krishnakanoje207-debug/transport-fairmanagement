"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { Users, User, Car, Settings, MapPin, Shield, CreditCard, QrCode, Navigation, Bell, BarChart3, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";
const roles = [
    {
        id: "guardian",
        icon: Users,
        title: "Guardian",
        subtitle: "Parents & Caretakers",
        description: "Monitor your loved ones in real-time, manage linked users, and receive instant alerts for complete peace of mind.",
        color: "oklch(0.65 0.2 25)",
        features: [
            { icon: MapPin, label: "Live GPS Tracking" },
            { icon: Shield, label: "SOS Alert Reception" },
            { icon: CreditCard, label: "Funds Management" },
            { icon: Bell, label: "Trip Notifications" },
        ],
        mockup: (<div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary"/>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Alex&apos;s Trip</p>
            <p className="text-xs text-muted-foreground">En route to School</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">Live</span>
        </div>
        <div className="h-40 rounded-xl bg-secondary/50 overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-4 h-4 rounded-full bg-primary animate-pulse"/>
          </div>
          <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: `
                linear-gradient(oklch(0.65 0.2 25 / 0.2) 1px, transparent 1px),
                linear-gradient(90deg, oklch(0.65 0.2 25 / 0.2) 1px, transparent 1px)
              `,
                backgroundSize: '20px 20px',
            }}/>
        </div>
      </div>),
    },
    {
        id: "linked",
        icon: User,
        title: "Linked User",
        subtitle: "Passengers & Travelers",
        description: "Enjoy seamless boarding with QR codes, track your journey progress, and stay connected with your guardians.",
        color: "oklch(0.55 0.15 200)",
        features: [
            { icon: QrCode, label: "QR Code Boarding" },
            { icon: Navigation, label: "Journey Tracking" },
            { icon: Shield, label: "One-Tap SOS" },
            { icon: MapPin, label: "Location Sharing" },
        ],
        mockup: (<div className="space-y-4">
        <div className="flex justify-center">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }} className="w-32 h-32 rounded-2xl bg-foreground p-2">
            <div className="w-full h-full rounded-xl bg-background flex items-center justify-center">
              <QrCode className="w-16 h-16 text-accent"/>
            </div>
          </motion.div>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Show this QR to board
        </p>
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
          <span className="text-xs text-muted-foreground">Valid until 6:00 PM</span>
        </div>
      </div>),
    },
    {
        id: "partner",
        icon: Car,
        title: "Travel Partner",
        subtitle: "Drivers & Operators",
        description: "Manage your routes efficiently, verify passengers with QR scanning, and broadcast your location in real-time.",
        color: "oklch(0.8 0.18 85)",
        features: [
            { icon: Navigation, label: "Route Management" },
            { icon: QrCode, label: "QR Verification" },
            { icon: MapPin, label: "GPS Broadcasting" },
            { icon: Users, label: "Passenger Manifest" },
        ],
        mockup: (<div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
          <div>
            <p className="text-sm font-medium text-foreground">Route #127</p>
            <p className="text-xs text-muted-foreground">Downtown Express</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">Active</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-xl bg-primary/10">
            <p className="text-lg font-bold text-primary">12</p>
            <p className="text-xs text-muted-foreground">Passengers</p>
          </div>
          <div className="p-3 rounded-xl bg-accent/10">
            <p className="text-lg font-bold text-accent">4.2</p>
            <p className="text-xs text-muted-foreground">km Left</p>
          </div>
          <div className="p-3 rounded-xl bg-chart-3/10">
            <p className="text-lg font-bold text-chart-3">15</p>
            <p className="text-xs text-muted-foreground">min ETA</p>
          </div>
        </div>
      </div>),
    },
    {
        id: "admin",
        icon: Settings,
        title: "Admin",
        subtitle: "System Administrators",
        description: "Full platform oversight with analytics dashboards, user management, and dynamic fare configuration.",
        color: "oklch(0.6 0.2 145)",
        features: [
            { icon: BarChart3, label: "Analytics Dashboard" },
            { icon: UserCog, label: "User Management" },
            { icon: CreditCard, label: "Fare Configuration" },
            { icon: Bell, label: "System Alerts" },
        ],
        mockup: (<div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-xl bg-primary/10">
            <p className="text-xs text-muted-foreground">Total Users</p>
            <p className="text-lg font-bold text-primary">52,847</p>
          </div>
          <div className="p-3 rounded-xl bg-accent/10">
            <p className="text-xs text-muted-foreground">Active Trips</p>
            <p className="text-lg font-bold text-accent">1,284</p>
          </div>
        </div>
        <div className="h-24 rounded-xl bg-secondary/30 flex items-end justify-around p-2 gap-1">
          {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (<motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.5, delay: i * 0.1 }} className="w-full bg-gradient-to-t from-primary to-accent rounded-t-sm"/>))}
        </div>
      </div>),
    },
];
export function RolesSection() {
    const [activeRole, setActiveRole] = useState(roles[0]);
    return (<section id="roles" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/20 via-background to-background"/>
      
      <div className="container px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-primary mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"/>
              Role-Based Access
            </span>
          </motion.div>
          
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            One Platform,{" "}
            <span className="gradient-text">Four Powerful Roles</span>
          </motion.h2>
          
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-lg text-muted-foreground">
            Each user type gets a tailored experience designed specifically for their needs
          </motion.p>
        </div>
        
        {/* Role Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-3 mb-12">
          {roles.map((role) => (<button key={role.id} onClick={() => setActiveRole(role)} className={cn("flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300", activeRole.id === role.id
                ? "bg-primary text-primary-foreground shadow-lg"
                : "glass-card text-muted-foreground hover:text-foreground hover:border-primary/30")}>
              <role.icon className="w-5 h-5"/>
              {role.title}
            </button>))}
        </motion.div>
        
        {/* Active Role Content */}
        <motion.div key={activeRole.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Details */}
          <div className="order-2 lg:order-1">
            <div className="flex items-center gap-4 mb-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${activeRole.color}20` }}>
                <activeRole.icon className="w-8 h-8" style={{ color: activeRole.color }}/>
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">{activeRole.title}</h3>
                <p className="text-muted-foreground">{activeRole.subtitle}</p>
              </div>
            </div>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {activeRole.description}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {activeRole.features.map((feature, i) => (<motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3 p-4 rounded-xl glass-card">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${activeRole.color}20` }}>
                    <feature.icon className="w-5 h-5" style={{ color: activeRole.color }}/>
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature.label}</span>
                </motion.div>))}
            </div>
          </div>
          
          {/* Right - Mockup */}
          <div className="order-1 lg:order-2">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="glass-card rounded-3xl p-6 max-w-sm mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/50"/>
                  <div className="w-3 h-3 rounded-full bg-chart-3/50"/>
                  <div className="w-3 h-3 rounded-full bg-chart-4/50"/>
                </div>
                <span className="text-xs text-muted-foreground">SafeRoute</span>
              </div>
              {activeRole.mockup}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>);
}

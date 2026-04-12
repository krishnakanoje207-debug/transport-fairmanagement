"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Bus,
  CreditCard,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Activity,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Route,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock data
const statsData = [
  {
    title: "Total Users",
    value: "12,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "from-primary to-orange-400",
  },
  {
    title: "Active Vehicles",
    value: "342",
    change: "+8.2%",
    trend: "up",
    icon: Bus,
    color: "from-accent to-cyan-400",
  },
  {
    title: "Revenue (MTD)",
    value: "$284,590",
    change: "+23.1%",
    trend: "up",
    icon: CreditCard,
    color: "from-green-500 to-emerald-400",
  },
  {
    title: "SOS Alerts",
    value: "7",
    change: "-45%",
    trend: "down",
    icon: AlertTriangle,
    color: "from-red-500 to-orange-400",
  },
];

const revenueData = [
  { name: "Jan", revenue: 45000, trips: 12000 },
  { name: "Feb", revenue: 52000, trips: 14500 },
  { name: "Mar", revenue: 48000, trips: 13200 },
  { name: "Apr", revenue: 61000, trips: 16800 },
  { name: "May", revenue: 55000, trips: 15100 },
  { name: "Jun", revenue: 67000, trips: 18200 },
  { name: "Jul", revenue: 72000, trips: 19500 },
];

const userTypeData = [
  { name: "Guardians", value: 5420, color: "#f97316" },
  { name: "Linked Users", value: 4230, color: "#06b6d4" },
  { name: "Travel Partners", value: 2890, color: "#10b981" },
  { name: "Drivers", value: 307, color: "#8b5cf6" },
];

const routePerformance = [
  { route: "Route A1", trips: 1250, rating: 4.8 },
  { route: "Route B3", trips: 980, rating: 4.6 },
  { route: "Route C2", trips: 870, rating: 4.9 },
  { route: "Route D5", trips: 750, rating: 4.4 },
  { route: "Route E1", trips: 620, rating: 4.7 },
];

const recentAlerts = [
  { id: 1, type: "SOS", user: "John Doe", location: "Downtown Station", time: "2 min ago", status: "active" },
  { id: 2, type: "Deviation", user: "Bus #127", location: "Route B3", time: "15 min ago", status: "resolved" },
  { id: 3, type: "Delay", user: "Bus #089", location: "Route A1", time: "32 min ago", status: "monitoring" },
];

const pendingApprovals = [
  { id: 1, name: "Metro Transit Co.", type: "Travel Partner", docs: 5, submitted: "2 days ago" },
  { id: 2, name: "City Express", type: "Travel Partner", docs: 4, submitted: "3 days ago" },
  { id: 3, name: "SafeRide Inc.", type: "Travel Partner", docs: 6, submitted: "5 days ago" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
  const [liveStats, setLiveStats] = useState({
    activeTrips: 127,
    onlineDrivers: 89,
    avgWaitTime: 4.2,
  });

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats({
        activeTrips: 120 + Math.floor(Math.random() * 20),
        onlineDrivers: 85 + Math.floor(Math.random() * 10),
        avgWaitTime: (4 + Math.random()).toFixed(1) as unknown as number,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold"
          >
            Admin Dashboard
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            System overview and management controls
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-500 font-medium">System Online</span>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            <Clock className="w-3 h-3 mr-1" />
            Last sync: Just now
          </Badge>
        </div>
      </div>

      {/* Live Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Active Trips</p>
              <p className="text-xl font-bold">{liveStats.activeTrips}</p>
            </div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Online Drivers</p>
              <p className="text-xl font-bold">{liveStats.onlineDrivers}</p>
            </div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Wait Time</p>
              <p className="text-xl font-bold">{liveStats.avgWaitTime} min</p>
            </div>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <MapPin className="w-4 h-4" />
          View Live Map
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statsData.map((stat, index) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="glass-card border-border/50 overflow-hidden group hover:border-primary/30 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                    <div className={`flex items-center gap-1 mt-2 ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                      {stat.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{stat.change}</span>
                      <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Revenue & Trips Overview
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">Revenue</Badge>
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">Trips</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.65 0.2 25)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="oklch(0.65 0.2 25)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.55 0.15 200)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="oklch(0.55 0.15 200)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.03 260)" />
                    <XAxis dataKey="name" stroke="oklch(0.6 0.02 260)" />
                    <YAxis stroke="oklch(0.6 0.02 260)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.16 0.02 260)",
                        border: "1px solid oklch(0.25 0.03 260)",
                        borderRadius: "8px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="oklch(0.65 0.2 25)"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="trips"
                      stroke="oklch(0.55 0.15 200)"
                      fillOpacity={1}
                      fill="url(#colorTrips)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-border/50 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                User Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {userTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(0.16 0.02 260)",
                        border: "1px solid oklch(0.25 0.03 260)",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {userTypeData.map((type) => (
                  <div key={type.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: type.color }} />
                    <span className="text-xs text-muted-foreground">{type.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Recent Alerts
              </CardTitle>
              <Button variant="ghost" size="sm">View All</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    alert.status === "active" ? "bg-red-500/20" : 
                    alert.status === "resolved" ? "bg-green-500/20" : "bg-yellow-500/20"
                  }`}>
                    {alert.status === "active" ? (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    ) : alert.status === "resolved" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Activity className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{alert.type}</span>
                      <Badge variant="outline" className="text-xs">
                        {alert.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {alert.user} - {alert.location}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{alert.time}</span>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Route Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Route className="w-5 h-5 text-primary" />
                Top Routes
              </CardTitle>
              <Button variant="ghost" size="sm">Manage</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {routePerformance.map((route, index) => (
                <div key={route.route} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="font-medium text-sm">{route.route}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{route.trips} trips</span>
                      <Badge variant="outline" className="text-xs">
                        {route.rating}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={(route.trips / 1250) * 100} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-accent" />
                Pending Approvals
              </CardTitle>
              <Badge className="bg-primary/20 text-primary">{pendingApprovals.length} New</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingApprovals.map((approval) => (
                <motion.div
                  key={approval.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-accent/20 text-accent text-xs">
                          {approval.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{approval.name}</p>
                        <p className="text-xs text-muted-foreground">{approval.type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {approval.docs} documents - {approval.submitted}
                    </span>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-green-500 hover:bg-green-500/10">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-red-500 hover:bg-red-500/10">
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

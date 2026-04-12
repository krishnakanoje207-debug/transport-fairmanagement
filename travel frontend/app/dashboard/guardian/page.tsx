"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Users, 
  Clock, 
  Shield, 
  AlertTriangle,
  ChevronRight,
  Navigation,
  Phone,
  MessageSquare,
  TrendingUp,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LiveMapView } from "@/components/dashboard/live-map-view";
import { TripCard } from "@/components/dashboard/trip-card";
import { LinkedUserCard } from "@/components/dashboard/linked-user-card";

// Mock data for linked users
const linkedUsers = [
  {
    id: "1",
    name: "Alex Johnson",
    avatar: "AJ",
    status: "traveling",
    currentTrip: {
      origin: "Home",
      destination: "Central School",
      eta: "12 min",
      progress: 65,
    },
    lastSeen: "Just now",
  },
  {
    id: "2",
    name: "Emma Johnson",
    avatar: "EJ",
    status: "arrived",
    currentTrip: null,
    lastLocation: "Dance Academy",
    lastSeen: "2 min ago",
  },
  {
    id: "3",
    name: "Mike Johnson",
    avatar: "MJ",
    status: "offline",
    currentTrip: null,
    lastLocation: "Office",
    lastSeen: "1 hour ago",
  },
];

const recentActivity = [
  { type: "arrival", user: "Alex", location: "School", time: "8:45 AM" },
  { type: "departure", user: "Emma", location: "Home", time: "8:30 AM" },
  { type: "sos_resolved", user: "Alex", time: "Yesterday" },
  { type: "arrival", user: "Mike", location: "Office", time: "Yesterday" },
];

const stats = [
  { label: "Linked Users", value: "3", icon: Users, color: "text-primary" },
  { label: "Active Trips", value: "1", icon: Navigation, color: "text-accent" },
  { label: "Total Trips", value: "247", icon: MapPin, color: "text-chart-3" },
  { label: "Safety Score", value: "98%", icon: Shield, color: "text-chart-4" },
];

export default function GuardianDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, <span className="gradient-text">John</span>
          </h1>
          <p className="text-muted-foreground">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Button variant="outline" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Messages
          </Button>
          <Button className="bg-primary gap-2">
            <Users className="w-4 h-4" />
            Add User
          </Button>
        </motion.div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card border-border overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Tracking
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                Fullscreen
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <LiveMapView />
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Active Trip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-border h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Active Trip
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TripCard user={linkedUsers[0]} />
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Linked Users & Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Linked Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Linked Users</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {linkedUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <LinkedUserCard user={user} />
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === "arrival" 
                        ? "bg-green-500/20 text-green-500" 
                        : activity.type === "departure"
                        ? "bg-primary/20 text-primary"
                        : "bg-chart-3/20 text-chart-3"
                    }`}>
                      {activity.type === "arrival" && <MapPin className="w-5 h-5" />}
                      {activity.type === "departure" && <Navigation className="w-5 h-5" />}
                      {activity.type === "sos_resolved" && <Shield className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.type === "arrival" && `${activity.user} arrived at ${activity.location}`}
                        {activity.type === "departure" && `${activity.user} left ${activity.location}`}
                        {activity.type === "sos_resolved" && `SOS resolved for ${activity.user}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* SOS Alert Banner (conditionally shown) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="hidden" // Change to "block" to show
      >
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">SOS Alert Active</p>
                <p className="text-sm text-muted-foreground">Alex triggered an SOS 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Phone className="w-4 h-4" />
                Call
              </Button>
              <Button className="bg-destructive hover:bg-destructive/90 gap-2">
                View Location
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

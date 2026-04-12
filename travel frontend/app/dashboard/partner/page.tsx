"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Navigation, 
  Users, 
  Clock, 
  MapPin,
  QrCode,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Zap,
  TrendingUp,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const passengers = [
  { id: "1", name: "Alex J.", avatar: "AJ", boardedAt: "8:15 AM", destination: "Central School" },
  { id: "2", name: "Emma W.", avatar: "EW", boardedAt: "8:22 AM", destination: "Tech Park" },
  { id: "3", name: "Mike R.", avatar: "MR", boardedAt: "8:30 AM", destination: "Downtown" },
];

const upcomingStops = [
  { name: "Green Valley", eta: "3 min", passengers: 2 },
  { name: "Tech Park", eta: "8 min", passengers: 1 },
  { name: "Central School", eta: "15 min", passengers: 1 },
];

const stats = [
  { label: "Current Passengers", value: "12", icon: Users, color: "text-primary" },
  { label: "Completed Stops", value: "5", icon: CheckCircle2, color: "text-green-500" },
  { label: "Remaining Stops", value: "8", icon: MapPin, color: "text-accent" },
  { label: "Today's Earnings", value: "$127", icon: Wallet, color: "text-chart-3" },
];

export default function PartnerDashboard() {
  const [isRouteActive, setIsRouteActive] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [broadcastLocation, setBroadcastLocation] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${isRouteActive ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
            <span className={`text-sm font-medium ${isRouteActive ? "text-green-500" : "text-muted-foreground"}`}>
              {isRouteActive ? "Route Active" : "Route Paused"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Route <span className="gradient-text">#127</span> - Downtown Express
          </h1>
          <p className="text-muted-foreground">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <Button
            variant={broadcastLocation ? "default" : "outline"}
            className={broadcastLocation ? "bg-green-600 hover:bg-green-700" : ""}
            onClick={() => setBroadcastLocation(!broadcastLocation)}
          >
            <Zap className="w-4 h-4 mr-2" />
            {broadcastLocation ? "Broadcasting" : "Start Broadcast"}
          </Button>
          <Button
            variant={isRouteActive ? "destructive" : "default"}
            onClick={() => setIsRouteActive(!isRouteActive)}
          >
            {isRouteActive ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause Route
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Route
              </>
            )}
          </Button>
        </motion.div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card border-border hover:border-chart-3/30 transition-colors">
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
      
      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* QR Scanner Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card border-border h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <QrCode className="w-5 h-5 text-chart-3" />
                QR Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-40 h-40 rounded-3xl bg-chart-3/10 border-2 border-dashed border-chart-3/30 flex items-center justify-center mb-6"
              >
                <QrCode className="w-16 h-16 text-chart-3" />
              </motion.div>
              <Button className="w-full bg-chart-3 hover:bg-chart-3/90 text-primary-foreground">
                <QrCode className="w-4 h-4 mr-2" />
                Open Scanner
              </Button>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Scan passenger QR codes for boarding verification
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Upcoming Stops */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card border-border h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Navigation className="w-5 h-5 text-accent" />
                Upcoming Stops
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingStops.map((stop, index) => (
                <motion.div
                  key={stop.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                    index === 0 ? "bg-accent/10 border border-accent/30" : "bg-secondary/30"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index === 0 ? "bg-accent text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                    {index === 0 ? (
                      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                        <Navigation className="w-5 h-5" />
                      </motion.div>
                    ) : (
                      <MapPin className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{stop.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {stop.passengers} passenger{stop.passengers > 1 ? "s" : ""} alighting
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${index === 0 ? "text-accent" : "text-muted-foreground"}`}>
                      {stop.eta}
                    </p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Current Passengers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card border-border h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Onboard Passengers
              </CardTitle>
              <span className="text-sm text-muted-foreground">12 total</span>
            </CardHeader>
            <CardContent className="space-y-3">
              {passengers.map((passenger, index) => (
                <motion.div
                  key={passenger.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {passenger.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{passenger.name}</p>
                    <p className="text-xs text-muted-foreground">To {passenger.destination}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Boarded</p>
                    <p className="text-sm text-foreground">{passenger.boardedAt}</p>
                  </div>
                </motion.div>
              ))}
              <Button variant="ghost" className="w-full text-muted-foreground">
                View all 12 passengers
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Route Progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-chart-3" />
              Route Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold text-chart-3">38%</span>
                </div>
                <div className="h-3 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "38%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-to-r from-chart-3 to-chart-4"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-xs text-muted-foreground">Stops Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-xs text-muted-foreground">Stops Remaining</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">45 min</p>
                <p className="text-xs text-muted-foreground">Est. Completion</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">12.4 km</p>
                <p className="text-xs text-muted-foreground">Distance Left</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

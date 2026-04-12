"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Navigation,
  MapPin,
  Clock,
  CreditCard,
  QrCode,
  AlertTriangle,
  Phone,
  Route,
  Bus,
  CheckCircle2,
  History,
  Wallet,
  Bell,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const upcomingTrip = {
  id: 1,
  route: "Route A1 - Downtown Express",
  vehicle: "Bus #127",
  departure: "10:30 AM",
  arrival: "11:15 AM",
  stops: ["Central Station", "Market St", "City Hall", "Downtown Hub"],
  fare: 4.50,
  status: "boarding_soon",
};

const recentTrips = [
  { id: 1, route: "Route B3", date: "Today, 8:30 AM", fare: 3.50, status: "completed" },
  { id: 2, route: "Route A1", date: "Yesterday, 5:45 PM", fare: 4.50, status: "completed" },
  { id: 3, route: "Route C2", date: "Apr 10, 2:00 PM", fare: 5.00, status: "completed" },
];

const notifications = [
  { id: 1, type: "delay", message: "Route B3 delayed by 10 minutes", time: "5 min ago" },
  { id: 2, type: "promo", message: "Get 20% off your next 5 rides!", time: "2 hours ago" },
  { id: 3, type: "reminder", message: "Your bus arrives in 15 minutes", time: "3 hours ago" },
];

export default function LinkedUserDashboard() {
  const [currentLocation, setCurrentLocation] = useState("Updating...");
  const [sharingLocation, setSharingLocation] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCurrentLocation("Central Station, Platform 3");
    }, 1500);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">My Journey</h1>
              <p className="text-xs text-muted-foreground">{currentLocation}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <Button 
              variant={sharingLocation ? "default" : "outline"} 
              size="sm"
              onClick={() => setSharingLocation(!sharingLocation)}
              className={sharingLocation ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <MapPin className="w-4 h-4 mr-1" />
              {sharingLocation ? "Live" : "Share"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Location Sharing Status */}
        {sharingLocation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20"
          >
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-500">Location sharing active</p>
              <p className="text-xs text-muted-foreground">Your guardian can see your location</p>
            </div>
            <Badge variant="outline" className="border-green-500/30 text-green-500">
              Live
            </Badge>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: QrCode, label: "Board", color: "bg-primary/20 text-primary" },
            { icon: Route, label: "Routes", color: "bg-accent/20 text-accent" },
            { icon: AlertTriangle, label: "SOS", color: "bg-red-500/20 text-red-500" },
            { icon: Phone, label: "Support", color: "bg-green-500/20 text-green-500" },
          ].map((action) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 p-4 rounded-xl glass-card"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}>
                <action.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Upcoming Trip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-primary/30 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Upcoming Trip</CardTitle>
                <Badge className="bg-primary/20 text-primary animate-pulse">Boarding Soon</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Bus className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{upcomingTrip.route}</p>
                  <p className="text-sm text-muted-foreground">{upcomingTrip.vehicle}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{upcomingTrip.departure}</p>
                  <p className="text-xs text-muted-foreground">Departure</p>
                </div>
              </div>

              {/* Route Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Journey Progress</span>
                  <span className="font-medium">Stop 1 of {upcomingTrip.stops.length}</span>
                </div>
                <div className="relative">
                  <Progress value={25} className="h-2" />
                  <div className="flex justify-between mt-2">
                    {upcomingTrip.stops.map((stop, i) => (
                      <div key={stop} className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-primary" : "bg-border"}`} />
                        <span className="text-[10px] text-muted-foreground mt-1 max-w-12 text-center truncate">
                          {stop.split(" ")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-primary hover:bg-primary/90">
                  <QrCode className="w-4 h-4 mr-2" />
                  Show Boarding QR
                </Button>
                <Button variant="outline" className="flex-1">
                  <Navigation className="w-4 h-4 mr-2" />
                  Navigate
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Balance & Recent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Wallet Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-border/50 h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-green-500" />
                  </div>
                  <Button variant="outline" size="sm">
                    Top Up
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <p className="text-3xl font-bold mt-1">$47.50</p>
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <CreditCard className="w-4 h-4" />
                  <span>Next trip: ${upcomingTrip.fare.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-card border-border/50 h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-accent" />
                  <span className="font-medium">This Month</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold">23</p>
                    <p className="text-sm text-muted-foreground">Trips Taken</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">$89.50</p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">18.5h</p>
                    <p className="text-sm text-muted-foreground">Travel Time</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">4.9</p>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Trips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Trips</CardTitle>
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentTrips.map((trip) => (
                <motion.div
                  key={trip.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Bus className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{trip.route}</p>
                    <p className="text-sm text-muted-foreground">{trip.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${trip.fare.toFixed(2)}</p>
                    <div className="flex items-center gap-1 text-xs text-green-500">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* SOS Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 right-6"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-500 shadow-lg shadow-red-500/30 flex items-center justify-center group"
          >
            <AlertTriangle className="w-7 h-7 text-white group-hover:animate-bounce" />
          </motion.button>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Emergency SOS
          </span>
        </motion.div>
      </main>
    </div>
  );
}

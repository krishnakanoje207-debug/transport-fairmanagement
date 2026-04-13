"use client";
import { motion } from "framer-motion";
import { Navigation, Clock, Phone, MessageSquare, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
export function TripCard({ user }) {
    if (!user.currentTrip) {
        return (<div className="text-center py-8 text-muted-foreground">
        <Navigation className="w-12 h-12 mx-auto mb-3 opacity-50"/>
        <p>No active trips</p>
      </div>);
    }
    return (<div className="space-y-6">
      {/* User info */}
      <div className="flex items-center gap-4">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
            {user.avatar}
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"/>
          </div>
        </motion.div>
        <div>
          <p className="font-semibold text-foreground text-lg">{user.name}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500"/>
            Traveling
          </p>
        </div>
      </div>
      
      {/* Route info */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-primary"/>
            <div className="w-px h-8 bg-border"/>
            <div className="w-3 h-3 rounded-full bg-accent"/>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">From</p>
              <p className="font-medium text-foreground">{user.currentTrip.origin}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">To</p>
              <p className="font-medium text-foreground">{user.currentTrip.destination}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Trip Progress</span>
          <span className="font-semibold text-primary">{user.currentTrip.progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${user.currentTrip.progress}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-primary to-accent"/>
        </div>
      </div>
      
      {/* ETA */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-accent"/>
          <div>
            <p className="text-xs text-muted-foreground">Estimated Arrival</p>
            <p className="font-semibold text-foreground">{user.currentTrip.eta}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Last updated</p>
          <p className="text-sm text-foreground">{user.lastSeen}</p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1 gap-2">
          <Phone className="w-4 h-4"/>
          Call
        </Button>
        <Button variant="outline" className="flex-1 gap-2">
          <MessageSquare className="w-4 h-4"/>
          Message
        </Button>
        <Button variant="destructive" size="icon" className="shrink-0">
          <AlertTriangle className="w-4 h-4"/>
        </Button>
      </div>
    </div>);
}

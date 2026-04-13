"use client";
import { motion } from "framer-motion";
import { MapPin, Navigation, Phone, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
const statusConfig = {
    traveling: {
        label: "Traveling",
        color: "bg-primary",
        textColor: "text-primary",
        bgColor: "bg-primary/10",
    },
    arrived: {
        label: "Arrived",
        color: "bg-green-500",
        textColor: "text-green-500",
        bgColor: "bg-green-500/10",
    },
    offline: {
        label: "Offline",
        color: "bg-muted-foreground",
        textColor: "text-muted-foreground",
        bgColor: "bg-muted",
    },
};
export function LinkedUserCard({ user }) {
    const status = statusConfig[user.status];
    return (<motion.div whileHover={{ scale: 1.01 }} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group">
      {/* Avatar */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
          {user.avatar}
        </div>
        <div className={cn("absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background", status.color)}>
          {user.status === "traveling" && (<motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-full h-full rounded-full bg-primary"/>)}
        </div>
      </div>
      
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground truncate">{user.name}</p>
          <span className={cn("text-xs px-2 py-0.5 rounded-full", status.bgColor, status.textColor)}>
            {status.label}
          </span>
        </div>
        
        <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
          {user.currentTrip ? (<>
              <Navigation className="w-3 h-3"/>
              <span className="truncate">
                To {user.currentTrip.destination} - {user.currentTrip.eta}
              </span>
            </>) : (<>
              <MapPin className="w-3 h-3"/>
              <span className="truncate">{user.lastLocation || "Unknown"}</span>
            </>)}
        </div>
      </div>
      
      {/* Progress bar for traveling */}
      {user.currentTrip && (<div className="hidden sm:block w-24">
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${user.currentTrip.progress}%` }} className="h-full rounded-full bg-gradient-to-r from-primary to-accent"/>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-1">
            {user.currentTrip.progress}%
          </p>
        </div>)}
      
      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Phone className="w-4 h-4"/>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="w-4 h-4"/>
        </Button>
      </div>
    </motion.div>);
}

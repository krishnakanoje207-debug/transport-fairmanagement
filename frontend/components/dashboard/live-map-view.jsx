"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Zap } from "lucide-react";
// Mock coordinates for animated vehicle
const routePoints = [
    { lat: 40.7128, lng: -74.006 },
    { lat: 40.7148, lng: -74.004 },
    { lat: 40.7168, lng: -74.002 },
    { lat: 40.7188, lng: -74.0 },
    { lat: 40.7208, lng: -73.998 },
];
export function LiveMapView({ liveLocation = null }) {
    const [vehiclePosition, setVehiclePosition] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setVehiclePosition((prev) => (prev + 1) % 100);
        }, 100);
        return () => clearInterval(interval);
    }, []);
    // Calculate position along path (0-100)
    const pathProgress = vehiclePosition;
    return (<div className="relative h-[400px] w-full bg-secondary/20 overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: `
            linear-gradient(oklch(0.65 0.2 25 / 0.3) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.65 0.2 25 / 0.3) 1px, transparent 1px)
          `,
            backgroundSize: '40px 40px',
        }}/>
      
      {/* Map visualization */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400">
        <defs>
          <linearGradient id="mapRouteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="oklch(0.65 0.2 25)" stopOpacity="0.3"/>
            <stop offset="50%" stopColor="oklch(0.55 0.15 200)" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="oklch(0.65 0.2 25)" stopOpacity="0.3"/>
          </linearGradient>
          <filter id="mapGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Road network */}
        <g opacity="0.2">
          <path d="M 0 200 L 800 200" stroke="oklch(0.5 0.02 260)" strokeWidth="2"/>
          <path d="M 0 100 L 800 100" stroke="oklch(0.5 0.02 260)" strokeWidth="1"/>
          <path d="M 0 300 L 800 300" stroke="oklch(0.5 0.02 260)" strokeWidth="1"/>
          <path d="M 200 0 L 200 400" stroke="oklch(0.5 0.02 260)" strokeWidth="1"/>
          <path d="M 400 0 L 400 400" stroke="oklch(0.5 0.02 260)" strokeWidth="2"/>
          <path d="M 600 0 L 600 400" stroke="oklch(0.5 0.02 260)" strokeWidth="1"/>
        </g>
        
        {/* Active route */}
        <motion.path d="M 100 320 Q 200 280 300 250 T 500 180 T 700 100" fill="none" stroke="url(#mapRouteGradient)" strokeWidth="6" strokeLinecap="round" filter="url(#mapGlow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }}/>
        
        {/* Route dashed line (traveled portion) */}
        <motion.path d="M 100 320 Q 200 280 300 250 T 500 180 T 700 100" fill="none" stroke="oklch(0.65 0.2 25)" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 4" initial={{ pathLength: 0 }} animate={{ pathLength: pathProgress / 100 }} transition={{ duration: 0.1 }}/>
        
        {/* Origin marker */}
        <g transform="translate(100, 320)">
          <circle r="12" fill="oklch(0.65 0.2 25)" opacity="0.3">
            <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle r="8" fill="oklch(0.65 0.2 25)"/>
          <circle r="4" fill="oklch(0.98 0.01 260)"/>
        </g>
        
        {/* Destination marker */}
        <g transform="translate(700, 100)">
          <circle r="12" fill="oklch(0.55 0.15 200)" opacity="0.3">
            <animate attributeName="r" values="12;20;12" dur="2s" repeatCount="indefinite"/>
          </circle>
          <circle r="8" fill="oklch(0.55 0.15 200)"/>
          <rect x="-4" y="-4" width="8" height="8" fill="oklch(0.98 0.01 260)" rx="1"/>
        </g>
        
        {/* Vehicle (animated along path) */}
        <motion.g initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: `${pathProgress}%` }} transition={{ duration: 0.1 }} style={{
            offsetPath: "path('M 100 320 Q 200 280 300 250 T 500 180 T 700 100')",
        }}>
          <circle r="20" fill="oklch(0.65 0.2 25)" opacity="0.2">
            <animate attributeName="r" values="20;30;20" dur="1.5s" repeatCount="indefinite"/>
          </circle>
          <circle r="14" fill="oklch(0.13 0.02 260)" stroke="oklch(0.65 0.2 25)" strokeWidth="3"/>
          <circle r="6" fill="oklch(0.65 0.2 25)"/>
        </motion.g>
      </svg>
      
      {/* Location labels */}
      <div className="absolute top-4 left-4 glass-card rounded-xl p-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary"/>
          <span className="text-sm font-medium text-foreground">Home</span>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 glass-card rounded-xl p-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent"/>
          <span className="text-sm font-medium text-foreground">Central School</span>
        </div>
      </div>
      
      {/* Status overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
        <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary"/>
          <span className="text-sm text-foreground">
            <span className="font-semibold">2.4 km</span>
            <span className="text-muted-foreground"> remaining</span>
          </span>
        </div>
        
        <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-chart-3"/>
          <span className="text-sm text-foreground">
            <span className="font-semibold">35 km/h</span>
          </span>
        </div>
        
        <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-accent"/>
          <span className="text-sm text-foreground">
            ETA: <span className="font-semibold">12 min</span>
          </span>
        </div>
      </div>
      {liveLocation && (<div className="absolute bottom-20 left-4 glass-card rounded-xl px-4 py-2 text-sm">
          Live: {liveLocation.latitude?.toFixed?.(5)}, {liveLocation.longitude?.toFixed?.(5)}
        </div>)}
    </div>);
}

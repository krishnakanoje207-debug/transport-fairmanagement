"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, Car, Bike, MapPin, Calendar, Clock, User, Navigation, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";

const transportModes = [
    {
        id: "bus",
        label: "Bus",
        icon: Bus,
        description: "Fixed route, scheduled departures",
        color: "oklch(0.55 0.15 200)",
        fields: ["drop"], // Bus only needs drop (fixed route pickup)
    },
    {
        id: "auto",
        label: "Auto",
        icon: Bike,
        description: "Door-to-door, flexible timing",
        color: "oklch(0.8 0.18 85)",
        fields: ["pickup", "drop"],
    },
    {
        id: "cab",
        label: "Cab",
        icon: Car,
        description: "Premium, comfortable ride",
        color: "oklch(0.65 0.2 25)",
        fields: ["pickup", "drop"],
    },
];

export default function ScheduleRidePage() {
    const router = useRouter();
    const [linkedUsers, setLinkedUsers] = useState([]);
    const [selectedMode, setSelectedMode] = useState(null);
    const [selectedUser, setSelectedUser] = useState("");
    const [pickup, setPickup] = useState("");
    const [drop, setDrop] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [busRoutes, setBusRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [linkedData, routesData] = await Promise.all([
                    apiRequest("/user/linked-users"),
                    apiRequest("/partner/available-routes").catch(() => ({ routes: [] })),
                ]);
                setLinkedUsers(linkedData?.linked_users || []);
                setBusRoutes(routesData?.routes || []);
            } catch { /* keep UI usable */ }
        };
        loadData();
    }, []);

    const currentMode = transportModes.find(m => m.id === selectedMode);
    const needsPickup = currentMode?.fields?.includes("pickup");
    const needsDrop = currentMode?.fields?.includes("drop");

    const handleConfirm = async () => {
        if (!selectedUser || !selectedMode || !drop || !date || !time) {
            setError("Please fill in all required fields.");
            return;
        }
        if (needsPickup && !pickup) {
            setError("Please enter pickup location.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // Create trip request via backend
            const tripData = {
                user_id: selectedUser,
                transport_type: selectedMode,
                pickup_location: needsPickup ? pickup : (selectedRoute || "Bus Stop"),
                drop_location: drop,
                scheduled_date: date,
                scheduled_time: time,
                route_id: selectedMode === "bus" ? selectedRoute : null,
            };

            const result = await apiRequest("/trip/request", {
                method: "POST",
                body: JSON.stringify(tripData),
            });

            // Navigate to payment page with trip info
            const tripId = result?.trip_id || result?.id || "new";
            const params = new URLSearchParams({
                trip_id: tripId,
                mode: selectedMode,
                pickup: needsPickup ? pickup : (selectedRoute || "Bus Stop"),
                drop: drop,
                user: linkedUsers.find(u => u.id === selectedUser)?.first_name || "User",
                date,
                time,
            });
            router.push(`/dashboard/guardian/payment?${params.toString()}`);
        } catch (err) {
            setError(err.message || "Failed to schedule ride.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <button onClick={() => router.push("/dashboard/guardian")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold">Schedule a Ride</h1>
                <p className="text-muted-foreground mt-1">Set up a journey for your linked user.</p>
            </motion.div>

            {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                </motion.div>
            )}

            {/* Step 1: Select User */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="glass-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                            </div>
                            Select Linked User
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="w-full p-3 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        >
                            <option value="">Choose a linked user...</option>
                            {linkedUsers.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.first_name} {u.last_name} ({u.relation || "User"})
                                </option>
                            ))}
                        </select>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Step 2: Transport Mode */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="glass-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                                <Navigation className="w-4 h-4 text-accent" />
                            </div>
                            Transportation Mode
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            {transportModes.map((mode) => (
                                <motion.button
                                    key={mode.id}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => {
                                        setSelectedMode(mode.id);
                                        setPickup("");
                                        setDrop("");
                                        setSelectedRoute("");
                                    }}
                                    className={`relative p-5 rounded-xl border text-center transition-all ${
                                        selectedMode === mode.id
                                            ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                                            : "border-border hover:border-primary/50 bg-secondary/30"
                                    }`}
                                >
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                                        selectedMode === mode.id ? "bg-primary" : "bg-secondary"
                                    }`}>
                                        <mode.icon className={`w-7 h-7 ${selectedMode === mode.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
                                    </div>
                                    <p className={`font-semibold ${selectedMode === mode.id ? "text-foreground" : "text-muted-foreground"}`}>
                                        {mode.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">{mode.description}</p>
                                    {selectedMode === mode.id && (
                                        <motion.div layoutId="modeIndicator" className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <ChevronRight className="w-3 h-3 text-primary-foreground" />
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Step 3: Location Details (conditional on mode) */}
            <AnimatePresence>
                {selectedMode && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="glass-card border-border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-chart-3/20 flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-chart-3" />
                                    </div>
                                    Route Details
                                    <Badge variant="outline" className="ml-auto">{currentMode?.label}</Badge>
                                </CardTitle>
                                <CardDescription>
                                    {selectedMode === "bus"
                                        ? "Bus has fixed pickup stops. Select your route and enter drop-off."
                                        : "Enter both pickup and drop-off addresses."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Bus Route Selector */}
                                {selectedMode === "bus" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Bus Route (Pickup Stop)</label>
                                        <select
                                            value={selectedRoute}
                                            onChange={(e) => setSelectedRoute(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value="">Select bus route...</option>
                                            {busRoutes.length > 0 ? busRoutes.map((r, i) => (
                                                <option key={r.id || i} value={r.route_name || r.id}>
                                                    {r.route_name} ({r.from_location} → {r.to_location})
                                                </option>
                                            )) : (
                                                <option value="Route-101">Route 101 - Downtown Express</option>
                                            )}
                                        </select>
                                    </div>
                                )}

                                {/* Pickup (only for auto/cab) */}
                                {needsPickup && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Pickup Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                            <Input
                                                value={pickup}
                                                onChange={(e) => setPickup(e.target.value)}
                                                placeholder="Enter pickup address"
                                                className="pl-10 bg-background/50 border-border"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Drop location (all modes) */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">Drop-off Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                                        <Input
                                            value={drop}
                                            onChange={(e) => setDrop(e.target.value)}
                                            placeholder="Enter drop-off address"
                                            className="pl-10 bg-background/50 border-border"
                                        />
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                type="date"
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                className="pl-10 bg-background/50 border-border"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                type="time"
                                                value={time}
                                                onChange={(e) => setTime(e.target.value)}
                                                className="pl-10 bg-background/50 border-border"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirm Button */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Button
                    onClick={handleConfirm}
                    disabled={isLoading || !selectedUser || !selectedMode || !drop}
                    className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                    {isLoading ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                    ) : (
                        <>Proceed to Payment <ChevronRight className="w-5 h-5 ml-2" /></>
                    )}
                </Button>
            </motion.div>
        </div>
    );
}

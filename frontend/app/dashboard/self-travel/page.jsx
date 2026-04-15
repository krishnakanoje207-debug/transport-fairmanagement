"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Navigation, MapPin, CreditCard, QrCode, AlertTriangle, Route, Bus, Wallet, Bell, ChevronRight, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function SelfTravelDashboard() {
    const [currentLocation, setCurrentLocation] = useState("Updating...");
    const [activeTrip, setActiveTrip] = useState(null);
    const [recentTrips, setRecentTrips] = useState([]);
    const [userStats, setUserStats] = useState({ total_trips: 0, total_fare: 0 });
    
    useEffect(() => {
        setTimeout(() => setCurrentLocation("Downtown Hub, Stop A"), 1500);
        const loadData = async () => {
            try {
                const [active, history, stats] = await Promise.all([
                    apiRequest("/trip/active"),
                    apiRequest("/trip/history?limit=3"),
                    apiRequest("/user/stats"),
                ]);
                setActiveTrip(active?.trip || null);
                setRecentTrips(history?.trips || []);
                setUserStats(stats || { total_trips: 0, total_fare: 0 });
            } catch (e) {
                // Ignore API load errors in demo state
            }
        };
        loadData();
    }, []);

    const handleSos = async () => {
        if (!activeTrip?.id) return alert("You are not in an active trip.");
        try {
            await apiRequest(`/trip/${activeTrip.id}/sos`, { method: "POST" });
            alert("SOS alert sent. Help is on the way.");
        } catch {
            alert("Failed to send SOS. Please dial emergency services directly.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-2xl font-bold">My Dashboard</h1>
                    <p className="text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-accent" /> {currentLocation}
                    </p>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                                <Route className="w-4 h-4" /> Book Ride
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-border sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Book a Self-Travel Ride</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Pickup Location</label>
                                    <Input placeholder="Current Location" className="bg-background"/>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Drop Location</label>
                                    <Input placeholder="Enter destination" className="bg-background"/>
                                </div>
                                <Button className="bg-primary w-full text-primary-foreground">Confirm & Pay</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-accent hover:bg-accent/90 text-primary-foreground gap-2">
                                <QrCode className="w-4 h-4" /> My Pass
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass-card border-border flex flex-col items-center py-12">
                            <div className="w-48 h-48 bg-white p-2 rounded-xl text-black flex items-center justify-center">
                                {/* Simulated QR Image */}
                                <QrCode className="w-32 h-32 text-black"/>
                            </div>
                            <p className="mt-4 font-mono text-center tracking-widest text-lg">TRIP-A89E-CC21</p>
                            <p className="text-sm text-muted-foreground mt-2">Scan at the vehicle terminal to board.</p>
                        </DialogContent>
                    </Dialog>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
                    <Card className="glass-card border-border overflow-hidden relative shadow-lg">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Bus className="w-32 h-32" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg flex justify-between items-center">
                                Active Journey
                                <Badge className="bg-green-500/20 text-green-500 font-medium animate-pulse">In Progress</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Vehicle</p>
                                    <p className="font-semibold text-lg">Express Bus #102</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">ETA to Destination</p>
                                    <p className="font-semibold text-lg text-accent">14 mins</p>
                                </div>
                            </div>
                            <div className="relative pt-6">
                                <Progress value={65} className="h-2" />
                                <div className="flex justify-between mt-2">
                                    <div className="text-xs text-muted-foreground text-left">
                                        <div className="w-3 h-3 bg-primary rounded-full mb-1" />
                                        Platform A
                                    </div>
                                    <div className="text-xs text-muted-foreground text-center">
                                        <div className="w-3 h-3 bg-primary rounded-full mb-1 mx-auto" />
                                        City Center
                                    </div>
                                    <div className="text-xs text-muted-foreground text-right">
                                        <div className="w-3 h-3 bg-border rounded-full mb-1 ml-auto" />
                                        Tech Park
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="glass-card border-border h-full flex flex-col items-center justify-center p-6 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <Wallet className="w-8 h-8 text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Available Balance</p>
                            <p className="text-4xl font-bold">Rs 450.00</p>
                        </div>
                        <Button variant="outline" className="w-full">Top Up Auto-Pass</Button>
                    </Card>
                </motion.div>
            </div>

            <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 gap-4">
                <h3 className="text-lg font-bold">Recent Trips</h3>
                <div className="grid md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((item, idx) => (
                        <motion.div key={idx} variants={item}>
                            <Card className="glass-card border-border hover:border-primary/50 transition-colors">
                                <CardContent className="p-4 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                        <div className="p-2 rounded-lg bg-secondary/50">
                                            <Bus className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <Badge variant="outline" className="text-green-500 border-green-500/20 bg-green-500/10">Completed</Badge>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Route E10 - Tech Park</p>
                                        <p className="text-sm text-muted-foreground">Yesterday, 5:30 PM</p>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-border/50">
                                        <span className="text-sm">Fare:</span>
                                        <span className="font-semibold text-primary">Rs 45.00</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="fixed bottom-6 right-6">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleSos} className="w-16 h-16 rounded-full bg-destructive shadow-lg shadow-destructive/30 flex items-center justify-center group z-50">
                    <AlertTriangle className="w-7 h-7 text-white group-hover:animate-bounce" />
                </motion.button>
            </motion.div>
        </div>
    );
}

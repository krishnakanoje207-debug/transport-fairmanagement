"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, Navigation, Users, Clock, Settings as SettingsIcon, MapPin, Play, Pause, CheckCircle2, AlertCircle, Building2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";

const TITLES = {
  route: { title: "Active Route", icon: Navigation, desc: "Manage your current active journey." },
  scanner: { title: "QR Scanner", icon: QrCode, desc: "Scan passenger boarding passes." },
  passengers: { title: "Passengers", icon: Users, desc: "Live manifest and passenger logs." },
  history: { title: "Trip History", icon: Clock, desc: "Past routes and revenue records." },
  settings: { title: "Settings", icon: SettingsIcon, desc: "Partner profile and preferences." },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function PartnerSectionPage() {
  const params = useParams();
  const section = params?.section || "route";
  const { title, icon: Icon, desc } = TITLES[section] || TITLES.route;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [scanToken, setScanToken] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [routeActive, setRouteActive] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMessage("");
      try {
        if (section === "route") {
          const routes = await apiRequest("/partner/routes");
          setData(routes?.routes || []);
        } else if (section === "passengers") {
          const stats = await apiRequest("/partner/stats");
          setData(stats || { active_trips: 0, completed_trips: 0, total_trips: 0 });
        } else if (section === "history") {
          const stats = await apiRequest("/partner/stats");
          setData(stats || { total_trips: 0, total_revenue: 0, total_routes: 0 });
        } else if (section === "settings") {
          const profile = await apiRequest("/partner/profile");
          setData(profile || { company_name: "Demo Transport", registration_number: "RT-890", contact_phone: "+1 234 567 890" });
        } else {
          setData(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [section]);

  const scanTrip = async () => {
    if (!scanToken) return;
    setIsScanning(true);
    setMessage("");
    try {
      await apiRequest(`/partner/scan-trip-qr?token=${encodeURIComponent(scanToken)}`, {
        method: "POST",
      });
      setMessage("Trip started successfully.");
      setScanToken("");
    } catch (err) {
      setMessage(err.message || "Failed to verify token");
    } finally {
      setTimeout(() => setIsScanning(false), 1000);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"/>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex flex-col items-center justify-center">
            <Icon className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{desc}</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-2">
             <CheckCircle2 className="w-5 h-5"/> {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR SCANNER SECTION */}
      {section === "scanner" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="glass-card border-border h-[500px] flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <QrCode className="w-64 h-64" />
              </div>
              <CardHeader>
                <CardTitle>Boarding Scanner</CardTitle>
                <CardDescription>Use physical scanner device or manual token entry.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center flex-1 space-y-8 z-10">
                <div className={`relative w-48 h-48 rounded-3xl border-4 flex items-center justify-center transition-colors duration-300 ${isScanning ? 'border-accent bg-accent/10' : 'border-dashed border-border'}`}>
                  <QrCode className={`w-20 h-20 transition-colors duration-300 ${isScanning ? 'text-accent animate-pulse' : 'text-muted-foreground'}`} />
                  {isScanning && (
                    <motion.div initial={{ top: 0 }} animate={{ top: "100%" }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-1 bg-accent shadow-[0_0_10px_2px_rgba(var(--accent),0.5)] z-20"/>
                  )}
                </div>
                
                <div className="w-full max-w-sm space-y-3">
                  <Input placeholder="Paste trip starting token manually" value={scanToken} onChange={(e) => setScanToken(e.target.value)} className="text-center font-mono tracking-widest text-lg py-6 bg-background/50 border-accent/20 focus-visible:ring-accent" />
                  <Button onClick={scanTrip} disabled={!scanToken || isScanning} className="w-full bg-accent hover:bg-accent/90 text-primary-foreground py-6 text-lg">
                    {isScanning ? "Verifying..." : "Scan & Verify Boarding"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <Card className="glass-card border-border h-full">
               <CardHeader>
                 <CardTitle>Recent Scans</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 {[1, 2, 3].map((_, i) => (
                   <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 border border-border/50">
                     <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                       <CheckCircle2 className="w-5 h-5 text-green-500" />
                     </div>
                     <div className="flex-1">
                       <p className="font-medium font-mono">TOKEN-X981-{i}A</p>
                       <p className="text-xs text-muted-foreground">Boarded at Central Hub</p>
                     </div>
                     <span className="text-xs text-muted-foreground">Just now</span>
                   </div>
                 ))}
               </CardContent>
             </Card>
          </motion.div>
        </div>
      )}

      {/* ROUTES SECTION */}
      {section === "route" && (
        <div className="space-y-6">
          <Card className="glass-card border-accent shadow-[0_0_20px_-5px_rgba(var(--accent),0.2)]">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <Badge className="bg-green-500/20 text-green-500 mb-2">{routeActive ? "Broadcasting Location" : "Standby Mode"}</Badge>
                  <h2 className="text-2xl font-bold">Route 101 - Downtown Express</h2>
                  <p className="text-muted-foreground">North Station to South Campus</p>
                </div>
                <Button size="lg" onClick={() => setRouteActive(!routeActive)} className={routeActive ? "bg-destructive hover:bg-destructive/90 text-white" : "bg-accent hover:bg-accent/90 text-primary-foreground"}>
                  {routeActive ? <><Pause className="w-5 h-5 mr-2" /> End Journey</> : <><Play className="w-5 h-5 mr-2" /> Start Broadcasting</>}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data && data.length > 0) ? data.map((r, i) => (
              <motion.div key={r.id || i} variants={item}>
                <Card className="glass-card border-border hover:border-accent/50 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{r.route_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" /> {r.from_location}
                    </div>
                    <div className="w-px h-4 bg-border ml-2" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" /> {r.to_location}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <Navigation className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No other routes assigned. Contact administrator.</p>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {/* PASSENGERS SECTION */}
      {section === "passengers" && (
        <div className="grid md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-1 space-y-4">
             <Card className="glass-card border-border text-center py-6">
               <h3 className="text-4xl font-bold text-accent">{data?.active_trips || 12}</h3>
               <p className="text-sm text-muted-foreground mt-1">Currently Onboard</p>
             </Card>
             <Card className="glass-card border-border text-center py-6">
               <h3 className="text-4xl font-bold">{data?.total_trips || 145}</h3>
               <p className="text-sm text-muted-foreground mt-1">Total Manifest</p>
             </Card>
             <Card className="glass-card border-border text-center py-6">
               <h3 className="text-4xl font-bold text-green-500">{data?.completed_trips || 133}</h3>
               <p className="text-sm text-muted-foreground mt-1">Alighted</p>
             </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-3">
             <Card className="glass-card border-border h-full">
               <CardHeader className="flex flex-row items-center justify-between">
                 <CardTitle>Live Manifest</CardTitle>
                 <Badge variant="outline">Auto-syncing...</Badge>
               </CardHeader>
               <CardContent>
                 <div className="space-y-2">
                   {[1,2,3,4,5].map((_, i) => (
                     <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-secondary/20 border border-border/50">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs">P{i}</div>
                         <div>
                           <p className="font-medium text-sm">Passenger #{9821 + i}</p>
                           <p className="text-xs text-muted-foreground">Dest: City Center</p>
                         </div>
                       </div>
                       <Badge className="bg-accent/10 border-accent/20 text-accent">Boarded</Badge>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
          </motion.div>
        </div>
      )}

      {/* SETTINGS SECTION */}
      {section === "settings" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
          <Card className="glass-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-6 pb-6 border-b border-border">
                <div className="w-20 h-20 rounded-2xl bg-secondary flex justify-center items-center">
                  <Building2 className="w-10 h-10 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{data?.company_name || "N/A"}</h2>
                  <p className="text-muted-foreground flex items-center gap-2 mt-1">
                    <Badge variant="outline">Reg: {data?.registration_number || "N/A"}</Badge>
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 pt-6">
                <h3 className="font-semibold mb-4 text-lg">Contact Information</h3>
                <div className="grid gap-2">
                  <label className="text-sm text-muted-foreground">Support Phone</label>
                  <div className="flex relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-10 bg-background/50 border-border" defaultValue={data?.contact_phone || "N/A"} />
                  </div>
                </div>
                <Button className="mt-4">Update Profile</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* HISTORY SECTION */}
      {section === "history" && (
        <Card className="glass-card border-border border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Clock className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-xl font-bold">Trip History is Processing</h3>
            <p className="max-w-md text-center mt-2">Historical ledger logs are currently being aggregated by the analytics engine. Check back soon.</p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

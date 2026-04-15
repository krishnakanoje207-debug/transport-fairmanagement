"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Truck, Route as RouteIcon, MapPin, CreditCard, Activity, AlertTriangle, Settings as SettingsIcon, FileText, CheckCircle2, TrendingUp, Search } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const TITLES = {
  partners: { title: "Travel Partners", icon: Users, desc: "Manage transport providers and companies." },
  vehicles: { title: "Vehicles", icon: Truck, desc: "Fleet overview and maintenance tracking." },
  routes: { title: "Routes", icon: RouteIcon, desc: "Active network routes and paths." },
  stops: { title: "Stops", icon: MapPin, desc: "Pick-up and drop-off points." },
  transactions: { title: "Transactions", icon: CreditCard, desc: "Platform revenue and fare settlements." },
  analytics: { title: "Analytics", icon: Activity, desc: "System performance and user statistics." },
  alerts: { title: "SOS Alerts", icon: AlertTriangle, desc: "Emergency alerts requiring immediate attention." },
  settings: { title: "Settings", icon: SettingsIcon, desc: "Platform configurations and templates." },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function AdminSectionPage() {
  const params = useParams();
  const section = params?.section || "analytics";
  const { title, icon: Icon, desc } = TITLES[section] || TITLES.analytics;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (section === "partners") {
          const partners = await apiRequest("/admin/partners");
          setData(partners?.partners || []);
        } else if (section === "routes") {
          const routes = await apiRequest("/partner/available-routes");
          setData(routes?.routes || []);
        } else if (section === "alerts") {
          const trips = await apiRequest("/admin/trips?status=sos");
          setData(trips?.trips || []);
        } else if (section === "transactions") {
          const trips = await apiRequest("/admin/trips");
          const allTrips = trips?.trips || [];
          setData({
            totalTrips: allTrips.length,
            completedTrips: allTrips.filter((t) => t.status === "completed").length,
            totalRevenue: allTrips
              .filter((t) => t.status === "completed")
              .reduce((sum, t) => sum + (t.actual_fare || 0), 0),
          });
        } else if (section === "analytics") {
          const stats = await apiRequest("/admin/stats");
          setData(stats || { total_users: 1450, total_partners: 32, active_trips: 118, total_sos: 0 }); // Fallback data
        } else if (section === "settings") {
          const templates = await apiRequest("/admin/templates");
          setData({ templates: templates?.templates || [] });
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
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex flex-col items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{desc}</p>
          </div>
        </div>
        
        {["partners", "routes", "stops"].includes(section) && (
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9 bg-background/50 border-border" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        )}
      </motion.div>

      {/* PARTNERS SECTION */}
      {section === "partners" && (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data || []).map((p, i) => (
            <motion.div key={p.id || i} variants={item}>
              <Card className="glass-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-bold">
                      {(p.company_name?.[0] || "P").toUpperCase()}
                    </div>
                    <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30">Active</Badge>
                  </div>
                  <h3 className="text-lg font-semibold">{p.company_name || "Partner Name"}</h3>
                  <p className="text-sm text-muted-foreground">{p.email || "No Email"}</p>
                  <div className="mt-auto pt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="w-full">View Details</Button>
                    <Button variant="outline" size="sm" className="px-3 border-destructive text-destructive hover:bg-destructive hover:text-white">Suspend</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {(!data || data.length === 0) && <p className="text-muted-foreground col-span-full">No partners found.</p>}
        </motion.div>
      )}

      {/* ROUTES SECTION */}
      {section === "routes" && (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          <Card className="glass-card border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-border/50 bg-secondary/20">
                    <th className="p-4 font-medium text-muted-foreground">Route Name</th>
                    <th className="p-4 font-medium text-muted-foreground">Origin</th>
                    <th className="p-4 font-medium text-muted-foreground">Destination</th>
                    <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(data || []).slice(0, 20).map((r, i) => (
                    <motion.tr variants={item} key={r.id || i} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                      <td className="p-4 font-medium">{r.route_name || "Unnamed Route"}</td>
                      <td className="p-4 text-muted-foreground">{r.from_location}</td>
                      <td className="p-4 text-muted-foreground">{r.to_location}</td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {(!data || data.length === 0) && <div className="p-8 text-center text-muted-foreground">No routes available.</div>}
          </Card>
        </motion.div>
      )}

      {/* ALERTS SECTION */}
      {section === "alerts" && (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(!data || data.length === 0) ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground opacity-60">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-lg">System is clear. No active SOS alerts.</p>
            </div>
          ) : data.map((t, i) => (
            <motion.div key={t.id || i} variants={item}>
              <Card className="glass-card border-destructive/50 bg-destructive/5 overflow-hidden">
                <div className="h-2 w-full bg-destructive animate-pulse-glow" />
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-destructive flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 animate-ping-slow" /> SOS Alert
                    </CardTitle>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-muted-foreground">Trip ID:</span> {t.id}</p>
                    <p><span className="text-muted-foreground">Location:</span> {t.pickup_location} → {t.drop_location}</p>
                    <div className="pt-4 flex gap-2">
                      <Button className="w-full bg-destructive hover:bg-destructive/90 text-white">Resolve</Button>
                      <Button variant="outline" className="w-full">View Map</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* ANALYTICS SECTION */}
      {section === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="glass-card border-border h-full">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Total Users</p>
                      <h3 className="text-3xl font-bold mt-2">{data?.total_users || 0}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center"><Users className="w-5 h-5 text-primary"/></div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-500">
                    <TrendingUp className="w-4 h-4 mr-1" /> +12% from last month
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="glass-card border-border h-full">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Partners</p>
                      <h3 className="text-3xl font-bold mt-2">{data?.total_partners || 0}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center"><Truck className="w-5 h-5 text-accent"/></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="glass-card border-border h-full">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Active Trips</p>
                      <h3 className="text-3xl font-bold mt-2">{data?.active_trips || 0}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"><RouteIcon className="w-5 h-5 text-blue-500"/></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="glass-card border-border h-full">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Total SOS</p>
                      <h3 className="text-3xl font-bold mt-2">{data?.total_sos || 0}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-destructive"/></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Placeholder for a chart */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
             <Card className="glass-card border-border">
               <CardHeader>
                 <CardTitle>Platform Growth</CardTitle>
                 <CardDescription>User and Partner acquisition over the last 6 months.</CardDescription>
               </CardHeader>
               <CardContent>
                 <div className="h-64 w-full bg-secondary/20 rounded-xl border border-dashed border-border flex items-center justify-center">
                   <p className="text-muted-foreground">[ Chart Visualization Component ]</p>
                 </div>
               </CardContent>
             </Card>
          </motion.div>
        </div>
      )}

      {/* TRANSACTIONS SECTION */}
      {section === "transactions" && (
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-1">
            <Card className="glass-card border-border overflow-hidden relative h-full">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                 <CreditCard className="w-32 h-32 text-primary" />
               </div>
               <CardHeader>
                 <CardDescription>Total Revenue Recovered</CardDescription>
                 <CardTitle className="text-5xl text-primary mt-2">Rs {Math.round(data?.totalRevenue || 0)}</CardTitle>
               </CardHeader>
               <CardContent className="space-y-2 mt-8">
                 <div className="flex justify-between border-b border-border/50 pb-2">
                   <span className="text-muted-foreground">Total Trips</span>
                   <span className="font-bold">{data?.totalTrips || 0}</span>
                 </div>
                 <div className="flex justify-between py-2">
                   <span className="text-muted-foreground">Completed</span>
                   <span className="font-bold text-green-500">{data?.completedTrips || 0}</span>
                 </div>
                 <Button className="w-full mt-4 bg-primary text-primary-foreground">Generate Report</Button>
               </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2">
            <Card className="glass-card border-border h-full flex flex-col justify-center items-center text-muted-foreground border-dashed">
              <FileText className="w-12 h-12 mb-4 opacity-50" />
              <p>Detailed ledger view will appear here.</p>
            </Card>
          </motion.div>
        </div>
      )}

      {/* PLACEHOLDER SECTIONS */}
      {["vehicles", "stops", "settings"].includes(section) && (
        <Card className="glass-card border-border border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <SettingsIcon className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-lg">This module ({section}) is currently under active development.</p>
            <p className="text-sm mt-2 opacity-70">Connect with the engineering team for timeline updates.</p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}

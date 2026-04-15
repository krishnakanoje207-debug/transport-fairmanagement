"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Users, CreditCard, Bell, Settings as SettingsIcon, Navigation, UserPlus, Wallet, History, Activity, Shield, Phone, Mail, Globe, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/api";
import { LiveMapView } from "@/components/dashboard/live-map-view";
import { LinkedUserCard } from "@/components/dashboard/linked-user-card";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function GuardianSectionPage() {
  const params = useParams();
  const section = params?.section || "section";
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [data, setData] = useState(null);
  const [linkedForm, setLinkedForm] = useState({ first_name: "", last_name: "", relation: "Child" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMessage("");
      try {
        if (section === "tracking") {
          const active = await apiRequest("/trip/active");
          if (active?.trip?.id) {
            const location = await apiRequest(`/location/latest/${active.trip.id}`);
            setData({ trip: active.trip, location: location?.location || null });
          } else {
            setData({ trip: null, location: null });
          }
        } else if (section === "users") {
          const linked = await apiRequest("/user/linked-users");
          setData(linked?.linked_users || []);
        } else if (section === "payments") {
          const stats = await apiRequest("/user/stats");
          const history = await apiRequest("/trip/history?limit=10");
          setData({ stats, trips: history?.trips || [] });
        } else if (section === "notifications") {
          const notifications = await apiRequest("/user/notifications");
          setData(notifications?.notifications || []);
        } else if (section === "settings") {
          const profile = await apiRequest("/user/profile");
          setData(profile || {});
        } else {
          setData(null);
        }
      } catch (err) {
        setMessage(err.message || "Failed to load section data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [section]);

  const createLinkedUser = async () => {
    if (!linkedForm.first_name.trim()) return;
    try {
      await apiRequest("/auth/linked-user/create", {
        method: "POST",
        body: JSON.stringify({
          first_name: linkedForm.first_name.trim(),
          last_name: linkedForm.last_name.trim() || "-",
          relation: linkedForm.relation.trim() || "Child",
        }),
      });
      setMessage("Linked user created.");
      const linked = await apiRequest("/user/linked-users");
      setData(linked?.linked_users || []);
      setLinkedForm({ first_name: "", last_name: "", relation: "Child" });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message || "Failed to create linked user");
    }
  };

  const removeLinkedUser = async (id) => {
    try {
      await apiRequest(`/user/linked-users/${id}`, { method: "DELETE" });
      setData(prev => prev.filter(u => u.id !== id));
      setMessage("User removed.");
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.message || "Failed to remove user");
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
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold capitalize">
            {section === "users" ? "Linked Users" : section}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your {section === "users" ? "linked dependents" : section}
          </p>
        </div>
        {section === "users" && (
          <Button className="bg-primary gap-2 pointer-events-none opacity-50"><UserPlus className="w-4 h-4"/> Add User (Use form below)</Button>
        )}
      </motion.div>

      {message && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
          {message}
        </motion.div>
      )}

      {section === "tracking" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-2">
            <Card className="glass-card border-border overflow-hidden h-[500px]">
              <CardContent className="p-0 h-full">
                <LiveMapView />
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="glass-card border-border h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="w-5 h-5 text-accent"/> Trip Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data?.trip ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-secondary/50 p-3 rounded-lg">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge className="bg-green-500/20 text-green-500 animate-pulse">{data.trip.status || "Active"}</Badge>
                    </div>
                    <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-background group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <Navigation className="w-4 h-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-border bg-card shadow">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-foreground">Pickup</div>
                            <time className="font-caveat font-medium text-muted-foreground">Now</time>
                          </div>
                          <div className="text-muted-foreground">{data.trip.pickup_location}</div>
                        </div>
                      </div>
                      <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-secondary text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-border bg-card shadow">
                          <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-foreground">Drop-off</div>
                            <time className="font-caveat font-medium text-muted-foreground">Est</time>
                          </div>
                          <div className="text-muted-foreground">{data.trip.drop_location}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No active trips currently.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {section === "users" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
             <Card className="glass-card border-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Add Dependent</CardTitle>
                <CardDescription>Link a user to track their rides and manage funds.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input placeholder="John" value={linkedForm.first_name} onChange={(e) => setLinkedForm(p => ({ ...p, first_name: e.target.value }))} className="bg-background"/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input placeholder="Doe" value={linkedForm.last_name} onChange={(e) => setLinkedForm(p => ({ ...p, last_name: e.target.value }))} className="bg-background"/>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Relation</label>
                  <Input placeholder="Child / Spouse" value={linkedForm.relation} onChange={(e) => setLinkedForm(p => ({ ...p, relation: e.target.value }))} className="bg-background"/>
                </div>
                <Button className="w-full bg-primary text-primary-foreground" onClick={createLinkedUser}>
                  <UserPlus className="w-4 h-4 mr-2" /> Submit
                </Button>
              </CardContent>
             </Card>
          </motion.div>
          <motion.div variants={container} initial="hidden" animate="show" className="lg:col-span-2 space-y-4">
             {(!data || data.length === 0) ? (
               <Card className="glass-card border-dashed py-12 flex flex-col items-center justify-center text-muted-foreground">
                 <Users className="w-12 h-12 opacity-20 mb-4" />
                 <p>No linked users found. Add one on the left.</p>
               </Card>
             ) : data.map((u) => (
                <motion.div key={u.id} variants={item}>
                  <Card className="glass-card border-border hover:border-primary/30 transition-all overflow-hidden group">
                    <CardContent className="p-0">
                      <div className="flex items-center p-4 gap-4">
                        <Avatar className="h-12 w-12 border-2 border-primary/20 bg-background">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {u.first_name?.[0]}{u.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{u.first_name} {u.last_name}</h3>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs font-normal">Relation: {u.relation || 'N/A'}</Badge>
                            <Badge className="bg-green-500/10 text-green-500 text-xs font-normal border-green-500/20">Active</Badge>
                          </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => removeLinkedUser(u.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                          Remove
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
             ))}
          </motion.div>
        </div>
      )}

      {section === "payments" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
               <Card className="glass-card border-primary h-full overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Wallet className="w-24 h-24 text-primary" />
                 </div>
                 <CardHeader>
                   <CardDescription>Wallet Balance</CardDescription>
                   <CardTitle className="text-4xl">Rs {data?.stats?.total_fare || "0.00"}</CardTitle>
                 </CardHeader>
                 <CardContent>
                   <Button className="w-full bg-primary text-primary-foreground mt-4">Top Up Wallet</Button>
                 </CardContent>
               </Card>
             </motion.div>
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
               <Card className="glass-card border-border h-full">
                 <CardHeader>
                   <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-accent"/> Funding Source</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="flex justify-between items-center p-3 border border-border rounded-lg bg-secondary/20">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-[10px] font-bold text-blue-800">VISA</div>
                       <div>
                         <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                         <p className="text-xs text-muted-foreground">Expires 12/28</p>
                       </div>
                     </div>
                     <Badge variant="outline" className="text-green-500 border-green-500/30">Primary</Badge>
                   </div>
                   <Button variant="outline" className="w-full border-dashed">Add Payment Method</Button>
                 </CardContent>
               </Card>
             </motion.div>
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
               <Card className="glass-card border-border h-full flex flex-col justify-center items-center text-center p-6 space-y-2">
                 <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center"><History className="w-6 h-6 text-accent"/></div>
                 <h3 className="font-semibold text-lg">{data?.stats?.total_trips || 0} Total Trips</h3>
                 <p className="text-sm text-muted-foreground">Completed historically across all dependents.</p>
               </Card>
             </motion.div>
          </div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {(!data?.trips || data.trips.length === 0) ? (
                    <p className="text-muted-foreground py-4 text-center">No recent transactions found.</p>
                  ) : data.trips.map((trip, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-lg hover:bg-secondary/30 transition-colors border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 flex flex-col items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Trip to {trip.drop_location}</p>
                          <p className="text-xs text-muted-foreground">{new Date(trip.created_at || Date.now()).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Rs {(trip.actual_fare || 0).toFixed(2)}</p>
                        <Badge variant="outline" className="text-xs bg-secondary/50">Completed</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {section === "notifications" && (
        <Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5 text-primary"/> Alert History</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {(!data || data.length === 0) ? (
                <div className="py-12 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                  <Bell className="w-12 h-12 mb-4" />
                  <p>You're up to date! No new notifications.</p>
                </div>
              ) : data.map((n) => (
                <motion.div key={n.id} variants={item} className="flex gap-4 p-4 rounded-xl bg-secondary/20 border border-border/50 hover:bg-secondary/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex flex-col items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{n.subject || "System Notification"}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">{new Date().toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      )}

      {section === "settings" && (
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="glass-card border-border h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><SettingsIcon className="w-5 h-5 text-accent"/> Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 py-4 border-b border-border/50">
                  <Avatar className="h-16 w-16 border-2 border-accent">
                    <AvatarFallback className="bg-accent/20 text-accent text-xl font-bold">
                      {data?.first_name?.[0]}{data?.last_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-medium">{data?.first_name} {data?.last_name}</h3>
                    <p className="text-sm text-muted-foreground">Guardian Account</p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">Edit Profile</Button>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{data?.email || "No email available"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{data?.phone || "No phone added"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span>Language: {data?.settings?.language === "en" ? "English" : (data?.settings?.language || "Default")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="glass-card border-border h-full bg-secondary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-red-500"/> Security & Preference</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                  </div>
                  <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Disabled</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-Wallet Topup</p>
                    <p className="text-xs text-muted-foreground">Recharge when balance falls below Rs 200.</p>
                  </div>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div>
                    <p className="font-medium text-destructive">Danger Zone</p>
                  </div>
                  <Button variant="destructive" size="sm">Deactivate Account</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

    </div>
  );
}

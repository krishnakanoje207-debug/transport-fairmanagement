"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, CreditCard, Bell, Settings as SettingsIcon, Navigation, UserPlus, Wallet, History, Activity, Shield, Phone, Mail, Globe, CheckCircle2, Eye, EyeOff, Lock, Key, Copy, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/api";
import { LiveMapView } from "@/components/dashboard/live-map-view";
import { getUser } from "@/lib/auth";

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
  const [linkedForm, setLinkedForm] = useState({
    first_name: "", last_name: "", relation: "Child",
    phone: "", date_of_birth: "", gender: "", blood_group: "", special_notes: ""
  });
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [showPayMethodDialog, setShowPayMethodDialog] = useState(false);
  const [payMethodForm, setPayMethodForm] = useState({ type: "upi", value: "" });

  // Settings state
  const [profileForm, setProfileForm] = useState({ first_name: "", last_name: "", phone: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [settingsPrefs, setSettingsPrefs] = useState({ tracking_enabled: true, sos_enabled: true, notifications_enabled: true, language: "en" });

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
          setData(stats || {});
        } else if (section === "notifications") {
          const notifs = await apiRequest("/user/notifications");
          setData(notifs?.notifications || []);
        } else if (section === "settings") {
          const user = getUser();
          if (user) {
            setProfileForm({
              first_name: user.first_name || "",
              last_name: user.last_name || "",
              phone: user.phone || "",
              email: user.email || "",
            });
            setSettingsPrefs(user.settings || { tracking_enabled: true, sos_enabled: true, notifications_enabled: true, language: "en" });
          }
          setData(user);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [section]);

  const handleAddLinkedUser = async () => {
    if (!linkedForm.first_name.trim()) return;
    try {
      const result = await apiRequest("/auth/linked-user/create", {
        method: "POST",
        body: JSON.stringify({
          first_name: linkedForm.first_name.trim(),
          last_name: linkedForm.last_name.trim() || "-",
          relation: linkedForm.relation.trim() || "Child",
          phone: linkedForm.phone.trim() || "",
          date_of_birth: linkedForm.date_of_birth || null,
          gender: linkedForm.gender || null,
          blood_group: linkedForm.blood_group || null,
          special_notes: linkedForm.special_notes || null,
        }),
      });
      // Store the generated credentials to show to guardian
      setCreatedCredentials({
        name: `${linkedForm.first_name} ${linkedForm.last_name}`,
        email: result?.linked_user?.email || "N/A",
        password: result?.linked_user?.password || "N/A",
        qr_token: result?.qr_login_token || "",
      });
      // Refresh list
      const linked = await apiRequest("/user/linked-users");
      setData(linked?.linked_users || []);
      setLinkedForm({ first_name: "", last_name: "", relation: "Child", phone: "", date_of_birth: "", gender: "", blood_group: "", special_notes: "" });
      setMessage("Linked user created successfully. Credentials shown below.");
    } catch (err) {
      setMessage(err.message || "Failed to create linked user");
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await apiRequest(`/user/linked-users/${userId}`, { method: "DELETE" });
      setData(prev => prev.filter(u => u.id !== userId));
      setMessage("Linked user removed.");
    } catch (err) {
      setMessage(err.message || "Failed to remove linked user");
    }
  };

  const handleSaveProfile = async () => {
    try {
      await apiRequest("/user/profile", {
        method: "PUT",
        body: JSON.stringify({
          first_name: profileForm.first_name,
          last_name: profileForm.last_name,
          phone: profileForm.phone,
        }),
      });
      setMessage("Profile updated successfully.");
    } catch (err) { setMessage(err.message || "Failed to update profile"); }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setMessage("Passwords do not match.");
      return;
    }
    try {
      await apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      });
      setMessage("Password changed successfully.");
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) { setMessage(err.message || "Failed to change password"); }
  };

  const handleSavePreferences = async () => {
    try {
      await apiRequest("/user/settings", {
        method: "PUT",
        body: JSON.stringify(settingsPrefs),
      });
      setMessage("Preferences saved.");
    } catch (err) { setMessage(err.message || "Failed to save preferences"); }
  };

  const handleTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) return;
    setMessage(`Wallet topped up with ₹${amount}. (Simulated)`);
    setTopUpAmount("");
    setShowTopUpDialog(false);
  };

  const handleAddPaymentMethod = async () => {
    if (!payMethodForm.value.trim()) return;
    setMessage(`Payment method (${payMethodForm.type}: ${payMethodForm.value}) added successfully. (Simulated)`);
    setPayMethodForm({ type: "upi", value: "" });
    setShowPayMethodDialog(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage("Copied to clipboard!");
    setTimeout(() => setMessage(""), 2000);
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
      {/* Status message */}
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4"/> {message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ TRACKING SECTION ═══ */}
      {section === "tracking" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Live Tracking</h1>
              <p className="text-muted-foreground">Track your linked users in real-time.</p>
            </div>
          </div>

          <Card className="glass-card border-border overflow-hidden">
            <CardContent className="p-0">
              <LiveMapView liveLocation={data?.location} />
            </CardContent>
          </Card>

          {data?.trip && (
            <Card className="glass-card border-border">
              <CardHeader><CardTitle>Active Trip Details</CardTitle></CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-muted-foreground">Status:</span> <Badge className="ml-2">{data.trip.status}</Badge></div>
                <div><span className="text-muted-foreground">Drop:</span> <span className="ml-2">{data.trip.drop_location || "N/A"}</span></div>
                <div><span className="text-muted-foreground">Transport:</span> <span className="ml-2 capitalize">{data.trip.transport_type || "N/A"}</span></div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══ LINKED USERS SECTION ═══ */}
      {section === "users" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Linked Users</h1>
                <p className="text-muted-foreground">Manage your linked family members.</p>
              </div>
            </div>
          </div>

          {/* Add new linked user form */}
          <Card className="glass-card border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary"/>Add Linked User</CardTitle>
              <CardDescription>Create a new linked user. Login credentials will be generated automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="First Name *" value={linkedForm.first_name} onChange={(e) => setLinkedForm(p => ({...p, first_name: e.target.value}))} />
                <Input placeholder="Last Name" value={linkedForm.last_name} onChange={(e) => setLinkedForm(p => ({...p, last_name: e.target.value}))} />
                <Input placeholder="Relation (e.g., Child, Parent)" value={linkedForm.relation} onChange={(e) => setLinkedForm(p => ({...p, relation: e.target.value}))} />
                <Input placeholder="Phone Number" value={linkedForm.phone} onChange={(e) => setLinkedForm(p => ({...p, phone: e.target.value}))} />
                <Input type="date" placeholder="Date of Birth" value={linkedForm.date_of_birth} onChange={(e) => setLinkedForm(p => ({...p, date_of_birth: e.target.value}))} />
                <select value={linkedForm.gender} onChange={(e) => setLinkedForm(p => ({...p, gender: e.target.value}))} className="w-full p-2 rounded-md bg-background border border-border text-foreground">
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <Input placeholder="Blood Group (e.g., O+)" value={linkedForm.blood_group} onChange={(e) => setLinkedForm(p => ({...p, blood_group: e.target.value}))} />
                <Input placeholder="Special Notes" value={linkedForm.special_notes} onChange={(e) => setLinkedForm(p => ({...p, special_notes: e.target.value}))} />
              </div>
              <Button onClick={handleAddLinkedUser} className="bg-primary hover:bg-primary/90 gap-2">
                <UserPlus className="w-4 h-4" /> Create Linked User
              </Button>
            </CardContent>
          </Card>

          {/* Generated Credentials Display */}
          <AnimatePresence>
            {createdCredentials && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card className="glass-card border-green-500/30 bg-green-500/5">
                  <CardHeader>
                    <CardTitle className="text-green-500 flex items-center gap-2"><Key className="w-5 h-5"/>Generated Login Credentials</CardTitle>
                    <CardDescription>Save these credentials. The password is shown only once.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                      <span className="text-sm text-muted-foreground w-20">Name:</span>
                      <span className="font-medium flex-1">{createdCredentials.name}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                      <span className="text-sm text-muted-foreground w-20">Email:</span>
                      <code className="font-mono text-sm flex-1">{createdCredentials.email}</code>
                      <button onClick={() => copyToClipboard(createdCredentials.email)}><Copy className="w-4 h-4 text-muted-foreground hover:text-primary"/></button>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                      <span className="text-sm text-muted-foreground w-20">Password:</span>
                      <code className="font-mono text-sm flex-1 text-green-500">{createdCredentials.password}</code>
                      <button onClick={() => copyToClipboard(createdCredentials.password)}><Copy className="w-4 h-4 text-muted-foreground hover:text-primary"/></button>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setCreatedCredentials(null)} className="mt-2">Dismiss</Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User List */}
          <motion.div variants={container} initial="hidden" animate="show" className="grid md:grid-cols-2 gap-4">
            {Array.isArray(data) && data.map((user) => (
              <motion.div key={user.id} variants={item}>
                <Card className="glass-card border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-foreground font-semibold">
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-muted-foreground">{user.relation || "Linked User"}</p>
                        </div>
                      </div>
                      <Badge variant={user.is_active ? "default" : "secondary"}>{user.is_active ? "Active" : "Inactive"}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1"><Mail className="w-3 h-3"/>{user.email || "N/A"}</div>
                      <div className="flex items-center gap-1"><Phone className="w-3 h-3"/>{user.phone || "N/A"}</div>
                      {user.blood_group && <div>Blood: {user.blood_group}</div>}
                      {user.gender && <div className="capitalize">Gender: {user.gender}</div>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveUser(user.id)}>Remove</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* ═══ PAYMENTS SECTION ═══ */}
      {section === "payments" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-3/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-chart-3" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Payments & Wallet</h1>
              <p className="text-muted-foreground">Manage your funds and transactions.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Wallet Card */}
            <Card className="glass-card border-green-500/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
                    <Wallet className="w-7 h-7 text-green-500"/>
                  </div>
                  <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1"><Plus className="w-3 h-3"/>Top Up</Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-border">
                      <DialogHeader><DialogTitle>Top Up Wallet</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <Input type="number" placeholder="Enter amount (₹)" value={topUpAmount} onChange={(e) => setTopUpAmount(e.target.value)} className="bg-background" />
                        <div className="grid grid-cols-4 gap-2">
                          {[100, 200, 500, 1000].map(amt => (
                            <Button key={amt} variant="outline" size="sm" onClick={() => setTopUpAmount(String(amt))}>₹{amt}</Button>
                          ))}
                        </div>
                        <Button onClick={handleTopUp} className="w-full bg-green-600 hover:bg-green-700">Add ₹{topUpAmount || "0"} to Wallet</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <p className="text-4xl font-bold mt-1">₹{data?.total_fare ? (500 - data.total_fare).toFixed(0) : "500"}</p>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="glass-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Payment Methods</h3>
                  <Dialog open={showPayMethodDialog} onOpenChange={setShowPayMethodDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1"><Plus className="w-3 h-3"/>Add</Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-border">
                      <DialogHeader><DialogTitle>Add Payment Method</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <select value={payMethodForm.type} onChange={(e) => setPayMethodForm(p => ({...p, type: e.target.value}))} className="w-full p-2 rounded-md bg-background border border-border text-foreground">
                          <option value="upi">UPI ID</option>
                          <option value="card">Credit/Debit Card</option>
                          <option value="netbanking">Net Banking</option>
                        </select>
                        <Input placeholder={payMethodForm.type === "upi" ? "yourname@upi" : payMethodForm.type === "card" ? "Card Number" : "Bank Account"} value={payMethodForm.value} onChange={(e) => setPayMethodForm(p => ({...p, value: e.target.value}))} className="bg-background" />
                        <Button onClick={handleAddPaymentMethod} className="w-full">Add Payment Method</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                    <CreditCard className="w-5 h-5 text-accent"/>
                    <div className="flex-1">
                      <p className="text-sm font-medium">SafeRoute Wallet</p>
                      <p className="text-xs text-muted-foreground">Default</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Trips", value: data?.total_trips || 0, icon: Navigation },
              { label: "Total Spent", value: `₹${data?.total_fare || 0}`, icon: CreditCard },
              { label: "Active Trips", value: data?.active_trips || 0, icon: Activity },
              { label: "Completed", value: data?.completed_trips || 0, icon: CheckCircle2 },
            ].map((stat) => (
              <Card key={stat.label} className="glass-card border-border">
                <CardContent className="p-4 text-center">
                  <stat.icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground"/>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ═══ NOTIFICATIONS SECTION ═══ */}
      {section === "notifications" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-chart-4/20 flex items-center justify-center">
              <Bell className="w-6 h-6 text-chart-4" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">Your alerts and messages.</p>
            </div>
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
            {Array.isArray(data) && data.length > 0 ? data.map((notif, i) => (
              <motion.div key={notif.id || i} variants={item}>
                <Card className={`glass-card border-border ${!notif.read ? "border-l-4 border-l-primary" : ""}`}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notif.type === "sos" ? "bg-destructive/20" : "bg-primary/20"}`}>
                      {notif.type === "sos" ? <AlertTriangle className="w-5 h-5 text-destructive"/> : <Bell className="w-5 h-5 text-primary"/>}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notif.message || "Notification"}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notif.created_at ? new Date(notif.created_at).toLocaleString() : "Just now"}</p>
                    </div>
                    {!notif.read && <Badge className="bg-primary/20 text-primary">New</Badge>}
                  </CardContent>
                </Card>
              </motion.div>
            )) : (
              <Card className="glass-card border-dashed border-border">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-20"/>
                  <p className="text-lg font-medium">No notifications yet</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      )}

      {/* ═══ SETTINGS SECTION (FULL REGENERATION) ═══ */}
      {section === "settings" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary"/>Profile Information</CardTitle>
                <CardDescription>Update your personal details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">First Name</label>
                    <Input value={profileForm.first_name} onChange={(e) => setProfileForm(p => ({...p, first_name: e.target.value}))} className="bg-background/50"/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Last Name</label>
                    <Input value={profileForm.last_name} onChange={(e) => setProfileForm(p => ({...p, last_name: e.target.value}))} className="bg-background/50"/>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <Input value={profileForm.email} disabled className="pl-10 bg-background/50 opacity-60"/>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <Input value={profileForm.phone} onChange={(e) => setProfileForm(p => ({...p, phone: e.target.value}))} className="pl-10 bg-background/50"/>
                  </div>
                </div>
                <Button onClick={handleSaveProfile} className="w-full">Save Profile</Button>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-accent"/>Change Password</CardTitle>
                <CardDescription>Keep your account secure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <Input type={showCurrentPw ? "text" : "password"} value={passwordForm.current_password} onChange={(e) => setPasswordForm(p => ({...p, current_password: e.target.value}))} className="pl-10 pr-10 bg-background/50"/>
                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showCurrentPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                    <Input type={showNewPw ? "text" : "password"} value={passwordForm.new_password} onChange={(e) => setPasswordForm(p => ({...p, new_password: e.target.value}))} className="pl-10 pr-10 bg-background/50"/>
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showNewPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Confirm New Password</label>
                  <Input type="password" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm(p => ({...p, confirm_password: e.target.value}))} className="bg-background/50"/>
                </div>
                <Button onClick={handleChangePassword} variant="outline" className="w-full">Change Password</Button>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="glass-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-chart-3"/>Preferences</CardTitle>
                <CardDescription>Configure tracking and notification settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "tracking_enabled", label: "Live GPS Tracking", desc: "Track linked users in real-time" },
                  { key: "sos_enabled", label: "SOS Alerts", desc: "Receive emergency SOS notifications" },
                  { key: "notifications_enabled", label: "Push Notifications", desc: "Get trip updates and alerts" },
                ].map(pref => (
                  <div key={pref.key} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{pref.label}</p>
                      <p className="text-xs text-muted-foreground">{pref.desc}</p>
                    </div>
                    <button
                      onClick={() => setSettingsPrefs(p => ({...p, [pref.key]: !p[pref.key]}))}
                      className={`w-12 h-6 rounded-full transition-colors relative ${settingsPrefs[pref.key] ? "bg-green-500" : "bg-secondary"}`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${settingsPrefs[pref.key] ? "translate-x-6" : "translate-x-0.5"}`}/>
                    </button>
                  </div>
                ))}

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="w-3 h-3"/>Language</label>
                  <select value={settingsPrefs.language} onChange={(e) => setSettingsPrefs(p => ({...p, language: e.target.value}))} className="w-full p-2 rounded-md bg-background border border-border text-foreground">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="mr">Marathi</option>
                  </select>
                </div>
                <Button onClick={handleSavePreferences} className="w-full">Save Preferences</Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="glass-card border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2"><AlertTriangle className="w-5 h-5"/>Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Deactivating your account will disable all linked users and active trips.</p>
                <Button variant="destructive" className="w-full">Deactivate Account</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

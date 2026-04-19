"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Users, Shield, AlertTriangle, ChevronRight, Navigation, Phone, MessageSquare, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LiveMapView } from "@/components/dashboard/live-map-view";
import { TripCard } from "@/components/dashboard/trip-card";
import { LinkedUserCard } from "@/components/dashboard/linked-user-card";
import { apiRequest } from "@/lib/api";
import { getUser } from "@/lib/auth";
const recentActivity = [
    { type: "arrival", user: "Alex", location: "School", time: "8:45 AM" },
    { type: "departure", user: "Emma", location: "Home", time: "8:30 AM" },
    { type: "sos_resolved", user: "Alex", time: "Yesterday" },
    { type: "arrival", user: "Mike", location: "Office", time: "Yesterday" },
];
export default function GuardianDashboard() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [linkedUsers, setLinkedUsers] = useState([]);
    const [stats, setStats] = useState([
        { label: "Linked Users", value: "0", icon: Users, color: "text-primary" },
        { label: "Active Trips", value: "0", icon: Navigation, color: "text-accent" },
        { label: "Total Trips", value: "0", icon: MapPin, color: "text-chart-3" },
        { label: "Safety Score", value: "--", icon: Shield, color: "text-chart-4" },
    ]);
    const [inboxCount, setInboxCount] = useState(0);
    const [inboxMessages, setInboxMessages] = useState([]);
    const [showAddUserForm, setShowAddUserForm] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [linkedUserForm, setLinkedUserForm] = useState({
        first_name: "",
        last_name: "",
        relation: "Child",
    });
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        const loadData = async () => {
            try {
                const [linkedData, statData] = await Promise.all([
                    apiRequest("/user/linked-users"),
                    apiRequest("/user/stats"),
                ]);
                const users = (linkedData?.linked_users || []).map((u) => ({
                    id: u.id,
                    name: `${u.first_name} ${u.last_name}`,
                    avatar: `${u.first_name?.[0] || ""}${u.last_name?.[0] || ""}`,
                    status: u.is_active ? "arrived" : "offline",
                    currentTrip: null,
                    lastLocation: u.relation || "Unknown",
                    lastSeen: "Recently",
                }));
                setLinkedUsers(users);
                setStats([
                    { label: "Linked Users", value: String(users.length), icon: Users, color: "text-primary" },
                    { label: "Active Trips", value: String(statData?.active_trips || 0), icon: Navigation, color: "text-accent" },
                    { label: "Total Trips", value: String(statData?.total_trips || 0), icon: MapPin, color: "text-chart-3" },
                    { label: "Safety Score", value: `${Math.max(0, 100 - (statData?.sos_count || 0) * 5)}%`, icon: Shield, color: "text-chart-4" },
                ]);
                const inbox = await apiRequest("/messaging/inbox");
                setInboxCount((inbox?.messages || []).length);
            }
            catch {
                // Keep UI usable with default placeholders.
            }
        };
        loadData();
    }, []);
    const currentUser = getUser();
    const router = useRouter();
    const handleMessages = async () => {
        try {
            const inbox = await apiRequest("/messaging/inbox");
            const msgs = inbox?.messages || [];
            setInboxMessages(msgs.slice(0, 5));
            setStatusMessage(msgs.length ? "Inbox loaded." : "No messages in inbox.");
        }
        catch (err) {
            setStatusMessage(err.message || "Failed to fetch inbox");
        }
    };
    const handleAddLinkedUser = async () => {
        if (!linkedUserForm.first_name.trim()) return;
        try {
            await apiRequest("/auth/linked-user/create", {
                method: "POST",
                body: JSON.stringify({
                    first_name: linkedUserForm.first_name.trim(),
                    last_name: linkedUserForm.last_name.trim() || "-",
                    relation: linkedUserForm.relation.trim() || "Child",
                }),
            });
            const linkedData = await apiRequest("/user/linked-users");
            const users = (linkedData?.linked_users || []).map((u) => ({
                id: u.id,
                name: `${u.first_name} ${u.last_name}`,
                avatar: `${u.first_name?.[0] || ""}${u.last_name?.[0] || ""}`,
                status: u.is_active ? "arrived" : "offline",
                currentTrip: null,
                lastLocation: u.relation || "Unknown",
                lastSeen: "Recently",
            }));
            setLinkedUsers(users);
            setStatusMessage("Linked user created.");
            setLinkedUserForm({ first_name: "", last_name: "", relation: "Child" });
            setShowAddUserForm(false);
        }
        catch (err) {
            setStatusMessage(err.message || "Failed to create linked user");
        }
    };
    const handleRemoveLinkedUser = async (userId) => {
        try {
            await apiRequest(`/user/linked-users/${userId}`, { method: "DELETE" });
            setLinkedUsers((prev) => prev.filter((u) => u.id !== userId));
            setStatusMessage("Linked user removed.");
        }
        catch (err) {
            setStatusMessage(err.message || "Failed to remove linked user");
        }
    };
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, <span className="gradient-text">{currentUser?.first_name || "Guardian"}</span>
          </h1>
          <p className="text-muted-foreground">
            {currentTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}
          </p>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
          <Button className="bg-accent hover:bg-accent/90 gap-2 text-primary-foreground" onClick={() => router.push("/dashboard/guardian/schedule-ride")}>
            <Navigation className="w-4 h-4"/>
            Schedule Ride
          </Button>

          <Button variant="outline" className="gap-2" onClick={handleMessages}>
            <MessageSquare className="w-4 h-4"/>
            Messages ({inboxCount})
          </Button>
          <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={() => setShowAddUserForm((prev) => !prev)}>
            <Users className="w-4 h-4"/>
            Add User
          </Button>
        </motion.div>
      </div>
      {statusMessage && <p className="text-sm text-muted-foreground">{statusMessage}</p>}
      {showAddUserForm && (<Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Create Linked User</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            <Input placeholder="First name" value={linkedUserForm.first_name} onChange={(e) => setLinkedUserForm((p) => ({ ...p, first_name: e.target.value }))}/>
            <Input placeholder="Last name" value={linkedUserForm.last_name} onChange={(e) => setLinkedUserForm((p) => ({ ...p, last_name: e.target.value }))}/>
            <Input placeholder="Relation" value={linkedUserForm.relation} onChange={(e) => setLinkedUserForm((p) => ({ ...p, relation: e.target.value }))}/>
            <Button onClick={handleAddLinkedUser}>Save</Button>
          </CardContent>
        </Card>)}
      {inboxMessages.length > 0 && (<Card className="glass-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Recent Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {inboxMessages.map((msg) => <p key={msg.id} className="text-sm text-muted-foreground">{msg.subject || "No Subject"}: {msg.body || ""}</p>)}
          </CardContent>
        </Card>)}
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (<motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="glass-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6"/>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>))}
      </div>
      
      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Map */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card className="glass-card border-border overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                Live Tracking
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => {
                const elem = document.documentElement;
                if (elem.requestFullscreen) elem.requestFullscreen();
                else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
              }}>
                Fullscreen
                <ChevronRight className="w-4 h-4 ml-1"/>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <LiveMapView />
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Active Trip */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card border-border h-full">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary"/>
                Active Trip
              </CardTitle>
            </CardHeader>
            <CardContent>
                  <TripCard user={linkedUsers[0] || {
                    id: "na",
                    name: "No active linked users",
                    avatar: "NA",
                    status: "offline",
                    currentTrip: null,
                    lastLocation: "Unavailable",
                    lastSeen: "N/A",
                  }}/>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Linked Users & Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Linked Users */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Linked Users</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {linkedUsers.map((user, index) => (<motion.div key={user.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + index * 0.1 }} className="space-y-2">
                  <LinkedUserCard user={user}/>
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleRemoveLinkedUser(user.id)}>
                      Remove
                    </Button>
                  </div>
                </motion.div>))}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (<motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + index * 0.1 }} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.type === "arrival"
                ? "bg-green-500/20 text-green-500"
                : activity.type === "departure"
                    ? "bg-primary/20 text-primary"
                    : "bg-chart-3/20 text-chart-3"}`}>
                      {activity.type === "arrival" && <MapPin className="w-5 h-5"/>}
                      {activity.type === "departure" && <Navigation className="w-5 h-5"/>}
                      {activity.type === "sos_resolved" && <Shield className="w-5 h-5"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {activity.type === "arrival" && `${activity.user} arrived at ${activity.location}`}
                        {activity.type === "departure" && `${activity.user} left ${activity.location}`}
                        {activity.type === "sos_resolved" && `SOS resolved for ${activity.user}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </motion.div>))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* SOS Alert Banner (conditionally shown) */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="hidden" // Change to "block" to show
    >
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-6 h-6 text-destructive"/>
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">SOS Alert Active</p>
                <p className="text-sm text-muted-foreground">Alex triggered an SOS 2 minutes ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Phone className="w-4 h-4"/>
                Call
              </Button>
              <Button className="bg-destructive hover:bg-destructive/90 gap-2">
                View Location
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>);
}

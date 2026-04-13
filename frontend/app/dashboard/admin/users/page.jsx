"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, MoreHorizontal, UserPlus, Mail, Phone, MapPin, Shield, ShieldOff, Trash2, Edit, Eye, Download, ChevronLeft, ChevronRight, } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { apiRequest } from "@/lib/api";
const roleColors = {
    Guardian: "bg-primary/20 text-primary",
    "Linked User": "bg-accent/20 text-accent",
    "Travel Partner": "bg-yellow-500/20 text-yellow-500",
};
const statusColors = {
    active: "bg-green-500/20 text-green-500",
    inactive: "bg-gray-500/20 text-gray-400",
    pending: "bg-yellow-500/20 text-yellow-500",
    suspended: "bg-red-500/20 text-red-500",
};
export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [statusMessage, setStatusMessage] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState({ fullName: "", email: "", phone: "9999999999", password: "Passw0rd!", role: "guardian" });
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ first_name: "", last_name: "", phone: "" });
    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "all" || user.roleLabel === roleFilter;
        const matchesStatus = statusFilter === "all" || user.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });
    const loadUsers = async () => {
        try {
            const data = await apiRequest("/admin/users");
            const mappedUsers = (data?.users || []).map((u) => {
                const roleLabel = u.role === "travel_partner"
                    ? "Travel Partner"
                    : u.role === "linked_user"
                        ? "Linked User"
                        : "Guardian";
                return {
                    id: u.id,
                    name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email,
                    first_name: u.first_name || "",
                    last_name: u.last_name || "",
                    email: u.email,
                    phone: u.phone || "-",
                    role: roleLabel,
                    roleLabel,
                    status: u.is_active ? "active" : "inactive",
                    linkedUsers: (u.linked_user_ids || []).length,
                    lastActive: "Recently",
                };
            });
            setUsers(mappedUsers);
        }
        catch {
            setUsers([]);
        }
    };
    useEffect(() => {
        loadUsers();
    }, []);
    const handleToggleActive = async (user) => {
        try {
            await apiRequest(`/admin/users/${user.id}`, {
                method: "PUT",
                body: JSON.stringify({ is_active: user.status !== "active" }),
            });
            await loadUsers();
        }
        catch (err) {
            setStatusMessage(err.message || "Failed to update user status");
        }
    };
    const handleDeleteUser = async (userId) => {
        try {
            await apiRequest(`/admin/users/${userId}`, { method: "DELETE" });
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            setStatusMessage("User deleted.");
        }
        catch (err) {
            setStatusMessage(err.message || "Failed to delete user");
        }
    };
    const handleEditUser = async (user) => {
        setEditingUser(user);
        setEditForm({
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            phone: user.phone || "",
        });
    };
    const saveEditUser = async () => {
        if (!editingUser) return;
        try {
            await apiRequest(`/admin/users/${editingUser.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    first_name: editForm.first_name,
                    last_name: editForm.last_name,
                    phone: editForm.phone,
                }),
            });
            await loadUsers();
            setEditingUser(null);
            setStatusMessage("User updated.");
        }
        catch (err) {
            setStatusMessage(err.message || "Failed to update user");
        }
    };
    const handleAddUser = async () => {
        if (!addForm.fullName || !addForm.email) return;
        const [firstName, ...rest] = addForm.fullName.trim().split(" ");
        const lastName = rest.join(" ") || "-";
        try {
            await apiRequest("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    email: addForm.email,
                    password: addForm.password,
                    first_name: firstName || "User",
                    last_name: lastName,
                    phone: addForm.phone,
                    role: addForm.role === "travel_partner" ? "travel_partner" : "guardian",
                }),
            });
            await loadUsers();
            setShowAddForm(false);
            setAddForm({ fullName: "", email: "", phone: "9999999999", password: "Passw0rd!", role: "guardian" });
            setStatusMessage("User created.");
        }
        catch (err) {
            setStatusMessage(err.message || "Failed to add user");
        }
    };
    const handleExportUsers = () => {
        const blob = new Blob([JSON.stringify(filteredUsers, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "users-export.json";
        a.click();
        URL.revokeObjectURL(url);
    };
    const guardianCount = users.filter((u) => u.role === "Guardian").length;
    const linkedCount = users.filter((u) => u.role === "Linked User").length;
    const partnerCount = users.filter((u) => u.role === "Travel Partner").length;
    return (<div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-3xl font-bold">
            User Management
          </motion.h1>
          <p className="text-muted-foreground mt-1">
            Manage all platform users and their permissions
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={handleExportUsers}>
            <Download className="w-4 h-4"/>
            Export
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setShowAddForm((v) => !v)}>
            <UserPlus className="w-4 h-4"/>
            Add User
          </Button>
        </div>
      </div>
      {statusMessage && <p className="text-sm text-muted-foreground">{statusMessage}</p>}
      {showAddForm && (<Card className="glass-card border-border/50">
          <CardContent className="grid gap-3 p-4 md:grid-cols-5">
            <Input placeholder="Full name" value={addForm.fullName} onChange={(e) => setAddForm((p) => ({ ...p, fullName: e.target.value }))}/>
            <Input placeholder="Email" value={addForm.email} onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}/>
            <Input placeholder="Phone" value={addForm.phone} onChange={(e) => setAddForm((p) => ({ ...p, phone: e.target.value }))}/>
            <Input placeholder="Password" value={addForm.password} onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))}/>
            <div className="flex gap-2">
              <Button variant={addForm.role === "guardian" ? "default" : "outline"} onClick={() => setAddForm((p) => ({ ...p, role: "guardian" }))}>Guardian</Button>
              <Button variant={addForm.role === "travel_partner" ? "default" : "outline"} onClick={() => setAddForm((p) => ({ ...p, role: "travel_partner" }))}>Partner</Button>
              <Button onClick={handleAddUser}>Save</Button>
            </div>
          </CardContent>
        </Card>)}
      {editingUser && (<Card className="glass-card border-border/50">
          <CardContent className="grid gap-3 p-4 md:grid-cols-4">
            <Input value={editForm.first_name} onChange={(e) => setEditForm((p) => ({ ...p, first_name: e.target.value }))}/>
            <Input value={editForm.last_name} onChange={(e) => setEditForm((p) => ({ ...p, last_name: e.target.value }))}/>
            <Input value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}/>
            <div className="flex gap-2">
              <Button onClick={saveEditUser}>Update</Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>)}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { label: "Total Users", value: String(users.length), icon: Users, color: "text-primary" },
            { label: "Guardians", value: String(guardianCount), icon: Shield, color: "text-primary" },
            { label: "Linked Users", value: String(linkedCount), icon: MapPin, color: "text-accent" },
            { label: "Partners", value: String(partnerCount), icon: Users, color: "text-yellow-500" },
        ].map((stat, i) => (<motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5"/>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>))}
      </div>

      {/* Filters */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
              <Input placeholder="Search users by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-secondary/50 border-border"/>
            </div>
            <div className="flex gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
                  <SelectValue placeholder="Role"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="Guardian">Guardian</SelectItem>
                  <SelectItem value="Linked User">Linked User</SelectItem>
                  <SelectItem value="Travel Partner">Travel Partner</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-secondary/50 border-border">
                  <SelectValue placeholder="Status"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="glass-card border-border/50 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 font-medium text-muted-foreground">User</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Contact</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Role</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Last Active</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredUsers.map((user, index) => (<motion.tr key={user.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ delay: index * 0.05 }} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`/placeholder.svg?height=40&width=40`}/>
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {user.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            {user.linkedUsers > 0 && (<p className="text-xs text-muted-foreground">{user.linkedUsers} linked users</p>)}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-3 h-3 text-muted-foreground"/>
                            <span>{user.email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3"/>
                            <span>{user.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={roleColors[user.role]}>{user.role}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={statusColors[user.status]}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {user.lastActive}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4"/>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditUser(user)}>
                            <Edit className="w-4 h-4"/>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4"/>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2"/>
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                <Edit className="w-4 h-4 mr-2"/>
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status === "active" ? (<DropdownMenuItem className="text-yellow-500" onClick={() => handleToggleActive(user)}>
                                  <ShieldOff className="w-4 h-4 mr-2"/>
                                  Suspend User
                                </DropdownMenuItem>) : (<DropdownMenuItem className="text-green-500" onClick={() => handleToggleActive(user)}>
                                  <Shield className="w-4 h-4 mr-2"/>
                                  Activate User
                                </DropdownMenuItem>)}
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.id)}>
                                <Trash2 className="w-4 h-4 mr-2"/>
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} users
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="w-4 h-4"/>
              </Button>
              <Button variant="outline" size="sm" className="bg-primary/20 text-primary">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">
                <ChevronRight className="w-4 h-4"/>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

const TITLES = {
  tracking: "Live Tracking",
  users: "Linked Users",
  payments: "Payments",
  notifications: "Notifications",
  settings: "Settings",
};

export default function GuardianSectionPage() {
  const params = useParams();
  const section = params?.section || "section";
  const title = TITLES[section] || "Guardian Section";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [data, setData] = useState(null);
  const [linkedForm, setLinkedForm] = useState({
    first_name: "",
    last_name: "",
    relation: "Child",
  });

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
    } catch (err) {
      setMessage(err.message || "Failed to create linked user");
    }
  };

  return (
    <Card className="glass-card border-border">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {message && <p className="text-sm text-muted-foreground mb-3">{message}</p>}
        {!loading && section === "tracking" && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Active trip: {data?.trip ? `${data.trip.pickup_location} -> ${data.trip.drop_location}` : "None"}</p>
            <p>Trip status: {data?.trip?.status || "N/A"}</p>
            <p>
              Last location: {data?.location ? `${data.location.latitude}, ${data.location.longitude}` : "No location updates yet"}
            </p>
          </div>
        )}
        {!loading && section === "users" && (
          <div className="space-y-3">
            <div className="grid gap-2 md:grid-cols-4">
              <Input placeholder="First name" value={linkedForm.first_name} onChange={(e) => setLinkedForm((p) => ({ ...p, first_name: e.target.value }))} />
              <Input placeholder="Last name" value={linkedForm.last_name} onChange={(e) => setLinkedForm((p) => ({ ...p, last_name: e.target.value }))} />
              <Input placeholder="Relation" value={linkedForm.relation} onChange={(e) => setLinkedForm((p) => ({ ...p, relation: e.target.value }))} />
              <Button onClick={createLinkedUser}>Create</Button>
            </div>
            {(data || []).map((u) => (
              <div key={u.id} className="rounded-md bg-secondary/30 p-2 text-sm text-muted-foreground">
                {u.first_name} {u.last_name} - {u.relation || "Relation N/A"}
              </div>
            ))}
          </div>
        )}
        {!loading && section === "payments" && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Total fare spent: Rs {data?.stats?.total_fare || 0}</p>
            <p>Total trips: {data?.stats?.total_trips || 0}</p>
            <p>Completed trips: {data?.stats?.completed_trips || 0}</p>
          </div>
        )}
        {!loading && section === "notifications" && (
          <div className="space-y-2">
            {(data || []).slice(0, 10).map((n) => (
              <div key={n.id} className="rounded-md bg-secondary/30 p-2 text-sm text-muted-foreground">
                {n.message}
              </div>
            ))}
          </div>
        )}
        {!loading && section === "settings" && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Name: {data?.first_name} {data?.last_name}</p>
            <p>Email: {data?.email}</p>
            <p>Phone: {data?.phone}</p>
            <p>Language: {data?.settings?.language || "en"}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

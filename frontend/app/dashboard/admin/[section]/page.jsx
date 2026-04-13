"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TITLES = {
  partners: "Partners",
  vehicles: "Vehicles",
  routes: "Routes",
  stops: "Stops",
  transactions: "Transactions",
  analytics: "Analytics",
  alerts: "SOS Alerts",
  settings: "Settings",
};

export default function AdminSectionPage() {
  const params = useParams();
  const section = params?.section || "section";
  const title = TITLES[section] || "Admin Section";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setMessage("");
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
          setData(stats || {});
        } else if (section === "settings") {
          const templates = await apiRequest("/admin/templates");
          setData({ templates: templates?.templates || [] });
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

  return (
    <Card className="glass-card border-border m-6">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {message && <p className="text-sm text-muted-foreground mb-2">{message}</p>}
        {!loading && section === "partners" && (
          <div className="space-y-2">
            {(data || []).map((p) => (
              <div key={p.id} className="rounded-md bg-secondary/30 p-2 text-sm text-muted-foreground">
                {p.company_name || "Partner"} - {p.email || "No email"}
              </div>
            ))}
          </div>
        )}
        {!loading && section === "routes" && (
          <div className="space-y-2">
            {(data || []).slice(0, 20).map((r) => (
              <div key={r.id} className="rounded-md bg-secondary/30 p-2 text-sm text-muted-foreground">
                {r.route_name}: {r.from_location} {"->"} {r.to_location}
              </div>
            ))}
          </div>
        )}
        {!loading && section === "alerts" && (
          <div className="space-y-2">
            {(data || []).map((t) => (
              <div key={t.id} className="rounded-md bg-secondary/30 p-2 text-sm text-muted-foreground">
                SOS Trip: {t.pickup_location} {"->"} {t.drop_location}
              </div>
            ))}
            {(!data || data.length === 0) && <p className="text-sm text-muted-foreground">No active SOS alerts.</p>}
          </div>
        )}
        {!loading && section === "transactions" && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Total trips: {data?.totalTrips || 0}</p>
            <p>Completed trips: {data?.completedTrips || 0}</p>
            <p>Estimated collected fare: Rs {Math.round(data?.totalRevenue || 0)}</p>
          </div>
        )}
        {!loading && section === "analytics" && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Total users: {data?.total_users || 0}</p>
            <p>Total partners: {data?.total_partners || 0}</p>
            <p>Active trips: {data?.active_trips || 0}</p>
            <p>Total SOS: {data?.total_sos || 0}</p>
          </div>
        )}
        {!loading && section === "settings" && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Message templates configured: {(data?.templates || []).length}</p>
          </div>
        )}
        {!loading && ["vehicles", "stops"].includes(section) && (
          <p className="text-sm text-muted-foreground">
            This module is available for extension. No dedicated backend endpoint exists yet for {section}.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

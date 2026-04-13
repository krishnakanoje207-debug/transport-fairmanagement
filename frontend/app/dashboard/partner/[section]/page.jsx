"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";

const TITLES = {
  route: "Active Route",
  scanner: "QR Scanner",
  passengers: "Passengers",
  history: "Trip History",
  settings: "Settings",
};

export default function PartnerSectionPage() {
  const params = useParams();
  const section = params?.section || "section";
  const title = TITLES[section] || "Partner Section";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [scanToken, setScanToken] = useState("");

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
          setData(stats || {});
        } else if (section === "history") {
          const stats = await apiRequest("/partner/stats");
          setData(stats || {});
        } else if (section === "settings") {
          const profile = await apiRequest("/partner/profile");
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

  const scanTrip = async () => {
    if (!scanToken) return;
    try {
      await apiRequest(`/partner/scan-trip-qr?token=${encodeURIComponent(scanToken)}`, {
        method: "POST",
      });
      setMessage("Trip started successfully.");
      setScanToken("");
    } catch (err) {
      setMessage(err.message || "Failed to scan token");
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
        {!loading && section === "scanner" && (
          <div className="space-y-3">
            <Input placeholder="Paste trip start QR token" value={scanToken} onChange={(e) => setScanToken(e.target.value)} />
            <Button onClick={scanTrip}>Scan and Start Trip</Button>
          </div>
        )}
        {!loading && section === "route" && (
          <div className="space-y-2">
            {(data || []).map((r) => (
              <div key={r.id} className="rounded-md bg-secondary/30 p-2 text-sm text-muted-foreground">
                {r.route_name}: {r.from_location} {"->"} {r.to_location}
              </div>
            ))}
          </div>
        )}
        {!loading && section === "passengers" && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Active trips: {data?.active_trips || 0}</p>
            <p>Completed trips: {data?.completed_trips || 0}</p>
            <p>Total trips: {data?.total_trips || 0}</p>
          </div>
        )}
        {!loading && section === "history" && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Total trips serviced: {data?.total_trips || 0}</p>
            <p>Total revenue: Rs {data?.total_revenue || 0}</p>
            <p>Routes managed: {data?.total_routes || 0}</p>
          </div>
        )}
        {!loading && section === "settings" && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Company: {data?.company_name || "N/A"}</p>
            <p>Registration: {data?.registration_number || "N/A"}</p>
            <p>Contact: {data?.contact_phone || "N/A"}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

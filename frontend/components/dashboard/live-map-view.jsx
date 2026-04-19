"use client";
import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Zap, Maximize2 } from "lucide-react";

const DEFAULT_CENTER = [20.5937, 78.9629]; // India center

export function LiveMapView({ liveLocation = null, onFullscreen = null }) {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const liveLocationRef = useRef(liveLocation);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        liveLocationRef.current = liveLocation;
    }, [liveLocation]);

    useEffect(() => {
        if (!isClient || !mapContainerRef.current || mapRef.current) return;

        // Dynamic import of leaflet (avoids SSR issues)
        const initMap = async () => {
            const L = (await import("leaflet")).default;

            // Fix default marker icon path issue with webpack
            delete L.Icon.Default.prototype._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
                iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            });

            const initialLiveLocation = liveLocationRef.current;
            const initialCenter = initialLiveLocation
                ? [initialLiveLocation.latitude, initialLiveLocation.longitude]
                : DEFAULT_CENTER;

            const map = L.map(mapContainerRef.current, {
                center: initialCenter,
                zoom: initialLiveLocation ? 15 : 5,
                zoomControl: true,
                attributionControl: true,
            });

            // OpenStreetMap free tiles — dark themed variant
            L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
                subdomains: "abcd",
                maxZoom: 19,
            }).addTo(map);

            // Custom pulsing marker icon
            const pulseIcon = L.divIcon({
                className: "",
                html: `
                    <div style="position:relative;width:24px;height:24px;">
                        <div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(255,107,53,0.2);animation:leaflet-ping 1.5s ease-out infinite;"></div>
                        <div style="position:absolute;inset:0;border-radius:50%;background:oklch(0.65 0.2 25);border:3px solid oklch(0.13 0.02 260);box-shadow:0 0 12px rgba(255,107,53,0.5);"></div>
                        <div style="position:absolute;inset:6px;border-radius:50%;background:oklch(0.98 0.01 260);"></div>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            });

            if (initialLiveLocation) {
                markerRef.current = L.marker(
                    [initialLiveLocation.latitude, initialLiveLocation.longitude],
                    { icon: pulseIcon }
                ).addTo(map);
            }

            mapRef.current = map;

            // Force a resize after mount (fixes grey tiles)
            setTimeout(() => map.invalidateSize(), 200);
        };

        initMap();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
                markerRef.current = null;
            }
        };
    }, [isClient]);

    // Update marker when liveLocation changes
    useEffect(() => {
        if (!mapRef.current || !liveLocation) return;

        const L = require("leaflet");
        const pos = [liveLocation.latitude, liveLocation.longitude];

        if (markerRef.current) {
            markerRef.current.setLatLng(pos);
        } else {
            const pulseIcon = L.divIcon({
                className: "",
                html: `
                    <div style="position:relative;width:24px;height:24px;">
                        <div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(255,107,53,0.2);animation:leaflet-ping 1.5s ease-out infinite;"></div>
                        <div style="position:absolute;inset:0;border-radius:50%;background:oklch(0.65 0.2 25);border:3px solid oklch(0.13 0.02 260);"></div>
                        <div style="position:absolute;inset:6px;border-radius:50%;background:oklch(0.98 0.01 260);"></div>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            });
            markerRef.current = L.marker(pos, { icon: pulseIcon }).addTo(mapRef.current);
        }

        mapRef.current.panTo(pos, { animate: true, duration: 0.5 });
    }, [liveLocation]);

    return (
        <div className="relative h-[400px] w-full overflow-hidden rounded-b-xl">
            {/* Leaflet CSS */}
            {isClient && (
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"
                />
            )}
            {/* Inject ping animation */}
            <style>{`
                @keyframes leaflet-ping {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(3); opacity: 0; }
                }
            `}</style>

            {/* Map container */}
            <div ref={mapContainerRef} className="absolute inset-0 z-0" />

            {/* Overlay: location labels */}
            {liveLocation && (
                <div className="absolute top-4 left-4 z-[1000] glass-card rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-foreground">
                            {liveLocation.latitude?.toFixed(5)}, {liveLocation.longitude?.toFixed(5)}
                        </span>
                    </div>
                </div>
            )}

            {/* Status overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-[1000] flex items-center justify-between">
                <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground">
                        <span className="font-semibold">Live</span>
                        <span className="text-muted-foreground ml-1">Tracking</span>
                    </span>
                </div>

                <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-chart-3" />
                    <span className="text-sm text-foreground">
                        <span className="font-semibold">GPS Active</span>
                    </span>
                </div>

                <div className="glass-card rounded-xl px-4 py-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span className="text-sm text-foreground">
                        OpenStreetMap
                    </span>
                </div>
            </div>

            {/* Fullscreen button */}
            {onFullscreen && (
                <button
                    onClick={onFullscreen}
                    className="absolute top-4 right-4 z-[1000] glass-card rounded-lg p-2 hover:bg-primary/20 transition-colors"
                >
                    <Maximize2 className="w-4 h-4 text-foreground" />
                </button>
            )}
        </div>
    );
}

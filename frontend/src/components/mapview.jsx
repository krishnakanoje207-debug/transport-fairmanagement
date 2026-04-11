import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const vehicleIcon = new L.DivIcon({
  html: '<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">🚌</div>',
  iconSize: [36, 36], iconAnchor: [18, 18], className: '',
});
const personIcon = new L.DivIcon({
  html: '<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">📍</div>',
  iconSize: [30, 30], iconAnchor: [15, 15], className: '',
});
const destIcon = new L.DivIcon({
  html: '<div style="font-size:24px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.4))">🏁</div>',
  iconSize: [30, 30], iconAnchor: [15, 15], className: '',
});

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      map.fitBounds(positions, { padding: [40, 40] });
    } else if (positions.length === 1) {
      map.setView(positions[0], 15);
    }
  }, [positions, map]);
  return null;
}

export default function MapView({ vehiclePos, userPos, destPos, routePoints, height = '320px', zoom = 14 }) {
  const center = vehiclePos || userPos || [26.2183, 78.1828];
  const positions = [vehiclePos, userPos, destPos].filter(Boolean);

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
        zoomControl={false} attributionControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        {positions.length > 0 && <FitBounds positions={positions} />}

        {vehiclePos && (
          <Marker position={vehiclePos} icon={vehicleIcon}>
            <Popup><strong>🚌 Vehicle</strong><br />Real-time location</Popup>
          </Marker>
        )}
        {userPos && (
          <Marker position={userPos} icon={personIcon}>
            <Popup><strong>📍 Your Location</strong></Popup>
          </Marker>
        )}
        {destPos && (
          <Marker position={destPos} icon={destIcon}>
            <Popup><strong>🏁 Destination</strong></Popup>
          </Marker>
        )}
        {routePoints && routePoints.length > 1 && (
          <Polyline positions={routePoints} pathOptions={{ color: '#818cf8', weight: 4, opacity: .8, dashArray: '8, 12' }} />
        )}
      </MapContainer>
    </div>
  );
}

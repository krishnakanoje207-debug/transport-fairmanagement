import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const vehicleIcon = L.divIcon({
  html: `<div style="width:36px;height:36px;background:#3a5fc8;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:1rem;box-shadow:0 2px 8px rgba(0,0,0,0.4)">🚌</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const userIcon = L.divIcon({
  html: `<div style="width:32px;height:32px;background:#c8a94f;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:0.9rem;box-shadow:0 2px 8px rgba(0,0,0,0.4)">👤</div>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function Recenter({ lat, lng }) {
  const map = useMap();
  useEffect(() => { if (lat && lng) map.setView([lat, lng], map.getZoom()); }, [lat, lng, map]);
  return null;
}

export default function MapView({ vehicleLocation, userLocation, height = 380, showDistance = false }) {
  const defaultCenter = vehicleLocation || userLocation || { lat: 26.2183, lng: 78.1828 };
  const positions = [];
  if (vehicleLocation) positions.push([vehicleLocation.lat, vehicleLocation.lng]);
  if (userLocation) positions.push([userLocation.lat, userLocation.lng]);

  return (
    <div className="map-container" style={{ height }}>
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {vehicleLocation && (
          <>
            <Marker position={[vehicleLocation.lat, vehicleLocation.lng]} icon={vehicleIcon}>
              <Popup>🚌 Vehicle Location</Popup>
            </Marker>
            {showDistance && (
              <Circle
                center={[vehicleLocation.lat, vehicleLocation.lng]}
                radius={300}
                color="#3a5fc8"
                fillColor="#3a5fc8"
                fillOpacity={0.08}
                weight={1}
              />
            )}
          </>
        )}

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>👤 Linked User Location</Popup>
          </Marker>
        )}

        {positions.length === 2 && (
          <Polyline positions={positions} color="#c8a94f" weight={2} dashArray="6 6" />
        )}

        {vehicleLocation && <Recenter lat={vehicleLocation.lat} lng={vehicleLocation.lng} />}
      </MapContainer>
    </div>
  );
}

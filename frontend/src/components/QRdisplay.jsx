import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import PaymentModal from './PaymentModal';

export default function QRDisplay({ trackingQR, tripStartQR, linkedUserQR, tripId, amount }) {
  const { t } = useTranslation();
  const [active, setActive] = useState(linkedUserQR ? 'linked' : 'tracking');
  const [paymentOpen, setPaymentOpen] = useState(false);

  const tabs = [];
  if (linkedUserQR) tabs.push(['linked', '🔗', t('linked_user_qr')]);
  if (trackingQR) tabs.push(['tracking', '📍', t('tracking_qr')]);
  if (tripStartQR) tabs.push(['start', '▶️', t('trip_start_qr')]);

  const handleTrackingScan = () => {
    // Open Google Maps with vehicle location
    const url = `https://www.google.com/maps?q=26.2283,78.1928&z=15`;
    window.open(url, '_blank');
  };

  return (
    <div>
      {tabs.length > 1 && (
        <div className="tabs">
          {tabs.map(([id, icon, label]) => (
            <button key={id} className={`tab-btn ${active === id ? 'active' : ''}`} onClick={() => setActive(id)}>
              {icon} {label}
            </button>
          ))}
        </div>
      )}

      {active === 'linked' && linkedUserQR && (
        <div className="qr-container fade-in-up">
          <div className="qr-wrapper">
            <QRCodeSVG value={linkedUserQR} size={180} bgColor="#ffffff" fgColor="#1e1b4b" level="H" />
          </div>
          <p className="qr-label">🔗 {t('linked_user_qr')}</p>
          <div className="badge badge-purple">Linked User Login QR</div>
          <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 260 }}>
            {t('linked_user')} can scan this QR to log in with minimal access
          </div>
        </div>
      )}

      {active === 'tracking' && trackingQR && (
        <div className="qr-container fade-in-up">
          <div className="qr-wrapper">
            <QRCodeSVG value={trackingQR} size={180} bgColor="#ffffff" fgColor="#1e1b4b" level="H" />
          </div>
          <p className="qr-label">📍 {t('tracking_qr')}</p>
          <div className="badge badge-info">Opens Google Maps</div>
          <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 260 }}>
            Scan to open real-time vehicle tracking in Google Maps
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleTrackingScan} style={{ marginTop: 8 }}>
            🗺 Open in Maps
          </button>
        </div>
      )}

      {active === 'start' && tripStartQR && (
        <div className="qr-container fade-in-up">
          <div className="qr-wrapper">
            <QRCodeSVG value={tripStartQR} size={180} bgColor="#ffffff" fgColor="#1e1b4b" level="H" />
          </div>
          <p className="qr-label">▶️ {t('trip_start_qr')}</p>
          <div className="badge badge-safe">For Travel Partner</div>
          <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 260 }}>
            Travel partner scans this QR to start the trip
          </div>
        </div>
      )}

      {/* Payment button */}
      {amount > 0 && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button className="btn btn-primary btn-lg" onClick={() => setPaymentOpen(true)}>
            💳 {t('payment')} — ₹{amount}
          </button>
        </div>
      )}

      <PaymentModal isOpen={paymentOpen} onClose={() => setPaymentOpen(false)} amount={amount} tripId={tripId} />
    </div>
  );
}

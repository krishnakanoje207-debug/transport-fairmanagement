import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

export default function QRDisplay({ paymentQR, linkedUserQR }) {
  const { t } = useTranslation();
  const [active, setActive] = useState('payment');

  return (
    <div>
      <div className="tabs">
        <button className={`tab-btn ${active === 'payment' ? 'active' : ''}`} onClick={() => setActive('payment')}>
          💳 {t('payment_qr')}
        </button>
        <button className={`tab-btn ${active === 'linked' ? 'active' : ''}`} onClick={() => setActive('linked')}>
          🔗 {t('linked_user_qr')}
        </button>
      </div>

      {active === 'payment' && (
        <div className="qr-container fade-in">
          <div className="qr-wrapper">
            <QRCodeSVG
              value={paymentQR || 'saferoute://payment/demo'}
              size={160}
              bgColor="#ffffff"
              fgColor="#070f2b"
              level="H"
            />
          </div>
          <p className="qr-label">💳 {t('payment_qr')}</p>
          <div className="badge badge-info">Valid till trip completion</div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', textAlign:'center', maxWidth:220 }}>
            Show this QR at the payment counter for fare payment
          </div>
        </div>
      )}

      {active === 'linked' && (
        <div className="qr-container fade-in">
          <div className="qr-wrapper">
            <QRCodeSVG
              value={linkedUserQR || 'saferoute://verify/demo'}
              size={160}
              bgColor="#ffffff"
              fgColor="#070f2b"
              level="H"
            />
          </div>
          <p className="qr-label">🔗 {t('linked_user_qr')}</p>
          <div className="badge badge-danger">Expires at trip end</div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', textAlign:'center', maxWidth:220 }}>
            Driver scans this QR to verify trip and activate live tracking
          </div>
        </div>
      )}
    </div>
  );
}

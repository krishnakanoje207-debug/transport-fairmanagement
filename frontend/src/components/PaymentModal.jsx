import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';

export default function PaymentModal({ isOpen, onClose, amount, tripId, onPaymentComplete }) {
  const { t } = useTranslation();
  const [method, setMethod] = useState('upi');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [txnId, setTxnId] = useState('');

  if (!isOpen) return null;

  const methods = [
    { id: 'upi', icon: '📱', name: t('upi'), desc: 'Google Pay, PhonePe, Paytm' },
    { id: 'card', icon: '💳', name: t('card'), desc: 'Credit / Debit Card' },
    { id: 'wallet', icon: '👛', name: t('wallet'), desc: 'SafeRoute Wallet' },
    { id: 'cash', icon: '💵', name: t('cash'), desc: 'Pay to driver' },
  ];

  const handlePay = async () => {
    setProcessing(true);
    // Simulate payment
    await new Promise(r => setTimeout(r, 2000));
    const txn = `SR${Date.now().toString(36).toUpperCase()}`;
    setTxnId(txn);
    setCompleted(true);
    setProcessing(false);
    if (onPaymentComplete) onPaymentComplete({ method, txnId: txn, amount });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
        {!completed ? (
          <>
            <div className="modal-header">
              <h3 className="modal-title">💳 {t('payment')}</h3>
              <button className="modal-close" onClick={onClose}>✕</button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 24, padding: 20, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>{t('est_fare')}</div>
              <div className="gradient-text" style={{ fontFamily: 'Space Grotesk', fontSize: '2.5rem', fontWeight: 800 }}>₹{amount || 0}</div>
              <div className="badge badge-info" style={{ marginTop: 8 }}>{t('demo_payment')}</div>
            </div>

            {method === 'upi' && (
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div className="qr-wrapper" style={{ display: 'inline-block' }}>
                  <QRCodeSVG value={`upi://pay?pa=saferoute@upi&pn=SafeRoute&am=${amount}&cu=INR&tn=Trip-${tripId}`}
                    size={140} bgColor="#ffffff" fgColor="#1e1b4b" level="H" />
                </div>
                <div style={{ fontSize: '.78rem', color: 'var(--text-muted)', marginTop: 8 }}>Scan with any UPI app</div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {methods.map(m => (
                <div key={m.id} className={`payment-method ${method === m.id ? 'selected' : ''}`} onClick={() => setMethod(m.id)}>
                  <span className="pm-icon">{m.icon}</span>
                  <div>
                    <div className="pm-name">{m.name}</div>
                    <div className="pm-desc">{m.desc}</div>
                  </div>
                  {method === m.id && <span style={{ marginLeft: 'auto', color: 'var(--accent-primary)' }}>✓</span>}
                </div>
              ))}
            </div>

            <button className="btn btn-primary btn-full btn-lg" onClick={handlePay} disabled={processing}>
              {processing ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Processing...</> : `${t('pay_now')} ₹${amount}`}
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }} className="fade-in-up">
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
            <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '1.6rem', fontWeight: 800, marginBottom: 8 }}>{t('payment_success')}!</h3>
            <div style={{ color: 'var(--text-muted)', marginBottom: 20 }}>{t('demo_payment')}</div>
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>{t('transaction_id')}</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{txnId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-success)' }}>₹{amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Method</span>
                <span style={{ fontWeight: 600 }}>{method.toUpperCase()}</span>
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

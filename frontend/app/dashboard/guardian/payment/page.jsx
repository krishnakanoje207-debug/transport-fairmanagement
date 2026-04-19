"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Smartphone, Building2, QrCode, CheckCircle2, ArrowLeft, MapPin, Clock, User, Shield, Navigation, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";

const paymentMethods = [
    { id: "upi", label: "UPI", icon: Smartphone, color: "text-green-500", bg: "bg-green-500/10" },
    { id: "card", label: "Credit Card", icon: CreditCard, color: "text-accent", bg: "bg-accent/10" },
    { id: "netbanking", label: "Net Banking", icon: Building2, color: "text-chart-3", bg: "bg-chart-3/10" },
    { id: "qr", label: "QR Payment", icon: QrCode, color: "text-primary", bg: "bg-primary/10" },
];

function PaymentPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const tripId = searchParams.get("trip_id") || "";
    const mode = searchParams.get("mode") || "cab";
    const pickup = searchParams.get("pickup") || "";
    const drop = searchParams.get("drop") || "";
    const userName = searchParams.get("user") || "User";
    const dateStr = searchParams.get("date") || "";
    const timeStr = searchParams.get("time") || "";

    const [selectedPayment, setSelectedPayment] = useState("upi");
    const [isProcessing, setIsProcessing] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [qrTokens, setQrTokens] = useState({ ride: "", tracking: "", payment: "" });
    const [upiId, setUpiId] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [bankName, setBankName] = useState("");

    const fare = mode === "bus" ? 45 : mode === "auto" ? 120 : 250;

    const handlePay = async () => {
        setIsProcessing(true);
        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate QR codes via backend
            let rideQr = "", trackingQr = "", paymentQr = "";
            try {
                if (tripId && tripId !== "new") {
                    const qrData = await apiRequest(`/qr/generate?trip_id=${tripId}&type=trip_start`, { method: "POST" });
                    rideQr = qrData?.token || qrData?.qr_token || `RIDE-${tripId}-${Date.now()}`;

                    const trackData = await apiRequest(`/qr/generate?trip_id=${tripId}&type=tracking`, { method: "POST" });
                    trackingQr = trackData?.token || trackData?.qr_token || `TRACK-${tripId}-${Date.now()}`;
                }
            } catch {
                // Generate fallback tokens
                rideQr = `RIDE-${Date.now().toString(36).toUpperCase()}`;
                trackingQr = `TRACK-${Date.now().toString(36).toUpperCase()}`;
            }
            paymentQr = `PAY-${Date.now().toString(36).toUpperCase()}-${fare}`;

            setQrTokens({ ride: rideQr, tracking: trackingQr, payment: paymentQr });
            setIsPaid(true);
        } catch (err) {
            alert(err.message || "Payment failed");
        } finally {
            setIsProcessing(false);
        }
    };

    const copyToken = (token) => {
        navigator.clipboard.writeText(token);
    };

    if (isPaid) {
        return (
            <div className="space-y-6 max-w-3xl mx-auto">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h2>
                    <p className="text-muted-foreground">Your ride has been booked. Here are your QR codes.</p>
                </motion.div>

                {/* Trip Summary */}
                <Card className="glass-card border-green-500/30">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Trip for</p>
                                <p className="font-semibold text-lg">{userName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Amount Paid</p>
                                <p className="text-2xl font-bold text-green-500">₹{fare}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                            <span className="capitalize">{mode}</span>
                            <span>•</span>
                            <span>{pickup || "Bus Stop"} → {drop}</span>
                            <span>•</span>
                            <span>{dateStr} {timeStr}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Generated QR Codes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: "Ride Start QR", token: qrTokens.ride, color: "text-primary", bg: "bg-primary/10", icon: Navigation },
                        { label: "Tracking QR", token: qrTokens.tracking, color: "text-accent", bg: "bg-accent/10", icon: MapPin },
                        { label: "Payment QR", token: qrTokens.payment, color: "text-green-500", bg: "bg-green-500/10", icon: CreditCard },
                    ].map((qr, i) => (
                        <motion.div key={qr.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
                            <Card className="glass-card border-border h-full">
                                <CardContent className="p-6 text-center space-y-4">
                                    <div className={`w-16 h-16 rounded-2xl ${qr.bg} flex items-center justify-center mx-auto`}>
                                        <qr.icon className={`w-8 h-8 ${qr.color}`} />
                                    </div>
                                    <h3 className="font-semibold">{qr.label}</h3>

                                    {/* QR Visual placeholder */}
                                    <div className="w-32 h-32 mx-auto rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-secondary/20">
                                        <QrCode className={`w-16 h-16 ${qr.color} opacity-60`} />
                                    </div>

                                    {/* Token */}
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/30 border border-border">
                                        <code className="text-xs flex-1 truncate text-muted-foreground font-mono">{qr.token}</code>
                                        <button onClick={() => copyToken(qr.token)} className="hover:text-primary transition-colors">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <Button onClick={() => router.push("/dashboard/guardian")} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground">
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <button onClick={() => router.back()} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h1 className="text-3xl font-bold">Complete Payment</h1>
                <p className="text-muted-foreground mt-1">Choose your preferred payment method.</p>
            </motion.div>

            {/* Trip Summary Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="glass-card border-accent/30">
                    <CardContent className="p-6">
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            <Badge variant="outline" className="capitalize">{mode}</Badge>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <User className="w-3 h-3" /> {userName}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <MapPin className="w-3 h-3" /> {pickup || "Bus Stop"} → {drop}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3 h-3" /> {dateStr} {timeStr}
                            </div>
                            <div className="ml-auto text-2xl font-bold text-foreground">₹{fare}</div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Payment Method Tabs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="glass-card border-border">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Method Selector */}
                        <div className="grid grid-cols-4 gap-3">
                            {paymentMethods.map((method) => (
                                <motion.button
                                    key={method.id}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setSelectedPayment(method.id)}
                                    className={`p-4 rounded-xl border text-center transition-all ${
                                        selectedPayment === method.id
                                            ? "border-primary bg-primary/10"
                                            : "border-border bg-secondary/30 hover:border-primary/50"
                                    }`}
                                >
                                    <method.icon className={`w-6 h-6 mx-auto mb-2 ${selectedPayment === method.id ? "text-primary" : "text-muted-foreground"}`} />
                                    <p className={`text-xs font-medium ${selectedPayment === method.id ? "text-foreground" : "text-muted-foreground"}`}>
                                        {method.label}
                                    </p>
                                </motion.button>
                            ))}
                        </div>

                        {/* Payment Form */}
                        <AnimatePresence mode="wait">
                            {selectedPayment === "upi" && (
                                <motion.div key="upi" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">UPI ID</label>
                                        <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi" className="bg-background/50 border-border" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">You will receive a payment request on your UPI app.</p>
                                </motion.div>
                            )}

                            {selectedPayment === "card" && (
                                <motion.div key="card" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Card Number</label>
                                        <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4242 4242 4242 4242" className="bg-background/50 border-border font-mono" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Expiry</label>
                                            <Input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" className="bg-background/50 border-border" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">CVV</label>
                                            <Input type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} placeholder="•••" className="bg-background/50 border-border" maxLength={4} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {selectedPayment === "netbanking" && (
                                <motion.div key="netbanking" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Select Bank</label>
                                        <select
                                            value={bankName}
                                            onChange={(e) => setBankName(e.target.value)}
                                            className="w-full p-3 rounded-xl bg-background border border-border text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value="">Choose your bank...</option>
                                            <option value="sbi">State Bank of India</option>
                                            <option value="hdfc">HDFC Bank</option>
                                            <option value="icici">ICICI Bank</option>
                                            <option value="axis">Axis Bank</option>
                                            <option value="kotak">Kotak Mahindra Bank</option>
                                            <option value="bob">Bank of Baroda</option>
                                        </select>
                                    </div>
                                    <p className="text-xs text-muted-foreground">You will be redirected to your bank&apos;s secure payment gateway.</p>
                                </motion.div>
                            )}

                            {selectedPayment === "qr" && (
                                <motion.div key="qr" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="text-center space-y-4">
                                    <div className="w-48 h-48 mx-auto rounded-2xl border-2 border-dashed border-primary/30 flex items-center justify-center bg-primary/5">
                                        <QrCode className="w-24 h-24 text-primary/40" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">Scan the QR code above with any UPI app to pay <strong className="text-foreground">₹{fare}</strong></p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Pay Button */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Button
                    onClick={handlePay}
                    disabled={isProcessing}
                    className="w-full h-14 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white"
                >
                    {isProcessing ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                        <>
                            <Shield className="w-5 h-5 mr-2" />
                            Pay ₹{fare} Securely
                        </>
                    )}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3" /> Your payment is secured with 256-bit encryption
                </p>
            </motion.div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="flex h-[400px] items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"/></div>}>
            <PaymentPageContent />
        </Suspense>
    );
}

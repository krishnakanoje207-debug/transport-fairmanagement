"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { MapPin, QrCode, DollarSign, Shield, Bell, BarChart3, Smartphone, Globe, Lock } from "lucide-react";
function FeatureCard({ icon: Icon, title, description, index, gradient }) {
    return (<motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: index * 0.1 }} whileHover={{ y: -8, transition: { duration: 0.3 } }} className="group relative">
      <div className="glass-card rounded-2xl p-8 h-full relative overflow-hidden">
        {/* Background gradient on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
            background: `radial-gradient(circle at top right, ${gradient} 0%, transparent 60%)`,
        }}/>
        
        {/* Animated border */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 neon-border"/>
        
        <div className="relative z-10">
          <motion.div whileHover={{ rotate: 12, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }} className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:border-primary/40 transition-colors">
            <Icon className="w-7 h-7 text-primary"/>
          </motion.div>
          
          <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
        
        {/* Corner decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <motion.circle cx="100" cy="0" r="60" fill="none" stroke="url(#featureGradient)" strokeWidth="1" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.2 }}/>
            <defs>
              <linearGradient id="featureGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="oklch(0.65 0.2 25)" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="oklch(0.55 0.15 200)" stopOpacity="0.2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </motion.div>);
}
const features = [
    {
        icon: MapPin,
        title: "Real-Time GPS Tracking",
        description: "Monitor every trip with live GPS updates. Parents and guardians can track their loved ones in real-time with pinpoint accuracy.",
        gradient: "oklch(0.65 0.2 25 / 0.15)",
    },
    {
        icon: QrCode,
        title: "QR-Based Boarding",
        description: "Seamless contactless boarding with unique QR codes. Passengers scan to board, automatically logging entry and exit times.",
        gradient: "oklch(0.55 0.15 200 / 0.15)",
    },
    {
        icon: DollarSign,
        title: "Dynamic Fare Calculation",
        description: "Intelligent fare algorithms that adjust based on distance, peak hours, and route conditions for fair and transparent pricing.",
        gradient: "oklch(0.8 0.18 85 / 0.15)",
    },
    {
        icon: Shield,
        title: "SOS Emergency Alerts",
        description: "One-tap emergency alerts that instantly notify guardians and authorities with precise location data when safety is compromised.",
        gradient: "oklch(0.55 0.22 25 / 0.15)",
    },
    {
        icon: Bell,
        title: "Smart Notifications",
        description: "Stay informed with intelligent alerts for trip starts, arrivals, delays, and important updates delivered in real-time.",
        gradient: "oklch(0.6 0.2 145 / 0.15)",
    },
    {
        icon: BarChart3,
        title: "Analytics Dashboard",
        description: "Comprehensive insights with beautiful visualizations for administrators to monitor fleet performance and user metrics.",
        gradient: "oklch(0.55 0.18 320 / 0.15)",
    },
    {
        icon: Smartphone,
        title: "Multi-Platform Access",
        description: "Access SafeRoute from any device. Responsive design ensures a seamless experience on mobile, tablet, or desktop.",
        gradient: "oklch(0.65 0.2 25 / 0.15)",
    },
    {
        icon: Globe,
        title: "Multi-Language Support",
        description: "Breaking language barriers with comprehensive internationalization supporting English, Hindi, and more languages.",
        gradient: "oklch(0.55 0.15 200 / 0.15)",
    },
    {
        icon: Lock,
        title: "Enterprise Security",
        description: "Bank-grade encryption with JWT authentication, role-based access control, and secure WebSocket connections.",
        gradient: "oklch(0.8 0.18 85 / 0.15)",
    },
];
export function FeaturesSection() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });
    const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100]);
    return (<section id="features" ref={containerRef} className="py-24 relative overflow-hidden">
      {/* Animated background */}
      <motion.div style={{ y: backgroundY }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 rounded-full opacity-30" style={{
            background: "radial-gradient(circle, oklch(0.65 0.2 25 / 0.1) 0%, transparent 70%)",
        }}/>
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-30" style={{
            background: "radial-gradient(circle, oklch(0.55 0.15 200 / 0.1) 0%, transparent 70%)",
        }}/>
      </motion.div>
      
      <div className="container px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-primary mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"/>
              Powerful Features
            </span>
          </motion.div>
          
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }} className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Everything You Need for{" "}
            <span className="gradient-text">Safe Transport</span>
          </motion.h2>
          
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg text-muted-foreground leading-relaxed">
            A comprehensive suite of features designed to make transport safer, 
            more efficient, and completely transparent for everyone involved.
          </motion.p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (<FeatureCard key={index} icon={feature.icon} title={feature.title} description={feature.description} index={index} gradient={feature.gradient}/>))}
        </div>
      </div>
    </section>);
}

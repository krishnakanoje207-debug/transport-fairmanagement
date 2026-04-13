"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Users, MapPin, Shield, Zap } from "lucide-react";
function AnimatedCounter({ value, suffix }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    useEffect(() => {
        if (isInView) {
            const duration = 2000;
            const steps = 60;
            const increment = value / steps;
            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= value) {
                    setCount(value);
                    clearInterval(timer);
                }
                else {
                    setCount(Math.floor(current));
                }
            }, duration / steps);
            return () => clearInterval(timer);
        }
    }, [isInView, value]);
    return (<span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>);
}
function StatCard({ icon: Icon, value, suffix, label, description, delay }) {
    return (<motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay }} className="relative group">
      <div className="glass-card rounded-2xl p-8 h-full hover:border-primary/30 transition-all duration-500">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
            background: "radial-gradient(circle at center, oklch(0.65 0.2 25 / 0.1) 0%, transparent 70%)",
        }}/>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }} className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Icon className="w-7 h-7 text-primary"/>
            </motion.div>
          </div>
          
          <h3 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
            <AnimatedCounter value={value} suffix={suffix}/>
          </h3>
          <p className="text-lg font-semibold text-foreground mb-2">{label}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </motion.div>);
}
const stats = [
    {
        icon: Users,
        value: 50000,
        suffix: "+",
        label: "Active Users",
        description: "Guardians and travelers trusting SafeRoute daily",
        delay: 0,
    },
    {
        icon: MapPin,
        value: 2500000,
        suffix: "+",
        label: "Trips Tracked",
        description: "Safe journeys completed with real-time monitoring",
        delay: 0.1,
    },
    {
        icon: Shield,
        value: 99,
        suffix: ".8%",
        label: "Safety Score",
        description: "Industry-leading safety and reliability metrics",
        delay: 0.2,
    },
    {
        icon: Zap,
        value: 150,
        suffix: "ms",
        label: "Response Time",
        description: "Lightning-fast alerts and real-time updates",
        delay: 0.3,
    },
];
export function StatsSection() {
    return (<section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background"/>
      
      <div className="container px-4 md:px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <p className="text-primary font-medium mb-2">Trusted Worldwide</p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Numbers That Speak for Themselves
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (<StatCard key={index} {...stat}/>))}
        </div>
        
        {/* Scrolling logos marquee */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="mt-20">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by leading transport authorities and organizations
          </p>
          <div className="relative overflow-hidden">
            <div className="flex animate-[scroll_30s_linear_infinite] gap-16">
              {[...Array(8)].map((_, i) => (<div key={i} className="flex items-center gap-16 shrink-0">
                  <span className="text-2xl font-bold text-muted-foreground/40 whitespace-nowrap">Metro Transit</span>
                  <span className="text-2xl font-bold text-muted-foreground/40 whitespace-nowrap">CityBus</span>
                  <span className="text-2xl font-bold text-muted-foreground/40 whitespace-nowrap">SafeRide</span>
                  <span className="text-2xl font-bold text-muted-foreground/40 whitespace-nowrap">TransitHub</span>
                </div>))}
            </div>
          </div>
        </motion.div>
      </div>
      
      <style jsx>{`
        @keyframes scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>);
}

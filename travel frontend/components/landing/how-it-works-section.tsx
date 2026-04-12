"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { 
  UserPlus, 
  QrCode, 
  Navigation, 
  Shield, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description: "Sign up as a Guardian, Linked User, or Travel Partner. Each role gets a personalized dashboard tailored to their needs.",
    features: ["Role-based access", "Secure authentication", "Profile customization"],
  },
  {
    number: "02",
    icon: QrCode,
    title: "Generate & Scan QR",
    description: "Passengers receive unique QR codes for boarding. Simply scan at entry and exit for automatic trip logging.",
    features: ["Contactless boarding", "Automatic timestamps", "Trip verification"],
  },
  {
    number: "03",
    icon: Navigation,
    title: "Track in Real-Time",
    description: "Watch every journey unfold on a live map. Guardians see exact locations, ETAs, and route progress.",
    features: ["Live GPS tracking", "ETA predictions", "Route visualization"],
  },
  {
    number: "04",
    icon: Shield,
    title: "Stay Protected",
    description: "Emergency SOS alerts, instant notifications, and 24/7 monitoring ensure safety throughout every journey.",
    features: ["One-tap SOS", "Instant alerts", "24/7 monitoring"],
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const isLast = index === steps.length - 1;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: index * 0.15 }}
      className="relative"
    >
      {/* Connection line */}
      {!isLast && (
        <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-px">
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 + 0.3 }}
            className="w-full h-full bg-gradient-to-r from-primary/50 to-transparent origin-left"
          />
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.15 + 0.5 }}
            className="absolute right-0 top-1/2 -translate-y-1/2"
          >
            <ArrowRight className="w-4 h-4 text-primary/50" />
          </motion.div>
        </div>
      )}
      
      <div className="glass-card rounded-3xl p-8 h-full group hover:border-primary/30 transition-all duration-500 relative overflow-hidden">
        {/* Background decoration */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors duration-500"
        />
        
        <div className="relative z-10">
          {/* Step number */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-5xl font-bold text-primary/20 group-hover:text-primary/30 transition-colors">
              {step.number}
            </span>
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors"
            >
              <step.icon className="w-7 h-7 text-primary" />
            </motion.div>
          </div>
          
          <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
            {step.title}
          </h3>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            {step.description}
          </p>
          
          {/* Features list */}
          <ul className="space-y-3">
            {step.features.map((feature, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + i * 0.1 }}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]);

  return (
    <section id="how-it-works" ref={containerRef} className="py-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent opacity-50" />
      </div>
      
      <div className="container px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-primary mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Simple Process
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance"
          >
            Get Started in{" "}
            <span className="gradient-text-cyan">Minutes</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground leading-relaxed"
          >
            Our streamlined onboarding process gets you up and running quickly. 
            No complex setup - just simple steps to safer journeys.
          </motion.p>
        </div>
        
        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12">
          {steps.map((step, index) => (
            <StepCard key={index} step={step} index={index} />
          ))}
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-muted-foreground mb-4">
            Ready to revolutionize your transport experience?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors animate-pulse-glow"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

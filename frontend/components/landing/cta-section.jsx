"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
export function CTASection() {
    return (<section className="py-24 relative overflow-hidden">
      <div className="container px-4 md:px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative">
          {/* CTA Card */}
          <div className="relative rounded-3xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20"/>
            
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
        }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-1/2 -left-1/4 w-full h-full opacity-30" style={{
            background: "conic-gradient(from 0deg, transparent, oklch(0.65 0.2 25 / 0.3), transparent)",
        }}/>
              <motion.div animate={{
            rotate: -360,
            scale: [1.2, 1, 1.2],
        }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -bottom-1/2 -right-1/4 w-full h-full opacity-30" style={{
            background: "conic-gradient(from 180deg, transparent, oklch(0.55 0.15 200 / 0.3), transparent)",
        }}/>
            </div>
            
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `
                  linear-gradient(oklch(0.98 0.01 260 / 0.5) 1px, transparent 1px),
                  linear-gradient(90deg, oklch(0.98 0.01 260 / 0.5) 1px, transparent 1px)
                `,
            backgroundSize: '40px 40px',
        }}/>
            
            {/* Content */}
            <div className="relative z-10 py-16 px-6 md:py-24 md:px-12 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-primary mb-8">
                <Sparkles className="w-4 h-4"/>
                <span>Start Your Free Trial Today</span>
              </motion.div>
              
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-6 text-balance max-w-4xl mx-auto">
                Ready to Transform Your{" "}
                <span className="gradient-text">Transport Experience?</span>
              </motion.h2>
              
              <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join thousands of guardians, travelers, and transport operators who trust 
                SafeRoute for safer, smarter journeys every day.
              </motion.p>
              
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 h-14 text-lg animate-pulse-glow group">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-foreground/20 hover:bg-foreground/5 h-14 text-lg px-10">
                    Sign In
                  </Button>
                </Link>
              </motion.div>
              
              <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="mt-8 text-sm text-muted-foreground">
                No credit card required. 14-day free trial. Cancel anytime.
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>);
}

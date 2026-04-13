"use client";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
const testimonials = [
    {
        name: "Sarah Mitchell",
        role: "Parent of 2",
        avatar: "SM",
        rating: 5,
        text: "SafeRoute has given me complete peace of mind. Knowing exactly where my children are during their commute to school is invaluable. The SOS feature is a game-changer.",
        highlight: "peace of mind",
    },
    {
        name: "Rajesh Kumar",
        role: "Fleet Manager",
        avatar: "RK",
        rating: 5,
        text: "Managing 50+ vehicles became so much easier with SafeRoute. The real-time tracking and analytics dashboard help us optimize routes and reduce costs significantly.",
        highlight: "optimize routes",
    },
    {
        name: "Emily Chen",
        role: "Daily Commuter",
        avatar: "EC",
        rating: 5,
        text: "The QR boarding system is so convenient! No more fumbling for tickets or cards. Just scan and go. Plus, I can share my live location with family automatically.",
        highlight: "scan and go",
    },
    {
        name: "Michael Torres",
        role: "Transport Authority",
        avatar: "MT",
        rating: 5,
        text: "We implemented SafeRoute across our entire public transit network. The dynamic fare calculation has improved revenue fairness, and riders love the transparency.",
        highlight: "transparency",
    },
    {
        name: "Priya Sharma",
        role: "Working Mother",
        avatar: "PS",
        rating: 5,
        text: "As a working mom, I cannot always be there to pick up my daughter. SafeRoute&apos;s live tracking and instant notifications let me know she&apos;s safe every single day.",
        highlight: "safe every single day",
    },
    {
        name: "David Park",
        role: "Bus Driver",
        avatar: "DP",
        rating: 5,
        text: "The Travel Partner dashboard makes my job easier. Passenger verification is quick, route management is intuitive, and I can focus on what matters - safe driving.",
        highlight: "safe driving",
    },
];
function TestimonialCard({ testimonial, index }) {
    return (<motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.1 }} className="group">
      <div className="glass-card rounded-2xl p-6 h-full hover:border-primary/30 transition-all duration-500 relative overflow-hidden">
        {/* Quote icon */}
        <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors"/>
        
        {/* Rating */}
        <div className="flex gap-1 mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-primary text-primary"/>))}
        </div>
        
        {/* Text */}
        <p className="text-muted-foreground mb-6 leading-relaxed">
          &quot;{testimonial.text.split(testimonial.highlight).map((part, i, arr) => (<span key={i}>
              {part}
              {i < arr.length - 1 && (<span className="text-primary font-medium">{testimonial.highlight}</span>)}
            </span>))}&quot;
        </p>
        
        {/* Author */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
            {testimonial.avatar}
          </div>
          <div>
            <p className="font-semibold text-foreground">{testimonial.name}</p>
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          </div>
        </div>
      </div>
    </motion.div>);
}
export function TestimonialsSection() {
    return (<section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <motion.div animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
        }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full" style={{
            background: "radial-gradient(circle, oklch(0.65 0.2 25 / 0.1) 0%, transparent 60%)",
        }}/>
      </div>
      
      <div className="container px-4 md:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-primary mb-6">
              <span className="w-2 h-2 rounded-full bg-chart-3 animate-pulse"/>
              Testimonials
            </span>
          </motion.div>
          
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Loved by{" "}
            <span className="gradient-text">Thousands</span>
          </motion.h2>
          
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-lg text-muted-foreground">
            See what our users have to say about their SafeRoute experience
          </motion.p>
        </div>
        
        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (<TestimonialCard key={index} testimonial={testimonial} index={index}/>))}
        </div>
        
        {/* Bottom stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="text-center">
            <p className="text-4xl font-bold gradient-text">4.9</p>
            <div className="flex gap-1 justify-center my-2">
              {[...Array(5)].map((_, i) => (<Star key={i} className="w-4 h-4 fill-primary text-primary"/>))}
            </div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold gradient-text-cyan">15K+</p>
            <p className="text-sm text-muted-foreground mt-2">Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold gradient-text">98%</p>
            <p className="text-sm text-muted-foreground mt-2">Would Recommend</p>
          </div>
        </motion.div>
      </div>
    </section>);
}

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginWithPassword } from "@/lib/api";
import { setSession } from "@/lib/auth";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Car, Route, MapPin, Clock, Users, TrendingUp, } from "lucide-react";
export default function PartnerLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const authData = await loginWithPassword(email, password);
            if (authData?.user?.role !== "travel_partner") {
                throw new Error("This account is not a travel partner account.");
            }
            setSession(authData);
            router.push("/dashboard/partner");
        }
        catch (err) {
            setError(err.message || "Unable to sign in");
        }
        finally {
            setIsLoading(false);
        }
    };
    const features = [
        { icon: Route, label: "Route Management", desc: "Plan and optimize your routes" },
        { icon: Users, label: "Passenger Tracking", desc: "Monitor all passengers in real-time" },
        { icon: TrendingUp, label: "Earnings Dashboard", desc: "Track your revenue growth" },
        { icon: Clock, label: "Schedule Control", desc: "Manage departure times" },
    ];
    return (<div className="min-h-screen flex">
      {/* Left Panel - Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-background to-primary/10"/>
        
        {/* Animated Route Line */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGradientPartner" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.8 0.18 85)"/>
              <stop offset="100%" stopColor="oklch(0.65 0.2 25)"/>
            </linearGradient>
          </defs>
          <motion.path d="M -50 200 Q 200 100 300 300 T 600 400 T 900 200 T 1200 350" fill="none" stroke="url(#routeGradientPartner)" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.3 }} transition={{ duration: 3, ease: "easeInOut" }}/>
          <motion.path d="M -50 500 Q 150 400 350 500 T 700 350 T 1000 500 T 1300 400" fill="none" stroke="url(#routeGradientPartner)" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.2 }} transition={{ duration: 4, ease: "easeInOut", delay: 0.5 }}/>
        </svg>
        
        {/* Animated Vehicles */}
        <motion.div animate={{
            x: [0, 500, 0],
            y: [0, -50, 0],
        }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute top-1/3 left-0">
          <div className="w-12 h-12 rounded-full bg-yellow-500/30 flex items-center justify-center backdrop-blur-sm border border-yellow-500/40">
            <Car className="w-6 h-6 text-yellow-400"/>
          </div>
        </motion.div>
        
        <motion.div animate={{
            x: [500, 0, 500],
            y: [0, 30, 0],
        }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="absolute top-2/3 right-0">
          <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center backdrop-blur-sm border border-primary/40">
            <Car className="w-5 h-5 text-primary"/>
          </div>
        </motion.div>
        
        {/* Map Pins */}
        {[
            { top: "20%", left: "20%" },
            { top: "40%", left: "60%" },
            { top: "70%", left: "30%" },
            { top: "50%", left: "80%" },
        ].map((pos, i) => (<motion.div key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 + i * 0.2, duration: 0.5 }} className="absolute" style={{ top: pos.top, left: pos.left }}>
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
              <MapPin className="w-6 h-6 text-yellow-500"/>
            </motion.div>
          </motion.div>))}
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <Link href="/" className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-white"/>
              </div>
              <span className="text-2xl font-bold">
                <span className="gradient-text">Safe</span>
                <span className="text-foreground">Route</span>
              </span>
            </Link>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30 mb-6">
              <Car className="w-4 h-4 text-yellow-500"/>
              <span className="text-sm font-medium text-yellow-400">Travel Partner Portal</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Drive your<br />
              <span className="text-yellow-400">business forward</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-md mb-8">
              Access your partner dashboard to manage routes, track passengers, and grow your earnings.
            </p>
          </motion.div>
          
          {/* Features Grid */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="grid grid-cols-2 gap-4">
            {features.map((feature, i) => (<motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className="glass-card rounded-xl p-4 hover:border-yellow-500/30 transition-colors">
                <feature.icon className="w-5 h-5 text-yellow-500 mb-2"/>
                <p className="text-sm font-medium text-foreground">{feature.label}</p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </motion.div>))}
          </motion.div>
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(oklch(0.8 0.18 85) 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
        }}/>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-white"/>
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">Safe</span>
              <span className="text-foreground">Route</span>
            </span>
          </Link>
          
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <Car className="w-4 h-4 text-yellow-500"/>
            <span className="text-sm font-medium text-yellow-400">Travel Partner Portal</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Partner Sign In</h2>
          <p className="text-muted-foreground mb-8">
            Access your dashboard to manage your fleet and routes
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Partner ID / Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Partner ID or Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="partner@company.com" className="pl-12 h-12 bg-secondary/30 border-border focus:border-yellow-500" required/>
              </div>
            </div>
            
            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link href="#" className="text-sm text-yellow-500 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="pl-12 pr-12 h-12 bg-secondary/30 border-border focus:border-yellow-500" required/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-yellow-600 to-primary hover:from-yellow-500 hover:to-primary/90 text-white text-lg font-semibold">
              {isLoading ? (<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"/>) : (<>
                  Access Dashboard
                  <ArrowRight className="ml-2 w-5 h-5"/>
                </>)}
            </Button>
          </form>
          
          {/* Register link */}
          <p className="mt-8 text-center text-muted-foreground">
            Want to become a partner?{" "}
            <Link href="/register" className="text-yellow-500 hover:underline font-medium">
              Apply now
            </Link>
          </p>
          
          {/* Other login options */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-center text-muted-foreground mb-4">
              Not a travel partner?
            </p>
            <div className="flex gap-3">
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full h-10 border-border hover:border-accent hover:bg-accent/10">
                  <Users className="w-4 h-4 mr-2"/>
                  User Login
                </Button>
              </Link>
              <Link href="/admin/login" className="flex-1">
                <Button variant="outline" className="w-full h-10 border-border hover:border-red-500/50 hover:bg-red-500/10">
                  <Shield className="w-4 h-4 mr-2"/>
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>);
}

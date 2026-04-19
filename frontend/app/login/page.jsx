"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginWithPassword } from "@/lib/api";
import { getHomeRouteByRole, setSession } from "@/lib/auth";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, MapPin, Users, Car, Heart, Navigation, Bell, Smartphone, User } from "lucide-react";
const roles = [
    {
        id: "guardian",
        label: "Guardian",
        icon: Users,
        description: "Monitor your loved ones",
        color: "oklch(0.65 0.2 25)",
    },
    {
        id: "linked",
        label: "Linked User",
        icon: MapPin,
        description: "Share your journey",
        color: "oklch(0.55 0.15 200)",
    },
    {
        id: "normal",
        label: "Normal User",
        icon: Navigation,
        description: "Travel independently",
        color: "oklch(0.6 0.2 145)",
    },
];
export default function UserLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState("guardian");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const authData = await loginWithPassword(email, password);
            const actualRole = authData?.user?.role;
            const expectedRole = selectedRole === "linked" ? "linked_user" : selectedRole === "normal" ? "normal" : "guardian";
            if (actualRole !== expectedRole) {
                throw new Error(`This account is ${actualRole || "unknown"}, please select the correct role.`);
            }
            setSession(authData);
            router.push(getHomeRouteByRole(actualRole));
        }
        catch (err) {
            setError(err.message || "Unable to sign in");
        }
        finally {
            setIsLoading(false);
        }
    };
    const features = [
        { icon: Navigation, label: "Live GPS Tracking", desc: "Real-time location updates" },
        { icon: Bell, label: "Instant Alerts", desc: "SOS and trip notifications" },
        { icon: Heart, label: "Family Safety", desc: "Peace of mind for loved ones" },
        { icon: Smartphone, label: "QR Boarding", desc: "Quick and secure check-in" },
    ];
    return (<div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10"/>
        
        {/* Animated Route Line */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGradientUser" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.65 0.2 25)"/>
              <stop offset="50%" stopColor="oklch(0.55 0.15 200)"/>
              <stop offset="100%" stopColor="oklch(0.65 0.2 25)"/>
            </linearGradient>
          </defs>
          <motion.path d="M 100 600 Q 250 400 400 500 T 700 350 T 900 450 T 1100 300" fill="none" stroke="url(#routeGradientUser)" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 5" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.4 }} transition={{ duration: 3, ease: "easeInOut" }}/>
        </svg>
        
        {/* Floating Location Pins */}
        <motion.div animate={{ y: [0, -15, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 right-1/4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center backdrop-blur-sm border border-primary/30 shadow-lg shadow-primary/20">
            <MapPin className="w-7 h-7 text-primary"/>
          </div>
        </motion.div>
        
        <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute bottom-1/3 left-1/3">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center backdrop-blur-sm border border-accent/30">
            <Users className="w-6 h-6 text-accent"/>
          </div>
        </motion.div>
        
        {/* Connection Lines */}
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1, duration: 0.8 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 w-32 h-32 rounded-full border-2 border-primary/30"/>
            <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="absolute inset-0 w-32 h-32 rounded-full border border-accent/30"/>
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center backdrop-blur-md border border-white/10">
              <Heart className="w-12 h-12 text-primary"/>
            </div>
          </div>
        </motion.div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `
              linear-gradient(oklch(0.65 0.2 25 / 0.5) 1px, transparent 1px),
              linear-gradient(90deg, oklch(0.65 0.2 25 / 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
        }}/>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <Link href="/" className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center animate-pulse-glow">
                <Shield className="w-6 h-6 text-primary-foreground"/>
              </div>
              <span className="text-2xl font-bold">
                <span className="gradient-text">Safe</span>
                <span className="text-foreground">Route</span>
              </span>
            </Link>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Stay connected<br />
              <span className="gradient-text">stay safe</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-md mb-8">
              Whether you&apos;re a guardian watching over loved ones or a traveler sharing your journey, we&apos;ve got you covered.
            </p>
          </motion.div>
          
          {/* Features */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="grid grid-cols-2 gap-4">
            {features.map((feature, i) => (<motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className="glass-card rounded-xl p-4 hover:border-primary/30 transition-colors">
                <feature.icon className="w-5 h-5 text-primary mb-2"/>
                <p className="text-sm font-medium text-foreground">{feature.label}</p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </motion.div>))}
          </motion.div>
        </div>
      </div>
      
      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(oklch(0.65 0.2 25) 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
        }}/>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground"/>
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">Safe</span>
              <span className="text-foreground">Route</span>
            </span>
          </Link>
          
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">
            Sign in to access your dashboard
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => (<motion.button key={role.id} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setSelectedRole(role.id)} className={`p-4 rounded-xl border text-left transition-all ${selectedRole === role.id
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                : "border-border hover:border-primary/50 bg-secondary/30"}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${selectedRole === role.id
                ? "bg-primary"
                : "bg-secondary"}`}>
                      <role.icon className={`w-5 h-5 ${selectedRole === role.id ? "text-primary-foreground" : "text-muted-foreground"}`}/>
                    </div>
                    <p className={`text-sm font-semibold ${selectedRole === role.id ? "text-foreground" : "text-muted-foreground"}`}>
                      {role.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {role.description}
                    </p>
                  </motion.button>))}
              </div>
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="pl-12 h-12 bg-secondary/30 border-border focus:border-primary" required/>
              </div>
            </div>
            
            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="pl-12 pr-12 h-12 bg-secondary/30 border-border focus:border-primary" required/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold">
              {isLoading ? (<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"/>) : (<>
                  Sign in
                  <ArrowRight className="ml-2 w-5 h-5"/>
                </>)}
            </Button>
          </form>
          
          {/* Sign up link */}
          <p className="mt-8 text-center text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Create one
            </Link>
          </p>
          
          {/* Other login options */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-center text-muted-foreground mb-4">
              Looking for a different portal?
            </p>
            <div className="flex gap-3">
              <Link href="/partner/login" className="flex-1">
                <Button variant="outline" className="w-full h-10 border-border hover:border-yellow-500/50 hover:bg-yellow-500/10">
                  <Car className="w-4 h-4 mr-2"/>
                  Partner Login
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

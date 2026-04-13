"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, User, Phone, MapPin, Users, Car, CheckCircle2 } from "lucide-react";
const roles = [
    {
        id: "guardian",
        label: "Guardian",
        icon: Users,
        description: "Monitor your family members during their journeys",
        color: "oklch(0.65 0.2 25)",
    },
    {
        id: "linked",
        label: "Linked User",
        icon: MapPin,
        description: "Share your location with guardians during travel",
        color: "oklch(0.55 0.15 200)",
    },
    {
        id: "partner",
        label: "Travel Partner",
        icon: Car,
        description: "Manage routes and verify passengers",
        color: "oklch(0.8 0.18 85)",
    },
];
export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const handleRoleSelect = (roleId) => {
        setSelectedRole(roleId);
        setStep(2);
    };
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Password and confirm password do not match");
            return;
        }
        if (selectedRole === "linked") {
            setError("Linked users are created by guardians from their dashboard.");
            return;
        }
        setIsLoading(true);
        setError("");
        try {
            const [firstName, ...rest] = formData.name.trim().split(" ");
            const lastName = rest.join(" ") || "-";
            await apiRequest("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    first_name: firstName || "User",
                    last_name: lastName,
                    phone: formData.phone,
                    role: selectedRole === "partner" ? "travel_partner" : "guardian",
                }),
            });
            setStep(3);
            setTimeout(() => {
                router.push("/login");
            }, 1500);
        }
        catch (err) {
            setError(err.message || "Registration failed");
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-background to-primary/10"/>
        
        {/* Animated route lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 1000">
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.65 0.2 25)" stopOpacity="0.5"/>
              <stop offset="100%" stopColor="oklch(0.55 0.15 200)" stopOpacity="0.5"/>
            </linearGradient>
          </defs>
          <motion.path d="M 0 200 Q 200 300 400 250 T 800 400" fill="none" stroke="url(#routeGrad)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, ease: "easeInOut" }}/>
          <motion.path d="M 0 400 Q 200 500 400 450 T 800 600" fill="none" stroke="url(#routeGrad)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, ease: "easeInOut", delay: 0.3 }}/>
          <motion.path d="M 0 600 Q 200 700 400 650 T 800 800" fill="none" stroke="url(#routeGrad)" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 3, ease: "easeInOut", delay: 0.6 }}/>
        </svg>
        
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
              Join the{" "}
              <span className="gradient-text-cyan">SafeRoute</span><br />
              community
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-md">
              Create your account and start experiencing safer, smarter transport management.
            </p>
          </motion.div>
          
          {/* Features list */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-12 space-y-4">
            {[
            "Real-time GPS tracking",
            "QR-based boarding",
            "Instant SOS alerts",
            "Dynamic fare calculation",
        ].map((feature, i) => (<div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary"/>
                <span className="text-muted-foreground">{feature}</span>
              </div>))}
          </motion.div>
        </div>
      </div>
      
      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
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
          
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (<div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step >= s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"}`}>
                  {step > s ? <CheckCircle2 className="w-4 h-4"/> : s}
                </div>
                {s < 3 && (<div className={`w-12 h-1 rounded-full ${step > s ? "bg-primary" : "bg-secondary"}`}/>)}
              </div>))}
          </div>
          
          <AnimatePresence mode="wait">
            {/* Step 1: Role Selection */}
            {step === 1 && (<motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Choose your role
                </h2>
                <p className="text-muted-foreground mb-8">
                  Select how you&apos;ll be using SafeRoute
                </p>
                
                <div className="space-y-4">
                  {roles.map((role) => (<motion.button key={role.id} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleRoleSelect(role.id)} className="w-full p-5 rounded-xl border border-border hover:border-primary/50 bg-secondary/30 hover:bg-secondary/50 text-left transition-all group">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: `${role.color}20` }}>
                          <role.icon className="w-6 h-6" style={{ color: role.color }}/>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                            {role.label}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {role.description}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"/>
                      </div>
                    </motion.button>))}
                </div>
              </motion.div>)}
            
            {/* Step 2: Account Details */}
            {step === 2 && (<motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
                  <ArrowLeft className="w-4 h-4"/>
                  Back to role selection
                </button>
                
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Create your account
                </h2>
                <p className="text-muted-foreground mb-8">
                  Enter your details to get started
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Full name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                      <Input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe" className="pl-12 h-12 bg-secondary/30 border-border focus:border-primary" required/>
                    </div>
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                      <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@example.com" className="pl-12 h-12 bg-secondary/30 border-border focus:border-primary" required/>
                    </div>
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                      <Input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 000-0000" className="pl-12 h-12 bg-secondary/30 border-border focus:border-primary" required/>
                    </div>
                  </div>
                  
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                      <Input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="Create a strong password" className="pl-12 pr-12 h-12 bg-secondary/30 border-border focus:border-primary" required/>
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                      </button>
                    </div>
                  </div>
                  
                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                      <Input type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm your password" className="pl-12 h-12 bg-secondary/30 border-border focus:border-primary" required/>
                    </div>
                  </div>
                  
                  {/* Submit */}
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" disabled={isLoading} className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold mt-6">
                    {isLoading ? (<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"/>) : (<>
                        Create account
                        <ArrowRight className="ml-2 w-5 h-5"/>
                      </>)}
                  </Button>
                </form>
                
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  By creating an account, you agree to our{" "}
                  <Link href="#" className="text-primary hover:underline">Terms</Link>
                  {" "}and{" "}
                  <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
              </motion.div>)}
            
            {/* Step 3: Success */}
            {step === 3 && (<motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center py-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-primary"/>
                </motion.div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                  Account created!
                </h2>
                <p className="text-muted-foreground mb-8">
                  Redirecting you to login...
                </p>
                
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full mx-auto"/>
              </motion.div>)}
          </AnimatePresence>
          
          {/* Sign in link */}
          {step !== 3 && (<p className="mt-8 text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>)}
        </motion.div>
      </div>
    </div>);
}

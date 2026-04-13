"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, Fingerprint, Server, Activity, Database, Users, Car, Settings, BarChart3, } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loginWithPassword } from "@/lib/api";
import { setSession } from "@/lib/auth";
export default function AdminLoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        code: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [step, setStep] = useState("credentials");
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };
    const handleCredentialsSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const authData = await loginWithPassword(formData.email, formData.password);
            if (authData?.user?.role !== "admin") {
                throw new Error("Only admin accounts can access this portal.");
            }
            setSession(authData);
            router.push("/dashboard/admin");
        }
        catch (err) {
            setError(err.message || "Login failed");
        }
        finally {
            setIsLoading(false);
        }
    };
    const handle2FASubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        if (formData.code.length !== 6) {
            setError("Enter a 6 digit code to continue.");
            setIsLoading(false);
            return;
        }
        router.push("/dashboard/admin");
        setIsLoading(false);
    };
    const adminFeatures = [
        { icon: Users, label: "User Management", value: "50K+" },
        { icon: Activity, label: "System Health", value: "99.9%" },
        { icon: Database, label: "Data Centers", value: "12" },
        { icon: BarChart3, label: "Daily Reports", value: "Auto" },
    ];
    return (<div className="min-h-screen flex">
      {/* Left Panel - Admin Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-background to-primary/5"/>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `linear-gradient(oklch(0.5 0.2 25 / 0.3) 1px, transparent 1px),
                             linear-gradient(90deg, oklch(0.5 0.2 25 / 0.3) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
        }}/>
        
        {/* Floating Security Elements */}
        <motion.div animate={{
            rotate: 360,
        }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500/60"/>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary/60"/>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500/40"/>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary/40"/>
        </motion.div>
        
        <motion.div animate={{
            rotate: -360,
        }} transition={{ duration: 45, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-red-500/20"/>
        
        <motion.div animate={{
            rotate: 360,
        }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full border border-primary/20"/>
        
        {/* Center Shield */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div animate={{
            boxShadow: [
                "0 0 30px oklch(0.5 0.2 25 / 0.3)",
                "0 0 60px oklch(0.5 0.2 25 / 0.5)",
                "0 0 30px oklch(0.5 0.2 25 / 0.3)",
            ]
        }} transition={{ duration: 3, repeat: Infinity }} className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center">
            <Shield className="w-12 h-12 text-white"/>
          </motion.div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 h-full">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <Link href="/" className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-white"/>
              </div>
              <span className="text-2xl font-bold">
                <span className="gradient-text">Safe</span>
                <span className="text-foreground">Route</span>
              </span>
            </Link>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 mb-6">
              <Server className="w-4 h-4 text-red-500"/>
              <span className="text-sm font-medium text-red-400">System Administration</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Control Center<br />
              <span className="text-red-500">Access Portal</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-md">
              Secure administrative access to manage users, monitor system health, and oversee all platform operations.
            </p>
          </motion.div>
          
          {/* Admin Stats */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="grid grid-cols-2 gap-4">
            {adminFeatures.map((feature, i) => (<motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.1 }} className="glass-card rounded-xl p-4 border border-red-500/10 hover:border-red-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-red-500"/>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{feature.value}</p>
                    <p className="text-xs text-muted-foreground">{feature.label}</p>
                  </div>
                </div>
              </motion.div>))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(oklch(0.5 0.2 25) 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
        }}/>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md relative z-10">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-primary flex items-center justify-center">
                <Shield className="w-5 h-5 text-white"/>
              </div>
              <span className="text-xl font-bold">
                <span className="gradient-text">Safe</span>
                <span className="text-foreground">Route</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-red-500"/>
              <span className="text-sm font-medium text-red-400">Admin Portal</span>
            </div>
          </div>

          {/* Security Notice */}
          <Alert className="mb-6 border-red-500/30 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-500"/>
            <AlertDescription className="text-sm text-red-200/80">
              Restricted access area. All login attempts are monitored and logged for security purposes.
            </AlertDescription>
          </Alert>

          {step === "credentials" ? (<motion.div key="credentials" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Admin Sign In</h2>
              <p className="text-muted-foreground mb-8">
                Enter your administrator credentials
              </p>

              <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                    <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="admin@saferoute.com" className="pl-12 h-12 bg-secondary/30 border-border focus:border-red-500" required/>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                    <Input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="Enter your password" className="pl-12 pr-12 h-12 bg-secondary/30 border-border focus:border-red-500" required/>
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                    </button>
                  </div>
                </div>

                {error && (<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-500 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4"/>
                    {error}
                  </motion.div>)}

                <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white text-lg font-semibold">
                  {isLoading ? (<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"/>) : ("Access Control Panel")}
                </Button>
              </form>
            </motion.div>) : (<motion.div key="2fa" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="text-center mb-6">
                <motion.div animate={{
                scale: [1, 1.05, 1],
            }} transition={{ duration: 2, repeat: Infinity }} className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500/30 to-primary/30 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                  <Fingerprint className="w-10 h-10 text-red-500"/>
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">Two-Factor Authentication</h2>
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <form onSubmit={handle2FASubmit} className="space-y-5">
                <div>
                  <Input type="text" name="code" value={formData.code} onChange={handleInputChange} placeholder="000000" maxLength={6} className="h-16 text-center text-3xl tracking-[0.5em] bg-secondary/30 border-border focus:border-red-500 font-mono" required/>
                </div>

                <Button type="submit" disabled={isLoading || formData.code.length !== 6} className="w-full h-12 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white text-lg font-semibold">
                  {isLoading ? (<motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"/>) : (<>
                      <Settings className="w-5 h-5 mr-2"/>
                      Access Control Panel
                    </>)}
                </Button>

                <button type="button" onClick={() => setStep("credentials")} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Back to credentials
                </button>
              </form>
            </motion.div>)}

          {/* Other login options */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-center text-muted-foreground mb-4">
              Not an administrator?
            </p>
            <div className="flex gap-3">
              <Link href="/login" className="flex-1">
                <Button variant="outline" className="w-full h-10 border-border hover:border-accent hover:bg-accent/10">
                  <Users className="w-4 h-4 mr-2"/>
                  User Login
                </Button>
              </Link>
              <Link href="/partner/login" className="flex-1">
                <Button variant="outline" className="w-full h-10 border-border hover:border-yellow-500/50 hover:bg-yellow-500/10">
                  <Car className="w-4 h-4 mr-2"/>
                  Partner
                </Button>
              </Link>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Protected by enterprise-grade security. IP: Logged
          </p>
        </motion.div>
      </div>
    </div>);
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Lock, Mail, Users, CheckCircle, ArrowRight, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [fullName, setFullName] = useState("");
    const [registerNumber, setRegisterNumber] = useState("");
    const [department, setDepartment] = useState("");
    const [section, setSection] = useState("");
    const [year, setYear] = useState("");
    const [fatherName, setFatherName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth(); // Optional: Auto login after register

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE_URL}/auth/initiate-signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const data = await res.json();
                    throw new Error(data.message || "Failed to send OTP");
                } else {
                    throw new Error(`Server Error: ${res.status}`);
                }
            }
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            if (!res.ok) throw new Error("Invalid OTP or expired.");
            setStep(3);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    password,
                    fullName,
                    role: "STUDENT",
                    registerNumber,
                    department,
                    section,
                    year,
                    fatherName
                }),
            });

            if (!res.ok) {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const data = await res.json();
                    throw new Error(data.message || "Registration failed");
                } else {
                    const text = await res.text();
                    console.error("Non-JSON error response from register:", text);
                    throw new Error("Registration failed: Server Error " + res.status);
                }
            }

            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json();
                // Auto login or redirect to login
                login(data.access_token, data.user);
                router.push("/dashboard");
            } else {
                const text = await res.text();
                console.error("Non-JSON success response from register:", text);
                throw new Error("Invalid server response format");
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4 relative overflow-hidden">
            <div className="absolute top-[-50px] left-[-50px] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-50 right-[-50px] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
                <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">Student Registration</CardTitle>
                        <CardDescription className="text-gray-300">
                            {step === 1 && "Verify your email to get started"}
                            {step === 2 && "Enter the code sent to " + email}
                            {step === 3 && "Complete your profile"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && <div className="text-red-400 text-sm text-center mb-4">{error}</div>}

                        {step === 1 && (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-white">College Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input id="email" type="email" placeholder="Enter your Gmail" className="pl-10 bg-white/5 border-white/10 text-white" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">{loading ? "Sending Code..." : "Send Verification Code"}</Button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="otp" className="text-white">Verification Code</Label>
                                    <div className="relative">
                                        <CheckCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input id="otp" type="text" placeholder="123456" className="pl-10 bg-white/5 border-white/10 text-white" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">{loading ? "Verifying..." : "Verify Code"}</Button>
                                <Button variant="link" onClick={() => setStep(1)} className="w-full text-white/50">Change Email</Button>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-white">Email</Label>
                                    <Input value={email} disabled className="bg-white/5 border-white/10 text-white/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fullName" className="text-white">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input id="fullName" placeholder="Rajesh Kumar" className="pl-10 bg-white/5 border-white/10 text-white" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="registerNumber" className="text-white">Register Number</Label>
                                        <Input id="registerNumber" placeholder="CSE2021001" className="bg-white/5 border-white/10 text-white" value={registerNumber} onChange={(e) => setRegisterNumber(e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="year" className="text-white">Year</Label>
                                        <Input id="year" placeholder="3" className="bg-white/5 border-white/10 text-white" value={year} onChange={(e) => setYear(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="department" className="text-white">Department</Label>
                                        <Input id="department" placeholder="CSE" className="bg-white/5 border-white/10 text-white" value={department} onChange={(e) => setDepartment(e.target.value)} required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="section" className="text-white">Section</Label>
                                        <Input id="section" placeholder="A" className="bg-white/5 border-white/10 text-white" value={section} onChange={(e) => setSection(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fatherName" className="text-white">Father's Name</Label>
                                    <Input id="fatherName" placeholder="Enter Father's Name" className="bg-white/5 border-white/10 text-white" value={fatherName} onChange={(e) => setFatherName(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-white">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input id="password" type="password" placeholder="••••••••" className="pl-10 bg-white/5 border-white/10 text-white" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input id="confirmPassword" type="password" placeholder="••••••••" className="pl-10 bg-white/5 border-white/10 text-white" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">{loading ? "Creating Account..." : "Create Account"}</Button>
                            </form>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Link href="/" className="text-sm text-indigo-300 hover:text-indigo-200">Already have an account? Sign In</Link>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}

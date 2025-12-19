"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Mail, CheckCircle, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/config";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            if (!res.ok) throw new Error("Email not found or failed to send OTP");
            setSuccess("OTP sent to your email!");
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Reset failed");
            }
            setSuccess("Password reset successfully! Redirecting...");
            setTimeout(() => router.push("/"), 2000);
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
                        <CardTitle className="text-2xl font-bold tracking-tight text-white">Reset Password</CardTitle>
                        <CardDescription className="text-gray-300">
                            {step === 1 ? "Enter your email to receive a code" : "Set your new password"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && <div className="text-red-400 text-sm text-center mb-4">{error}</div>}
                        {success && <div className="text-green-400 text-sm text-center mb-4">{success}</div>}

                        {step === 1 && (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-white">College Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input id="email" type="email" placeholder="student@college.edu" className="pl-10 bg-white/5 border-white/10 text-white" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">{loading ? "Sending..." : "Send Reset Code"}</Button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="otp" className="text-white">Verification Code</Label>
                                    <div className="relative">
                                        <CheckCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input id="otp" placeholder="123456" className="pl-10 bg-white/5 border-white/10 text-white" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-white">New Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input id="newPassword" type="password" placeholder="••••••••" className="pl-10 bg-white/5 border-white/10 text-white" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input id="confirmPassword" type="password" placeholder="••••••••" className="pl-10 bg-white/5 border-white/10 text-white" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">{loading ? "Resetting..." : "Reset Password"}</Button>
                            </form>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Link href="/" className="flex items-center text-sm text-indigo-300 hover:text-indigo-200">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                        </Link>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}

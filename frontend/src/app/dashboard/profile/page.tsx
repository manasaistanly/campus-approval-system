"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, User, Shield, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/config";

export default function ProfilePage() {
    const { user, token } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/users/profile`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchProfile();
        else setLoading(false);
    }, [token]);

    if (loading) return <div>Loading profile...</div>;
    if (!user) return <div>Please log in to view profile.</div>;

    const displayUser = profile || user;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>

            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={`https://ui-avatars.com/api/?name=${displayUser.fullName}`} alt={displayUser.fullName} />
                        <AvatarFallback>{displayUser.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{displayUser.fullName}</CardTitle>
                        <CardDescription>{displayUser.email}</CardDescription>
                        <div className="mt-2">
                            <Badge>{displayUser.role}</Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center text-sm font-medium text-muted-foreground">
                                <User className="mr-2 h-4 w-4" /> Full Name
                            </div>
                            <div className="text-sm">{displayUser.fullName}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center text-sm font-medium text-muted-foreground">
                                <Mail className="mr-2 h-4 w-4" /> Email
                            </div>
                            <div className="text-sm">{displayUser.email}</div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center text-sm font-medium text-muted-foreground">
                                <Shield className="mr-2 h-4 w-4" /> Role
                            </div>
                            <div className="text-sm">{displayUser.role}</div>
                        </div>
                        {displayUser.registerNumber && (
                            <div className="space-y-2">
                                <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" /> Register Number
                                </div>
                                <div className="text-sm">{displayUser.registerNumber}</div>
                            </div>
                        )}
                        {displayUser.department && (
                            <div className="space-y-2">
                                <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <Shield className="mr-2 h-4 w-4" /> Department
                                </div>
                                <div className="text-sm">{displayUser.department}</div>
                            </div>
                        )}
                        {displayUser.section && (
                            <div className="space-y-2">
                                <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" /> Section
                                </div>
                                <div className="text-sm">{displayUser.section}</div>
                            </div>
                        )}
                        {displayUser.year && (
                            <div className="space-y-2">
                                <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" /> Year
                                </div>
                                <div className="text-sm">{displayUser.year}</div>
                            </div>
                        )}
                        {displayUser.fatherName && (
                            <div className="space-y-2">
                                <div className="flex items-center text-sm font-medium text-muted-foreground">
                                    <User className="mr-2 h-4 w-4" /> Father's Name
                                </div>
                                <div className="text-sm">{displayUser.fatherName}</div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <div className="flex items-center text-sm font-medium text-muted-foreground">
                                <Shield className="mr-2 h-4 w-4" /> Quota
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-sm font-semibold text-blue-600 border rounded px-3 py-1 bg-blue-50">
                                    {displayUser.quota || "GOVERNMENT"}
                                </div>
                                {displayUser.id === user?.id && (
                                    <select
                                        className="border rounded px-2 py-1 text-sm bg-background cursor-pointer"
                                        value={displayUser.quota || "GOVERNMENT"}
                                        onChange={async (e) => {
                                            const newQuota = e.target.value;
                                            try {
                                                const res = await fetch(`${API_BASE_URL}/users/${displayUser.id}/quota`, {
                                                    method: 'PATCH',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        Authorization: `Bearer ${token}`
                                                    },
                                                    body: JSON.stringify({ quota: newQuota })
                                                });
                                                if (res.ok) {
                                                    setProfile({ ...displayUser, quota: newQuota });
                                                    // Also update local user object context if needed, but displayUser driven by profile state
                                                    alert("Quota updated successfully!");
                                                }
                                            } catch (err) {
                                                console.error("Failed to update quota");
                                                alert("Failed to update quota");
                                            }
                                        }}
                                    >
                                        <option value="GOVERNMENT">GOVERNMENT</option>
                                        <option value="MANAGEMENT">MANAGEMENT</option>
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

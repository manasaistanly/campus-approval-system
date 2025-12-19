"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, Clock } from "lucide-react";

export default function DashboardPage() {
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE_URL}/bonafide`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const total = data.length;
                    const pending = data.filter((r: any) => r.status === 'PENDING').length;
                    const approved = data.filter((r: any) => r.status === 'APPROVED' || r.status === 'READY').length;

                    setCounts({ total, pending, approved });
                }
            } catch (err) {
                console.error("Failed to fetch stats");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    const stats = [
        { title: "Total Requests", value: loading ? "-" : counts.total.toString(), icon: FileText, color: "text-blue-500" },
        { title: "Pending", value: loading ? "-" : counts.pending.toString(), icon: Clock, color: "text-yellow-500" },
        { title: "Approved", value: loading ? "-" : counts.approved.toString(), icon: CheckCircle, color: "text-green-500" },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {loading ? "Loading..." : "Current status"}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Placeholder for now, or could fetch from a notifications endpoint if we had one */}
                            <div className="text-sm">
                                <span className="font-semibold">System:</span> Welcome {user?.fullName || "User"}!
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

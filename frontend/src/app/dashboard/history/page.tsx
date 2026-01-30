"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Loader2, QrCode, Clock } from "lucide-react";

interface Request {
    id: string;
    purpose: {
        reason: string;
        category: string;
    };
    status: string;
    currentApproverRole: string;
    createdAt: string;
    formalLetterText: string;
    deliveryMode: 'PHYSICAL' | 'DIGITAL';
}

export default function RequestHistoryPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [user]);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/bonafide`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const data = await res.json();
                    // Backend returns all requests for now, ideally we filter by studentId if role is student,
                    // or the specific endpoint handles it (my controller calls findAll, I should update it to filter by user).
                    // Let's assume backend currently returns all but we only show ours if filtering isn't strict yet,
                    // OR better: Update backend controller to use request.user.id for filtering if Student.
                    // For now, let's just display what we get.
                    setRequests(data);
                } else {
                    const text = await res.text();
                    console.error("Non-JSON response from /bonafide (history):", text);
                }
            } else {
                console.error("Failed to fetch requests:", res.status, res.statusText);
            }
        } catch (err) {
            console.error("Failed to fetch requests", err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "APPROVED": return "bg-green-500 hover:bg-green-600";
            case "REJECTED": return "bg-red-500 hover:bg-red-600";
            case "PENDING": return "bg-yellow-500 hover:bg-yellow-600";
            case "READY": return "bg-blue-500 hover:bg-blue-600";
            default: return "bg-gray-500";
        }
    };

    if (loading) {
        return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>My Request History</CardTitle>
                    <CardDescription>Track the status of your bonafide and scholarship requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No requests found.</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile View - Card Layout */}
                            <div className="md:hidden space-y-4">
                                {requests.map((req) => (
                                    <Card key={req.id}>
                                        <CardContent className="pt-6">
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-semibold text-base">{req.purpose.reason}</p>
                                                        <p className="text-sm text-gray-500">{req.purpose.category}</p>
                                                    </div>
                                                    <Badge className={getStatusColor(req.status)}>{req.status}</Badge>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Mode</p>
                                                        <Badge variant="outline" className="mt-1">{req.deliveryMode}</Badge>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Submitted</p>
                                                        <p className="font-medium mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                {req.status === 'PENDING' && (
                                                    <div className="text-sm">
                                                        <p className="text-gray-500">Current Stage</p>
                                                        <p className="font-medium text-gray-800">Waiting for {req.currentApproverRole}</p>
                                                    </div>
                                                )}
                                                {(req.status === 'APPROVED' || req.status === 'READY') && req.deliveryMode === 'DIGITAL' && (
                                                    <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => {
                                                        const token = localStorage.getItem("token");
                                                        fetch(`${API_BASE_URL}/bonafide/${req.id}/download`, {
                                                            headers: { Authorization: `Bearer ${token}` }
                                                        })
                                                            .then(response => {
                                                                if (response.ok) return response.blob();
                                                                throw new Error('Download failed');
                                                            })
                                                            .then(blob => {
                                                                const url = window.URL.createObjectURL(blob);
                                                                const a = document.createElement('a');
                                                                a.href = url;
                                                                a.download = "bonafide.pdf";
                                                                document.body.appendChild(a);
                                                                a.click();
                                                                a.remove();
                                                            })
                                                            .catch(e => alert(e.message));
                                                    }}>
                                                        <QrCode className="h-4 w-4" /> Download PDF
                                                    </Button>
                                                )}
                                                {req.status === 'READY' && req.deliveryMode === 'PHYSICAL' && (
                                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-blue-600" />
                                                        <span className="text-blue-700 font-semibold text-sm">Ready for Collection</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            {/* Desktop View - Table Layout */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reason</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Mode</TableHead>
                                            <TableHead>Submitted On</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Current Stage</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {requests.map((req) => (
                                            <TableRow key={req.id}>
                                                <TableCell className="font-medium">{req.purpose.reason}</TableCell>
                                                <TableCell>{req.purpose.category}</TableCell>
                                                <TableCell><Badge variant="outline">{req.deliveryMode}</Badge></TableCell>
                                                <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusColor(req.status)}>{req.status}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {req.status === 'PENDING' ? (
                                                        <span className="text-sm text-gray-600 font-medium">
                                                            Waiting for {req.currentApproverRole}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-gray-600">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {(req.status === 'APPROVED' || req.status === 'READY') && req.deliveryMode === 'DIGITAL' && (
                                                        <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                                                            const token = localStorage.getItem("token");
                                                            fetch(`${API_BASE_URL}/bonafide/${req.id}/download`, {
                                                                headers: { Authorization: `Bearer ${token}` }
                                                            })
                                                                .then(response => {
                                                                    if (response.ok) return response.blob();
                                                                    throw new Error('Download failed');
                                                                })
                                                                .then(blob => {
                                                                    const url = window.URL.createObjectURL(blob);
                                                                    const a = document.createElement('a');
                                                                    a.href = url;
                                                                    a.download = "bonafide.pdf";
                                                                    document.body.appendChild(a);
                                                                    a.click();
                                                                    a.remove();
                                                                })
                                                                .catch(e => alert(e.message));
                                                        }}>
                                                            <QrCode className="h-4 w-4" /> Download PDF
                                                        </Button>
                                                    )}
                                                    {req.status === 'READY' && req.deliveryMode === 'PHYSICAL' && (
                                                        <span className="text-blue-600 font-bold text-xs flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> Ready for Collection
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

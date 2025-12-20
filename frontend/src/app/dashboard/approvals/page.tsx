"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { FeeInputDialog } from "@/components/fee-input-dialog";

interface Request {
    id: string;
    student: {
        fullName: string;
        registerNumber: string;
        department: string;
        year: string;
    };
    purpose: {
        reason: string;
    };
    formalLetterText: string;
    createdAt: string;
    status: string;
    documents?: string[];
}

export default function ApprovalsPage() {
    const { user } = useAuth();
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [feeDialogOpen, setFeeDialogOpen] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (user) fetchPendingRequests();
    }, [user]);

    const fetchPendingRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/bonafide/pending`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const data = await res.json();
                    setRequests(data);
                } else {
                    const text = await res.text();
                    console.error("Non-JSON response from /bonafide/pending:", text);
                }
            } else {
                console.error("Failed to fetch approvals:", res.status, res.statusText);
            }
        } catch (err) {
            console.error("Failed to fetch approvals", err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        // If user is OFFICE, show fee input dialog instead of direct approval
        if (user?.role === "OFFICE") {
            setSelectedRequestId(id);
            setFeeDialogOpen(true);
            return;
        }

        // Normal approval for other roles
        setProcessing(id);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/bonafide/${id}/approve`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setRequests(prev => prev.filter(r => r.id !== id));
            }
        } catch (err) {
            console.error("Approval failed");
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!rejectReason) return;
        setProcessing(id);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/bonafide/${id}/reject`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reason: rejectReason })
            });
            if (res.ok) {
                setRequests(prev => prev.filter(r => r.id !== id));
                setRejectReason("");
            }
        } catch (err) {
            console.error("Rejection failed");
        } finally {
            setProcessing(null);
        }
    };

    if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Pending Approvals</CardTitle>
                    <CardDescription>Review and take action on student requests assigned to you.</CardDescription>
                </CardHeader>
                <CardContent>
                    {requests.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500 opacity-50" />
                            <p>All caught up! No pending requests.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Purpose</TableHead>
                                        <TableHead>Letter</TableHead>
                                        <TableHead>Submitted</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((req) => (
                                        <TableRow key={req.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{req.student.fullName}</p>
                                                    <p className="text-xs text-gray-500">{req.student.registerNumber}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{req.student.department} - Year {req.student.year}</TableCell>
                                            <TableCell>{req.purpose.reason}</TableCell>
                                            <TableCell>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4 mr-1" /> View</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Formal Letter</DialogTitle>
                                                            <DialogDescription>Submitted by {req.student.fullName}</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm">
                                                            {req.formalLetterText}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                            <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                {/* Preview PDF Button - Only during fee verification (2nd approval) */}
                                                {user?.role === "PRINCIPAL" && req.status === "PENDING_FEES_VERIFICATION" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={async () => {
                                                            try {
                                                                const token = localStorage.getItem("token");
                                                                const res = await fetch(`${API_BASE_URL}/bonafide/${req.id}/download`, {
                                                                    headers: { Authorization: `Bearer ${token}` }
                                                                });
                                                                if (res.ok) {
                                                                    const blob = await res.blob();
                                                                    const url = window.URL.createObjectURL(blob);
                                                                    window.open(url, '_blank');
                                                                }
                                                            } catch (err) {
                                                                console.error("Preview failed");
                                                            }
                                                        }}
                                                    >
                                                        Preview PDF
                                                    </Button>
                                                )}

                                                <Button
                                                    variant="default"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    size="sm"
                                                    onClick={() => handleApprove(req.id)}
                                                    disabled={processing === req.id}
                                                >
                                                    {processing === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                                                </Button>

                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="destructive" size="sm" disabled={processing === req.id}>Reject</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Reject Request</DialogTitle>
                                                            <DialogDescription>Please provide a reason for rejection.</DialogDescription>
                                                        </DialogHeader>
                                                        <Textarea
                                                            placeholder="Reason for rejection..."
                                                            value={rejectReason}
                                                            onChange={(e) => setRejectReason(e.target.value)}
                                                        />
                                                        <DialogFooter>
                                                            <Button variant="destructive" onClick={() => handleReject(req.id)} disabled={!rejectReason || processing === req.id}>
                                                                Confirm Rejection
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {
                selectedRequestId && (
                    <FeeInputDialog
                        requestId={selectedRequestId}
                        open={feeDialogOpen}
                        onClose={() => {
                            setFeeDialogOpen(false);
                            setSelectedRequestId(null);
                        }}
                        onSuccess={() => {
                            fetchPendingRequests();
                        }}
                    />
                )
            }
        </div >
    );
}

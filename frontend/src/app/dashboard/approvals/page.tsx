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
                        <>
                            {/* Mobile View - Card Layout */}
                            <div className="md:hidden space-y-4">
                                {requests.map((req) => (
                                    <Card key={req.id}>
                                        <CardContent className="pt-6">
                                            <div className="space-y-4">
                                                {/* Student Info */}
                                                <div>
                                                    <p className="font-semibold text-base">{req.student.fullName}</p>
                                                    <p className="text-sm text-gray-500">{req.student.registerNumber}</p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {req.student.department} - Year {req.student.year}
                                                    </p>
                                                </div>

                                                {/* Purpose & Date */}
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Purpose</p>
                                                        <p className="font-medium mt-1">{req.purpose.reason}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Submitted</p>
                                                        <p className="font-medium mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>

                                                {/* View Letter Button */}
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm" className="w-full">
                                                            <Eye className="h-4 w-4 mr-2" /> View Letter
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-[90vw] sm:max-w-lg">
                                                        <DialogHeader>
                                                            <DialogTitle>Formal Letter</DialogTitle>
                                                            <DialogDescription>Submitted by {req.student.fullName}</DialogDescription>
                                                        </DialogHeader>
                                                        <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm max-h-[60vh] overflow-y-auto">
                                                            {req.formalLetterText}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>

                                                {/* Preview PDF for Principal */}
                                                {user?.role === "PRINCIPAL" && req.status === "PENDING_FEES_VERIFICATION" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
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

                                                {/* Action Buttons */}
                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        variant="default"
                                                        className="bg-green-600 hover:bg-green-700 w-full"
                                                        size="sm"
                                                        onClick={() => handleApprove(req.id)}
                                                        disabled={processing === req.id}
                                                    >
                                                        {processing === req.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                                        Approve
                                                    </Button>

                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="destructive" size="sm" className="w-full" disabled={processing === req.id}>
                                                                Reject
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-[90vw] sm:max-w-lg">
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
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={() => handleReject(req.id)}
                                                                    disabled={!rejectReason || processing === req.id}
                                                                    className="w-full sm:w-auto"
                                                                >
                                                                    Confirm Rejection
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
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
                        </>
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

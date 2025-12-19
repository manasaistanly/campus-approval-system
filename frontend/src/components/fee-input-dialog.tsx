"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/config";

interface FeeInputDialogProps {
    requestId: string;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function FeeInputDialog({ requestId, open, onClose, onSuccess }: FeeInputDialogProps) {
    const [fees, setFees] = useState({
        tuitionFees: "",
        examFees: "",
        hostelFees: "",
        booksStationery: "",
        laptopPurchase: "",
        projectExpenses: "",
        certificateDate: new Date().toISOString().split('T')[0]
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/bonafide/${requestId}/submit-fees`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    tuitionFees: parseFloat(fees.tuitionFees) || 0,
                    examFees: parseFloat(fees.examFees) || 0,
                    hostelFees: fees.hostelFees ? parseFloat(fees.hostelFees) : null,
                    booksStationery: fees.booksStationery ? parseFloat(fees.booksStationery) : null,
                    laptopPurchase: fees.laptopPurchase ? parseFloat(fees.laptopPurchase) : null,
                    projectExpenses: fees.projectExpenses ? parseFloat(fees.projectExpenses) : null,
                    certificateDate: new Date(fees.certificateDate)
                })
            });

            if (res.ok) {
                alert("Fee structure submitted successfully!");
                onSuccess();
                onClose();
            } else {
                alert("Failed to submit fees");
            }
        } catch (error) {
            console.error(error);
            alert("Error submitting fees");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Enter Fee Structure</DialogTitle>
                    <DialogDescription>
                        Fill in the fee details for this bonafide certificate. Required fields are marked with *.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="tuitionFees">Tuition Fees *</Label>
                        <Input
                            id="tuitionFees"
                            type="number"
                            placeholder="7000"
                            value={fees.tuitionFees}
                            onChange={(e) => setFees({ ...fees, tuitionFees: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="examFees">Exam Fees *</Label>
                        <Input
                            id="examFees"
                            type="number"
                            placeholder="1800"
                            value={fees.examFees}
                            onChange={(e) => setFees({ ...fees, examFees: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hostelFees">Hostel Fees (Optional)</Label>
                        <Input
                            id="hostelFees"
                            type="number"
                            placeholder="0"
                            value={fees.hostelFees}
                            onChange={(e) => setFees({ ...fees, hostelFees: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="booksStationery">Books & Stationery (Optional)</Label>
                        <Input
                            id="booksStationery"
                            type="number"
                            placeholder="0"
                            value={fees.booksStationery}
                            onChange={(e) => setFees({ ...fees, booksStationery: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="laptopPurchase">Laptop Purchase (Optional)</Label>
                        <Input
                            id="laptopPurchase"
                            type="number"
                            placeholder="0"
                            value={fees.laptopPurchase}
                            onChange={(e) => setFees({ ...fees, laptopPurchase: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="projectExpenses">Project Expenses (Optional)</Label>
                        <Input
                            id="projectExpenses"
                            type="number"
                            placeholder="0"
                            value={fees.projectExpenses}
                            onChange={(e) => setFees({ ...fees, projectExpenses: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2 col-span-2">
                        <Label htmlFor="certificateDate">Certificate Date *</Label>
                        <Input
                            id="certificateDate"
                            type="date"
                            value={fees.certificateDate}
                            onChange={(e) => setFees({ ...fees, certificateDate: e.target.value })}
                            required
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting || !fees.tuitionFees || !fees.examFees}>
                        {submitting ? "Submitting..." : "Submit Fees"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

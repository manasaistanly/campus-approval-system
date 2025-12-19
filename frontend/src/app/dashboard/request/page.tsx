"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Reason {
    id: string;
    reason: string;
    category: string;
}

export default function RequestBonafidePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [reasons, setReasons] = useState<Reason[]>([]);
    const [selectedPurpose, setSelectedPurpose] = useState("");
    const [deliveryMode, setDeliveryMode] = useState("PHYSICAL");
    const [formalLetter, setFormalLetter] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchingReasons, setFetchingReasons] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        // Fetch reasons
        const fetchReasons = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`${API_BASE_URL}/bonafide/reasons`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setReasons(data);
                }
            } catch (err) {
                console.error("Failed to fetch reasons");
            } finally {
                setFetchingReasons(false);
            }
        };
        if (user) fetchReasons();
    }, [user]);

    const [files, setFiles] = useState<FileList | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const formData = new FormData();
            formData.append("purposeId", selectedPurpose);
            formData.append("formalLetterText", formalLetter);
            formData.append("deliveryMode", deliveryMode);

            if (files) {
                for (let i = 0; i < files.length; i++) {
                    formData.append("documents", files[i]);
                }
            }

            const res = await fetch(`${API_BASE_URL}/bonafide`, {
                method: "POST",
                headers: {
                    // Content-Type must be undefined so browser sets boundary
                    Authorization: `Bearer ${token}`
                },
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to submit request");

            setSuccess(true);
            setTimeout(() => router.push("/dashboard"), 2000);
        } catch (err) {
            setError("Failed to submit request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 animate-bounce" />
                <h2 className="text-2xl font-bold">Request Submitted Successfully!</h2>
                <p className="text-gray-500">Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>New Bonafide Certificate Request</CardTitle>
                    <CardDescription>
                        Please specify the reason for your request. Your formal letter will be reviewed by the Tutor.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="text-red-500 text-sm">{error}</div>}

                        <div className="space-y-2">
                            <Label>Purpose</Label>
                            <Select onValueChange={setSelectedPurpose} required>
                                <SelectTrigger>
                                    <SelectValue placeholder={fetchingReasons ? "Loading reasons..." : "Select a purpose"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {reasons.map((r) => (
                                        <SelectItem key={r.id} value={r.id}>
                                            {r.reason} <span className="text-gray-400 text-xs ml-2">({r.category})</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Delivery Mode</Label>
                            <Select onValueChange={setDeliveryMode} defaultValue="PHYSICAL">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Delivery Mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PHYSICAL">Physical Copy (Collect from Office)</SelectItem>
                                    <SelectItem value="DIGITAL">Digital Copy (Download PDF)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Supporting Documents (Optional)</Label>
                            <input
                                type="file"
                                multiple
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                onChange={(e) => setFiles(e.target.files)}
                            />
                            <p className="text-xs text-gray-500">
                                Upload valid proofs (e.g., Internship Offer, ID Card). PDF or Images allowed.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Formal Letter / Detailed Message</Label>
                            <Textarea
                                placeholder="Respected Sir/Madam, I am writing to request a bonafide certificate for..."
                                className="min-h-[200px]"
                                value={formalLetter}
                                onChange={(e) => setFormalLetter(e.target.value)}
                                required
                            />
                            <p className="text-xs text-gray-500">
                                Please include relevant dates and specific details required for the certificate.
                            </p>
                        </div>

                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading || !selectedPurpose}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Request
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

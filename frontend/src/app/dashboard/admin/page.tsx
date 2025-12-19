"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { API_BASE_URL } from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    department?: string;
    section?: string;
}

export default function AdminPage() {
    const { token } = useAuth();
    // const { toast } = useToast(); -> Removed for simplicity
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchUsers();
    }, [token]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                alert("Success: User role updated");
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            } else {
                throw new Error("Failed to update");
            }
        } catch (error) {
            alert("Error: Failed to update role");
        }
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage user roles and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Role</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.fullName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.department} {user.section && `(${user.section})`}</TableCell>
                                        <TableCell>
                                            <Select
                                                defaultValue={user.role}
                                                onValueChange={(val) => handleRoleChange(user.id, val)}
                                                disabled={user.email === 'admin@college.edu'} // Prevent editing master admin
                                            >
                                                <SelectTrigger className="w-[140px]">
                                                    <SelectValue>{user.role}</SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="STUDENT">Student</SelectItem>
                                                    <SelectItem value="TUTOR">Tutor</SelectItem>
                                                    <SelectItem value="HOD">HOD</SelectItem>
                                                    <SelectItem value="PRINCIPAL">Principal</SelectItem>
                                                    <SelectItem value="OFFICE">Office</SelectItem>
                                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

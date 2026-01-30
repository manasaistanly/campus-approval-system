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
                const contentType = res.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const data = await res.json();
                    setUsers(data);
                } else {
                    const text = await res.text();
                    console.error("Non-JSON response from /users:", text);
                }
            } else {
                console.error("Failed to fetch users:", res.status, res.statusText);
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
                    <>
                        {/* Mobile View - Card Layout */}
                        <div className="md:hidden space-y-4">
                            {users.map((user) => (
                                <Card key={user.id}>
                                    <CardContent className="pt-6">
                                        <div className="space-y-3">
                                            <div>
                                                <p className="font-semibold text-base">{user.fullName}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                            <div className="text-sm">
                                                <p className="text-gray-500">Department</p>
                                                <p className="font-medium mt-1">
                                                    {user.department} {user.section && `(${user.section})`}
                                                </p>
                                            </div>
                                            <div className="text-sm">
                                                <p className="text-gray-500 mb-2">Role</p>
                                                <Select
                                                    defaultValue={user.role}
                                                    onValueChange={(val) => handleRoleChange(user.id, val)}
                                                    disabled={user.email === 'manasaistanly0@gmail.com'}
                                                >
                                                    <SelectTrigger className="w-full">
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
                                                    disabled={user.email === 'manasaistanly0@gmail.com'} // Prevent editing master admin
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
                    </>
                </CardContent>
            </Card>
        </div>
    );
}

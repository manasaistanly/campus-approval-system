"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, LogOut, FileText, User, Home, BookOpen, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ROLE_LINKS = {
    STUDENT: [
        { href: "/dashboard", label: "Overview", icon: Home },
        { href: "/dashboard/request", label: "New Request", icon: FileText },
        { href: "/dashboard/history", label: "My History", icon: BookOpen },
        { href: "/dashboard/profile", label: "Profile", icon: User },
    ],
    TUTOR: [
        { href: "/dashboard", label: "Overview", icon: Home },
        { href: "/dashboard/approvals", label: "Pending Approvals", icon: FileText },
        { href: "/dashboard/history", label: "Approval History", icon: BookOpen },
    ],
    HOD: [
        { href: "/dashboard", label: "Overview", icon: Home },
        { href: "/dashboard/approvals", label: "Pending Approvals", icon: FileText },
        { href: "/dashboard/reports", label: "Reports", icon: BookOpen },
    ],
    PRINCIPAL: [
        { href: "/dashboard", label: "Overview", icon: Home },
        { href: "/dashboard/approvals", label: "Pending Approvals", icon: FileText },
        { href: "/dashboard/reports", label: "Reports", icon: BookOpen },
    ],
    OFFICE: [
        { href: "/dashboard", label: "Overview", icon: Home },
        { href: "/dashboard/fees", label: "Fee Structures", icon: BookOpen },
        { href: "/dashboard/approvals", label: "Pending Approvals", icon: FileText },
        { href: "/dashboard/settings", label: "System Settings", icon: Settings },
    ],
    ADMIN: [
        { href: "/dashboard", label: "Overview", icon: Home },
        { href: "/dashboard/admin", label: "User Management", icon: Settings }, // Using Settings icon as placeholder or import Shield
    ]
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) {
        return <div className="p-10 text-center">Loading...</div>; // Or redirect
    }

    // Type assertion for user.role as keyof typeof ROLE_LINKS
    // In real app, validate role.
    const links = ROLE_LINKS[user.role as keyof typeof ROLE_LINKS] || [];

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-zinc-900">
            {/* Mobile Sidebar */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-50">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                    <SidebarContent links={links} pathname={pathname} logout={logout} />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r bg-white dark:bg-zinc-950">
                <SidebarContent links={links} pathname={pathname} logout={logout} />
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-gray-500">Welcome back, {user.fullName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                            {user.role}
                        </div>
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}

function SidebarContent({ links, pathname, logout }: { links: any[], pathname: string, logout: () => void }) {
    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
            <div className="p-6 border-b flex items-center gap-3">
                <Image src="/logo.png" alt="Bonafide Logo" width={40} height={40} className="rounded-lg" />
                <span className="font-bold text-lg tracking-tight">Bonafide</span>
            </div>
            <div className="flex-1 py-6 px-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link key={link.href} href={link.href}>
                            <div className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
                                isActive
                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 font-medium"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                            )}>
                                <Icon className="h-5 w-5" />
                                {link.label}
                            </div>
                        </Link>
                    );
                })}
            </div>
            <div className="p-4 border-t">
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, FileText, Palette, Hotel, Calendar, UserCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useBrandSettings } from "@/hooks/useBrandSettings";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [activeTab, setActiveTab] = useState("all");
    const { brand } = useBrandSettings();

    const sidebarLinks = [
        { name: "All Quotes", icon: LayoutDashboard, id: "all", href: "/admin" },
        { name: "Create New", icon: Plus, id: "new", href: "/admin/new" },
        { name: "Branding", icon: Palette, id: "branding", href: "/admin/branding" },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50/50 font-montserrat">
            {/* Sidebar */}
            <aside className="w-80 border-r border-gray-100 bg-white p-8 flex flex-col gap-12 sticky top-0 h-screen">
                <div className="flex flex-col gap-4">
                    {brand?.companyLogo ? (
                        <img src={brand.companyLogo} className="h-10 w-auto object-contain self-start" alt="Logo" />
                    ) : (
                        <h1 className="text-3xl font-black text-primary tracking-tighter">
                            YouthCamping
                        </h1>
                    )}
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] pl-1">
                        Admin Dashboard
                    </p>
                </div>

                <nav className="flex flex-col gap-4">
                    {sidebarLinks.map((link) => (
                        <Link
                            key={link.id}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all transform hover:translate-x-1",
                                activeTab === link.id
                                    ? "bg-primary text-white shadow-xl shadow-primary/20"
                                    : "text-gray-500 hover:bg-primary/5 hover:text-primary"
                            )}
                            onClick={() => setActiveTab(link.id)}
                        >
                            <link.icon size={20} />
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto flex flex-col gap-6">
                    <GlassCard variant="orange" className="p-6 rounded-3xl">
                        <h3 className="font-bold text-primary text-sm mb-2">Need Help?</h3>
                        <p className="text-[10px] text-primary/60 font-medium leading-relaxed">
                            If you encounter any issues building a luxury proposal, contact support.
                        </p>
                    </GlassCard>

                    <Button 
                        variant="ghost" 
                        className="w-full text-red-500 hover:bg-red-50 hover:text-red-600 rounded-2xl py-4 font-bold border border-transparent hover:border-red-100"
                        onClick={() => {
                            document.cookie = "admin_token=; path=/; max-age=0";
                            window.location.href = "/";
                        }}
                    >
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-16">
                    <div>
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                            Welcome back, Team
                        </h2>
                        <p className="text-gray-500 font-medium mt-2">
                            Generate ultra-luxury travel proposals in seconds.
                        </p>
                    </div>

                    <Link href="/admin/new">
                        <Button size="lg" className="rounded-2xl px-8">
                            <Plus className="mr-2" size={20} />
                            New Proposal
                        </Button>
                    </Link>
                </header>

                {children}
            </main>
        </div>
    );
}

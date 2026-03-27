"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { toast } from "sonner";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simple auth check: Use a hardcoded password for now (or a secret from env)
        // Since it's a "mock" auth check as per the user's request
        if (password === "admin123") {
            // Set cookie: admin_token=authenticated
            document.cookie = "admin_token=authenticated; path=/; max-age=86400"; // 24 hours
            toast.success("Login successful!");
            router.push("/admin");
        } else {
            toast.error("Invalid password.");
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center p-6 bg-gray-50/50 font-montserrat">
            <div className="w-full max-w-md">
                <GlassCard className="p-10 shadow-3xl">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black text-primary tracking-tighter mb-2">Admin Login</h1>
                        <p className="text-gray-400 font-semibold uppercase tracking-widest text-xs italic">YouthCamping Management</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="password">Administrator Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter admin password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="h-12 border-2 border-gray-100"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-6 rounded-2xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-xs"
                            disabled={isLoading}
                        >
                            {isLoading ? "Authenticating..." : "Sign In to Dashboard"}
                        </Button>
                    </form>
                    
                    <div className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Only authorized personnel permitted
                    </div>
                </GlassCard>
            </div>
        </main>
    );
}

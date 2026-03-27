"use client";

import Link from "next/link";
import { useBrandSettings } from "@/hooks/useBrandSettings";
import { motion } from "framer-motion";

export default function Home() {
    const { brand } = useBrandSettings();

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-white text-center font-montserrat relative selection:bg-primary/20">
            {/* Elegant Background Decoration */}
            <div className="absolute top-0 right-0 -z-10 w-1/2 h-1/2 bg-gradient-to-br from-primary/5 via-transparent to-transparent blur-[120px]" />
            <div className="absolute bottom-0 left-0 -z-10 w-1/2 h-1/2 bg-gradient-to-tr from-primary/[0.03] via-transparent to-transparent blur-[120px]" />

            <div className="z-10 max-w-5xl w-full flex flex-col items-center gap-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center"
                >
                    {brand?.companyLogo ? (
                        <img src={brand.companyLogo} className="h-28 w-auto object-contain mb-8 drop-shadow-xl" alt="Company Logo" />
                    ) : (
                        <h1 className="text-8xl font-[900] text-primary tracking-tighter mb-4 uppercase scale-90 md:scale-100">
                            YouthCamping
                        </h1>
                    )}

                    <div className="h-px w-24 bg-primary/20 mb-8" />

                    <p className="text-3xl md:text-5xl font-black text-gray-900 uppercase tracking-[0.2em] italic mb-4">
                        Curated Luxury Travel
                    </p>
                    <p className="text-sm md:text-lg font-black text-primary uppercase tracking-[0.6em] opacity-60">
                        One Trip at a Time
                    </p>
                </motion.div>

                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="max-w-2xl text-gray-500 font-medium leading-relaxed text-sm md:text-base italic"
                >
                    &quot;We orchestrate bespoke journeys that transcend the ordinary, blending uncompromising luxury with authentic cultural immersion for the discerning traveler.&quot;
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="flex flex-col md:flex-row gap-6 mt-10"
                >
                    <button className="px-14 py-6 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-primary/30 hover:bg-primary-deep transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95">
                        Discover Destinations
                    </button>
                    <button className="px-14 py-6 bg-white border-2 border-primary text-primary font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-primary/5 transition-all transform hover:-translate-y-1 hover:scale-105 active:scale-95">
                        Our Experience
                    </button>
                </motion.div>

                {/* Secure Entry — Subtle and Professional */}
                <div className="mt-20 opacity-0 hover:opacity-100 transition-opacity duration-500">
                    <Link
                        href="/login"
                        className="text-[10px] text-gray-300 font-black uppercase tracking-widest hover:text-primary transition-colors py-4 px-8 border border-gray-100 rounded-full hover:border-primary/20"
                    >
                        Management Login
                    </Link>
                </div>
            </div>

            <footer className="absolute bottom-10 text-[9px] font-black uppercase tracking-[0.5em] text-gray-400 opacity-40">
                &copy; {new Date().getFullYear()} YouthCamping Luxury Travel. All Rights Reserved.
            </footer>
        </main>
    );
}

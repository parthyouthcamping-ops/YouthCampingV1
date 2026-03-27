"use client";

import { notFound, useParams } from "next/navigation";
import { PREDEFINED_QUOTES } from "@/lib/itineraries";
import { motion } from "framer-motion";
import { 
    Users, 
    Calendar, 
    MapPin, 
    CheckCircle2, 
    XCircle, 
    Star, 
    Sparkles, 
    Download, 
    Utensils, 
    Hotel as HotelIcon, 
    MessageCircle as WhatsAppIcon,
    ShieldCheck,
    Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import { ImageSlider } from "@/components/ui/ImageSlider";

export default function QuotationPage() {
    const params = useParams();
    const slug = params.slug as string;

    // Task 1: Mapping data correctly
    const data = PREDEFINED_QUOTES[slug];

    if (!data) {
        return notFound();
    }

    const handleDownloadPDF = () => {
        window.print();
    };

    return (
        <div className="bg-white min-h-screen font-montserrat text-[#1a1a1a] selection:bg-primary/20 pdf-container overflow-x-hidden">
             {/* Print Styles */}
             <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    .pdf-container { background: white !important; padding: 0 !important; color: black !important; }
                    .pdf-section { page-break-after: always; padding: 10mm !important; }
                    .itinerary-item { page-break-inside: avoid; margin-bottom: 20px; }
                    header, footer { border: none !important; position: static !important; }
                    .glass-card { background: white !important; border: 1px solid #eee !important; box-shadow: none !important; }
                    .bg-primary { background-color: #f97316 !important; print-color-adjust: exact; }
                    .text-primary { color: #f97316 !important; print-color-adjust: exact; }
                }
            `}</style>

            {/* Premium Header */}
            <header className="sticky top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md h-[80px] flex items-center border-b border-gray-100 no-print">
                <div className="container mx-auto flex items-center justify-between px-6">
                    <h2 className="text-xl font-black tracking-tighter text-gray-900 uppercase italic">YouthCamping</h2>
                    <div className="flex items-center gap-4">
                        <Button onClick={handleDownloadPDF} variant="outline" className="hidden md:flex rounded-xl font-black uppercase text-[10px] tracking-widest h-11 border-2">
                           <Download size={14} className="mr-2" /> Download PDF
                        </Button>
                        <Button onClick={() => window.open(`https://wa.me/${data.expert.whatsapp}`, '_blank')} className="rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl h-11 px-8">
                           Confirm Booking
                        </Button>
                    </div>
                </div>
            </header>

            {/* Task 2: Header Section */}
            <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
                <img src={data.heroImage} className="absolute inset-0 w-full h-full object-cover" alt={data.destination} />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white" />
                
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <h1 className="text-6xl md:text-9xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
                            {data.destination.split(',')[0]}
                        </h1>
                        <div className="flex items-center justify-center gap-6">
                            <span className="h-px w-12 bg-white/60" />
                            <span className="text-white font-bold text-xl tracking-[0.4em] uppercase">{data.duration}</span>
                            <span className="h-px w-12 bg-white/60" />
                        </div>
                        <div className="mt-8">
                             <span className="bg-primary text-white px-10 py-4 rounded-2xl font-black text-2xl shadow-2xl">
                                ₹{(data.lowLevelPrice || 0).toLocaleString()} <span className="text-xs opacity-70">Starting</span>
                             </span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Task 2: Itinerary Rendering */}
            <section className="py-24 bg-gray-50/50">
                <div className="container mx-auto px-6 max-w-5xl">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black tracking-tight text-gray-900 uppercase">Your Curated Journey</h2>
                        <div className="h-1.5 w-20 bg-primary mx-auto mt-4 rounded-full" />
                    </div>

                    <div className="space-y-12">
                        {data.itinerary?.map((day, idx) => (
                            <motion.div 
                                key={idx} 
                                initial={{ opacity: 0, x: -20 }} 
                                whileInView={{ opacity: 1, x: 0 }} 
                                viewport={{ once: true }}
                                className="itinerary-item"
                            >
                                <GlassCard className="p-0 overflow-hidden flex flex-col md:flex-row gap-0 rounded-[2.5rem] border-none shadow-xl ring-1 ring-gray-100">
                                    <div className="md:w-1/3 h-64 md:h-auto overflow-hidden">
                                        <img src={day.photos[0]} className="w-full h-full object-cover" alt={day.title} />
                                    </div>
                                    <div className="flex-1 p-10 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <span className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center text-xl font-black italic">
                                                0{day.day}
                                            </span>
                                            <h3 className="text-2xl font-black text-gray-900 uppercase">{day.title}</h3>
                                        </div>
                                        <p className="text-gray-500 font-medium leading-relaxed italic">{day.description}</p>
                                        
                                        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                                            <div className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                <Utensils size={16} className="text-primary" /> {day.meals}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-widest">
                                                <HotelIcon size={16} className="text-primary" /> {day.stay}
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Task 2: Sections Below */}
            <section className="py-24 container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="space-y-10">
                        <h2 className="text-3xl font-black text-gray-900 uppercase flex items-center gap-4">
                            <CheckCircle2 className="text-green-500" /> Inclusions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.includes?.map((inc, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-600 bg-gray-50 p-4 rounded-2xl border border-gray-100 uppercase tracking-wide">
                                    <div className="w-2 h-2 rounded-full bg-primary" /> {inc}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-10">
                        <h2 className="text-3xl font-black text-gray-900 uppercase flex items-center gap-4">
                            <XCircle className="text-red-400" /> Exclusions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.exclusions?.map((exc, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm font-bold text-gray-400 bg-gray-50/50 p-4 rounded-2xl border border-gray-50 uppercase tracking-wide">
                                    <div className="w-2 h-2 rounded-full bg-gray-300" /> {exc}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Task 2: Trust Section */}
            <section className="py-24 bg-gray-900 text-white rounded-[4rem] mx-6 mb-24 p-16 text-center pdf-section">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="space-y-4">
                        <div className="flex justify-center gap-1 text-primary">
                            {[1,2,3,4,5].map(i => <Star key={i} size={28} fill="currentColor" />)}
                        </div>
                        <h2 className="text-5xl font-black uppercase tracking-tighter">Trusted by 1.7L+ Travelers</h2>
                        <p className="text-primary font-black uppercase tracking-[0.4em] text-sm italic">Overall Rating: 4.8 / 5.0</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <GlassCard className="bg-white/5 border-white/10 p-8 text-left space-y-4">
                            <Quote size={30} className="text-primary opacity-40" />
                            <p className="italic text-gray-300 font-medium">&quot;Our Bali trip was perfectly organized. The private villas was stunning and the itinerary was active yet relaxing.&quot;</p>
                            <div className="pt-4 border-t border-white/5">
                                <p className="font-black uppercase tracking-widest text-xs">Rahul & Sneha</p>
                            </div>
                        </GlassCard>
                        <GlassCard className="bg-white/5 border-white/10 p-8 text-left space-y-4">
                            <Quote size={30} className="text-primary opacity-40" />
                            <p className="italic text-gray-300 font-medium">&quot;The Vietnam street food tour in Hanoi was the highlight of our journey. YouthCamping knows the best local spots!&quot;</p>
                            <div className="pt-4 border-t border-white/5">
                                <p className="font-black uppercase tracking-widest text-xs">Vikram Singh</p>
                            </div>
                        </GlassCard>
                    </div>

                    <div className="flex items-center justify-center gap-10 pt-10 border-t border-white/10">
                         <div className="flex flex-col items-center gap-2">
                             <ShieldCheck size={40} className="text-primary" />
                             <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Verified Secure</span>
                         </div>
                         <div className="flex flex-col items-center gap-2">
                             <WhatsAppIcon size={40} className="text-primary" />
                             <span className="text-[10px] font-black uppercase tracking-widest opacity-60">24/7 Support</span>
                         </div>
                    </div>
                </div>
            </section>

            <footer className="py-20 text-center opacity-40">
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">&copy; {new Date().getFullYear()} YouthCamping Global travel. All Rights Reserved.</p>
            </footer>
        </div>
    );
}

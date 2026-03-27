"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { getQuotationBySlug } from "@/lib/store";
import { Quotation } from "@/lib/types";
import { useBrandSettings } from "@/hooks/useBrandSettings";
import { motion, useScroll, useTransform } from "framer-motion";
import { ImageSlider } from "@/components/ui/ImageSlider";
import { GlassCard } from "@/components/ui/GlassCard";
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
    Instagram,
    MessageCircle as WhatsAppIcon,
    ArrowRight,
    Globe,
    Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LuxuryView() {
    const { slug } = useParams();
    const [q, setQ] = useState<Quotation | null>(null);
    const [loading, setLoading] = useState(true);
    const { brand } = useBrandSettings();
    const [selectedTier, setSelectedTier] = useState<'standard' | 'luxury'>('standard');
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

    useEffect(() => {
        const load = async () => {
            if (slug) {
                try {
                    const quoteData = await getQuotationBySlug(slug as string);
                    setQ(quoteData || null);
                } catch (error) {
                    console.error("Failed to load quotation:", error);
                    setQ(null);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        load();
    }, [slug]);


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white font-montserrat">
            <div className="text-center animate-pulse">
                <h1 className="text-4xl font-black text-primary italic">YouthCamping</h1>
                <p className="text-gray-400 font-semibold uppercase tracking-widest mt-4">One Trip at a Time</p>
            </div>
        </div>
    );

    if (!q) {
        return notFound();
    }

    return (
        <div className="bg-white min-h-screen font-montserrat text-[#1a1a1a] selection:bg-primary/20 pdf-container overflow-x-hidden">
            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    .no-print { display: none !important; }
                    .pdf-container { background: white !important; padding: 0 !important; color: black !important; }
                    .pdf-section { page-break-after: always; padding: 20mm !important; }
                    .itinerary-item { page-break-inside: avoid; margin-bottom: 20px; }
                    header, footer { border: none !important; position: static !important; }
                    .pricing-card { position: static !important; width: 100% !important; border: 2px solid #eee !important; box-shadow: none !important; }
                    img { max-width: 100% !important; }
                    .glass-card { background: white !important; border: 1px solid #eee !important; box-shadow: none !important; }
                    .bg-primary { background-color: #f97316 !important; print-color-adjust: exact; }
                    .text-primary { color: #f97316 !important; print-color-adjust: exact; }
                }
            `}</style>

            {/* Premium Branding Header */}
            <header className="sticky top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md h-[90px] flex items-center transition-all duration-300 border-b border-gray-100 no-print">
                <div className="container mx-auto flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        {brand && brand.companyLogo ? (
                            <img src={brand.companyLogo} className="h-12 w-auto object-contain" alt="Logo" />
                        ) : (
                            <h2 className="text-xl font-black tracking-tighter text-gray-900 uppercase">YOUTHCAMPING</h2>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Button 
                             onClick={() => {
                                const message = encodeURIComponent(`Hi ${q.expert.name || 'Travel Expert'}, I want to book my ${q.destination} trip! Link: ${window.location.href}`);
                                window.open(`https://wa.me/${q.expert.whatsapp}?text=${message}`, '_blank');
                            }}
                            className="rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 h-12 px-8"
                        >
                            Confirm Booking
                        </Button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative h-[90vh] flex items-center justify-center overflow-hidden pdf-section">
                <motion.div style={{ opacity: heroOpacity }} className="absolute inset-0">
                    <img src={q.heroImage || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"}
                        className="w-full h-full object-cover" alt={q.destination} />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-white" />
                </motion.div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <h4 className="text-white text-xs md:text-sm font-black uppercase tracking-[0.6em] drop-shadow-lg opacity-90">
                            A CURATED JOURNEY PREPARED FOR {q.clientName.toUpperCase()}
                        </h4>
                        <h1 className="text-7xl md:text-[11rem] font-[900] text-white tracking-tighter drop-shadow-2xl leading-[0.8] uppercase mb-4">
                            {q.destination}
                        </h1>
                        <div className="flex items-center justify-center gap-6 mt-4">
                            <span className="h-[1px] w-20 bg-white/40" />
                            <span className="text-white font-bold text-sm md:text-xl tracking-[0.4em] uppercase">
                                {q.duration} • LUXURY EDITION
                            </span>
                            <span className="h-[1px] w-20 bg-white/40" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Quick Summary Grid */}
            <section className="relative z-30 -mt-20 px-6 container mx-auto">
                <GlassCard className="p-10 md:p-14 rounded-[4rem] shadow-4xl bg-white border-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 glass-card">
                    <div className="flex items-center gap-6 border-r border-gray-100 pr-6 last:border-0 last:pr-0">
                        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <Users size={30} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Guests</p>
                            <p className="text-xl font-bold text-gray-900">{q.pax} Premium Travelers</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 border-r border-gray-100 pr-6 last:border-0 last:pr-0">
                        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <Calendar size={30} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Timeline</p>
                            <p className="text-xl font-bold text-gray-900">
                                {q.travelDates?.from ? new Date(q.travelDates.from).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : "TBA"} - {q.travelDates?.to ? new Date(q.travelDates.to).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ""}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 border-r border-gray-100 pr-6 last:border-0 last:pr-0">
                        <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                            <Globe size={30} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Region</p>
                            <p className="text-xl font-bold text-gray-900 uppercase tracking-widest">{q.destination.split(',')[0]}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 no-print">
                            <Star size={30} fill="currentColor" />
                        </div>
                        <div>
                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 mb-2 no-print">
                                {['standard', 'luxury'].map((tier) => (
                                    <button
                                        key={tier}
                                        onClick={() => setSelectedTier(tier as any)}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${selectedTier === tier ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Choice {tier === 'standard' ? '01' : '02'}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Package Value</p>
                            <p className="text-2xl font-black text-primary italic">
                                ₹{(selectedTier === 'standard' ? (q.lowLevelPrice || 0) : (q.highLevelPrice || 0)).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </section>

            {/* Professional Introduction */}
            <section className="py-32 container mx-auto px-6 pdf-section">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <span className="text-primary font-black uppercase tracking-[0.4em] text-xs italic">The Philosophy</span>
                            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.9] uppercase">
                                Your <span className="text-primary">Signature</span> <br/>Escape
                            </h2>
                        </div>
                        <p className="text-xl text-gray-500 leading-relaxed font-medium italic">
                            &quot;We don't just plan trips; we orchestrate masterpieces. Every detail of your {q.destination} journey has been hand-selected to ensure a seamless blend of cultural immersion and uncompromising luxury.&quot;
                        </p>
                        <div className="flex gap-4 no-print">
                           {['Private Transfers', '5-Star Stays', 'Expert Guides'].map(tag => (
                               <span key={tag} className="px-6 py-3 bg-gray-50 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">{tag}</span>
                           ))}
                        </div>
                    </div>
                    <div className="relative">
                         <div className="absolute -inset-10 bg-primary/5 rounded-[5rem] blur-3xl" />
                         <img src={q.coverImage || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2070&auto=format&fit=crop"} 
                              className="w-full aspect-[4/5] object-cover rounded-[4rem] shadow-4xl border-8 border-white relative z-10" alt="Cover" />
                    </div>
                </div>
            </section>

            {/* Detailed Itinerary Sections */}
            <section className="py-32 bg-gray-50/50 pdf-section">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col items-center text-center gap-6 mb-32">
                        <div className="h-1.5 w-24 bg-primary rounded-full" />
                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-gray-900 uppercase">
                           The Itinerary
                        </h2>
                        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-sm italic">Detailed day-wise experience breakdown</p>
                    </div>

                    <div className="space-y-40">
                        {q.itinerary?.map((day, idx) => (
                            <div key={day.id} className="itinerary-item group">
                                <div className={`flex flex-col lg:flex-row gap-16 lg:gap-24 items-start ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                                    {/* Content Side */}
                                    <motion.div 
                                        initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="flex-1 space-y-10"
                                    >
                                        <div className="flex items-center gap-6">
                                            <span className="text-7xl font-black text-primary/10 tracking-tighter italic">0{day.day}</span>
                                            <div className="space-y-1">
                                                <h3 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900 uppercase">{day.title}</h3>
                                                <div className="flex items-center gap-4 text-primary italic font-bold text-xs uppercase tracking-widest">
                                                    <span>{day.stay || 'Premium Stay'}</span>
                                                    <span className="h-1 w-1 bg-primary rounded-full" />
                                                    <span>{day.meals || 'Breakfast Included'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-lg text-gray-500 font-medium leading-[1.8] italic bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
                                            {day.description}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                                    <Sparkles size={14} /> Highlights
                                                </h4>
                                                <ul className="space-y-3">
                                                    {day.activities?.map((act, i) => (
                                                        <li key={i} className="flex items-start gap-3 group/item">
                                                            <div className="w-1.5 h-1.5 bg-primary/30 rounded-full mt-1.5 group-hover/item:scale-150 transition-transform" />
                                                            <span className="text-sm font-bold uppercase tracking-wide text-gray-700">{act}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="space-y-4">
                                                <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                                                    <Utensils size={14} /> Culinary & Rest
                                                </h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-500 uppercase">
                                                        <Utensils size={14} className="opacity-40" /> {day.meals}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-500 uppercase">
                                                        <HotelIcon size={14} className="opacity-40" /> {day.stay}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Visual Side */}
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        className="flex-1 w-full"
                                    >
                                        <ImageSlider images={day.photos} className="rounded-[4rem] shadow-4xl border-8 border-white overflow-hidden aspect-[4/3]" />
                                    </motion.div>
                                </div>
                                {idx < q.itinerary.length - 1 && (
                                    <div className="h-px w-full bg-gray-100 mt-40 no-print" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Inclusions & Exclusions */}
            <section className="py-32 container mx-auto px-6 pdf-section">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <span className="text-green-500 font-black uppercase tracking-[0.4em] text-xs italic">What's Covered</span>
                            <h2 className="text-5xl font-black text-gray-900 uppercase">Total Inclusion</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-gray-50 p-12 rounded-[4rem] border border-gray-100">
                            {q.includes?.map((inc, i) => (
                                <div key={i} className="flex items-start gap-4 group">
                                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-600 leading-tight">{inc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <span className="text-red-400 font-black uppercase tracking-[0.4em] text-xs italic">What's Extra</span>
                            <h2 className="text-5xl font-black text-gray-900 uppercase">Main Exclusion</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-gray-50 p-12 rounded-[4rem] border border-gray-100">
                            {q.exclusions?.map((exc, i) => (
                                <div key={i} className="flex items-start gap-4 opacity-70">
                                    <XCircle size={18} className="text-red-300 shrink-0" />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-gray-400 leading-tight">{exc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Optional Experiences */}
            {q.optionalActivities && q.optionalActivities.length > 0 && (
                <section className="py-32 container mx-auto px-6 pdf-section">
                    <div className="flex flex-col items-center text-center gap-6 mb-16">
                        <span className="text-primary font-black uppercase tracking-[0.4em] text-xs italic">Enhance Your Journey</span>
                        <h2 className="text-5xl font-black text-gray-900 uppercase">Optional Add-ons</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {q.optionalActivities.map((opt, i) => (
                            <GlassCard key={i} className="p-10 rounded-[3rem] border border-gray-100 hover:border-primary/20 transition-all flex flex-col justify-between group">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-black text-gray-900 uppercase group-hover:text-primary transition-colors">{opt.name}</h3>
                                    <p className="text-sm text-gray-400 font-medium leading-relaxed italic">{opt.description}</p>
                                </div>
                                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Investment</span>
                                    <span className="text-lg font-black text-primary">₹{opt.price.toLocaleString()}</span>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                </section>
            )}

            {/* Logistics & Expertise */}
            <section className="py-32 bg-gray-900 text-white rounded-[5rem] mx-6 mb-32 p-20 pdf-section">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                                Expertly <br/>Guided by <br/><span className="text-primary italic">{q.expert.name}</span>
                            </h3>
                            <p className="text-gray-400 text-lg font-medium">{q.expert.designation || 'Your Destination Host'}</p>
                        </div>
                        <div className="flex items-center gap-10">
                            <Button 
                                onClick={() => window.open(`https://wa.me/${q.expert.whatsapp}`, '_blank')}
                                className="bg-white text-gray-900 rounded-2xl px-12 py-8 text-lg font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all no-print">
                                Connect on WhatsApp
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-10">
                        <img src={q.expert.photo} className="w-64 h-64 rounded-[3rem] object-cover ring-8 ring-white/10 shadow-4xl p-2 bg-white/5" alt="Expert" />
                        <div className="text-center space-y-2">
                            <p className="text-xs font-black uppercase tracking-[0.5em] text-primary">Certified Expert</p>
                            <p className="text-2xl font-bold italic">Specializing in {q.destination.split(',')[0]} Luxury</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simplified Footer */}
            <footer className="py-20 border-t border-gray-100 text-center space-y-8">
                <div className="flex flex-col items-center gap-4">
                    <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">YouthCamping</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-400">Luxury Travel Reimagined</p>
                </div>
                <div className="flex justify-center gap-10 no-print">
                   <Instagram size={20} className="text-gray-300 hover:text-primary transition-colors cursor-pointer" />
                   <Globe size={20} className="text-gray-300 hover:text-primary transition-colors cursor-pointer" />
                   <Smartphone size={20} className="text-gray-300 hover:text-primary transition-colors cursor-pointer" />
                </div>
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest pt-10">
                    &copy; {new Date().getFullYear()} YouthCamping Global Luxury Travel. All Rights Reserved.
                </p>
            </footer>

            {/* Fixed Booking Bar for Mobile - no-print */}
            <div className="fixed bottom-6 left-6 right-6 z-[110] md:hidden no-print">
                <Button 
                    onClick={() => {
                        const message = encodeURIComponent(`Hi ${q.expert.name}, I'm interested in booking the ${q.destination} trip!`);
                        window.open(`https://wa.me/${q.expert.whatsapp}?text=${message}`, '_blank');
                    }}
                    className="w-full h-16 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-2xl shadow-primary/40 flex items-center justify-between px-8"
                >
                    <span>Reserve Package</span>
                    <ArrowRight size={18} />
                </Button>
            </div>
        </div>
    );
}

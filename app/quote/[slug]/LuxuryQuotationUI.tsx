"use client";

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
import { useState } from "react";

interface LuxuryQuotationUIProps {
    q: Quotation;
}

export default function LuxuryQuotationUI({ q }: LuxuryQuotationUIProps) {
    const { brand } = useBrandSettings();
    const [selectedTier, setSelectedTier] = useState<'standard' | 'luxury'>('standard');
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

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
            <header className="sticky top-0 left-0 right-0 z-[100] bg-white/90 backdrop-blur-md h-20 md:h-[90px] flex items-center transition-all duration-300 border-b border-gray-100 no-print">
                <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-4">
                        {brand && brand.companyLogo ? (
                            <img src={brand.companyLogo} className="h-8 md:h-12 w-auto object-contain" alt="Logo" />
                        ) : (
                            <h2 className="text-lg md:text-xl font-black tracking-tighter text-gray-900 uppercase">YOUTHCAMPING</h2>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                         <Button 
                             onClick={() => {
                                const message = encodeURIComponent(`Hi ${q.expert.name || 'Travel Expert'}, I want to book my ${q.destination} trip! Link: ${window.location.href}`);
                                window.open(`https://wa.me/${q.expert.whatsapp}?text=${message}`, '_blank');
                            }}
                            className="rounded-xl font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-xl shadow-primary/20 h-10 md:h-12 px-4 md:px-8"
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
                        <h4 className="text-white text-[10px] md:text-sm font-black uppercase tracking-[0.4em] md:tracking-[0.6em] drop-shadow-lg opacity-90 px-4">
                            A CURATED JOURNEY PREPARED FOR {q.clientName.toUpperCase()}
                        </h4>
                        <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[11rem] font-[900] text-white tracking-tighter drop-shadow-2xl leading-[0.9] md:leading-[0.8] uppercase mb-1 px-4 break-words">
                            {q.destination}
                        </h1>
                        <p className="text-white/80 font-medium italic text-lg md:text-2xl tracking-wide mb-4">
                            &quot;{q.slug.includes('bali') ? 'The Heaven on Earth awaits you.' : 'A Journey through time and beauty.'}&quot;
                        </p>
                        <div className="flex items-center justify-center gap-4 md:gap-6 mt-4">
                            <span className="h-[1px] w-12 md:w-20 bg-white/40" />
                            <span className="text-white font-bold text-xs md:text-xl tracking-[0.2em] md:tracking-[0.4em] uppercase">
                                {q.duration} • LUXURY EDITION
                            </span>
                            <span className="h-[1px] w-12 md:w-20 bg-white/40" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Quick Summary Grid */}
            <section className="relative z-30 -mt-10 md:-mt-20 px-4 md:px-6 container mx-auto">
                <GlassCard className="p-6 md:p-14 rounded-3xl md:rounded-[4rem] shadow-4xl bg-white border-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 glass-card">
                    <div className="flex items-center gap-6 border-b sm:border-b-0 sm:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-6 last:border-0 last:pr-0">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                            <Users size={24} className="md:w-[30px] md:h-[30px]" />
                        </div>
                        <div>
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Guests</p>
                            <p className="text-base md:text-xl font-bold text-gray-900">{q.pax} Premium Travelers</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 border-b sm:border-b-0 lg:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-6 lg:pr-6 last:border-0 last:pr-0">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                            <Calendar size={24} className="md:w-[30px] md:h-[30px]" />
                        </div>
                        <div>
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Timeline</p>
                            <p className="text-base md:text-xl font-bold text-gray-900">
                                {q.travelDates?.from ? new Date(q.travelDates.from).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : "TBA"} - {q.travelDates?.to ? new Date(q.travelDates.to).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ""}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 border-b sm:border-b-0 sm:border-r border-gray-100 pb-6 sm:pb-0 sm:pr-6 last:border-0 last:pr-0">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shrink-0">
                            <Globe size={24} className="md:w-[30px] md:h-[30px]" />
                        </div>
                        <div>
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Region</p>
                            <p className="text-base md:text-xl font-bold text-gray-900 uppercase tracking-widest">{q.destination.split(',')[0]}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 no-print shrink-0">
                            <Star size={24} fill="currentColor" className="md:w-[30px] md:h-[30px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 mb-2 no-print w-fit">
                                {['standard', 'luxury'].map((tier) => (
                                    <button
                                        key={tier}
                                        onClick={() => setSelectedTier(tier as any)}
                                        className={`px-3 md:px-4 py-1.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${selectedTier === tier ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Choice {tier === 'standard' ? '01' : '02'}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary mb-1">Package Value</p>
                            <p className="text-xl md:text-2xl font-black text-primary italic truncate">
                                ₹{(selectedTier === 'standard' ? (q.lowLevelPrice || 0) : (q.highLevelPrice || 0)).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </section>

            {/* Professional Introduction */}
            <section className="py-16 md:py-32 container mx-auto px-4 md:px-6 pdf-section">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-center">
                    <div className="space-y-6 md:space-y-10">
                        <div className="space-y-2 md:space-y-4">
                            <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs italic">The Philosophy</span>
                            <h2 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.9] uppercase">
                                Your <span className="text-primary">Signature</span> <br className="hidden sm:block" />Escape
                            </h2>
                        </div>
                        <p className="text-base md:text-xl text-gray-500 leading-relaxed font-medium italic">
                            &quot;We don't just plan trips; we orchestrate masterpieces. Every detail of your {q.destination} journey has been hand-selected to ensure a seamless blend of cultural immersion and uncompromising luxury.&quot;
                        </p>
                        <div className="flex flex-wrap gap-3 md:gap-4 no-print">
                           {['Private Transfers', '5-Star Stays', 'Expert Guides'].map(tag => (
                               <span key={tag} className="px-4 md:px-6 py-2 md:py-3 bg-gray-50 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">{tag}</span>
                           ))}
                        </div>
                    </div>
                    <div className="relative mt-10 lg:mt-0">
                         <div className="absolute -inset-6 md:-inset-10 bg-primary/5 rounded-3xl md:rounded-[5rem] blur-2xl md:blur-3xl" />
                         <img src={q.coverImage || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2070&auto=format&fit=crop"} 
                              className="w-full aspect-[4/5] object-cover rounded-3xl md:rounded-[4rem] shadow-4xl border-4 md:border-8 border-white relative z-10" alt="Cover" />
                    </div>
                </div>
            </section>

            {/* Detailed Itinerary Sections */}
            <section className="py-16 md:py-32 bg-gray-50/50 pdf-section" id="itinerary">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col items-center text-center gap-4 md:gap-6 mb-16 md:mb-32">
                        <div className="h-1 md:h-1.5 w-16 md:w-24 bg-primary rounded-full" />
                        <h2 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tighter text-gray-900 uppercase">
                           The Itinerary
                        </h2>
                        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-sm italic px-4">Detailed day-wise experience breakdown</p>
                    </div>

                    <div className="space-y-16 md:space-y-40">
                        {q.itinerary?.map((day, idx) => (
                            <div key={idx} className="itinerary-item group">
                                <div className={`flex flex-col lg:flex-row gap-8 md:gap-16 lg:gap-24 items-start ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                                    {/* Content Side */}
                                    <motion.div 
                                        initial={{ opacity: 0, x: idx % 2 === 0 ? -30 : 30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        className="flex-1 w-full space-y-6 md:space-y-10"
                                    >
                                        <div className="flex flex-col gap-4">
                                            <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/10 rounded-full w-fit">
                                                <span className="text-primary font-black uppercase text-[10px] tracking-widest italic">Day 0{day.day}</span>
                                            </div>
                                            <div className="space-y-1 min-w-0">
                                                <h3 className="text-xl sm:text-2xl md:text-5xl font-black tracking-tight text-gray-900 uppercase truncate">{day.title}</h3>
                                                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-primary italic font-bold text-[10px] md:text-xs uppercase tracking-widest">
                                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                                                        <HotelIcon size={12} className="opacity-50" />
                                                        <span>{day.stay || 'Premium Stay'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                                                        <Utensils size={12} className="opacity-50" />
                                                        <span>{day.meals || 'Breakfast Included'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-sm md:text-lg text-gray-500 font-medium leading-relaxed md:leading-[1.8] italic bg-white p-6 md:p-10 rounded-2xl md:rounded-[3rem] border border-gray-100 shadow-sm break-words">
                                            {day.description}
                                        </p>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                            <div className="space-y-3 md:space-y-4">
                                                <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary">
                                                    <Sparkles size={14} /> Highlights
                                                </h4>
                                                <ul className="space-y-2 md:space-y-3">
                                                    {day.activities?.map((act, i) => (
                                                        <li key={i} className="flex items-start gap-3 group/item">
                                                            <div className="w-1.5 h-1.5 bg-primary/30 rounded-full mt-1.5 md:mt-1.5 group-hover/item:scale-150 transition-transform shrink-0" />
                                                            <span className="text-xs md:text-sm font-bold uppercase tracking-wide text-gray-700 break-words">{act}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="space-y-3 md:space-y-4">
                                                <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary">
                                                    <Utensils size={14} /> Culinary & Rest
                                                </h4>
                                                <div className="space-y-2 md:space-y-3">
                                                    <div className="flex items-center gap-3 text-xs md:text-sm font-bold text-gray-500 uppercase">
                                                        <Utensils size={14} className="opacity-40 shrink-0" /> {day.meals}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs md:text-sm font-bold text-gray-500 uppercase">
                                                        <HotelIcon size={14} className="opacity-40 shrink-0" /> {day.stay}
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
                                         <ImageSlider images={day.photos} className="rounded-3xl md:rounded-[4rem] shadow-4xl border-4 md:border-8 border-white overflow-hidden aspect-[4/3]" />
                                     </motion.div>
                                 </div>
                                 {idx < (q.itinerary?.length || 0) - 1 && (
                                     <div className="h-px w-full bg-gray-100 mt-16 md:mt-40 no-print" />
                                 )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

             {/* Inclusions & Exclusions */}
             <section className="py-16 md:py-32 container mx-auto px-4 md:px-6 pdf-section">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20">
                    <div className="space-y-8 md:space-y-12">
                        <div className="space-y-2 md:space-y-4">
                            <span className="text-green-500 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs italic">What's Covered</span>
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase">Total Inclusion</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-x-12 md:gap-y-6 bg-gray-50 p-6 md:p-12 rounded-3xl md:rounded-[4rem] border border-gray-100">
                            {q.includes?.map((inc, i) => (
                                <div key={i} className="flex items-start gap-4 group">
                                    <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-600 leading-tight break-words">{inc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-8 md:space-y-12">
                        <div className="space-y-2 md:space-y-4">
                            <span className="text-red-400 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs italic">What's Extra</span>
                            <h2 className="text-3xl md:text-5xl font-black text-gray-900 uppercase">Main Exclusion</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-x-12 md:gap-y-6 bg-gray-50 p-6 md:p-12 rounded-3xl md:rounded-[4rem] border border-gray-100">
                            {q.exclusions?.map((exc, i) => (
                                <div key={i} className="flex items-start gap-4 opacity-70">
                                    <XCircle size={18} className="text-red-300 shrink-0" />
                                    <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-gray-400 leading-tight break-words">{exc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust & Testimonials Section */}
            <section className="py-32 bg-white pdf-section">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1 space-y-10">
                            <div className="space-y-4">
                                <span className="text-primary font-black uppercase tracking-[0.4em] text-xs italic">Why Choose Us</span>
                                <h2 className="text-5xl md:text-7xl font-black text-gray-900 uppercase tracking-tighter leading-none">
                                    Trusted by <span className="text-primary italic">10K+</span> Travelers
                                </h2>
                            </div>
                            <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100 w-fit">
                                <div className="flex items-center gap-1 text-primary">
                                    {[1,2,3,4,5].map(s => <Star key={s} size={20} fill="currentColor" />)}
                                </div>
                                <div className="h-10 w-px bg-gray-200" />
                                <span className="text-lg font-black text-gray-900">4.8 AVERAGE RATING</span>
                            </div>
                            <p className="text-xl text-gray-500 font-medium italic leading-relaxed">
                                Join the thousands who have experienced the Youthcamping difference. We prioritize your comfort and experience over everything else.
                            </p>
                        </div>
                        <div className="flex-1 grid grid-cols-1 gap-6">
                            {[
                                { name: "Rahul S.", review: "Youthcamping made our Bali trip absolutely seamless. The luxury villas were breathtaking!", rating: 5 },
                                { name: "Priya M.", review: "Best travel coordinators ever. The attention to detail in our Vietnam itinerary was unmatched.", rating: 5 }
                            ].map((testi, i) => (
                                <GlassCard key={i} className="p-8 rounded-3xl border border-gray-100">
                                    <div className="flex items-center gap-1 text-primary mb-4">
                                        {[...Array(testi.rating)].map((_, s) => <Star key={s} size={14} fill="currentColor" />)}
                                    </div>
                                    <p className="text-base text-gray-600 font-medium italic mb-4">&quot;{testi.review}&quot;</p>
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-widest">{testi.name} - Verified Traveler</p>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Steps & Payment Policy */}
            <section className="py-32 bg-gray-50/50 pdf-section">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <span className="text-primary font-black uppercase tracking-[0.4em] text-xs italic">The Process</span>
                                <h2 className="text-5xl font-black text-gray-900 uppercase">3 Easy Booking Steps</h2>
                            </div>
                            <div className="space-y-8">
                                {[
                                    { step: "01", title: "Review Itinerary", desc: "Our expert-curated day-wise plan covers the best of the destination." },
                                    { step: "02", title: "Confirm on WhatsApp", desc: "Talk to your dedicated coordinator and finalize dates." },
                                    { step: "03", title: "Pack Your Bags!", desc: "Pay the booking amount and get your confirmation instantly." }
                                ].map((s, i) => (
                                    <div key={i} className="flex gap-8 group">
                                        <span className="text-5xl font-black text-primary/20 group-hover:text-primary/100 transition-colors italic shrink-0">{s.step}</span>
                                        <div className="space-y-2">
                                            <h4 className="text-xl font-black text-gray-900 uppercase">{s.title}</h4>
                                            <p className="text-sm text-gray-500 font-medium italic">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <GlassCard className="p-10 md:p-14 rounded-[4rem] bg-gray-900 text-white border-none shadow-4xl self-start">
                            <div className="space-y-8">
                                <div className="space-y-2 border-b border-white/10 pb-6">
                                    <h4 className="text-2xl font-black text-primary uppercase">Payment Policy</h4>
                                    <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Transparency is our priority</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/60 font-medium italic">Booking Amount</span>
                                        <span className="font-black text-primary">₹10,000 / Person</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/60 font-medium italic">Confirmation</span>
                                        <span className="font-black text-white uppercase italic">Instant</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-white/60 font-medium italic">Cancellation</span>
                                        <span className="font-black text-white">Full Refund (T&C)</span>
                                    </div>
                                </div>
                                <Button 
                                     onClick={() => window.open(`https://wa.me/${q.expert?.whatsapp}`, '_blank')}
                                     className="w-full bg-primary text-white hover:bg-white hover:text-gray-900 py-8 rounded-2xl font-black uppercase tracking-widest transition-all">
                                    Confirm with Coordinator
                                </Button>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </section>

            {/* Logistics & Expertise */}
            <section className="py-16 md:py-32 bg-gray-900 text-white rounded-3xl md:rounded-[5rem] mx-4 md:mx-6 mb-16 md:mb-32 p-8 md:p-20 pdf-section">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center text-center lg:text-left">
                    <div className="space-y-6 md:space-y-10 order-2 lg:order-1">
                        <div className="space-y-2 md:space-y-4">
                            <h3 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                                Expertly <br className="hidden md:block" />Guided by <br /><span className="text-primary italic">{q.expert?.name}</span>
                            </h3>
                            <p className="text-gray-400 text-base md:text-lg font-medium">{q.expert?.designation || 'Your Destination Host'}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 md:gap-10">
                            <Button 
                                onClick={() => window.open(`https://wa.me/${q.expert?.whatsapp}`, '_blank')}
                                className="w-full sm:w-auto bg-white text-gray-900 rounded-2xl px-8 md:px-12 py-6 md:py-8 text-sm md:text-lg font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all no-print">
                                Connect on WhatsApp
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-6 md:gap-10 order-1 lg:order-2">
                        <img src={q.expert?.photo} className="w-40 h-40 md:w-64 md:h-64 rounded-3xl md:rounded-[3rem] object-cover ring-4 md:ring-8 ring-white/10 shadow-4xl p-1 md:p-2 bg-white/5" alt="Expert" />
                        <div className="text-center space-y-1 md:space-y-2">
                            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-primary">Certified Expert</p>
                            <p className="text-lg md:text-2xl font-bold italic">Specializing in {q.destination.split(',')[0]} Luxury</p>
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
        </div>
    );
}

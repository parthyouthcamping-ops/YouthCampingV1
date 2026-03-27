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
    MessageCircle,
    Instagram,
    Globe,
    Phone,
    Sparkles,
    Share2,
    MessageCircle as WhatsAppIcon
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
        <div className="bg-white min-h-screen font-montserrat text-[#1a1a1a] selection:bg-primary/20">
            {/* Clean Premium Branding Header */}
            <header className="sticky top-0 left-0 right-0 z-[100] bg-white h-[100px] flex items-center transition-all duration-300 border-none">
                <div className="w-full relative flex items-center justify-center px-6">
                    {brand && brand.companyLogo ? (
                        <div className="flex items-center justify-center">
                            <img
                                src={brand.companyLogo}
                                className="max-h-[200px] w-auto object-contain transform-none transition-all"
                                alt="YouthCamping"
                            />
                        </div>
                    ) : (
                        <h2 className="text-2xl md:text-3xl font-[900] tracking-tighter text-slate-900 uppercase">
                            YOUTHCAMPING
                        </h2>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <motion.div style={{ opacity: heroOpacity }} className="absolute inset-0">
                    <img src={q.heroImage || "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"}
                        className="w-full h-full object-cover" alt={q.destination} />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white" />
                </motion.div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-10"
                    >
                        <div className="space-y-4">
                            <h4 className="text-primary-light text-xs md:text-sm font-black uppercase tracking-[0.4em] drop-shadow-lg">
                                YOUR EXCLUSIVE TRAVEL PROPOSAL
                            </h4>
                            <h1 className="text-7xl md:text-[11rem] font-[900] text-white tracking-tight drop-shadow-2xl leading-[0.85] uppercase">
                                {q.destination}
                            </h1>
                            <div className="flex items-center justify-center gap-4 mt-6">
                                <span className="h-[2px] w-12 bg-primary" />
                                <span className="text-white font-semibold text-sm md:text-lg tracking-widest uppercase">
                                    {q.duration} • {q.pax} ADULTS
                                </span>
                                <span className="h-[2px] w-12 bg-primary" />
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* Scroll Down Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 cursor-pointer no-print scroll-indicator"
                    onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Discover More</span>
                    <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center p-1">
                        <motion.div
                            animate={{ y: [0, 16, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-1.5 h-1.5 bg-primary rounded-full"
                        />
                    </div>
                </motion.div>
            </section>

            {/* Traveler & Date Info Section */}
            <section className="relative z-30 -mt-20 px-6 container mx-auto">
                <GlassCard className="p-12 md:p-16 rounded-[4rem] shadow-3xl bg-white border-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div className="flex items-center gap-6 border-r border-gray-100 pr-6 last:border-0 last:pr-0">
                        <div className="w-14 h-14 bg-primary/5 rounded-[1.2rem] flex items-center justify-center text-primary flex-shrink-0">
                            <Users size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 leading-none">Traveller Name</p>
                            <p className="text-lg font-semibold text-gray-900 leading-none">{q.clientName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 border-r border-gray-100 pr-6 last:border-0 last:pr-0">
                        <div className="w-14 h-14 bg-primary/5 rounded-[1.2rem] flex items-center justify-center text-primary flex-shrink-0">
                            <Calendar size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 leading-none">Travel Dates</p>
                            <p className="text-lg font-semibold text-gray-900 leading-tight">
                                {q.travelDates?.from ? new Date(q.travelDates.from).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : "TBA"} - {q.travelDates?.to ? new Date(q.travelDates.to).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ""}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 border-r border-gray-100 pr-6 last:border-0 last:pr-0">
                        <div className="w-14 h-14 bg-primary/5 rounded-[1.2rem] flex items-center justify-center text-primary flex-shrink-0">
                            <Sparkles size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 leading-none">Duration</p>
                            <p className="text-lg font-semibold text-gray-900 leading-none">{q.duration}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 border-r border-gray-100 pr-6 last:border-0 last:pr-0">
                        <div className="w-14 h-14 bg-primary/5 rounded-[1.2rem] flex items-center justify-center text-primary flex-shrink-0">
                            <Star size={28} fill="currentColor" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 leading-none">Your Travel Journey</p>
                            <p className="text-xl font-[900] text-primary leading-none">
                                ₹{(selectedTier === 'standard' ? (q.lowLevelPrice || 0) : (q.highLevelPrice || 0)).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </GlassCard>
            </section>

            {/* Package Overview / The Experience */}
            <section className="py-32 container mx-auto px-6 experience-section">
                <div className="flex flex-col gap-16">
                    <div className="space-y-4 text-center max-w-4xl mx-auto">
                        <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter italic text-primary-deep">
                            The Experience
                            <span className="block text-gray-900 mt-4 not-italic">Curated Specifically for {q.clientName}</span>
                        </h2>
                    </div>

                    <div className="relative w-full">
                        <div className="absolute -inset-10 bg-primary/5 rounded-[5rem] blur-3xl -z-10" />
                        {q.experiencePhotos && q.experiencePhotos.length > 0 ? (
                            <ImageSlider images={q.experiencePhotos} aspectRatio="video" className="w-full rounded-[4rem] shadow-3xl border-8 border-white" />
                        ) : (
                            <img
                                src={q.coverImage || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"}
                                className="w-full aspect-video object-cover rounded-[4rem] shadow-3xl border-8 border-white"
                                alt="Cover"
                            />
                        )}
                    </div>
                </div>
            </section>

            {/* Itinerary */}
            <section className="py-32 bg-gray-50/50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-5xl font-semibold tracking-tight text-primary">Your Daily Journey</h2>
                        <p className="text-gray-400 font-semibold uppercase tracking-[0.2em] italic">Day-by-Day Luxury Curated</p>
                    </div>

                    <div className="flex flex-col relative gap-20">
                        {/* Timeline Line */}
                        <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5 -translate-x-1/2 hidden md:block timeline-line" />

                        {q.itinerary?.map((day, idx) => (
                            <motion.div
                                key={day.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "-100px" }}
                                className={`flex flex-col lg:flex-row gap-12 lg:gap-24 mb-32 items-center relative ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
                            >
                                {/* Timeline Dot */}
                                <div className="absolute left-8 lg:left-1/2 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-white shadow-lg z-10 hidden md:block" />

                                <div className="flex-1 space-y-10">
                                    <div className={`flex flex-col ${idx % 2 !== 0 ? 'lg:items-end lg:text-right' : 'lg:items-start'} gap-4`}>
                                        <div className="flex items-center gap-4">
                                            <span className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-semibold italic shadow-xl shadow-primary/30">
                                                {day.day}
                                            </span>
                                            <h3 className="text-4xl font-semibold tracking-tighter text-gray-900">{day.title}</h3>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <p className={`text-lg text-gray-500 font-medium leading-relaxed italic ${idx % 2 !== 0 ? 'lg:text-right' : ''}`}>
                                            {day.description}
                                        </p>

                                        <div className="space-y-8 flex flex-col">
                                            <div className="space-y-4 w-full">
                                                <div className={`flex items-center gap-3 ${idx % 2 !== 0 ? 'lg:justify-end' : ''}`}>
                                                    <div className="h-px bg-primary/20 flex-1" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Daily Highlights</span>
                                                    <div className="h-px bg-primary/20 flex-1 lg:hidden" />
                                                </div>
                                                <ul className={`grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 ${idx % 2 !== 0 ? 'lg:justify-items-end' : ''}`}>
                                                    {day.activities?.map((act, i) => (
                                                        act && (
                                                            <li key={i} className="flex items-start gap-3 group text-gray-700">
                                                                <CheckCircle2 size={16} className="text-primary mt-1 flex-shrink-0" />
                                                                <span className="text-sm font-semibold group-hover:text-primary transition-colors">{act}</span>
                                                            </li>
                                                        )
                                                    ))}
                                                </ul>
                                            </div>

                                            {day.sightseeing && day.sightseeing.length > 0 && day.sightseeing[0] !== "" && (
                                                <div className="space-y-4 w-full">
                                                    <div className={`flex items-center gap-3 ${idx % 2 !== 0 ? 'lg:justify-end' : ''}`}>
                                                        <div className="h-px bg-primary/20 flex-1" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Sightseeing Places</span>
                                                        <div className="h-px bg-primary/20 flex-1 lg:hidden" />
                                                    </div>
                                                    <div className={`flex flex-wrap gap-3 ${idx % 2 !== 0 ? 'lg:justify-end' : ''}`}>
                                                        {day.sightseeing.map((place, i) => (
                                                            place && (
                                                                <span key={i} className="px-6 py-3 bg-primary/5 rounded-2xl text-[11px] font-black text-primary uppercase tracking-[0.1em] border border-primary/10 shadow-sm hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1">
                                                                    {place}
                                                                </span>
                                                            )
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 w-full relative itinerary-item">
                                    <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-2xl -z-10 opacity-60" />
                                    <ImageSlider images={day.photos} className="shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] rounded-[2.5rem] overflow-hidden border border-white/20" />
                                </div>
                            </motion.div>
                        ))}

                        {q.routeMap && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="mt-20 flex flex-col items-center gap-10"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-[2px] w-12 bg-primary/20" />
                                    <h3 className="text-xl font-black italic tracking-widest uppercase text-gray-400">Your Route Map</h3>
                                    <div className="h-[2px] w-12 bg-primary/20" />
                                </div>
                                <div className="relative w-full max-w-5xl group">
                                    <div className="absolute -inset-10 bg-primary/5 rounded-[5rem] blur-3xl -z-10" />
                                    <img src={q.routeMap} className="w-full rounded-[3.5rem] shadow-3xl border-8 border-white object-cover aspect-video" alt="Route Map" />
                                    <div className="absolute inset-0 rounded-[3.5rem] bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </section>

            {/* Hotels */}
            <section className="py-32 container mx-auto px-6">
                <div className="mb-20 flex flex-col md:flex-row justify-between items-end gap-10">
                    <div>
                        <h2 className="text-5xl font-black tracking-tighter mb-4 text-primary uppercase">The Retreats</h2>
                        <p className="text-gray-400 font-semibold uppercase tracking-[0.2em]">Exquisite Stays Selected for You</p>
                    </div>

                    <div className="flex bg-gray-50 p-2 rounded-[2rem] border border-gray-100 self-start md:self-end no-print">
                        <button
                            onClick={() => setSelectedTier('standard')}
                            className={`px-8 py-4 rounded-[1.5rem] flex flex-col items-center transition-all ${selectedTier === 'standard' ? 'bg-white shadow-xl text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Hotel Option 1</span>
                            <span className="text-[11px] font-semibold mt-1">₹{(q.lowLevelPrice || 0).toLocaleString()} Per Person</span>
                        </button>
                        <button
                            onClick={() => setSelectedTier('luxury')}
                            className={`px-8 py-4 rounded-[1.5rem] flex flex-col items-center transition-all ${selectedTier === 'luxury' ? 'bg-primary shadow-xl text-white' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Hotel Option 2</span>
                            <span className="text-[11px] font-semibold mt-1 opacity-80">₹{(q.highLevelPrice || 0).toLocaleString()} Per Person</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {(selectedTier === 'standard' ? q.lowLevelHotels || [] : q.highLevelHotels || []).map((hotel) => (
                        <GlassCard key={hotel.id} className="p-0 overflow-hidden flex flex-col group border-gray-100 hover:border-primary/20 transition-all shadow-xl hover:shadow-2xl hotel-card">
                            <div className="p-10 pb-6 w-full space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-3xl font-black tracking-tighter group-hover:text-primary transition-colors">{hotel.name}</h3>
                                        <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-2 mt-2">
                                            <MapPin size={16} className="text-primary/40" /> {hotel.location}
                                        </p>
                                    </div>
                                    <div className="flex gap-1 text-primary">
                                        {Array.from({ length: hotel.rating }).map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                                    </div>
                                </div>
                            </div>

                            <div className="px-10 mb-8">
                                <ImageSlider images={hotel.photos} aspectRatio="video" className="rounded-[2rem] w-full shadow-2xl" />
                            </div>

                            <div className="px-10 pb-10 w-full">
                                <p className="text-gray-500 font-medium leading-relaxed italic border-l-4 border-gray-50 pl-6 text-sm">
                                    &quot;{hotel.description}&quot;
                                </p>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </section>

            {/* Custom Dynamic Sections */}
            {(q.customSections || []).filter(s => s.isVisible).map((section) => (
                <section key={section.id} className="py-24 bg-white overflow-hidden">
                    <div className="container mx-auto px-6">
                        <GlassCard className="p-16 rounded-[4rem] border-none shadow-3xl bg-gray-50/30 ring-1 ring-gray-100 flex flex-col md:flex-row gap-16 items-center">
                            <div className="flex-1 space-y-8 text-left">
                                <div className="space-y-4">
                                    <h2 className="text-5xl font-black tracking-tight text-gray-900 leading-tight">
                                        {section.heading}
                                    </h2>
                                    <div className="h-1.5 w-24 bg-primary rounded-full" />
                                </div>
                                <p className="text-xl text-gray-500 leading-relaxed font-medium whitespace-pre-wrap">
                                    {section.description}
                                </p>
                                {section.buttonLabel && section.buttonLink && (
                                    <Button
                                        onClick={() => window.open(section.buttonLink, '_blank')}
                                        className="rounded-2xl px-12 py-8 text-lg shadow-xl shadow-primary/20"
                                    >
                                        {section.buttonLabel}
                                    </Button>
                                )}
                            </div>
                            {section.image && (
                                <div className="flex-1 w-full">
                                    <img
                                        src={section.image}
                                        alt={section.heading}
                                        className="w-full h-auto rounded-[3rem] shadow-2xl object-cover aspect-video md:aspect-square"
                                    />
                                </div>
                            )}
                        </GlassCard>
                    </div>
                </section>
            ))}

            {/* Pricing, Includes & Exclusions */}
            <section className="py-32 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                        <div className="space-y-20">
                            <div className="space-y-6">
                                <h2 className="text-6xl font-black tracking-tight text-primary uppercase">The Experience</h2>
                                <p className="text-primary-deep font-black uppercase tracking-[0.3em]">Curated Inclusions for your perfection</p>
                            </div>

                            <div className="space-y-16">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <h3 className="text-2xl font-semibold uppercase tracking-widest text-gray-900">What's Included</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-10 rounded-[3rem] border border-gray-100 includes-section">
                                        {q.includes?.map((inc, i) => (
                                            inc && (
                                                <div key={i} className="flex items-start gap-4 text-gray-600 font-semibold uppercase tracking-[0.1em] text-[11px] leading-relaxed group">
                                                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0 group-hover:scale-150 transition-transform" />
                                                    {inc}
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                                            <XCircle size={24} />
                                        </div>
                                        <h3 className="text-2xl font-semibold uppercase tracking-widest text-gray-900">What's Excluded</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-10 rounded-[3rem] border border-gray-100 includes-section">
                                        {q.exclusions?.map((exc, i) => (
                                            exc && (
                                                <div key={i} className="flex items-start gap-4 text-gray-400 font-semibold uppercase tracking-[0.1em] text-[11px] leading-relaxed group">
                                                    <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 flex-shrink-0 group-hover:bg-red-300 transition-colors" />
                                                    {exc}
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <GlassCard className="p-16 rounded-[4rem] text-center space-y-10 shadow-3xl shadow-primary/20 bg-white sticky top-32 border-none ring-1 ring-gray-100 pricing-card">
                            <div className="space-y-2">
                                <h3 className="text-sm font-black text-gray-300 uppercase tracking-[0.4em] mb-4">Your Travel Journey</h3>
                                <div className="flex items-center justify-center gap-3">
                                    <span className={`w-3 h-3 rounded-full ${selectedTier === 'standard' ? 'bg-gray-400' : 'bg-primary'}`} />
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                                        {selectedTier === 'standard' ? 'Hotel Option 1' : 'Hotel Option 2'} Included
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-10">
                                <div className="space-y-2 p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price Per Person</p>
                                    <p className="text-6xl font-semibold text-primary tracking-tighter">
                                        ₹{(selectedTier === 'standard' ? (q.lowLevelPrice || 0) : (q.highLevelPrice || 0)).toLocaleString()}
                                    </p>
                                </div>

                                <div className="space-y-2 p-8 bg-primary/[0.03] rounded-[2.5rem] border border-primary/5">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Total Package Value</p>
                                    <p className="text-5xl font-semibold text-primary tracking-tighter">
                                        ₹{((selectedTier === 'standard' ? (q.lowLevelPrice || 0) : (q.highLevelPrice || 0)) * (q.pax || 0)).toLocaleString()}
                                    </p>
                                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-widest mt-2">{q.pax || 0} Premium Travelers</p>
                                </div>
                            </div>

                            <div className="space-y-6 pt-4 no-print">
                                <Button
                                    onClick={() => {
                                        const message = encodeURIComponent(`Hi ${q.expert.name || 'Travel Expert'}, I would like to book my trip from this quotation: ${window.location.href}`);
                                        window.open(`https://wa.me/${q.expert.whatsapp}?text=${message}`, '_blank');
                                    }}
                                    size="lg"
                                    className="w-full py-10 text-xl tracking-[0.2em] font-black uppercase rounded-[2rem] shadow-2xl shadow-primary/30"
                                >
                                    Book Your Trip
                                </Button>
                                <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-[0.3em]">Pricing valid for 48 hours from generation</p>
                            </div>
                        </GlassCard>
                    </div>
                </div>
            </section>


            {/* Expert Section */}
            {q.expert && (
                <section className="py-24 container mx-auto px-6 max-w-3xl">
                    <GlassCard className="p-10 md:p-12 rounded-[3rem] text-center md:text-left shadow-2xl border-gray-50 bg-white/50">
                        <div className="flex flex-col md:flex-row items-center gap-10">
                            <div className="relative flex-shrink-0">
                                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-primary/10 shadow-lg">
                                    <img
                                        src={q.expert.photo || "https://ui-avatars.com/api/?name=" + encodeURIComponent(q.expert.name || "Expert") + "&background=random"}
                                        className="w-full h-full object-cover"
                                        alt={q.expert.name}
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-[#25D366] w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-primary font-black uppercase tracking-[0.3em] text-[9px]">Talk to your travel expert</p>
                                    <h2 className="text-3xl font-black tracking-tight text-gray-900 leading-tight">
                                        {q.expert.name || "Your Expert"}
                                    </h2>
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest opacity-80">
                                        {q.expert.designation || "Youthcamping Travel Expert"}
                                    </p>
                                </div>

                                <p className="text-base text-gray-500 font-medium leading-relaxed italic">
                                    &quot;I have personally curated every element of this journey to ensure it exceeds your expectations of luxury.&quot;
                                </p>

                                <div className="pt-2 no-print">
                                    <Button
                                        onClick={() => {
                                            const message = encodeURIComponent(`Hi ${q.expert.name || 'Travel Expert'}, I would like to book my trip from this quotation: ${window.location.href}`);
                                            window.open(`https://wa.me/${q.expert.whatsapp}?text=${message}`, '_blank');
                                        }}
                                        className="inline-flex items-center gap-4 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-black tracking-widest uppercase text-xs shadow-lg shadow-green-200 hover:scale-105 active:scale-95 transition-all text-left h-auto"
                                    >
                                        <WhatsAppIcon size={18} /> Chat on WhatsApp
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </section >
            )}

            {/* Footer */}
            < footer className="py-20 bg-gray-900 text-white" >
                <div className="container mx-auto px-6 text-center">
                    <div className="flex flex-col items-center gap-12 border-b border-white/5 pb-16 mb-16">
                        <div className="flex flex-col items-center gap-6">
                            <h2 className="text-2xl md:text-3xl font-semibold tracking-[0.3em] text-white uppercase font-montserrat">
                                youthcamping.in
                            </h2>
                            <p className="text-gray-500 font-semibold uppercase tracking-[0.4em] italic text-[10px]">One Trip at a Time</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl mx-auto no-print">
                            <div className="flex flex-col items-center gap-4 group">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Follow Us</span>
                                <a
                                    href={brand?.instagramLink || "#"}
                                    target="_blank"
                                    className="flex items-center gap-3 bg-white/5 hover:bg-primary px-8 py-5 rounded-2xl transition-all w-full justify-center group-hover:scale-105"
                                >
                                    <Instagram size={24} />
                                    <span className="font-semibold text-sm">Instagram</span>
                                </a>
                            </div>

                            <div className="flex flex-col items-center gap-4 group">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Visit Our Website</span>
                                <a
                                    href={brand?.websiteLink || "#"}
                                    target="_blank"
                                    className="flex items-center gap-3 bg-white/5 hover:bg-primary px-8 py-5 rounded-2xl transition-all w-full justify-center group-hover:scale-105"
                                >
                                    <Globe size={24} />
                                    <span className="font-semibold text-sm">Our Website</span>
                                </a>
                            </div>

                            <div className="flex flex-col items-center gap-4 group">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Call Us</span>
                                <a
                                    href={`tel:${brand?.phoneNumber?.replace(/\s/g, "")}`}
                                    className="flex items-center gap-3 bg-white/5 hover:bg-primary px-8 py-5 rounded-2xl transition-all w-full justify-center group-hover:scale-105"
                                >
                                    <Phone size={24} />
                                    <span className="font-semibold text-sm">{brand?.phoneNumber || "Contact Us"}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-[0.4em]">{brand?.footerText || `© ${new Date().getFullYear()} YouthCamping Luxury Travel. All Rights Reserved.`}</p>
                </div>
            </footer >
        </div >
    );
}

"use client";

import { Quotation } from "@/lib/types";
import { useBrandSettings } from "@/hooks/useBrandSettings";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
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
    Utensils,
    Hotel as HotelIcon,
    Instagram,
    Globe,
    Smartphone,
    Check,
    Loader2,
    Clock,
    Car,
    Camera,
    Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Helper: add N days to a date string, return formatted label like "12 Oct 2026"
function getDayDate(baseDate: string | undefined, dayOffset: number): string {
    if (!baseDate) return '';
    try {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + dayOffset);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return ''; }
}

// Pick an icon for an activity keyword
function ActivityIcon({ label }: { label: string }) {
    const l = label.toLowerCase();
    if (l.includes('transfer') || l.includes('drive') || l.includes('pickup')) return <Car size={14} className="shrink-0 text-primary" />;
    if (l.includes('hotel') || l.includes('check') || l.includes('resort')) return <HotelIcon size={14} className="shrink-0 text-primary" />;
    if (l.includes('meal') || l.includes('dinner') || l.includes('lunch') || l.includes('breakfast')) return <Utensils size={14} className="shrink-0 text-primary" />;
    if (l.includes('photo') || l.includes('view') || l.includes('sunset')) return <Camera size={14} className="shrink-0 text-primary" />;
    if (l.includes('trek') || l.includes('hike') || l.includes('walk') || l.includes('explore')) return <Compass size={14} className="shrink-0 text-primary" />;
    return <Sparkles size={14} className="shrink-0 text-primary" />;
}


// Icon helper for Journey Stops
function StopIcon({ type, icon }: { type: string, icon?: string }) {
    const t = type.toLowerCase();
    const i = icon?.toLowerCase();
    
    if (t === 'arrival' || i === 'plane' || i === 'airport') return <Sparkles size={18} className="text-amber-400" fill="currentColor" />; // Use Sparkles as a premium substitute
    if (t === 'departure' || i === 'departure') return <MapPin size={18} className="text-primary" />;
    if (t === 'stay' || i === 'hotel' || i === 'building') return <HotelIcon size={18} className="text-primary" />;
    if (i === 'drive' || i === 'car') return <Car size={18} className="text-primary" />;
    if (i === 'boat' || i === 'ship') return <Compass size={18} className="text-primary" />;
    
    return <Sparkles size={18} className="text-primary" />;
}

interface LuxuryQuotationUIProps {
    q: Quotation;
}

export default function LuxuryQuotationUI({ q }: LuxuryQuotationUIProps) {
    const { brand } = useBrandSettings();
    const [selectedTier, setSelectedTier] = useState<'standard' | 'luxury'>('standard');
    const [expandedDay, setExpandedDay] = useState<number | null>(1);
    const [booking, setBooking] = useState<any>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingForm, setBookingForm] = useState({ 
        name: q.clientName || '', 
        phone: '', 
        email: '',
        travelers: q.pax || 1,
        travelDates: `${q.travelDates?.from || ''} to ${q.travelDates?.to || ''}`,
        specialRequests: ''
    });

    // Live status: booking state takes priority over server-rendered prop (avoids stale data)
    const liveStatus: string = booking?.status || q.bookingStatus || 'sent';
    const isBooked   = liveStatus === 'booked';
    const isReserved = liveStatus === 'reserved';
    const isPending  = liveStatus === 'pending';

    const { scrollYProgress } = useScroll();
    const [scrolled, setScrolled] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    useEffect(() => {
        fetchBooking();
    }, [q.slug]);

    const fetchBooking = async () => {
        try {
            const res = await fetch(`/api/book?slug=${q.slug}`);
            const data = await res.json();
            if (data && !data.error) setBooking(data);
        } catch (err) {
            console.error('Failed to fetch booking status');
        }
    };

    // Sync quotation document's bookingStatus via PATCH so backend + frontend stay consistent
    const syncQuotationStatus = async (newStatus: string) => {
        try {
            await fetch(`/api/quotation/${q.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (err) {
            console.error('Failed to sync quotation status', err);
        }
    };

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting || isBooked || isReserved || isPending) return; // prevent duplicate submissions
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tripSlug: q.slug,
                    name: bookingForm.name,
                    phone: bookingForm.phone,
                    email: bookingForm.email,
                    travelers: bookingForm.travelers,
                    travelDates: bookingForm.travelDates,
                    specialRequests: bookingForm.specialRequests,
                })
            });
            const data = await res.json();
            if (res.ok && data.id) {
                // Update local booking state immediately (instant UI sync — no page reload needed)
                setBooking({ ...data, status: 'pending' });
                setIsBookingModalOpen(false);
                // Also patch the quotation document so admin dashboard stays accurate
                await syncQuotationStatus('pending');
                toast.success("Booking request submitted! Redirecting to WhatsApp…");
                
                // WhatsApp redirection with rich pre-filled message
                const bookingRef = data.id || q.slug;
                const waMessage = encodeURIComponent(
                    `Hi ${q.expert?.name || 'Travel Expert'},\n\n` +
                    `I've just submitted a booking request for my trip.\n\n` +
                    `*Trip:* ${q.destination}\n` +
                    `*Name:* ${bookingForm.name}\n` +
                    `*Phone:* ${bookingForm.phone}\n` +
                    `*Email:* ${bookingForm.email}\n` +
                    `*Travelers:* ${bookingForm.travelers}\n` +
                    `*Dates:* ${bookingForm.travelDates}\n` +
                    (bookingForm.specialRequests ? `*Special Requests:* ${bookingForm.specialRequests}\n` : '') +
                    `*Booking Ref:* ${bookingRef}\n\n` +
                    `Looking forward to connecting!`
                );
                const expertPhone = (q.expert?.whatsapp || '').replace(/[^0-9]/g, '');
                if (expertPhone) {
                    setTimeout(() => window.open(`https://wa.me/${expertPhone}?text=${waMessage}`, '_blank'), 1500);
                } else {
                    toast.info("Could not redirect to WhatsApp — no expert number configured.");
                }
            } else {
                toast.error(data.error || "Booking failed. Please try again.");
            }
        } catch (err) {
            toast.error("Booking failed. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Strict button visibility: booked → hide all; pending/reserved → show locked status; else → show CTA
    const renderBookingButton = (className?: string) => {
        if (isBooked) {
            return (
                <div className={`${className} flex items-center gap-2 bg-green-500 text-white rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest cursor-default`}>
                    <CheckCircle2 size={14} />
                    Booking Confirmed
                </div>
            );
        }

        if (isReserved) {
            return (
                <Button 
                    disabled
                    className={`${className} flex items-center gap-2 bg-blue-500 hover:bg-blue-500 cursor-not-allowed opacity-80`}
                >
                    <Check size={14} />
                    Reserved
                </Button>
            );
        }

        if (isPending) {
            return (
                <Button 
                    disabled
                    className={`${className} flex items-center gap-2 bg-yellow-500 hover:bg-yellow-500 cursor-not-allowed opacity-80`}
                >
                    <Loader2 size={14} className="animate-spin" />
                    Booking Requested
                </Button>
            );
        }

        return (
            <Button 
                onClick={() => setIsBookingModalOpen(true)}
                disabled={isSubmitting}
                className={className}
            >
                Confirm Booking
            </Button>
        );
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-primary/20">
            {/* ── CINEMATIC FLOATING PROGRESS INDICATOR ── */}
            <motion.div 
                className="fixed top-0 left-0 right-0 h-1.5 bg-primary/20 z-[200] origin-left"
                style={{ scaleX: scrollYProgress }}
            />
            <motion.div 
                className="fixed top-0 left-0 right-0 h-1.5 bg-primary z-[201] origin-left shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                style={{ scaleX: scrollYProgress }}
            />
            <div className="pdf-container overflow-x-hidden">
            {/* Global Styles + Glass System */}
            <style jsx global>{`
                /* ── Glass token system ── */
                :root {
                    --glass-light: rgba(250, 248, 243, 0.55);
                    --glass-dark:  rgba(18, 43, 30, 0.55);
                    --glass-white: rgba(255, 255, 255, 0.10);
                    --glass-blur:  blur(18px);
                    --glass-border-light: rgba(255,255,255,0.22);
                    --glass-border-dark:  rgba(255,255,255,0.10);
                    --glass-shadow: 0 8px 32px rgba(0,0,0,0.22);
                    --glass-shine: linear-gradient(120deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.04) 100%);
                }

                /* ── Glass mixins ── */
                .glass-panel {
                    background: var(--glass-light);
                    backdrop-filter: var(--glass-blur);
                    -webkit-backdrop-filter: var(--glass-blur);
                    border: 1px solid var(--glass-border-light);
                    box-shadow: var(--glass-shadow);
                }
                .glass-panel-dark {
                    background: rgba(12, 28, 20, 0.62);
                    backdrop-filter: var(--glass-blur);
                    -webkit-backdrop-filter: var(--glass-blur);
                    border: 1px solid var(--glass-border-dark);
                    box-shadow: 0 8px 40px rgba(0,0,0,0.38);
                }
                .glass-shine::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: var(--glass-shine);
                    border-radius: inherit;
                    pointer-events: none;
                }

                /* ── Subtle grain texture overlay ── */
                .grain-overlay::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
                    pointer-events: none;
                    border-radius: inherit;
                    opacity: 0.5;
                }

                /* ── Print overrides ── */
                @media print {
                    .no-print { display: none !important; }
                    .pdf-container { background: white !important; padding: 0 !important; color: black !important; }
                    .pdf-section { page-break-after: always; padding: 20mm !important; }
                    .itinerary-item { page-break-inside: avoid; margin-bottom: 20px; }
                    header, footer { border: none !important; position: static !important; }
                    .pricing-card { position: static !important; width: 100% !important; border: 2px solid #eee !important; box-shadow: none !important; }
                    img { max-width: 100% !important; }
                    .glass-card, .glass-panel, .glass-panel-dark { background: white !important; border: 1px solid #eee !important; box-shadow: none !important; }
                    .bg-primary { background-color: #f97316 !important; print-color-adjust: exact; }
                    .text-primary { color: #f97316 !important; print-color-adjust: exact; }
                }
            `}</style>

            {/* Status Banner — driven by liveStatus for instant UI sync */}
            {isBooked && (
                <div className="bg-green-500 text-white w-full text-center py-3 px-4 font-black uppercase tracking-[0.2em] text-xs md:text-sm shadow-md z-[200] relative">
                    <CheckCircle2 size={16} className="inline mr-2 -mt-1" />
                    Booking Confirmed — This trip is booked!
                </div>
            )}
            {isReserved && !isBooked && (
                <div className="bg-blue-500 text-white w-full text-center py-3 px-4 font-black uppercase tracking-[0.2em] text-xs md:text-sm shadow-md z-[200] relative">
                    <Check size={16} className="inline mr-2 -mt-1" />
                    Trip Reserved — Awaiting Confirmation
                </div>
            )}
            {isPending && !isBooked && !isReserved && (
                <div className="bg-yellow-500 text-white w-full text-center py-3 px-4 font-black uppercase tracking-[0.2em] text-xs md:text-sm shadow-md z-[200] relative">
                    <Loader2 size={16} className="inline mr-2 -mt-1 animate-spin" />
                    Booking Requested — Our expert will reach out shortly!
                </div>
            )}

            {/* ── NAVBAR — Glass blur ── */}
            <header className="sticky top-0 left-0 right-0 z-[100] h-20 md:h-[90px] flex items-center transition-all duration-300 no-print"
                style={{
                    background: 'rgba(255,255,255,0.82)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.07)'
                }}>
                <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-4">
                        {brand && brand.companyLogo ? (
                            <img src={brand.companyLogo} className="h-8 md:h-12 w-auto object-contain" alt="Logo" />
                        ) : (
                            <h2 className="text-lg md:text-xl font-black tracking-tighter text-gray-900 uppercase">YOUTHCAMPING</h2>
                        )}
                        {/* Status pill reads liveStatus — updates immediately after booking */}
                        <div className={`hidden sm:flex px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white shadow-sm transition-colors duration-500 ${
                            liveStatus === 'booked'   ? 'bg-green-500'  :
                            liveStatus === 'reserved' ? 'bg-blue-500'   :
                            liveStatus === 'pending'  ? 'bg-yellow-500' :
                            liveStatus === 'cancelled'? 'bg-red-500'    : 'bg-orange-400'
                        }`}>
                            {liveStatus}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {renderBookingButton("rounded-xl font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-xl shadow-primary/20 h-10 md:h-12 px-4 md:px-8")}
                    </div>
                </div>
            </header>

            {/* ── HERO SECTION ── */}
            <section className="relative h-screen min-h-[600px] flex flex-col justify-end overflow-hidden pdf-section grain-overlay">
                {/* Background image with Ken Burns zoom */}
                <motion.div
                    className="absolute inset-0"
                    initial={{ scale: 1.25 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 20, ease: 'linear' }}
                >
                    <img
                        src={q.heroImage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop&fm=webp'}
                        alt={q.destination}
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-cover"
                    />
                </motion.div>

                {/* Cinematic gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/75" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />

                {/* ── GLASS HERO INFO PANEL ── */}
                <div className="relative z-10 container mx-auto px-4 md:px-6 pb-12 md:pb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                        className="relative max-w-4xl p-8 md:p-14 overflow-hidden"
                    >
                        {/* Glass background with shine */}
                        <div className="absolute inset-0 rounded-[2.5rem] bg-[#0a0a0a]/40 backdrop-blur-2xl border border-white/15 shadow-2xl overflow-hidden glass-shine" />
                        
                        <div className="relative z-10">
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mb-8">
                                <span className="px-5 py-1.5 rounded-full bg-amber-400 text-[#0a0a0a] font-black uppercase text-[10px] tracking-widest shadow-xl shadow-amber-400/20">
                                    Best Seller
                                </span>
                                <span className="px-5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl text-white font-black uppercase text-[10px] tracking-widest border border-white/10">
                                    Trending
                                </span>
                                <span className="px-5 py-1.5 rounded-full bg-white/10 backdrop-blur-xl text-white font-black uppercase text-[10px] tracking-widest border border-white/10">
                                    Limited Slots
                                </span>
                            </div>

                            {/* Eyebrow */}
                            <div className="flex items-center gap-3 mb-6">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: 32 }}
                                    transition={{ delay: 1, duration: 0.8 }}
                                    className="h-px bg-primary" 
                                />
                                <span className="text-primary font-black uppercase tracking-[0.5em] text-[10px] md:text-sm">
                                    Curated for {q.clientName}
                                </span>
                            </div>

                            {/* Trip name */}
                            <h1 className={`font-montserrat font-[900] text-white uppercase leading-[0.88] tracking-tighter mb-8
                                           text-5xl sm:text-7xl md:text-9xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]`}>
                                {q.destination}
                            </h1>

                            {/* Tagline */}
                            <p className="text-white/70 font-medium text-base md:text-xl tracking-wide mb-10 max-w-2xl leading-relaxed">
                                An exclusive {q.duration} masterpiece crafted around your vision of the perfect escape.
                            </p>

                            {/* Meta row + Rating */}
                            <div className="flex flex-wrap items-center gap-8 md:gap-12 pt-6 border-t border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="flex text-amber-400">
                                        {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                                    </div>
                                    <span className="text-white font-black text-xs tracking-widest uppercase">4.9/5 (120+ REVIEWS)</span>
                                </div>
                                <div className="flex items-center gap-4 text-white/50">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-primary" />
                                        <span className="font-bold text-xs uppercase tracking-widest text-white">{q.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-primary" />
                                        <span className="font-bold text-xs uppercase tracking-widest text-white">{q.pax} Travelers</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-6 right-6 md:right-10 z-10 flex flex-col items-center gap-2 no-print"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    <div className="w-px h-12 bg-white/30 relative overflow-hidden">
                        <motion.div
                            className="absolute top-0 w-full bg-white"
                            style={{ height: '40%' }}
                            animate={{ y: ['-100%', '250%'] }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                        />
                    </div>
                    <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest" style={{ writingMode: 'vertical-rl' }}>Scroll</span>
                </motion.div>

                {/* ── Floating WhatsApp button ── */}
                {q.expert?.whatsapp && (
                    <motion.a
                        href={`https://wa.me/${(q.expert.whatsapp).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in the ${q.destination} trip.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fixed bottom-6 right-5 z-[150] no-print flex items-center gap-2 px-4 py-3 rounded-2xl text-white font-bold text-xs uppercase tracking-widest shadow-2xl transition-all duration-300 hover:scale-105"
                        style={{
                            background: 'rgba(37, 211, 102, 0.88)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255,255,255,0.25)',
                            boxShadow: '0 8px 32px rgba(37,211,102,0.35), 0 2px 8px rgba(0,0,0,0.2)'
                        }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2, duration: 0.6 }}
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Chat with Expert
                    </motion.a>
                )}
            </section>

            {/* ── QUICK SUMMARY FLOATING GLASS CARD ── */}
            <section className="relative z-30 -mt-16 md:-mt-24 px-4 md:px-6 container mx-auto">
                <div className="p-6 md:p-12 rounded-3xl md:rounded-[3rem] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 glass-shine relative"
                    style={{
                        background: 'rgba(255,255,255,0.88)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255,255,255,0.6)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)'
                    }}>
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
                </div>
            </section>

            {/* Professional Introduction */}
            <section className="py-16 md:py-32 container mx-auto px-4 md:px-6 pdf-section">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-center">
                    <div className="space-y-6 md:space-y-10">
                        <div className="space-y-2 md:space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="h-px w-8 bg-primary" />
                                <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">The Philosophy</span>
                            </div>
                            <h2 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.9] uppercase">
                                Your <span className="text-primary">Signature</span> <br className="hidden sm:block" />Escape
                            </h2>
                        </div>
                        <p className="text-base md:text-xl text-gray-500 leading-relaxed font-medium">
                            We don&apos;t just plan trips — we orchestrate masterpieces. Every detail of your {q.destination} journey has been hand-selected to ensure a seamless blend of cultural immersion and uncompromising luxury.
                        </p>
                        <div className="flex flex-wrap gap-3 md:gap-4 no-print">
                           {['Private Transfers', '5-Star Stays', 'Expert Guides'].map(tag => (
                               <span key={tag} className="px-4 md:px-6 py-2 md:py-3 bg-gray-50 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-100">{tag}</span>
                           ))}
                        </div>
                    </div>
                    <div className="relative mt-10 lg:mt-0">
                         <div className="absolute -inset-6 md:-inset-10 bg-primary/5 rounded-3xl md:rounded-[5rem] blur-2xl md:blur-3xl" />
                         <img
                             src={q.coverImage || 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2070&auto=format&fit=crop&fm=webp'}
                             loading="lazy"
                             decoding="async"
                             className="w-full aspect-[4/5] object-cover rounded-3xl md:rounded-[4rem] shadow-4xl border-4 md:border-8 border-white relative z-10"
                             alt={`${q.destination} cover`}
                         />
                    </div>
                </div>
            </section>

            {/* ── THE ROAD AHEAD — Journey Map ── */}
            {q.journeyMap && (
                <section className="py-20 md:py-32 container mx-auto px-4 md:px-6 pdf-section overflow-hidden">
                    <div className="max-w-6xl mx-auto space-y-16 md:space-y-24">
                        
                        {/* Summary Tiles */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                            {q.journeyMap.summaryTiles.map((tile, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: i * 0.1 }}
                                    className="p-6 md:p-8 rounded-3xl bg-white border border-gray-100 shadow-xl shadow-gray-200/20 flex flex-col items-center text-center gap-4 group hover:border-primary/20 transition-all cursor-default"
                                >
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                                        {tile.icon === 'map' && <MapPin size={24} className="md:w-8 md:h-8" />}
                                        {tile.icon === 'clock' && <Clock size={24} className="md:w-8 md:h-8" />}
                                        {tile.icon === 'compass' && <Compass size={24} className="md:w-8 md:h-8" />}
                                        {tile.icon === 'calendar' && <Calendar size={24} className="md:w-8 md:h-8" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">{tile.label}</p>
                                        <p className="text-lg md:text-xl font-black text-gray-900 tracking-tight">{tile.value}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Journey Timeline */}
                        <div className="relative group">
                            {/* Decorative Background Labels */}
                            <div className="absolute -top-10 -left-10 text-[10rem] font-black text-gray-100 select-none opacity-50 z-0">MAP</div>
                            
                            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-10">
                                <div className="md:col-span-5 space-y-8">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="h-px w-8 bg-primary" />
                                            <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Route Map</span>
                                        </div>
                                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-[0.9] uppercase">
                                            The <span className="text-primary">Road</span> Ahead
                                        </h2>
                                    </div>
                                    <p className="text-sm md:text-base text-gray-500 leading-relaxed font-medium max-w-sm">
                                        From your arrival to the final farewell, we’ve mapped out a seamless flow of experiences across the region’s most iconic landscapes.
                                    </p>
                                    
                                    {/* Legend / Mini Stat */}
                                    <div className="p-6 rounded-3xl bg-[#0a0a0a] text-white space-y-4 shadow-2xl relative overflow-hidden group/legend">
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/legend:opacity-100 transition-opacity" />
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40 border-b border-white/10 pb-4 relative z-10">
                                            <span>Full Route Overview</span>
                                            <span className="text-primary">{q.journeyMap.stops.length} Milestones</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shrink-0">
                                                <Compass className="animate-pulse" />
                                            </div>
                                            <div>
                                                <p className="font-black uppercase tracking-tight text-white leading-none">Starting Point</p>
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">{q.journeyMap.stops[0]?.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vertical Timeline Divider with Draw Effect */}
                                <div className="md:col-span-1 border-r border-dashed border-gray-100 hidden md:block relative">
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        whileInView={{ height: '100%' }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                        className="absolute top-0 bottom-0 left-full w-[2px] bg-gradient-to-b from-primary via-primary/40 to-transparent origin-top" 
                                    />
                                </div>

                                <div className="md:col-span-6 space-y-12 relative">
                                    {q.journeyMap.stops.map((stop, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.6, delay: i * 0.1 }}
                                            className="relative flex items-center gap-8 group/stop"
                                        >
                                            {/* Stop Marker */}
                                            <div className="relative shrink-0">
                                                <div className="w-14 h-14 rounded-full bg-white border border-gray-100 shadow-xl flex items-center justify-center relative z-10 group-hover/stop:border-primary transition-all duration-500">
                                                    <StopIcon type={stop.type} icon={stop.icon} />
                                                </div>
                                                {i < q.journeyMap.stops.length - 1 && (
                                                    <div className="absolute top-14 left-7 w-px h-12 bg-gray-100 group-hover/stop:bg-primary/20 transition-colors" />
                                                )}
                                            </div>

                                            {/* Stop Content */}
                                            <div className="flex-1 pb-4">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">Day {stop.day}</span>
                                                    <span className="h-px w-3 bg-gray-100" />
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{stop.type}</span>
                                                    {stop.driveTime && (
                                                        <>
                                                            <span className="h-px w-3 bg-gray-100" />
                                                            <div className="flex items-center gap-1">
                                                                <Clock size={10} className="text-gray-300" />
                                                                <span className="text-[9px] font-bold text-gray-400">{stop.driveTime}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <h4 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight uppercase group-hover/stop:text-primary transition-colors">
                                                    {stop.name}
                                                </h4>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ── ITINERARY SECTION ── */}
            <section className="py-16 md:py-28 bg-[#f9f9f7] pdf-section" id="itinerary">
                <div className="container mx-auto px-4 md:px-6">

                    {/* Section header */}
                    <div className="flex flex-col items-start gap-3 mb-14 md:mb-20">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-8 bg-primary" />
                            <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">Day by Day</span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-gray-900 uppercase leading-none">
                            The Itinerary
                        </h2>
                        <p className="text-gray-400 font-semibold text-xs md:text-sm uppercase tracking-[0.2em] mt-1">
                            {q.itinerary?.length || 0}-day curated experience — {q.destination}
                        </p>
                    </div>

                    {/* Day cards — Accordion Style */}
                    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
                        {q.itinerary?.map((day, idx) => {
                            const isOpen = expandedDay === day.day;
                            const dayLabel = getDayDate(q.travelDates?.from, idx);
                            
                            return (
                                <motion.div
                                    key={day.id || idx}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                                    className={`group relative rounded-[2.5rem] transition-all duration-700 ${
                                        isOpen 
                                        ? 'bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] border-primary/20 scale-[1.01]' 
                                        : 'bg-white/50 hover:bg-white border-transparent hover:shadow-2xl hover:-translate-y-1'
                                    } border-2 overflow-hidden`}
                                >
                                    {/* --- CARD HEADER (CLOSED STATE) --- */}
                                    <button
                                        onClick={() => {
                                            setExpandedDay(isOpen ? null : day.day);
                                            if (!isOpen) {
                                                setTimeout(() => {
                                                    document.getElementById(`day-card-${day.day}`)?.scrollIntoView({ 
                                                        behavior: 'smooth', 
                                                        block: 'center' 
                                                    });
                                                }, 300);
                                            }
                                        }}
                                        id={`day-card-${day.day}`}
                                        className="w-full text-left p-6 md:p-8 flex items-center justify-between gap-6"
                                    >
                                        <div className="flex items-center gap-6 md:gap-8 flex-1">
                                            {/* Day Number Box */}
                                            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-colors duration-500 ${
                                                isOpen ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                                <span className="text-[10px] font-black uppercase tracking-tighter leading-none">Day</span>
                                                <span className="text-xl md:text-2xl font-black italic leading-none mt-1">{day.day < 10 ? `0${day.day}` : day.day}</span>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    {dayLabel && (
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                                            {dayLabel}
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className={`text-lg md:text-2xl font-black tracking-tight uppercase transition-colors duration-500 ${
                                                    isOpen ? 'text-gray-900' : 'text-gray-600'
                                                }`}>
                                                    {day.title}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                                            isOpen ? 'bg-primary border-primary text-white rotate-180' : 'border-gray-100 text-gray-300'
                                        }`}>
                                            <Compass size={18} />
                                        </div>
                                    </button>

                                    {/* --- EXPANDED CONTENT --- */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                                            >
                                                <div className="p-6 md:p-8 pt-0 space-y-8">
                                                    {/* Image Slider inside the card */}
                                                    <div className="rounded-3xl overflow-hidden shadow-2xl relative aspect-video">
                                                        <ImageSlider 
                                                            images={day.photos || []} 
                                                            className="w-full h-full"
                                                        />
                                                        <div className="absolute top-4 left-4 z-10">
                                                            <div className="bg-black/40 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl flex items-center gap-2">
                                                                <Camera size={14} className="text-white" />
                                                                <span className="text-white font-black text-[10px] uppercase tracking-widest">
                                                                    View Gallery
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                                        <div className="lg:col-span-2 space-y-6">
                                                            <div className="flex items-center gap-3">
                                                                <Sparkles size={16} className="text-primary" />
                                                                <h4 className="font-black uppercase tracking-[0.2em] text-xs text-gray-900">Experience Overview</h4>
                                                            </div>
                                                            <p className="text-gray-600 text-base md:text-lg leading-relaxed font-medium">
                                                                {day.description}
                                                            </p>
                                                        </div>

                                                        <div className="space-y-6">
                                                            <div className="flex items-center gap-3">
                                                                <MapPin size={16} className="text-primary" />
                                                                <h4 className="font-black uppercase tracking-[0.2em] text-xs text-gray-900">What&apos;s Included</h4>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {day.activities?.map((act, i) => (
                                                                    <div key={i} className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl group/chip hover:bg-primary/5 hover:border-primary/20 transition-all duration-300">
                                                                        <ActivityIcon label={act} />
                                                                        <span className="text-[11px] font-black text-gray-600 uppercase tracking-widest">{act}</span>
                                                                    </div>
                                                                ))}
                                                                {day.meals && (
                                                                    <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 px-4 py-2.5 rounded-xl">
                                                                        <Utensils size={14} className="text-primary" />
                                                                        <span className="text-[11px] font-black text-primary uppercase tracking-widest">{day.meals}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

             {/* Inclusions & Exclusions */}
             <section className="py-16 md:py-24 container mx-auto px-4 md:px-6 pdf-section">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                    <div className="space-y-6 md:space-y-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="h-px w-6 bg-green-500" />
                                <span className="text-green-600 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">What&apos;s Covered</span>
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase">Inclusions</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 bg-green-50/50 p-6 md:p-10 rounded-3xl border border-green-100">
                            {q.includes?.map((inc, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                                    <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-gray-700 leading-snug break-words">{inc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6 md:space-y-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="h-px w-6 bg-red-400" />
                                <span className="text-red-500 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">What&apos;s Extra</span>
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase">Exclusions</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 bg-red-50/40 p-6 md:p-10 rounded-3xl border border-red-100">
                            {q.exclusions?.map((exc, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <XCircle size={16} className="text-red-300 shrink-0 mt-0.5" />
                                    <span className="text-[11px] md:text-xs font-bold uppercase tracking-wider text-gray-400 leading-snug break-words">{exc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust & Testimonials Section */}
            <section className="py-20 md:py-28 bg-white pdf-section">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 space-y-8">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="h-px w-8 bg-primary" />
                                    <span className="text-primary font-black uppercase tracking-[0.4em] text-xs">Why Choose Us</span>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter leading-none">
                                    Trusted by <span className="text-primary">10K+</span> Travelers
                                </h2>
                            </div>
                            <div className="flex items-center gap-5 p-5 bg-gray-50 rounded-2xl border border-gray-100 w-fit">
                                <div className="flex items-center gap-0.5 text-primary">
                                    {[1,2,3,4,5].map(s => <Star key={s} size={18} fill="currentColor" />)}
                                </div>
                                <div className="h-8 w-px bg-gray-200" />
                                <span className="text-base font-black text-gray-900">4.8 Average Rating</span>
                            </div>
                            <p className="text-lg text-gray-500 font-medium leading-relaxed">
                                Join thousands who have experienced the Youthcamping difference. We prioritize your comfort and experiences above all else.
                            </p>
                        </div>
                        <div className="flex-1 grid grid-cols-1 gap-4">
                            {[
                                { name: "Rahul S.", review: "Youthcamping made our Bali trip absolutely seamless. The luxury villas were breathtaking!", rating: 5 },
                                { name: "Priya M.", review: "Best travel coordinators ever. The attention to detail in our Vietnam itinerary was unmatched.", rating: 5 }
                            ].map((testi, i) => (
                                /* ── Glass testimonial card ── */
                                <div key={i} className="p-6 rounded-2xl glass-shine relative"
                                    style={{
                                        background: 'rgba(250, 248, 243, 0.60)',
                                        backdropFilter: 'blur(12px)',
                                        WebkitBackdropFilter: 'blur(12px)',
                                        border: '1px solid rgba(255,255,255,0.55)',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)'
                                    }}>
                                    <div className="flex items-center gap-0.5 text-primary mb-3">
                                        {[...Array(testi.rating)].map((_, s) => <Star key={s} size={13} fill="currentColor" />)}
                                    </div>
                                    <p className="text-sm md:text-base text-gray-600 font-medium mb-3">&ldquo;{testi.review}&rdquo;</p>
                                    <p className="text-xs font-black text-gray-900 uppercase tracking-widest">{testi.name} — Verified Traveler</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Steps & Payment Policy */}
            <section className="py-20 md:py-28 bg-[#f9f9f7] pdf-section">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
                        <div className="space-y-10">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="h-px w-8 bg-primary" />
                                    <span className="text-primary font-black uppercase tracking-[0.4em] text-xs">The Process</span>
                                </div>
                                <h2 className="text-4xl font-black text-gray-900 uppercase">3 Easy Steps</h2>
                            </div>
                            <div className="space-y-7">
                                {[
                                    { step: "01", title: "Review Itinerary", desc: "Explore our expert-curated day-wise plan covering the best of the destination." },
                                    { step: "02", title: "Confirm on WhatsApp", desc: "Talk to your dedicated coordinator and finalize your travel dates." },
                                    { step: "03", title: "Pack Your Bags", desc: "Pay the booking amount and receive your confirmation instantly." }
                                ].map((s, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <span className="text-4xl font-black text-primary/20 group-hover:text-primary transition-colors shrink-0">{s.step}</span>
                                        <div className="space-y-1">
                                            <h4 className="text-lg font-black text-gray-900 uppercase">{s.title}</h4>
                                            <p className="text-sm text-gray-500 font-medium">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* ── GLASS PRICE CTA CARD ── */}
                        <div className="rounded-3xl md:rounded-[2.5rem] text-white self-start overflow-hidden relative glass-shine"
                            style={{
                                background: 'rgba(12, 28, 20, 0.78)',
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255,255,255,0.10)',
                                boxShadow: '0 24px 64px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)'
                            }}>
                            {/* Gold accent bar */}
                            <div className="h-1 w-full bg-gradient-to-r from-primary via-amber-400 to-primary opacity-80" />
                            <div className="p-8 md:p-12 space-y-7">
                                <div className="space-y-1 border-b pb-5" style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
                                    <h4 className="text-xl font-black text-primary uppercase">Payment Policy</h4>
                                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Transparent pricing, always</p>
                                </div>
                                <div className="space-y-5">
                                    {[
                                        { label: 'Booking Amount', value: '₹10,000 / Person', highlight: true },
                                        { label: 'Confirmation', value: 'Instant', highlight: false },
                                        { label: 'Cancellation', value: 'Full Refund (T&C)', highlight: false },
                                    ].map((row, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm py-1"
                                            style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none', paddingBottom: i < 2 ? '1.25rem' : 0 }}>
                                            <span className="font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>{row.label}</span>
                                            <span className={`font-black uppercase ${row.highlight ? 'text-primary' : 'text-white'}`}>{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                                {renderBookingButton("w-full bg-primary text-white hover:bg-white hover:text-gray-900 py-6 rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/30")}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Booking Modal */}
            <AnimatePresence>
                {isBookingModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsBookingModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] glass-shine"
                            style={{
                                background: 'rgba(252, 250, 247, 0.92)',
                                backdropFilter: 'blur(28px)',
                                WebkitBackdropFilter: 'blur(28px)',
                                border: '1px solid rgba(255,255,255,0.6)',
                                boxShadow: '0 32px 80px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,1)'
                            }}
                        >
                            <div className="p-8 md:p-12 space-y-8">
                                <div className="space-y-2 text-center">
                                    <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] italic">RESERVATION</span>
                                    <h3 className="text-3xl font-black text-gray-900 uppercase">Secure Your Trip</h3>
                                    <p className="text-sm text-gray-400 font-medium italic">Enter your details and our expert will reach out.</p>
                                </div>

                                <form onSubmit={handleBook} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Full Name</label>
                                        <input 
                                            required
                                            value={bookingForm.name}
                                            onChange={e => setBookingForm({...bookingForm, name: e.target.value})}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-primary outline-none transition-all"
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">WhatsApp Phone</label>
                                        <input 
                                            required
                                            type="tel"
                                            value={bookingForm.phone}
                                            onChange={e => setBookingForm({...bookingForm, phone: e.target.value})}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-primary outline-none transition-all"
                                            placeholder="+91 00000 00000"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Email Address</label>
                                        <input 
                                            required
                                            type="email"
                                            value={bookingForm.email}
                                            onChange={e => setBookingForm({...bookingForm, email: e.target.value})}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-primary outline-none transition-all"
                                            placeholder="you@email.com"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Number of Travelers</label>
                                        <input 
                                            required
                                            type="number"
                                            min="1"
                                            value={bookingForm.travelers}
                                            onChange={e => setBookingForm({...bookingForm, travelers: parseInt(e.target.value) || 1})}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-primary outline-none transition-all"
                                            placeholder="e.g. 2"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Travel Dates</label>
                                        <input 
                                            type="text"
                                            value={bookingForm.travelDates}
                                            onChange={e => setBookingForm({...bookingForm, travelDates: e.target.value})}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-primary outline-none transition-all"
                                            placeholder="e.g. Oct 12 to Oct 20"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Special Requests (Optional)</label>
                                        <textarea 
                                            value={bookingForm.specialRequests}
                                            onChange={e => setBookingForm({...bookingForm, specialRequests: e.target.value})}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-primary outline-none transition-all min-h-[100px]"
                                            placeholder="Any dietary requirements or special occasions?"
                                        />
                                    </div>

                                    <Button 
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-primary text-white py-8 rounded-2xl font-black uppercase tracking-widest h-auto mt-4"
                                    >
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : 'Confirm Reservation'}
                                    </Button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── EXPERT SECTION — Glass dark ── */}
            <section className="mx-4 md:mx-6 mb-16 md:mb-24 rounded-3xl md:rounded-[3.5rem] overflow-hidden relative pdf-section"
                style={{
                    background: 'rgba(8, 22, 14, 0.90)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 32px 80px rgba(0,0,0,0.4)'
                }}>
                {/* Subtle green ambient glow */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(249,115,22,0.06) 0%, transparent 70%)' }} />
                <div className="p-8 md:p-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center text-center lg:text-left text-white">
                        <div className="space-y-6 md:space-y-8 order-2 lg:order-1">
                            <div className="space-y-2 md:space-y-3">
                                <div className="flex items-center gap-3 justify-center lg:justify-start">
                                    <span className="h-px w-6 bg-primary" />
                                    <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Your Expert</span>
                                </div>
                                <h3 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9]">
                                    Guided by<br /><span className="text-primary">{q.expert?.name}</span>
                                </h3>
                                <p className="text-sm md:text-base font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{q.expert?.designation || 'Your Destination Host'}</p>
                            </div>
                            <Button
                                onClick={() => window.open(`https://wa.me/${(q.expert?.whatsapp || '').replace(/[^0-9]/g, '')}`, '_blank')}
                                className="w-full sm:w-auto bg-white text-gray-900 rounded-2xl px-8 py-5 text-sm font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all no-print"
                            >
                                Connect on WhatsApp
                            </Button>
                        </div>
                        <div className="flex flex-col items-center gap-5 order-1 lg:order-2">
                            {/* ── Glass expert photo frame ── */}
                            <div className="relative p-1.5 rounded-3xl"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(249,115,22,0.5), rgba(255,255,255,0.08) 50%, rgba(249,115,22,0.2))',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)'
                                }}>
                                <img
                                    src={q.expert?.photo}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-36 h-36 md:w-56 md:h-56 rounded-[1.4rem] object-cover"
                                    alt={q.expert?.name || 'Expert'}
                                />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Certified Expert</p>
                                <p className="text-base md:text-xl font-bold text-white">Specializing in {q.destination.split(',')[0]}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Simplified Footer */}
            <footer className="py-20 border-t text-center space-y-8" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
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

            {/* ── Sticky Mobile Booking CTA ── */}
            <div className="fixed bottom-0 left-0 right-0 z-[140] md:hidden no-print px-4 pb-4"
                style={{ 
                    background: 'linear-gradient(to top, rgba(255,255,255,0.95) 60%, transparent)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                }}>
                <div className="pt-4">
                    {renderBookingButton("w-full rounded-2xl font-black uppercase text-sm tracking-widest h-14 shadow-2xl shadow-primary/25")}
                </div>
                </div>
            </div>
        </div>
    );
}

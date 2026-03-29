"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";
import {
    Sparkles, Copy, Check, AlertCircle, Loader2,
    ChevronDown, ChevronUp, RotateCcw, Download,
    MapPin, Calendar, Users, Clock, Wand2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// ─── Prompt template shown to agent as a guide ───────────────────────────────
const PROMPT_TEMPLATE = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRIP DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Destination:      [e.g. Kerala]
Client Name:      [e.g. Vishwarajbhai]
Duration:         [e.g. 4 Nights / 5 Days]
Trip Type:        [e.g. Luxury]
Travel Dates:     [e.g. 22 Mar – 26 Mar 2026]
Group Size:       [e.g. 6 Travelers]
Hero Image URL:   [paste URL or leave blank]

Day-wise Itinerary:
  Day 1: [Title] — [Description] — [Highlights: point, point, point] — [Stay type] — [Meal type] — [Day image URL]
  Day 2: [Title] — [Description] — [Highlights: ...] — [Stay type] — [Meal type]
  Day 3: ...

Route Stops (in order):
  [Stop Name] | [emoji icon] | [Day number] | [Stop type] | [Drive time to next stop]
  ...

FAQ:
  Q: [question] / A: [answer]
  Q: [question] / A: [answer]`;

// ─── Section colours for JSON tree preview ───────────────────────────────────
const SECTION_META: Record<string, { label: string; color: string; emoji: string }> = {
    hero:        { label: "Hero Section",   color: "#f97316", emoji: "🌄" },
    journeyMap:  { label: "Journey Map",    color: "#3b82f6", emoji: "🗺️" },
    itinerary:   { label: "Itinerary",      color: "#10b981", emoji: "📅" },
    faq:         { label: "FAQ",            color: "#8b5cf6", emoji: "❓" },
};

function JsonTree({ data, depth = 0 }: { data: any; depth?: number }) {
    const [open, setOpen] = useState(true);
    if (data === null || data === undefined) return <span className="text-gray-400 text-xs">null</span>;
    if (typeof data === "string")  return <span className="text-emerald-600 text-xs">"{data}"</span>;
    if (typeof data === "number")  return <span className="text-blue-600 text-xs">{data}</span>;
    if (typeof data === "boolean") return <span className="text-purple-600 text-xs">{String(data)}</span>;

    if (Array.isArray(data)) {
        return (
            <span>
                <button onClick={() => setOpen(o => !o)} className="text-gray-500 text-xs font-bold mr-1 hover:text-primary">
                    [{open ? "–" : `+${data.length}`}]
                </button>
                {open && (
                    <div className="ml-4 border-l border-gray-100 pl-3">
                        {data.map((item, i) => (
                            <div key={i} className="my-0.5">
                                <span className="text-gray-400 text-xs mr-2">{i}:</span>
                                <JsonTree data={item} depth={depth + 1} />
                            </div>
                        ))}
                    </div>
                )}
            </span>
        );
    }

    if (typeof data === "object") {
        return (
            <span>
                <button onClick={() => setOpen(o => !o)} className="text-gray-500 text-xs font-bold mr-1 hover:text-primary">
                    {"{" + (open ? "–" : `+${Object.keys(data).length}`) + "}"}
                </button>
                {open && (
                    <div className="ml-4 border-l border-gray-100 pl-3">
                        {Object.entries(data).map(([k, v]) => (
                            <div key={k} className="my-0.5 flex flex-wrap gap-1 items-start">
                                <span className="text-gray-600 text-xs font-bold shrink-0">"{k}":</span>
                                <JsonTree data={v} depth={depth + 1} />
                            </div>
                        ))}
                    </div>
                )}
            </span>
        );
    }
    return null;
}

function SectionCard({ sectionKey, data }: { sectionKey: string; data: any }) {
    const [copied, setCopied] = useState(false);
    const meta = SECTION_META[sectionKey] || { label: sectionKey, color: "#999", emoji: "📦" };

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2));
        setCopied(true);
        toast.success(`${meta.label} JSON copied`);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm"
        >
            {/* Header strip */}
            <div
                className="flex items-center justify-between px-6 py-4"
                style={{ background: `${meta.color}10`, borderBottom: `1px solid ${meta.color}20` }}
            >
                <div className="flex items-center gap-3">
                    <span className="text-xl">{meta.emoji}</span>
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: meta.color }}>
                        {meta.label}
                    </span>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all"
                    style={{ background: `${meta.color}15`, color: meta.color }}
                >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>

            {/* JSON tree */}
            <div className="bg-white p-6 font-mono text-xs leading-relaxed overflow-x-auto max-h-80 overflow-y-auto">
                <JsonTree data={data} />
            </div>
        </motion.div>
    );
}

// ─── Quick preview cards ──────────────────────────────────────────────────────
function HeroPreview({ hero }: { hero: any }) {
    return (
        <div className="relative rounded-3xl overflow-hidden h-48 shadow-lg">
            {hero.heroImageUrl ? (
                <img src={hero.heroImageUrl} className="absolute inset-0 w-full h-full object-cover" alt="" />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-gray-900" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6">
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">
                    {hero.tripType} · {hero.duration}
                </p>
                <h3 className="text-white font-black text-2xl uppercase tracking-tighter">{hero.destination}</h3>
                <p className="text-white/70 text-xs mt-1">{hero.tagline}</p>
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                    <Users size={9} /> {hero.groupSize}
                </span>
                <span className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                    <Calendar size={9} /> {hero.travelDates}
                </span>
            </div>
        </div>
    );
}

function StopPill({ stop }: { stop: any }) {
    return (
        <div className="flex flex-col items-center gap-1.5 relative">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-lg">{stop.icon}</div>
            <span className="text-[9px] font-black uppercase tracking-wider text-gray-600 text-center max-w-[64px] leading-tight">{stop.name}</span>
            {stop.driveTimeToNext && (
                <span className="text-[8px] text-gray-400 font-bold">{stop.driveTimeToNext}</span>
            )}
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AIGeneratorPage() {
    const router = useRouter();
    const [input, setInput] = useState(PROMPT_TEMPLATE);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"preview" | "json">("preview");
    const [copiedAll, setCopiedAll] = useState(false);

    const charCount = input.length;
    const isTemplate = input === PROMPT_TEMPLATE;

    const handleGenerate = async () => {
        if (isTemplate) {
            toast.error("Please fill in the trip details template first.");
            return;
        }
        if (input.trim().length < 40) {
            toast.error("Add more details for a better result.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch("/api/ai/generate-itinerary", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: input }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || "Generation failed");
            }
            setResult(data.data);
            setActiveTab("preview");
            toast.success("✨ Itinerary generated successfully!");
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyAll = () => {
        if (!result) return;
        navigator.clipboard.writeText(JSON.stringify(result, null, 2));
        setCopiedAll(true);
        toast.success("Full JSON copied to clipboard");
        setTimeout(() => setCopiedAll(false), 2500);
    };

    const handleDownload = () => {
        if (!result) return;
        const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `itinerary-${result.hero?.destination?.toLowerCase().replace(/\s+/g, "-") || "generated"}-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("JSON downloaded");
    };

    const handleReset = () => {
        setInput(PROMPT_TEMPLATE);
        setResult(null);
        setError(null);
    };

    return (
        <div className="space-y-10">
            {/* Page header */}
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Wand2 size={20} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">AI Itinerary Generator</h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Powered by Gemini 1.5 Flash</p>
                        </div>
                    </div>
                </div>

                {result && (
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            className="rounded-2xl text-xs font-black uppercase tracking-widest border-gray-200"
                        >
                            <RotateCcw size={14} className="mr-2" /> Reset
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleDownload}
                            className="rounded-2xl text-xs font-black uppercase tracking-widest border-gray-200"
                        >
                            <Download size={14} className="mr-2" /> Download JSON
                        </Button>
                        <Button
                            onClick={handleCopyAll}
                            className="rounded-2xl text-xs font-black uppercase tracking-widest"
                        >
                            {copiedAll ? <Check size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
                            {copiedAll ? "Copied!" : "Copy All JSON"}
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                {/* ── LEFT: Input panel ─────────────────────────────────── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Trip Brief</h2>
                        <span className={`text-[10px] font-bold tabular-nums ${charCount > 3000 ? 'text-red-500' : 'text-gray-400'}`}>
                            {charCount.toLocaleString()} chars
                        </span>
                    </div>

                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onFocus={() => { if (isTemplate) setInput(""); }}
                            spellCheck={false}
                            placeholder={PROMPT_TEMPLATE}
                            className="w-full h-[600px] bg-gray-50 border-2 border-gray-100 rounded-3xl p-6 text-sm font-mono text-gray-700 outline-none focus:border-primary transition-all resize-none leading-relaxed placeholder:text-gray-300"
                        />

                        {/* Inline guide overlay — visible only when empty */}
                        {input.trim() === "" && (
                            <div className="absolute inset-0 p-6 pointer-events-none">
                                <pre className="text-[11px] text-gray-300 font-mono whitespace-pre-wrap leading-relaxed">
                                    {PROMPT_TEMPLATE}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Helper tips */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { icon: "🗓️", tip: "Include Travel Dates for auto date chips" },
                            { icon: "🏨", tip: "Mention stay type for each day (5-star / houseboat)" },
                            { icon: "🗺️", tip: "Add Route Stops with drive times for the journey map" },
                            { icon: "🍽️", tip: "Specify meal type: Breakfast / All Meals / None" },
                        ].map((t, i) => (
                            <div key={i} className="flex items-start gap-2 bg-white p-4 rounded-2xl border border-gray-100 text-xs">
                                <span>{t.icon}</span>
                                <span className="text-gray-500 font-medium leading-snug">{t.tip}</span>
                            </div>
                        ))}
                    </div>

                    {/* Generate button */}
                    <Button
                        onClick={handleGenerate}
                        disabled={isLoading || input.trim().length < 20}
                        className="w-full h-16 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-primary/20 relative overflow-hidden"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="mr-3 animate-spin" />
                                Generating Itinerary…
                            </>
                        ) : (
                            <>
                                <Sparkles size={18} className="mr-3" />
                                Generate with AI
                                <span className="ml-3 text-white/50 text-[10px] font-bold normal-case tracking-normal">Gemini 1.5 Flash</span>
                            </>
                        )}
                        {/* shimmer effect while loading */}
                        {isLoading && (
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                animate={{ x: ["-100%", "200%"] }}
                                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                            />
                        )}
                    </Button>
                </div>

                {/* ── RIGHT: Output panel ──────────────────────────────── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Generated Output</h2>
                        {result && (
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                {(["preview", "json"] as const).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                            activeTab === tab ? "bg-white text-primary shadow-sm" : "text-gray-400"
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Loading skeleton */}
                    {isLoading && (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="rounded-3xl overflow-hidden border border-gray-100 animate-pulse">
                                    <div className="h-14 bg-gray-100" />
                                    <div className="p-6 space-y-3 bg-white">
                                        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                                        <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error state */}
                    {error && !isLoading && (
                        <GlassCard className="p-8 rounded-3xl border border-red-100 bg-red-50/50 flex items-start gap-4">
                            <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-black text-red-700 text-sm">Generation Failed</p>
                                <p className="text-red-500 text-xs font-medium mt-1">{error}</p>
                                <p className="text-red-400 text-xs mt-2">Check your prompt has enough detail, or verify that <code className="bg-red-100 px-1 rounded">GEMINI_API_KEY</code> is configured in <code className="bg-red-100 px-1 rounded">.env.local</code></p>
                            </div>
                        </GlassCard>
                    )}

                    {/* Empty state */}
                    {!result && !isLoading && !error && (
                        <GlassCard className="flex flex-col items-center justify-center p-16 text-center gap-5 rounded-3xl h-[600px]">
                            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center">
                                <Sparkles size={36} className="text-primary/40" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-black text-gray-900 text-lg">Your output appears here</h3>
                                <p className="text-gray-400 text-sm font-medium max-w-xs leading-relaxed">
                                    Fill in the trip brief on the left and click <strong>Generate with AI</strong>
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {Object.values(SECTION_META).map(m => (
                                    <span key={m.label} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
                                        style={{ background: `${m.color}15`, color: m.color }}>
                                        {m.emoji} {m.label}
                                    </span>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {/* Result output */}
                    <AnimatePresence mode="wait">
                        {result && !isLoading && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                className="space-y-4 max-h-[680px] overflow-y-auto pr-1"
                            >
                                {activeTab === "preview" ? (
                                    <>
                                        {/* Hero preview */}
                                        {result.hero && <HeroPreview hero={result.hero} />}

                                        {/* Journey stops */}
                                        {result.journeyMap?.stops?.length > 0 && (
                                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                                                <div className="flex items-center gap-2 mb-5">
                                                    <span className="text-lg">🗺️</span>
                                                    <span className="text-xs font-black uppercase tracking-widest text-blue-500">Journey Map</span>
                                                </div>
                                                <div className="flex gap-4 overflow-x-auto pb-2">
                                                    {result.journeyMap.stops.map((stop: any, i: number) => (
                                                        <StopPill key={i} stop={stop} />
                                                    ))}
                                                </div>
                                                {result.journeyMap.summaryTiles?.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-50">
                                                        {result.journeyMap.summaryTiles.map((tile: any, i: number) => (
                                                            <span key={i} className="flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                                                                {tile.icon} {tile.label}: {tile.place}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Itinerary days */}
                                        {result.itinerary?.days?.length > 0 && (
                                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">📅</span>
                                                    <span className="text-xs font-black uppercase tracking-widest text-emerald-500">
                                                        {result.itinerary.days.length}-Day Itinerary
                                                    </span>
                                                </div>
                                                {result.itinerary.days.map((day: any, i: number) => (
                                                    <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-2xl">
                                                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
                                                            {day.dayNumber}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="font-black text-gray-900 text-sm">{day.title}</p>
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{day.activityType}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed line-clamp-2">{day.description}</p>
                                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                                {day.stayType && <span className="text-[9px] bg-white border border-gray-100 text-gray-500 font-bold uppercase tracking-widest px-2 py-1 rounded-lg">🏨 {day.stayType}</span>}
                                                                {day.mealType && <span className="text-[9px] bg-white border border-gray-100 text-gray-500 font-bold uppercase tracking-widest px-2 py-1 rounded-lg">🍽️ {day.mealType}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* FAQ */}
                                        {result.faq?.items?.length > 0 && (
                                            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">❓</span>
                                                    <span className="text-xs font-black uppercase tracking-widest text-purple-500">
                                                        {result.faq.items.length} FAQs
                                                    </span>
                                                </div>
                                                {result.faq.items.map((faq: any, i: number) => (
                                                    <div key={i} className="p-4 bg-gray-50 rounded-2xl">
                                                        <p className="text-xs font-black text-gray-900 mb-1">Q: {faq.question}</p>
                                                        <p className="text-xs text-gray-500 font-medium leading-snug">A: {faq.answer}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    /* JSON tab — section-by-section */
                                    <div className="space-y-4">
                                        {Object.entries(result).map(([key, val]) => (
                                            <SectionCard key={key} sectionKey={key} data={val} />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

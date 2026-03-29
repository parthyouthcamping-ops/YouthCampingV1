"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
    ArrowLeft,
    Save,
    Plus,
    Trash2,
    Image as ImageIcon,
    ChevronRight,
    ChevronLeft,
    Hotel as HotelIcon,
    Calendar,
    Users,
    GripVertical,
    Eye,
    EyeOff,
    FileText,
    Layers,
    Edit,
    MessageCircle as WhatsAppIcon,
    Map as MapIcon,
    RotateCcw,
    Clock as ClockIcon
} from "lucide-react";
import { useBrandSettings } from "@/hooks/useBrandSettings";
import { Quotation, Hotel as HotelType, DayItinerary, CustomSection, JourneyStop } from "@/lib/types";
import { saveQuotation, generateSlug } from "@/lib/store";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { toast } from "sonner";

interface QuotationFormProps {
    initialData?: Quotation;
    isEdit?: boolean;
}

export default function QuotationForm({ initialData, isEdit = false }: QuotationFormProps) {
    const router = useRouter();
    const { brand } = useBrandSettings();
    const [step, setStep] = useState(1);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingField, setUploadingField] = useState<string | null>(null);
    const activeUploads = useState(0); // [count, setCount]
    const totalSteps = 7;

    const CLOUDINARY_CLOUD = "dltxunwku";
    const CLOUDINARY_PRESET = "quotation_upload";
    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;

    const [formData, setFormData] = useState<Partial<Quotation>>({
        id: uuidv4(),
        status: "Draft",
        pax: 2,
        lowLevelPrice: 24999,
        highLevelPrice: 44999,
        travelDates: { from: "", to: "" },
        duration: "",
        transportOption: "Private Car",
        roomSharing: "Double",
        hotels: [],
        lowLevelHotels: [],
        highLevelHotels: [],
        itinerary: [],
        customSections: [],
        experiencePhotos: [],
        includes: ["Hotel Stay", "All Transfers", "Sightseeing", "Breakfast & Dinner"],
        exclusions: ["Airfare", "Visa Fees", "Personal Expenses", "Travel Insurance"],
        expert: { name: "", whatsapp: "" },
        ...initialData
    });


    useEffect(() => {
        if (formData.travelDates?.from && formData.travelDates?.to) {
            const start = new Date(formData.travelDates.from);
            const end = new Date(formData.travelDates.to);
            const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            if (diff > 0) {
                setFormData(prev => ({ ...prev, duration: `${diff} Nights / ${diff + 1} Days` }));
            } else {
                setFormData(prev => ({ ...prev, duration: "" }));
            }
        } else {
            setFormData(prev => ({ ...prev, duration: "" }));
        }
    }, [formData.travelDates?.from, formData.travelDates?.to]);

    useEffect(() => {
        // ─── HYDRATE FROM AI GENERATOR ─────────────────────────────────────────
        const pendingData = localStorage.getItem("pending_ai_quotation");
        if (pendingData) {
            try {
                const parsed = JSON.parse(pendingData);
                // Ensure all arrays have IDs for React keys
                const ensureIds = (arr: any[]) => (arr || []).map(item => ({ ...item, id: item.id || uuidv4() }));
                
                setFormData(prev => ({
                    ...prev,
                    ...parsed,
                    id: uuidv4(), 
                    status: "Draft",
                    travelDates: parsed.travelDates || prev.travelDates,
                    lowLevelHotels: ensureIds(parsed.lowLevelHotels),
                    highLevelHotels: ensureIds(parsed.highLevelHotels),
                    itinerary: ensureIds(parsed.itinerary),
                    journeyMap: parsed.journeyMap || prev.journeyMap,
                }));
                toast.success("✨ AI Itinerary Imported Successfully!");
                localStorage.removeItem("pending_ai_quotation");
            } catch (err) {
                console.error("Failed to hydrate from AI data:", err);
            }
        }
    }, [initialData]);

    const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleWhatsAppShare = () => {
        if (!formData.clientName) return;

        const customerName = formData.clientName;
        const companyName = brand?.companyName || "YouthCamping";
        const quotationLink = `${window.location.origin}/quote/${formData.slug}`;
        const salesPersonName = formData.expert?.name || "Your Travel Expert";
        const designation = formData.expert?.designation || "Destination Expert";

        const message = `Hi ${customerName},

Greetings from ${companyName}.

As per our recent conversation, we've prepared a customized quotation for you based on your requirements.

You can view the quotation by clicking on the following link:
${quotationLink}

${salesPersonName}
${designation}`;

        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleSave = async () => {
        // Block save if any image upload is still running
        if (activeUploads[0] > 0 || uploadingField !== null) {
            toast.error("Please wait for all image uploads to complete before saving.");
            return;
        }

        setIsSaving(true);
        try {
            // Scrub: ensure all photo fields contain only URL strings (http/https)
            const isUrl = (v: unknown): v is string =>
                typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://'));

            const scrubHotels = (hotels: typeof formData.lowLevelHotels) =>
                (hotels || []).map(h => ({
                    ...h,
                    photos: (h.photos || []).filter(isUrl)
                }));

            const scrubbedData = {
                ...formData,
                heroImage: isUrl(formData.heroImage) ? formData.heroImage : undefined,
                experiencePhotos: (formData.experiencePhotos || []).filter(isUrl),
                lowLevelHotels: scrubHotels(formData.lowLevelHotels),
                highLevelHotels: scrubHotels(formData.highLevelHotels),
                hotels: scrubHotels(formData.hotels),
                itinerary: (formData.itinerary || []).map(day => ({
                    ...day,
                    photos: (day.photos || []).filter(isUrl)
                })),
                expert: {
                    ...formData.expert!,
                    photo: isUrl(formData.expert?.photo) ? formData.expert?.photo : undefined
                }
            };

            const finalData: Quotation = {
                ...scrubbedData as Quotation,
                slug: formData.slug || generateSlug(formData.destination || "trip", formData.id || uuidv4()),
                updatedAt: new Date().toISOString()
            };
            console.log("Saving payload:", finalData);
            await saveQuotation(finalData);
            toast.success("Proposal saved successfully!");
            router.push("/admin");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save proposal. Please check your connection.");
        } finally {
            setIsSaving(false);
        }
    };


    const uploadToCloudinary = async (file: File): Promise<string> => {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", CLOUDINARY_PRESET);
        const res = await fetch(CLOUDINARY_URL, { method: "POST", body: fd });
        if (!res.ok) throw new Error("Cloudinary upload failed");
        const data = await res.json();
        return data.secure_url as string;
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        field: string,
        isList = false,
        index?: number
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 20 * 1024 * 1024) {
            toast.error("Image must be under 20MB");
            e.target.value = "";
            return;
        }

        const fieldKey = index !== undefined ? `${field}_${index}` : field;
        setUploadingField(fieldKey);
        activeUploads[1](n => n + 1);
        try {
            const url = await uploadToCloudinary(file);
            // Validate returned value is a proper URL before storing
            if (!url || !url.startsWith('https://')) {
                throw new Error('Invalid URL returned from Cloudinary');
            }
            setFormData(prev => {
                if (index !== undefined) {
                    if (field === 'hotels') {
                        const newHotels = [...(prev.hotels || [])];
                        newHotels[index] = { ...newHotels[index], photos: [...(newHotels[index].photos || []), url] };
                        return { ...prev, hotels: newHotels };
                    } else if (field === 'lowLevelHotels') {
                        const newHotels = [...(prev.lowLevelHotels || [])];
                        newHotels[index] = { ...newHotels[index], photos: [...(newHotels[index].photos || []), url] };
                        return { ...prev, lowLevelHotels: newHotels };
                    } else if (field === 'highLevelHotels') {
                        const newHotels = [...(prev.highLevelHotels || [])];
                        newHotels[index] = { ...newHotels[index], photos: [...(newHotels[index].photos || []), url] };
                        return { ...prev, highLevelHotels: newHotels };
                    } else if (field === 'itinerary') {
                        const newItin = [...(prev.itinerary || [])];
                        newItin[index] = { ...newItin[index], photos: [...(newItin[index].photos || []), url] };
                        return { ...prev, itinerary: newItin };
                    } else if (field === 'customSections') {
                        const newSections = [...(prev.customSections || [])];
                        newSections[index] = { ...newSections[index], image: url };
                        return { ...prev, customSections: newSections };
                    }
                } else if (field === 'experiencePhotos') {
                    return { ...prev, experiencePhotos: [...(prev.experiencePhotos || []), url] };
                } else {
                    return { ...prev, [field]: url };
                }
                return prev;
            });
            toast.success("Image uploaded!");
        } catch (err) {
            console.error(err);
            toast.error("Image upload failed. Please try again.");
        } finally {
            activeUploads[1](n => n - 1);
            setUploadingField(null);
            e.target.value = "";
        }
    };

    const TABS = [
        { id: "trip", label: "Trip Info" },
        { id: "branding", label: "Branding" },
        { id: "hotels", label: "Hotels" },
        { id: "itinerary", label: "Itinerary" },
        { id: "extra", label: "Extra Sections" },
        { id: "pricing", label: "Final Details" },
    ];

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-12">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/admin")}
                    className="text-gray-400 font-semibold hover:text-gray-900"
                >
                    <ArrowLeft size={20} className="mr-2" /> Back to List
                </Button>

                <div className="flex items-center gap-4">
                    <div className="flex gap-2 mr-6">
                        {[1, 2, 3, 4, 5, 6].map(s => (
                            <div
                                key={s}
                                className={`w-8 h-1.5 rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-gray-100'}`}
                            />
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        {isEdit && (
                            <Button
                                variant="outline"
                                onClick={handleWhatsAppShare}
                                className="rounded-2xl border-2 border-green-100 text-green-600 hover:bg-green-50 hover:border-green-200"
                            >
                                <WhatsAppIcon size={18} className="mr-2" /> Share via WhatsApp
                            </Button>
                        )}
                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving || activeUploads[0] > 0}
                            className="rounded-2xl shadow-xl shadow-primary/30 min-w-[140px]"
                        >
                            {isSaving ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </div>
                            ) : activeUploads[0] > 0 ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Uploading...
                                </div>
                            ) : (
                                <><Save size={18} className="mr-2" /> {isEdit ? "Update Proposal" : "Save Proposal"}</>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <GlassCard className="p-12 mb-12">
                        {step === 1 && (
                            <div className="flex flex-col gap-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <FileText size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Basic Details</h2>
                                        <p className="text-gray-500 font-medium">Set the luxury foundation for this trip.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label htmlFor="clientName" className="font-semibold">Client Name</Label>
                                        <Input
                                            id="clientName"
                                            name="clientName"
                                            placeholder="e.g. Mr. & Mrs. Singh"
                                            value={formData.clientName || ""}
                                            onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="destination" className="font-semibold">Destination</Label>
                                        <Input
                                            id="destination"
                                            name="destination"
                                            placeholder="e.g. Manali Luxury Escape"
                                            value={formData.destination || ""}
                                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="pax" className="font-semibold">Pax Count</Label>
                                        <Input
                                            id="pax"
                                            name="pax"
                                            type="number"
                                            value={formData.pax}
                                            onChange={(e) => setFormData({ ...formData, pax: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="lowLevelPrice" className="font-semibold">Standard (Low Level) Price (₹)</Label>
                                        <Input
                                            id="lowLevelPrice"
                                            name="lowLevelPrice"
                                            type="number"
                                            placeholder="Standard Option Price"
                                            className="font-semibold"
                                            value={formData.lowLevelPrice}
                                            onChange={(e) => setFormData({ ...formData, lowLevelPrice: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="highLevelPrice" className="font-semibold">Luxury (High Level) Price (₹)</Label>
                                        <Input
                                            id="highLevelPrice"
                                            name="highLevelPrice"
                                            type="number"
                                            placeholder="Luxury Option Price"
                                            className="font-black"
                                            value={formData.highLevelPrice}
                                            onChange={(e) => setFormData({ ...formData, highLevelPrice: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="travelDateFrom">Travel Dates From</Label>
                                        <Input
                                            id="travelDateFrom"
                                            name="travelDateFrom"
                                            type="date"
                                            value={formData.travelDates?.from || ""}
                                            onChange={(e) => setFormData({ ...formData, travelDates: { ...formData.travelDates!, from: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="travelDateTo">Travel Dates To</Label>
                                        <Input
                                            id="travelDateTo"
                                            name="travelDateTo"
                                            type="date"
                                            value={formData.travelDates?.to || ""}
                                            onChange={(e) => setFormData({ ...formData, travelDates: { ...formData.travelDates!, to: e.target.value } })}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="duration">Duration (Auto-calculated)</Label>
                                        <Input
                                            id="duration"
                                            name="duration"
                                            disabled
                                            className="bg-gray-50 font-semibold text-primary"
                                            value={formData.duration || "Nights / Days"}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="flex flex-col gap-10 text-center items-center py-10">
                                <div className="max-w-md">
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Brand Elements</h2>
                                    <p className="text-gray-500 font-medium mb-12">Upload high-resolution images to elevate the luxury feel.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                                    <div className="flex flex-col gap-4">
                                        <Label>Destination Hero</Label>
                                        <label htmlFor="heroImage" className="group relative aspect-video rounded-[2rem] border-4 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-all overflow-hidden bg-gray-50">
                                            {formData.heroImage ? (
                                                <img src={formData.heroImage} className="w-full h-full object-cover" />
                                            ) : uploadingField === 'heroImage' ? (
                                                <div className="text-primary flex flex-col items-center gap-3">
                                                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                    <span className="text-[10px] font-semibold uppercase tracking-widest">Uploading...</span>
                                                </div>
                                            ) : (
                                                <div className="text-gray-400 group-hover:text-primary transition-colors flex flex-col items-center gap-3">
                                                    <ImageIcon size={32} />
                                                    <span className="text-[10px] font-semibold uppercase tracking-widest">Select Image</span>
                                                </div>
                                            )}
                                        </label>
                                        <input id="heroImage" name="heroImage" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'heroImage')} />
                                    </div>


                                    <div className="flex flex-col gap-4">
                                        <Label>Experience Photos (Slider)</Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {formData.experiencePhotos?.map((p, i) => (
                                                <div key={i} className="aspect-video rounded-xl overflow-hidden relative group">
                                                    <img src={p} className="w-full h-full object-cover" />
                                                    <button
                                                        onClick={() => {
                                                            const n = [...(formData.experiencePhotos || [])];
                                                            n.splice(i, 1);
                                                            setFormData({ ...formData, experiencePhotos: n });
                                                        }}
                                                        className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            <label htmlFor="experiencePhotos" className="aspect-video rounded-xl border-4 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-all bg-gray-50 flex-col gap-1">
                                                {uploadingField === 'experiencePhotos' ? (
                                                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                ) : (
                                                    <Plus size={20} className="text-gray-400" />
                                                )}
                                                <span className="text-[8px] font-black uppercase text-gray-400">{uploadingField === 'experiencePhotos' ? 'Uploading...' : 'Add Photo'}</span>
                                            </label>
                                            <input id="experiencePhotos" name="experiencePhotos" type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'experiencePhotos')} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4 text-left">
                                        <div className="space-y-1">
                                            <Label className="font-semibold">Expert Details</Label>
                                            <p className="text-[10px] text-gray-400 font-medium">Profile information for the destination expert.</p>
                                        </div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <label htmlFor="expertPhoto" className="group relative w-16 h-16 rounded-full border-2 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-all overflow-hidden bg-gray-50 shrink-0">
                                                {formData.expert?.photo ? (
                                                    <img src={formData.expert.photo} className="w-full h-full object-cover" />
                                                ) : uploadingField === 'expert_photo' ? (
                                                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                ) : (
                                                    <div className="text-gray-400 group-hover:text-primary transition-colors flex flex-col items-center">
                                                        <Plus size={16} />
                                                    </div>
                                                )}
                                            </label>
                                    <input id="expertPhoto" name="expertPhoto" type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;
                                                setUploadingField('expert_photo');
                                                try {
                                                    const url = await uploadToCloudinary(file);
                                                    setFormData(prev => ({ ...prev, expert: { ...prev.expert!, photo: url } }));
                                                    toast.success("Photo uploaded!");
                                                } catch {
                                                    toast.error("Photo upload failed.");
                                                } finally {
                                                    setUploadingField(null);
                                                    e.target.value = "";
                                                }
                                            }} />
                                            <div className="flex-1 space-y-2">
                                                <Input
                                                    id="expertName"
                                                    name="expertName"
                                                    placeholder="Expert Name"
                                                    value={formData.expert?.name || ""}
                                                    className="h-10 text-xs font-semibold"
                                                    onChange={(e) => setFormData({ ...formData, expert: { ...formData.expert!, name: e.target.value } })}
                                                />
                                                <Input
                                                    id="expertDesignation"
                                                    name="expertDesignation"
                                                    placeholder="Expert Title"
                                                    value={formData.expert?.designation || ""}
                                                    className="h-10 text-xs font-semibold"
                                                    onChange={(e) => setFormData({ ...formData, expert: { ...formData.expert!, designation: e.target.value } })}
                                                />
                                            </div>
                                        </div>
                                        <Input
                                            id="expertWhatsapp"
                                            name="expertWhatsapp"
                                            placeholder="WhatsApp Number"
                                            value={formData.expert?.whatsapp || ""}
                                            className="h-10 text-xs font-semibold"
                                            onChange={(e) => setFormData({ ...formData, expert: { ...formData.expert!, whatsapp: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="flex flex-col gap-10">
                                <div className="flex flex-col gap-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                                <HotelIcon size={28} />
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Hotel Options</h2>
                                                <p className="text-gray-500 font-medium">Standard & Luxury Stays.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between border-l-4 border-gray-200 pl-6">
                                            <h3 className="text-xl font-semibold">Standard Hotels</h3>
                                            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => {
                                                const h: HotelType = { id: uuidv4(), name: "", location: "", rating: 3, description: "", roomType: "", photos: [] };
                                                setFormData({ ...formData, lowLevelHotels: [...(formData.lowLevelHotels || []), h] });
                                            }}>+ Add Standard Stay</Button>
                                        </div>

                                        <div className="flex flex-col gap-8">
                                            {formData.lowLevelHotels?.map((hotel, index) => (
                                                <div key={hotel.id || `low-${index}`} className="p-8 bg-gray-50/50 rounded-[2rem] border-2 border-transparent hover:border-gray-100 transition-all">
                                                    <div className="flex justify-between mb-6">
                                                        <h4 className="font-semibold text-gray-400">Standard Hotel {index + 1}</h4>
                                                        <Button variant="ghost" onClick={() => {
                                                            const newH = [...(formData.lowLevelHotels || [])];
                                                            newH.splice(index, 1);
                                                            setFormData({ ...formData, lowLevelHotels: newH });
                                                        }} className="text-red-400"><Trash2 size={16} /></Button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                        <div className="md:col-span-2 space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <Input id={`lowHotelName_${index}`} name={`lowHotelName_${index}`} placeholder="Hotel Name" value={hotel.name} onChange={(e) => {
                                                                    const newH = [...(formData.lowLevelHotels || [])];
                                                                    newH[index].name = e.target.value;
                                                                    setFormData({ ...formData, lowLevelHotels: newH });
                                                                }} />
                                                                <Input id={`lowHotelLocation_${index}`} name={`lowHotelLocation_${index}`} placeholder="Location" value={hotel.location} onChange={(e) => {
                                                                    const newH = [...(formData.lowLevelHotels || [])];
                                                                    newH[index].location = e.target.value;
                                                                    setFormData({ ...formData, lowLevelHotels: newH });
                                                                }} />
                                                                <Input id={`lowHotelRoomType_${index}`} name={`lowHotelRoomType_${index}`} placeholder="Room Type" value={hotel.roomType} onChange={(e) => {
                                                                    const newH = [...(formData.lowLevelHotels || [])];
                                                                    newH[index].roomType = e.target.value;
                                                                    setFormData({ ...formData, lowLevelHotels: newH });
                                                                }} />
                                                            </div>
                                                            <Textarea id={`lowHotelDesc_${index}`} name={`lowHotelDesc_${index}`} placeholder="Description..." value={hotel.description} onChange={(e) => {
                                                                const newH = [...(formData.lowLevelHotels || [])];
                                                                newH[index].description = e.target.value;
                                                                setFormData({ ...formData, lowLevelHotels: newH });
                                                            }} />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 h-fit">
                                                            {hotel.photos?.map((p, i) => (
                                                                <div key={i} className="aspect-square rounded-xl overflow-hidden relative">
                                                                    <img src={p} className="w-full h-full object-cover" />
                                                                </div>
                                                            ))}
                                                            <label htmlFor={`lowLevelHotel_${index}`} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer bg-white">
                                                                {uploadingField === `lowLevelHotels_${index}` ? (
                                                                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                                ) : (
                                                                    <Plus size={16} />
                                                                )}
                                                            </label>
                                                            <input id={`lowLevelHotel_${index}`} name={`lowLevelHotel_${index}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'lowLevelHotels', true, index)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-8 pt-10 border-t border-gray-50">
                                        <div className="flex items-center justify-between border-l-4 border-primary pl-6">
                                            <h3 className="text-xl font-semibold">Luxury Hotels</h3>
                                            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => {
                                                const h: Hotel = { id: uuidv4(), name: "", location: "", rating: 5, description: "", roomType: "", photos: [] };
                                                setFormData({ ...formData, highLevelHotels: [...(formData.highLevelHotels || []), h] });
                                            }}>+ Add Luxury Stay</Button>
                                        </div>

                                        <div className="flex flex-col gap-8">
                                            {formData.highLevelHotels?.map((hotel, index) => (
                                                <div key={hotel.id || `high-${index}`} className="p-8 bg-primary/[0.02] rounded-[2rem] border-2 border-transparent hover:border-primary/5 transition-all">
                                                    <div className="flex justify-between mb-6">
                                                        <h4 className="font-semibold text-primary opacity-50">Luxury Hotel {index + 1}</h4>
                                                        <Button variant="ghost" onClick={() => {
                                                            const newH = [...(formData.highLevelHotels || [])];
                                                            newH.splice(index, 1);
                                                            setFormData({ ...formData, highLevelHotels: newH });
                                                        }} className="text-red-400"><Trash2 size={16} /></Button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                        <div className="md:col-span-2 space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <Input id={`highHotelName_${index}`} name={`highHotelName_${index}`} placeholder="Hotel Name" value={hotel.name} onChange={(e) => {
                                                                    const newH = [...(formData.highLevelHotels || [])];
                                                                    newH[index].name = e.target.value;
                                                                    setFormData({ ...formData, highLevelHotels: newH });
                                                                }} />
                                                                <Input id={`highHotelLocation_${index}`} name={`highHotelLocation_${index}`} placeholder="Location" value={hotel.location} onChange={(e) => {
                                                                    const newH = [...(formData.highLevelHotels || [])];
                                                                    newH[index].location = e.target.value;
                                                                    setFormData({ ...formData, highLevelHotels: newH });
                                                                }} />
                                                                <Input id={`highHotelRoomType_${index}`} name={`highHotelRoomType_${index}`} placeholder="Room Type" value={hotel.roomType} onChange={(e) => {
                                                                    const newH = [...(formData.highLevelHotels || [])];
                                                                    newH[index].roomType = e.target.value;
                                                                    setFormData({ ...formData, highLevelHotels: newH });
                                                                }} />
                                                            </div>
                                                            <Textarea id={`highHotelDesc_${index}`} name={`highHotelDesc_${index}`} placeholder="Description..." value={hotel.description} onChange={(e) => {
                                                                const newH = [...(formData.highLevelHotels || [])];
                                                                newH[index].description = e.target.value;
                                                                setFormData({ ...formData, highLevelHotels: newH });
                                                            }} />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 h-fit">
                                                            {hotel.photos?.map((p, i) => (
                                                                <div key={i} className="aspect-square rounded-xl overflow-hidden relative">
                                                                    <img src={p} className="w-full h-full object-cover" />
                                                                </div>
                                                            ))}
                                                            <label htmlFor={`highLevelHotel_${index}`} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer bg-white">
                                                                {uploadingField === `highLevelHotels_${index}` ? (
                                                                    <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                                ) : (
                                                                    <Plus size={16} />
                                                                )}
                                                            </label>
                                                            <input id={`highLevelHotel_${index}`} name={`highLevelHotel_${index}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'highLevelHotels', true, index)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="flex flex-col gap-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                            <Calendar size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Day-Wise Itinerary</h2>
                                            <p className="text-gray-500 font-medium">Curate the daily experience.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => {
                                            const d: DayItinerary = {
                                                id: uuidv4(),
                                                day: (formData.itinerary?.length || 0) + 1,
                                                title: "",
                                                description: "",
                                                activities: [],
                                                photos: []
                                            };
                                            setFormData({ ...formData, itinerary: [...(formData.itinerary || []), d] });
                                        }} className="rounded-2xl border-2">
                                            <Plus size={20} className="mr-2" /> Add Manual Day
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-16">
                                    {formData.itinerary?.map((item, index) => (
                                        <div key={item.id} className="relative group flex gap-10">
                                            <div className="flex flex-col items-center gap-4 shrink-0">
                                                <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center text-xl font-black italic shadow-lg shadow-primary/30">
                                                    {item.day}
                                                </div>
                                                <div className="w-1 flex-1 bg-gray-50 rounded-full" />
                                            </div>

                                            <div className="flex-1 space-y-8 bg-gray-50/50 p-10 rounded-[2.5rem] relative">
                                                <div className="absolute top-6 right-6">
                                                    <Button variant="ghost" onClick={() => {
                                                        const newItin = [...(formData.itinerary || [])];
                                                        newItin.splice(index, 1);
                                                        const indexed = newItin.map((d, i) => ({ ...d, day: i + 1 }));
                                                        setFormData({ ...formData, itinerary: indexed });
                                                    }} className="text-red-500"><Trash2 size={18} /></Button>
                                                </div>

                                                    <div className="space-y-4">
                                                        <Label htmlFor={`itinerary_title_${index}`} className="font-semibold">Day {item.day} Title</Label>
                                                        <Input
                                                            id={`itinerary_title_${index}`}
                                                            name={`itinerary_title_${index}`}
                                                            placeholder="Title"
                                                            value={item.title}
                                                            onChange={(e) => {
                                                                const newItin = [...(formData.itinerary || [])];
                                                                newItin[index].title = e.target.value;
                                                                setFormData({ ...formData, itinerary: newItin });
                                                            }}
                                                            className="bg-white font-black"
                                                        />
                                                    </div>

                                                    <div className="space-y-4">
                                                        <Label htmlFor={`itinerary_activities_${index}`} className="font-semibold">Activities (One per line)</Label>
                                                        <Textarea
                                                            id={`itinerary_activities_${index}`}
                                                            name={`itinerary_activities_${index}`}
                                                            value={item.activities.join('\n')}
                                                            onChange={(e) => {
                                                                const newItin = [...(formData.itinerary || [])];
                                                                newItin[index].activities = e.target.value.split('\n');
                                                                setFormData({ ...formData, itinerary: newItin });
                                                            }}
                                                            className="bg-white font-semibold"
                                                        />
                                                    </div>

                                                    <div className="space-y-4">
                                                        <Label htmlFor={`itinerary_description_${index}`} className="font-semibold">Day Description</Label>
                                                        <Textarea
                                                            id={`itinerary_description_${index}`}
                                                            name={`itinerary_description_${index}`}
                                                            value={item.description}
                                                            onChange={(e) => {
                                                                const newItin = [...(formData.itinerary || [])];
                                                                newItin[index].description = e.target.value;
                                                                setFormData({ ...formData, itinerary: newItin });
                                                            }}
                                                            className="bg-white min-h-[100px] font-semibold"
                                                        />
                                                    </div>

                                                    <div className="space-y-4">
                                                        <Label htmlFor={`itinerary_photo_${index}`} className="font-semibold">Daily Photos</Label>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            {item.photos?.map((photo, i) => (
                                                                <div key={i} className="aspect-video rounded-2xl overflow-hidden relative group">
                                                                    <img src={photo} className="w-full h-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 px-2">
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setFormData(prev => ({ ...prev, heroImage: photo }));
                                                                                toast.success("✨ Hero image set!");
                                                                            }}
                                                                            className="text-[10px] h-7 px-3 rounded-full bg-white text-gray-900 border border-gray-100 uppercase font-black tracking-widest hover:bg-primary hover:text-white"
                                                                        >
                                                                            {formData.heroImage === photo ? "⭐ Current Hero" : "Set Hero"}
                                                                        </Button>
                                                                        <button
                                                                            onClick={() => {
                                                                                const newItin = [...(formData.itinerary || [])];
                                                                                newItin[index].photos.splice(i, 1);
                                                                                setFormData({ ...formData, itinerary: newItin });
                                                                            }}
                                                                            className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                                                        >
                                                                            <Trash2 size={12} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <div className="flex flex-col gap-2">
                                                                <label htmlFor={`itinerary_photo_${index}`} className="flex-1 min-h-[80px] rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-primary/40 transition-all bg-white group/upload flex-col gap-2">
                                                                    {uploadingField === `itinerary_${index}` ? (
                                                                        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                                                    ) : (
                                                                        <ImageIcon size={24} className="text-gray-300" />
                                                                    )}
                                                                </label>
                                                                {item.photos?.length > 0 && (
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="sm" 
                                                                        className="text-red-400 text-[9px] font-black uppercase tracking-widest hover:text-red-500 hover:bg-red-50"
                                                                        onClick={() => {
                                                                            const newItin = [...(formData.itinerary || [])];
                                                                            newItin[index].photos = [];
                                                                            setFormData({ ...formData, itinerary: newItin });
                                                                            toast.success("Gallery cleared");
                                                                        }}
                                                                    >
                                                                        Clear All
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <input id={`itinerary_photo_${index}`} name={`itinerary_photo_${index}`} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'itinerary', true, index)} />
                                                        </div>
                                                    </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 5 && (
                            <div className="flex flex-col gap-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                            <MapIcon size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Route Map Builder</h2>
                                            <p className="text-gray-500 font-medium">Define stops and travel metrics.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                const stops: JourneyStop[] = (formData.itinerary || []).map(day => ({
                                                    name: day.title.split(' - ')[0] || "Stop",
                                                    day: day.day,
                                                    type: "Stay",
                                                    icon: "building"
                                                }));
                                                setFormData({ ...formData, journeyMap: { summaryTiles: [{label:"Distance", value:"120 km", icon:"map"}, {label:"Duration", value:formData.duration || "", icon:"clock"}], stops } });
                                                toast.success("Synced from Itinerary!");
                                            }}
                                            className="rounded-2xl border-2"
                                        >
                                            <RotateCcw size={16} className="mr-2" /> Sync from Itinerary
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                const stop: JourneyStop = { name: "", day: (formData.journeyMap?.stops?.length || 0) + 1, type: "Stay" };
                                                setFormData({ ...formData, journeyMap: { summaryTiles: formData.journeyMap?.summaryTiles || [], stops: [...(formData.journeyMap?.stops || []), stop] } });
                                            }}
                                            className="rounded-2xl"
                                        >
                                            <Plus size={20} className="mr-2" /> Add Stop
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-12">
                                    {/* Tiles */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        {(formData.journeyMap?.summaryTiles || []).map((tile, i) => (
                                            <div key={i} className="p-6 bg-white border border-gray-100 rounded-3xl space-y-3 shadow-sm">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <ClockIcon size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{tile.label}</span>
                                                </div>
                                                <Input
                                                    value={tile.value}
                                                    onChange={(e) => {
                                                        const n = [...(formData.journeyMap?.summaryTiles || [])];
                                                        n[i].value = e.target.value;
                                                        setFormData({ ...formData, journeyMap: { ...formData.journeyMap!, summaryTiles: n } });
                                                    }}
                                                    className="border-none bg-gray-50 font-black text-lg p-0 h-auto focus-visible:ring-0"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Stops */}
                                    <div className="space-y-4">
                                        {(formData.journeyMap?.stops || []).map((stop, i) => (
                                            <div key={i} className="flex flex-wrap md:flex-nowrap items-center gap-4 p-6 bg-gray-50/50 rounded-3xl border border-gray-100 group">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-xs shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                                                    {i + 1}
                                                </div>
                                                <Input 
                                                    placeholder="Stop Name" 
                                                    value={stop.name} 
                                                    onChange={(e) => {
                                                        const n = [...(formData.journeyMap?.stops || [])];
                                                        n[i].name = e.target.value;
                                                        setFormData({ ...formData, journeyMap: { ...formData.journeyMap!, stops: n } });
                                                    }}
                                                    className="flex-1 bg-white border-transparent focus:border-primary/20"
                                                />
                                                <select 
                                                    value={stop.type}
                                                    onChange={(e) => {
                                                        const n = [...(formData.journeyMap?.stops || [])];
                                                        n[i].type = e.target.value;
                                                        setFormData({ ...formData, journeyMap: { ...formData.journeyMap!, stops: n } });
                                                    }}
                                                    className="h-10 px-4 bg-white border border-gray-100 rounded-xl text-xs font-bold font-sans outline-none"
                                                >
                                                    <option>Arrival</option>
                                                    <option>Stay</option>
                                                    <option>Transfer</option>
                                                    <option>Departure</option>
                                                </select>
                                                <Input 
                                                    placeholder="Icon (plane, hotel...)" 
                                                    className="w-32 bg-white border-transparent focus:border-primary/20"
                                                    value={stop.icon}
                                                    onChange={(e) => {
                                                        const n = [...(formData.journeyMap?.stops || [])];
                                                        n[i].icon = e.target.value;
                                                        setFormData({ ...formData, journeyMap: { ...formData.journeyMap!, stops: n } });
                                                    }}
                                                />
                                                <Input 
                                                    placeholder="Drive Time" 
                                                    className="w-32 bg-white border-transparent focus:border-primary/20 font-mono text-[10px]"
                                                    value={stop.driveTime}
                                                    onChange={(e) => {
                                                        const n = [...(formData.journeyMap?.stops || [])];
                                                        n[i].driveTime = e.target.value;
                                                        setFormData({ ...formData, journeyMap: { ...formData.journeyMap!, stops: n } });
                                                    }}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const n = [...(formData.journeyMap?.stops || [])];
                                                        n.splice(i, 1);
                                                        setFormData({ ...formData, journeyMap: { ...formData.journeyMap!, stops: n } });
                                                    }}
                                                    className="text-red-400 hover:text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 6 && (
                            <div className="flex flex-col gap-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                            <Layers size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Extra Sections</h2>
                                            <p className="text-gray-500 font-medium">Add custom content blocks.</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            const newSection: CustomSection = { id: uuidv4(), heading: "", description: "", isVisible: true };
                                            setFormData({ ...formData, customSections: [...(formData.customSections || []), newSection] });
                                        }}
                                        className="rounded-2xl"
                                    >
                                        <Plus size={20} className="mr-2" /> + Add Section
                                    </Button>
                                </div>

                                <Reorder.Group
                                    axis="y"
                                    values={formData.customSections || []}
                                    onReorder={(newOrder) => setFormData({ ...formData, customSections: newOrder })}
                                    className="space-y-6"
                                >
                                    {(formData.customSections || []).map((section, index) => (
                                        <Reorder.Item
                                            key={section.id}
                                            value={section}
                                            className={`p-8 bg-gray-50/50 rounded-[2.5rem] border-2 ${section.isVisible ? 'border-transparent' : 'border-dashed border-gray-200 opacity-60'}`}
                                        >
                                            <div className="flex items-start gap-6">
                                                <div className="mt-2 text-gray-300 cursor-grab active:cursor-grabbing">
                                                    <GripVertical size={24} />
                                                </div>
                                                <div className="flex-1 space-y-8">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-xl font-black">Section {index + 1}</h3>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost" size="sm"
                                                                onClick={() => {
                                                                    const n = [...(formData.customSections || [])];
                                                                    n[index] = { ...n[index], isVisible: !n[index].isVisible };
                                                                    setFormData({ ...formData, customSections: n });
                                                                }}
                                                            >
                                                                {section.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                                                            </Button>
                                                            <Button
                                                                variant="ghost" size="sm"
                                                                onClick={() => {
                                                                    const n = [...(formData.customSections || [])];
                                                                    n.splice(index, 1);
                                                                    setFormData({ ...formData, customSections: n });
                                                                }}
                                                                className="text-red-400"
                                                            >
                                                                <Trash2 size={18} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="space-y-6">
                                                            <Input id={`section_heading_${index}`} name={`section_heading_${index}`} placeholder="Heading" value={section.heading} onChange={(e) => {
                                                                const n = [...(formData.customSections || [])];
                                                                n[index].heading = e.target.value;
                                                                setFormData({ ...formData, customSections: n });
                                                            }} />
                                                            <Textarea id={`section_description_${index}`} name={`section_description_${index}`} placeholder="Description" value={section.description} onChange={(e) => {
                                                                const n = [...(formData.customSections || [])];
                                                                n[index].description = e.target.value;
                                                                setFormData({ ...formData, customSections: n });
                                                            }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            </div>
                        )}

                        {step === 7 && (
                            <div className="flex flex-col gap-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <Users size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Final Details & Payments</h2>
                                        <p className="text-gray-500 font-medium">Verify everything before saving.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <div className="space-y-4">
                                        <Label htmlFor="transportOption" className="font-semibold">Transport Mode</Label>
                                        <div className="relative group/transport">
                                            <Input
                                                id="transportOption"
                                                name="transportOption"
                                                placeholder="e.g. Flight, Private Car, Tempo Traveller..."
                                                className="h-14 rounded-2xl border-2 border-gray-100 bg-white px-6 font-semibold focus:border-primary transition-all pr-12"
                                                value={formData.transportOption || ""}
                                                onChange={(e) => setFormData({ ...formData, transportOption: e.target.value })}
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-hover/transport:text-primary transition-colors pointer-events-none">
                                                <Edit size={18} />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {["Flight", "Train", "Private Car", "Bus", "Self Drive"].map(opt => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, transportOption: opt })}
                                                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border-2 ${formData.transportOption === opt ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-50 border-transparent text-gray-400 hover:border-gray-200'}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label htmlFor="includes" className="font-semibold">Inclusions (One per line)</Label>
                                        <Textarea
                                            id="includes"
                                            name="includes"
                                            value={formData.includes?.join('\n')}
                                            onChange={(e) => setFormData({ ...formData, includes: e.target.value.split('\n') })}
                                            className="min-h-[150px]"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label htmlFor="exclusions" className="font-semibold">Exclusions (One per line)</Label>
                                        <Textarea
                                            id="exclusions"
                                            name="exclusions"
                                            value={formData.exclusions?.join('\n')}
                                            onChange={(e) => setFormData({ ...formData, exclusions: e.target.value.split('\n') })}
                                            className="min-h-[150px]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </GlassCard>
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-between">
                <Button variant="outline" disabled={step === 1} onClick={prevStep} className="rounded-2xl px-10 border-2">
                    <ChevronLeft size={20} className="mr-2" /> Previous
                </Button>
                {step < totalSteps ? (
                    <Button onClick={nextStep} className="rounded-2xl px-10">
                        Next Section <ChevronRight size={20} className="ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSave} disabled={isSaving || activeUploads[0] > 0} className="rounded-2xl px-10 shadow-lg shadow-primary/20">
                        {isSaving ? "Saving..." : activeUploads[0] > 0 ? "Uploading..." : <><Save size={20} className="mr-2" /> Save Proposal</>}
                    </Button>
                )}
            </div>
        </div>
    );
}

export type Hotel = {
    id: string;
    name: string;
    location: string;
    rating: number; // 1-5
    description: string;
    roomType: string;
    photos: string[]; // Base64 or URLs
};

export type DayItinerary = {
    id: string;
    day: number;
    title: string;
    description: string;
    activities: string[];
    sightseeing?: string[];
    photos: string[];
    meals?: string;
    stay?: string;
};

export type CustomSection = {
    id: string;
    heading: string;
    description: string;
    image?: string;
    buttonLabel?: string;
    buttonLink?: string;
    isVisible: boolean;
};

export type JourneyStop = {
    name: string;
    day: number;
    type: string; // Arrival, Stay, Departure
    icon?: string; // airplane, building, map, etc.
    driveTime?: string;
};

export type JourneyMap = {
    summaryTiles: { label: string; value: string; icon: string }[];
    stops: JourneyStop[];
};

export type Quotation = {
    id: string;
    slug: string;
    clientName: string;
    destination: string;
    pax: number;
    travelDates: {
        from: string;
        to: string;
    };
    duration: string; // e.g. "5 Days • 4 Nights"
    transportOption: string;
    roomSharing: "Single" | "Double" | "Triple" | "Quad";
    packagePrice: number; // For backward compatibility or legacy display
    lowLevelPrice: number; // Price per pax for low level option
    highLevelPrice: number; // Price per pax for high level option

    // Brand
    companyLogo?: string;
    brandLogo?: string;
    heroImage?: string;
    coverImage?: string;
    experiencePhotos?: string[]; // Multiple photos for the experience section
    routeMap?: string; // One photo for the route map at the bottom

    // Content
    hotels: Hotel[]; // Legacy or fallback
    lowLevelHotels: Hotel[];
    highLevelHotels: Hotel[];
    itinerary: DayItinerary[];
    journeyMap?: JourneyMap;
    customSections?: CustomSection[];
    includes: string[];
    exclusions: string[];
    optionalActivities?: {
        name: string;
        price: number;
        description: string;
    }[];

    // Expert
    expert: {
        name: string;
        photo?: string;
        whatsapp: string;
        designation?: string;
    };

    status: "Draft" | "Published";
    bookingStatus?: "pending" | "reserved" | "booked" | "cancelled" | "sent";
    isBooked?: boolean;
    isReserved?: boolean;
    createdAt: string;
    updatedAt: string;
};

export type BrandSettings = {
    companyName?: string;
    companyLogo?: string;
    logoMode?: 'contain' | 'fill' | 'cover';
    brandColor?: string;
    instagramLink?: string;
    websiteLink?: string;
    phoneNumber?: string;
    footerText?: string;
    updatedAt: string;
};

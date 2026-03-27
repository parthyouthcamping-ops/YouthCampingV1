import { Quotation } from "./types";

const bali6n7d: Quotation = {
    id: "bali-static-001",
    slug: "bali-6n7d",
    clientName: "Exclusive Traveler",
    destination: "Bali, Indonesia",
    status: "Published",
    pax: 2,
    duration: "6 Nights / 7 Days",
    transportOption: "Private Car",
    roomSharing: "Double",
    packagePrice: 0,
    hotels: [],
    lowLevelHotels: [],
    highLevelHotels: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    travelDates: { from: "2024-06-01", to: "2024-06-07" },
    lowLevelPrice: 85000,
    highLevelPrice: 125000,
    heroImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=2070&auto=format&fit=crop",
    coverImage: "https://images.unsplash.com/photo-1518548419970-58e3b40e9bc4?q=80&w=2070&auto=format&fit=crop",
    experiencePhotos: [
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1501179691627-eeaa65ea017c?q=80&w=2070&auto=format&fit=crop"
    ],
    itinerary: [
        {
            id: "d1", day: 1, title: "Arrival & Coastal Majesty",
            description: "Welcome to the Island of Gods. Upon arrival at Ngurah Rai International Airport, you will be greeted by your private chauffeur and escorted to your luxury coastal retreat.",
            activities: ["Private Airport Greeting", "Uluwatu Temple Visit", "Kecak Fire Dance Performance"],
            meals: "Dinner included",
            stay: "Luxury Resort in Uluwatu",
            photos: ["https://images.unsplash.com/photo-1555400038-63f5ba517a47?q=80&w=2070&auto=format&fit=crop"]
        },
        {
            id: "d2", day: 2, title: "Ubud Jungles & Sacred Cascades",
            description: "Explore the cultural soul of Bali in Ubud.",
            activities: ["Kanto Lampo Waterfall", "Rice Terraces Walk"],
            meals: "Breakfast & Lunch",
            stay: "Ubud Jungle Villa",
            photos: ["https://images.unsplash.com/photo-1518548419970-58e3b40e9bc4?q=80&w=2070&auto=format&fit=crop"]
        }
    ],
    optionalActivities: [
        { name: "Bali Swing (Ubud)", price: 2500, description: "Iconic swing over the jungle valley." }
    ],
    includes: ["Luxury Resort Stays", "Private Chauffeur Driven Car", "Daily Breakfast & Gourmet Lunches"],
    exclusions: ["International Flights", "Personal Expenses", "Travel Insurance"],
    expert: { name: "Anish", whatsapp: "919999999999", designation: "Bali Destination Specialist", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200&fit=crop" },
};

export const PREDEFINED_QUOTES: Record<string, Quotation> = {
    "bali-6n7d": bali6n7d,
    "vietnam-7n8d": {
        id: "vietnam-static-001",
        slug: "vietnam-7n8d",
        clientName: "Valued Guest",
        destination: "Vietnam North to South",
        status: "Published",
        pax: 2,
        duration: "7 Nights / 8 Days",
        transportOption: "Private Car",
        roomSharing: "Double",
        packagePrice: 0,
        hotels: [],
        lowLevelHotels: [],
        highLevelHotels: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        travelDates: { from: "2024-11-10", to: "2024-11-17" },
        lowLevelPrice: 95000,
        highLevelPrice: 155000,
        heroImage: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop",
        coverImage: "https://images.unsplash.com/photo-1555660220-44497747808a?q=80&w=2070&auto=format&fit=crop",
        experiencePhotos: [],
        itinerary: [
            {
                id: "v1", day: 1, title: "Welcome to Hanoi",
                description: "Arrival in the thousand-year-ol capital of Vietnam.",
                activities: ["Hanoi Arrival", "Old Quarter Cyclo Tour"],
                meals: "Welcome Dinner",
                stay: "Luxury Boutique Hotel, Hanoi",
                photos: ["https://images.unsplash.com/photo-1509030450996-93525bbbf6b1?q=80&w=2070&auto=format&fit=crop"]
            }
        ],
        optionalActivities: [],
        includes: ["5-star Hotel Stays", "Internal Flights"],
        exclusions: [],
        expert: { name: "Anish", whatsapp: "919999999999", designation: "Destination Expert", photo: "" },
    },
    "trip-luxury-57fe4": {
        ...bali6n7d,
        id: "trip-luxury-57fe4",
        slug: "trip-luxury-57fe4",
        clientName: "Test Traveler"
    }
}

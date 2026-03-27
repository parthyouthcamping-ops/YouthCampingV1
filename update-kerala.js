
async function update() {
    const id = "0424eb59-597c-4893-ad4d-768200e634ef";
    const slug = "trip-luxury-0424e";
    
    const quotation = {
        id: id,
        slug: slug,
        clientName: "Special Guest",
        destination: "Mesmerizing Kerala Getaway",
        pax: 4,
        travelDates: { from: "", to: "" },
        duration: "4 Nights / 5 Days",
        transportOption: "Private AC Vehicle",
        roomSharing: "Quad",
        lowLevelPrice: 17200,
        highLevelPrice: 0,
        status: "Published",
        heroImage: "https://res.cloudinary.com/dltxunwku/image/upload/v1773557434/us33yvb9p2b8cuv5tkda.jpg",
        experiencePhotos: [
            "https://res.cloudinary.com/dltxunwku/image/upload/v1773557447/gnawaou4dgjh8dkwqo3p.jpg"
        ],
        itinerary: [
            {
                id: "d1",
                day: 1,
                title: "Arrival in Kochi → Drive to Munnar",
                description: "Arrival at Kochi Airport / Railway Station. Meet our representative and begin drive to Munnar. En route sightseeing of Valara and Cheeyappara Waterfalls. Check-in at hotel in Munnar. Evening free for leisure or local market visit.",
                activities: ["Airport/Railway Pickup", "Drive to Munnar", "Valara Waterfalls", "Cheeyappara Waterfalls", "Hotel Check-in", "Local Market Visit"],
                photos: []
            },
            {
                id: "d2",
                day: 2,
                title: "Munnar Local Sightseeing",
                description: "After breakfast explore major attractions of Munnar. Visit Mattupetty Dam, Echo Point, Kundala Lake, and Eravikulam National Park. Enjoy tea plantation photo stops and visit local chocolate and spice shops.",
                activities: ["Mattupetty Dam", "Echo Point", "Kundala Lake", "Eravikulam National Park", "Tea Plantation Photos", "Chocolate & Spice Shops"],
                photos: []
            },
            {
                id: "d3",
                day: 3,
                title: "Munnar → Thekkady",
                description: "Breakfast at hotel, check-out and drive to Thekkady. Visit Periyar Wildlife Sanctuary and local spice plantations. Optional activities include Kathakali cultural show, Kalaripayattu martial arts show, or boating in Periyar Lake.",
                activities: ["Transfer to Thekkady", "Periyar Wildlife Sanctuary", "Spice Plantations", "Optional Kathakali Show", "Optional Martial Arts Show", "Optional Periyar Boating"],
                photos: []
            },
            {
                id: "d4",
                day: 4,
                title: "Thekkady → Alleppey Houseboat",
                description: "Breakfast and checkout, drive to Alleppey. Check-in to houseboat for an overnight backwater cruise. Experience coconut groves, paddy fields and village life. All meals included in houseboat.",
                activities: ["Drive to Alleppey", "Houseboat Check-in", "Backwater Cruise", "Sunset Views", "Traditional Kerala Meals"],
                photos: []
            },
            {
                id: "d5",
                day: 5,
                title: "Alleppey → Kochi Departure",
                description: "Breakfast in houseboat, check-out and drive back to Kochi. Drop at Kochi Airport or Railway Station for your onward journey with beautiful memories.",
                activities: ["Houseboat Breakfast", "Drive to Kochi", "Airport/Railway Drop"],
                photos: []
            }
        ],
        lowLevelHotels: [
            { id: "h1", name: "Standard Hotel/Resort", location: "Munnar", rating: 3, description: "Comfortable stay amidst tea plantations.", roomType: "Standard Room", photos: [] },
            { id: "h2", name: "Standard Hotel/Resort", location: "Thekkady", rating: 3, description: "Close to Periyar Wildlife Sanctuary.", roomType: "Standard Room", photos: [] },
            { id: "h3", name: "Private Houseboat", location: "Alleppey", rating: 3, description: "Traditional Kerala Houseboat experience.", roomType: "Private Bedroom", photos: [] }
        ],
        highLevelHotels: [],
        hotels: [],
        includes: [
            "4 Nights accommodation",
            "Daily breakfast at hotel",
            "All meals in houseboat (Lunch, Dinner, Breakfast)",
            "Private AC vehicle for all transfers and sightseeing",
            "Driver allowance, toll tax and parking",
            "Houseboat cruise in Alleppey",
            "All sightseeing as per itinerary"
        ],
        exclusions: [
            "Airfare / Train tickets",
            "Entry tickets for sightseeing places",
            "Personal expenses (shopping, laundry, tips etc.)",
            "Boating or activity charges",
            "Travel insurance",
            "Anything not mentioned in inclusions"
        ],
        expert: {
            name: "Kerala Expert",
            photo: null,
            whatsapp: "910000000000",
            designation: "Destination Specialist"
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const response = await fetch('https://youthcampingp.vercel.app/api/db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', id: id, slug: slug, data: quotation })
    });

    const result = await response.json();
    console.log(result);
}

update();

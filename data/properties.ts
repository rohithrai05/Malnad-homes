
import { Property, Review } from '../types';

// Puttur Center approx: 12.7685, 75.2023

export const properties: Property[] = [
  {
    id: "1",
    title: "Balnad Heritage Co-Living",
    location: "Balnad",
    category: "Villa",
    allowedGuest: "Any",
    price: "₹8,500",
    priceValue: 8500,
    rating: 4.8,
    mainImage: "https://websiteupload.s3.ap-south-1.amazonaws.com/media/2024/07/6617bb86d89551.webp",
    galleryImages: [
      "https://img1.wsimg.com/isteam/ip/a043541a-f9ac-468b-87bb-b3fc27f0aed0/WhatsApp%20Image%202025-06-18%20at%2010.44.26_085b1637.jpg",
      "https://www.baseragirlspg.com/img/gallery/study-desk.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPLz13fzObe1vqDFKOG5NP7N0QLFuqY4YiLg&s"
    ],
    description: "A peaceful heritage home converted into a co-living space for remote workers and postgraduate students. Surrounded by plantations, it offers a quiet environment for deep work and study. \n\nFeatures shared common areas and high-speed internet, fostering a small community of like-minded professionals.",
    amenities: ["High-Speed Wi-Fi", "Home Cooked Meals", "Quiet Study Zones", "Parking", "Power Backup", "Housekeeping"],
    specs: { guests: 8, bedrooms: 4, bathrooms: 3, size: "3,200 sq ft" },
    coordinates: { lat: 12.7750, lng: 75.2150 },
    owner: {
      name: "Shivaprasad K.",
      contact: "+91 94481 00001",
      email: "shivaprasad@malnadhomes.in",
      avatar: "https://ui-avatars.com/api/?name=Shivaprasad+K&background=064e3b&color=fff"
    }
  },
  {
    id: "2",
    title: "The Darbar Executive Suites",
    location: "Darbar",
    category: "Apartment",
    allowedGuest: "Any",
    price: "₹12,000",
    priceValue: 12000,
    rating: 4.5,
    mainImage: "https://asset-cdn.stanzaliving.com/stanza-living/image/upload/f_auto,q_auto,w_600/e_improve/e_sharpen:10/e_saturation:10/f_auto,q_auto/v1655385044/Website/CMS-Uploads/f7zygwwoqcpahgsbnhjo.jpg",
    galleryImages: [
      "https://images.nobroker.in/images/8aa9bc199b6d35a1019b6e2c8c735a5b/8aa9bc199b6d35a1019b6e2c8c735a5b_51124_964354_medium.jpg",
      "https://meridianstays.in/location/img/four-sharing-proxima-marol.webp",
      "https://cdn.shopify.com/s/files/1/1233/0208/files/AMb_1_480x480.png?v=1628250438"
    ],
    description: "Located in the bustling heart of Darbar, these serviced apartments are perfect for corporate employees. Quick access to Puttur's bus stand and major banks. \n\nEnjoy hassle-free living with cleaning services and modern furnishings included.",
    amenities: ["AC Rooms", "Fiber Internet", "Work Desk", "Room Service", "Laundry", "Elevator"],
    specs: { guests: 2, bedrooms: 1, bathrooms: 1, size: "650 sq ft" },
    coordinates: { lat: 12.7690, lng: 75.2030 },
    owner: {
      name: "Ramesh Shetty",
      contact: "+91 94812 00002",
      email: "ramesh.shetty@darbar.com",
      avatar: "https://ui-avatars.com/api/?name=Ramesh+Shetty&background=065f46&color=fff"
    }
  },
  {
    id: "3",
    title: "Nehrunagar Student Haven",
    location: "Nehrunagar",
    category: "PG",
    allowedGuest: "Male",
    price: "₹4,500",
    priceValue: 4500,
    rating: 4.2,
    mainImage: "https://s3-us-west-2.amazonaws.com/issuewireassets/primg/40473/dual-occupancy-edited1649737864.jpg",
    galleryImages: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMRyj_9AB0BXbxdH8dCAfClqUzrH2qO6cCFQ&s",
      "https://content.jdmagicbox.com/comp/jodhpur/i6/0291px291.x291.231019152422.x1i6/catalogue/manasvi-girls-hostel-air-force-area-jodhpur-hostels-131ifnvqlu.jpg",
      "https://nestaway-houses-assets.nestaway.com/uploads/images/thumb_large_0e9535b4-1d2f-49f8-8836-0a5d03d7956c.gif"
    ],
    description: "Situated in the educational hub of Nehrunagar, this PG is walking distance from St. Philomena College and other institutions. \n\nDesigned specifically for students, offering a disciplined yet comfortable environment with healthy food options.",
    amenities: ["Study Desk", "Wi-Fi", "Washing Machine", "Mess Facility", "CCTV Security", "24/7 Water"],
    specs: { guests: 2, bedrooms: 1, bathrooms: 1, size: "400 sq ft" },
    coordinates: { lat: 12.7620, lng: 75.2100 },
    owner: {
      name: "Venkatesh Rao",
      contact: "+91 98800 12345",
      email: "venky.rao@gmail.com",
      avatar: "https://ui-avatars.com/api/?name=Venkatesh+Rao&background=10b981&color=fff"
    }
  },
  {
    id: "4",
    title: "Kemminje Group Villa",
    location: "Kemminje",
    category: "Villa",
    allowedGuest: "Family",
    price: "₹18,000",
    priceValue: 18000,
    rating: 4.9,
    mainImage: "https://images.jdmagicbox.com/v2/comp/jodhpur/f4/0291px291.x291.250825120711.t9f4/catalogue/the-unique-pg-hostel-basni-jodhpur-paying-guest-accommodations-805pbblpbv.jpg",
    galleryImages: [
      "https://ap-south-1.graphassets.com/cmdpk61eo00do08l54vb2d7wl/cmd01b8hv1frc07pm4xveeyul",
      "https://www.thehivehostels.com/uploads/images/1658301040_7796f3aa4d7819a2f5d5.jpeg",
      "https://gsh-cdn.sgp1.cdn.digitaloceanspaces.com/assets/img/no-broker-indore/PRT834/room-on-rent-in-indore/pg-in-new-gayatri-nagar_1713337408.jpg"
    ],
    description: "A spacious villa suitable for a group of colleagues or a family relocating to Puttur. \n\nFeatures large shared spaces, a kitchen for self-cooking, and a garden. Located in a safe residential neighborhood.",
    amenities: ["Private Garden", "Full Kitchen", "Parking (4 cars)", "Inverter Backup", "Pet Friendly"],
    specs: { guests: 10, bedrooms: 5, bathrooms: 5, size: "4,500 sq ft" },
    coordinates: { lat: 12.7550, lng: 75.2200 },
    owner: {
      name: "Mrs. Leela Hegde",
      contact: "+91 99001 55667",
      email: "leela.hegde@outlook.com",
      avatar: "https://ui-avatars.com/api/?name=Leela+Hegde&background=34d399&color=fff"
    }
  },
  {
    id: "5",
    title: "Kabaka Transit PG",
    location: "Kabaka",
    category: "PG",
    allowedGuest: "Any",
    price: "₹3,500",
    priceValue: 3500,
    rating: 4.3,
    mainImage: "https://content.jdmagicbox.com/v2/comp/pune/m4/020pxx20.xx20.230603163609.l4m4/catalogue/neelambari-girls-pg-hostel-sadashiv-peth-pune-hostels-43q0tc07p2.jpg",
    galleryImages: [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNBSCi03DslFWRzqXFBGGfCLDc6zSB-GxGPQ&s",
      "https://threebestrated.in/images/AnuGirlsHostel-Lucknow-UP.jpeg",
      "https://imagecdn.99acres.com/media1/34604/3/692083903M-1767011070667.jpg"
    ],
    description: "Strategically located near the railway station. Ideal for daily commuters or employees working in the industrial area. \n\nBudget-friendly accommodation with clean basic amenities and transport connectivity.",
    amenities: ["Near Railway Station", "Filtered Water", "Single Beds", "Bike Parking", "Budget Friendly"],
    specs: { guests: 3, bedrooms: 1, bathrooms: 1, size: "550 sq ft" },
    coordinates: { lat: 12.7800, lng: 75.1950 },
    owner: {
      name: "Kishore Rai",
      contact: "+91 97412 88990",
      email: "kishore.rai@kabaka.in",
      avatar: "https://ui-avatars.com/api/?name=Kishore+Rai&background=022c22&color=fff"
    }
  },
  {
    id: "6",
    title: "Bolwar Heights Flat",
    location: "Bolwar",
    category: "Apartment",
    allowedGuest: "Family",
    price: "₹10,500",
    priceValue: 10500,
    rating: 4.6,
    mainImage: "https://metrocityliving.com/wp-content/uploads/2025/03/metrocity-girls-hostel-with-triple-sharing-bed-in-kothrud-pune.jpg",
    galleryImages: [
      "https://meridianstays.in/location/img/four-sharing-proxima-marol.webp",
      "https://asset-cdn.stanzaliving.com/stanza-living/image/upload/f_auto,q_auto,w_600/e_improve/e_sharpen:10/e_saturation:10/f_auto,q_auto/v1655385044/Website/CMS-Uploads/f7zygwwoqcpahgsbnhjo.jpg",
      "https://gsh-cdn.sgp1.cdn.digitaloceanspaces.com/assets/img/no-broker-indore/PRT834/room-on-rent-in-indore/pg-in-new-gayatri-nagar_1713337408.jpg"
    ],
    description: "A modern 2BHK flat in Bolwar. Ideal for small families or two professionals sharing. \n\nClose to supermarkets and gyms. The building has security and dedicated parking.",
    amenities: ["Modular Kitchen", "Washing Machine", "Power Backup", "Gym Access", "Covered Parking"],
    specs: { guests: 4, bedrooms: 2, bathrooms: 2, size: "1,100 sq ft" },
    coordinates: { lat: 12.7580, lng: 75.2050 },
    owner: {
      name: "Suresh Balnad",
      contact: "+91 94482 11223",
      email: "suresh@balnadgroup.com",
      avatar: "https://ui-avatars.com/api/?name=Suresh+Balnad&background=064e3b&color=fff"
    }
  },
  {
    id: "7",
    title: "Bannur Orchard Cottage",
    location: "Bannur",
    category: "Cottage",
    allowedGuest: "Any",
    price: "₹7,500",
    priceValue: 7500,
    rating: 4.7,
    mainImage: "https://www.srcspatna.com/images/Hostel-Facility/Hostel_Facility_banner.jpg",
    galleryImages: [
      "https://websiteupload.s3.ap-south-1.amazonaws.com/media/2024/07/6617bb86d89551.webp",
      "https://img1.wsimg.com/isteam/ip/a043541a-f9ac-468b-87bb-b3fc27f0aed0/WhatsApp%20Image%202025-06-18%20at%2010.44.26_085b1637.jpg",
      "https://cdn.shopify.com/s/files/1/1233/0208/files/AMb_1_480x480.png?v=1628250438"
    ],
    description: "A quiet cottage for those who prefer nature over city noise. Great for writers or students preparing for exams. \n\nAffordable rent with basic amenities. Own vehicle recommended.",
    amenities: ["Fruit Orchard", "Silence", "Water Heater", "Nature Trails", "Yoga Space"],
    specs: { guests: 4, bedrooms: 2, bathrooms: 2, size: "1,400 sq ft" },
    coordinates: { lat: 12.7600, lng: 75.1800 },
    owner: {
      name: "Ananth Rao",
      contact: "+91 88844 55566",
      email: "ananth.bannur@yahoo.in",
      avatar: "https://ui-avatars.com/api/?name=Ananth+Rao&background=065f46&color=fff"
    }
  },
  {
    id: "8",
    title: "Main Road Women's Hostel",
    location: "Main Road",
    category: "Hostel",
    allowedGuest: "Female",
    price: "₹5,000",
    priceValue: 5000,
    rating: 4.4,
    mainImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNBSCi03DslFWRzqXFBGGfCLDc6zSB-GxGPQ&s",
    galleryImages: [
      "https://threebestrated.in/images/AnuGirlsHostel-Lucknow-UP.jpeg",
      "https://content.jdmagicbox.com/comp/jodhpur/i6/0291px291.x291.231019152422.x1i6/catalogue/manasvi-girls-hostel-air-force-area-jodhpur-hostels-131ifnvqlu.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTDrikdBU9R9ZbVBAtOoeG7p__tXvj8IGPbA&s"
    ],
    description: "A secure women's hostel right on Main Road. Very close to colleges and bus stops. \n\nFeatures 24/7 security guard, CCTV, and hygienic mess food included in rent.",
    amenities: ["24/7 Security", "Mess Included", "Warden", "Study Hall", "Hot Water"],
    specs: { guests: 2, bedrooms: 1, bathrooms: 1, size: "500 sq ft" },
    coordinates: { lat: 12.7710, lng: 75.2040 },
    owner: {
      name: "Poornima Devi",
      contact: "+91 91102 33445",
      email: "poornima.hostel@rediffmail.com",
      avatar: "https://ui-avatars.com/api/?name=Poornima+Devi&background=10b981&color=fff"
    }
  },
  {
    id: "9",
    title: "Padnoor Shared House",
    location: "Padnoor",
    category: "Cottage",
    allowedGuest: "Any",
    price: "₹6,000",
    priceValue: 6000,
    rating: 4.9,
    mainImage: "https://meridianstays.in/location/img/four-sharing-proxima-marol.webp",
    galleryImages: [
      "https://images.nobroker.in/images/8aa9bc199b6d35a1019b6e2c8c735a5b/8aa9bc199b6d35a1019b6e2c8c735a5b_51124_964354_medium.jpg",
      "https://s3-us-west-2.amazonaws.com/issuewireassets/primg/40473/dual-occupancy-edited1649737864.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPLz13fzObe1vqDFKOG5NP7N0QLFuqY4YiLg&s"
    ],
    description: "Affordable shared accommodation in Padnoor. \n\nGreat for students looking for a low-cost option with plenty of open space. Peaceful environment.",
    amenities: ["Field View", "Shared Kitchen", "Bicycle Parking", "Local Cuisine", "Open Deck"],
    specs: { guests: 6, bedrooms: 3, bathrooms: 3, size: "2,200 sq ft" },
    coordinates: { lat: 12.7480, lng: 75.1980 },
    owner: {
      name: "Raghavendra Bhat",
      contact: "+91 94821 77889",
      email: "raghu.bhat@padnoor.com",
      avatar: "https://ui-avatars.com/api/?name=Raghavendra+Bhat&background=34d399&color=fff"
    }
  },
  {
    id: "10",
    title: "Mundoor Studio",
    location: "Mundoor",
    category: "Apartment",
    allowedGuest: "Any",
    price: "₹6,500",
    priceValue: 6500,
    rating: 4.6,
    mainImage: "https://www.sunlighthostel.com/wp-content/uploads/2025/02/Mens-PG-Sunlight-Hostel.jpg",
    galleryImages: [
      "https://www.thehivehostels.com/uploads/images/1658301040_7796f3aa4d7819a2f5d5.jpeg",
      "https://ap-south-1.graphassets.com/cmdpk61eo00do08l54vb2d7wl/cmd01b8hv1frc07pm4xveeyul",
      "https://gsh-cdn.sgp1.cdn.digitaloceanspaces.com/assets/img/no-broker-indore/PRT834/room-on-rent-in-indore/pg-in-new-gayatri-nagar_1713337408.jpg"
    ],
    description: "Compact studio apartment in Mundoor. \n\nIdeal for a single professional. Comes with a small kitchenette and attached bath. Private and secure.",
    amenities: ["Kitchenette", "Private Terrace", "Work Chair", "Pet Friendly", "Water Heater"],
    specs: { guests: 1, bedrooms: 1, bathrooms: 1, size: "400 sq ft" },
    coordinates: { lat: 12.7850, lng: 75.2250 },
    owner: {
      name: "Sandeep Rai",
      contact: "+91 99805 11224",
      email: "sandeep.rai@mundoor.in",
      avatar: "https://ui-avatars.com/api/?name=Sandeep+Rai&background=022c22&color=fff"
    }
  },
  {
    id: "11",
    title: "Aryapu Men's PG",
    location: "Aryapu",
    category: "PG",
    allowedGuest: "Male",
    price: "₹4,000",
    priceValue: 4000,
    rating: 4.8,
    mainImage: "https://ap-south-1.graphassets.com/cmdpk61eo00do08l54vb2d7wl/cmd01b8hv1frc07pm4xveeyul",
    galleryImages: [
      "https://content.jdmagicbox.com/v2/comp/pune/m4/020pxx20.xx20.230603163609.l4m4/catalogue/neelambari-girls-pg-hostel-sadashiv-peth-pune-hostels-43q0tc07p2.jpg",
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMRyj_9AB0BXbxdH8dCAfClqUzrH2qO6cCFQ&s",
      "https://nestaway-houses-assets.nestaway.com/uploads/images/thumb_large_0e9535b4-1d2f-49f8-8836-0a5d03d7956c.gif"
    ],
    description: "Premium men's PG in Aryapu with gym and recreation room. \n\nAttracts young professionals and students. Clean rooms with daily housekeeping.",
    amenities: ["Gym", "Recreation Room", "High Speed Wifi", "Washing Machine", "Biometric Entry"],
    specs: { guests: 6, bedrooms: 3, bathrooms: 4, size: "3,500 sq ft" },
    coordinates: { lat: 12.7650, lng: 75.2300 },
    owner: {
      name: "Girish Aryapu",
      contact: "+91 94480 99887",
      email: "girish@aryapu-stays.in",
      avatar: "https://ui-avatars.com/api/?name=Girish+Aryapu&background=064e3b&color=fff"
    }
  },
  {
    id: "12",
    title: "Chikkamudnoor Family Home",
    location: "Chikkamudnoor",
    category: "Villa",
    allowedGuest: "Family",
    price: "₹9,000",
    priceValue: 9000,
    rating: 4.5,
    mainImage: "https://imagecdn.99acres.com/media1/34733/13/694673045M-1767603026864.jpg",
    galleryImages: [
      "https://www.baseragirlspg.com/img/gallery/study-desk.jpg",
      "https://metrocityliving.com/wp-content/uploads/2025/03/metrocity-girls-hostel-with-triple-sharing-bed-in-kothrud-pune.jpg",
      "https://res.cloudinary.com/flivin-homes/image/upload/v1616668696/Website/Prague_Homes/flivinhomes_happyHome4_mhxcyq.jpg"
    ],
    description: "An independent house in Chikkamudnoor available for rent. \n\nQuiet neighborhood, perfect for a family. Close to schools and local market.",
    amenities: ["Car Parking", "Garden", "Semi-Furnished", "24/7 Water", "Family Friendly"],
    specs: { guests: 5, bedrooms: 2, bathrooms: 2, size: "1,200 sq ft" },
    coordinates: { lat: 12.7720, lng: 75.1850 },
    owner: {
      name: "Mohammad Ishaq",
      contact: "+91 97400 44556",
      email: "ishaq.home@gmail.com",
      avatar: "https://ui-avatars.com/api/?name=Mohammad+Ishaq&background=065f46&color=fff"
    }
  }
];

export const mockReviews: Review[] = [
  {
    id: "r1",
    propertyId: "1",
    userName: "Aditi Sharma",
    userAvatar: "https://i.pravatar.cc/150?u=aditi",
    rating: 5,
    date: "2 months ago",
    comment: "Absolutely loved the peace and quiet here. Perfect for finishing my thesis. The food is just like home!"
  },
  {
    id: "r2",
    propertyId: "1",
    userName: "Rohan Das",
    userAvatar: "https://i.pravatar.cc/150?u=rohan",
    rating: 4,
    date: "1 month ago",
    comment: "Great internet speed. The shared kitchen is well-maintained. A bit far from the main road but worth it for the tranquility."
  },
  {
    id: "r3",
    propertyId: "3",
    userName: "Sameer K.",
    userAvatar: "https://i.pravatar.cc/150?u=sameer",
    rating: 4,
    date: "3 weeks ago",
    comment: "Very close to St. Philomena. saves me a lot of travel time. The warden is friendly."
  },
  {
    id: "r4",
    propertyId: "2",
    userName: "Priya Hegde",
    userAvatar: "https://i.pravatar.cc/150?u=priya",
    rating: 5,
    date: "5 days ago",
    comment: "Executive suites are top-notch. Cleaning service is very professional. Highly recommended for working pros."
  }
];

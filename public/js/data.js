// ============================================
// Données de démonstration (sera remplacé par la BD)
// ============================================

const PROPERTIES_DATA = [
  {
    id: 1,
    title: "Villa Azuréenne avec piscine",
    description: "Superbe villa contemporaine avec vue panoramique sur la mer Méditerranée. Profitez d'une piscine à débordement, d'une terrasse spacieuse et d'un jardin méditerranéen. Idéale pour des vacances en famille ou entre amis. La villa dispose d'une cuisine entièrement équipée, d'un salon lumineux et de chambres climatisées offrant tout le confort moderne.",
    location: "Côte d'Azur",
    address: "Nice, Alpes-Maritimes",
    pricePerNight: 250,
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    amenities: ["WiFi", "Piscine", "Parking", "Climatisation", "Cuisine équipée", "Terrasse", "Vue mer", "BBQ"],
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"
    ],
    rating: 4.8,
    reviewCount: 24,
    reviews: [
      { user: "Marie L.", rating: 5, comment: "Maison magnifique avec une vue à couper le souffle. Tout était parfait !", date: "2025-07-15" },
      { user: "Thomas R.", rating: 5, comment: "Séjour inoubliable. La piscine est incroyable et l'emplacement idéal.", date: "2025-08-02" },
      { user: "Claire M.", rating: 4, comment: "Très belle propriété, bien équipée. Petit bémol sur le parking un peu étroit.", date: "2025-06-20" }
    ],
    bookedDates: [
      { start: "2026-04-10", end: "2026-04-17" },
      { start: "2026-05-01", end: "2026-05-08" },
      { start: "2026-07-15", end: "2026-08-01" }
    ],
    badge: "Coup de coeur"
  },
  {
    id: 2,
    title: "Chalet de montagne authentique",
    description: "Chalet traditionnel savoyard en bois chaleureux, au pied des pistes de ski. Ambiance cosy avec cheminée, sauna privatif et balcon avec vue sur les sommets enneigés. Parfait pour les amateurs de sports d'hiver comme d'été avec accès direct aux sentiers de randonnée. Le chalet a été entièrement rénové avec des matériaux nobles.",
    location: "Alpes",
    address: "Chamonix, Haute-Savoie",
    pricePerNight: 180,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    amenities: ["WiFi", "Cheminée", "Parking", "Cuisine équipée", "Lave-linge", "Terrasse", "Vue montagne"],
    images: [
      "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      "https://images.unsplash.com/photo-1470770841497-7b3601fb1224?w=800",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800"
    ],
    rating: 4.9,
    reviewCount: 31,
    reviews: [
      { user: "Pierre D.", rating: 5, comment: "Le chalet parfait ! Cheminée, vue magnifique et accueil chaleureux.", date: "2025-12-28" },
      { user: "Julie F.", rating: 5, comment: "On s'est sentis comme chez nous. Le sauna après le ski, un bonheur !", date: "2026-01-15" },
      { user: "Marc B.", rating: 5, comment: "Emplacement idéal au pied des pistes. Décoration authentique et charmante.", date: "2026-02-10" }
    ],
    bookedDates: [
      { start: "2026-04-05", end: "2026-04-12" },
      { start: "2026-12-20", end: "2027-01-03" }
    ],
    badge: "Populaire"
  },
  {
    id: 3,
    title: "Maison bretonne en bord de mer",
    description: "Charmante maison de pêcheur rénovée, à seulement 50 mètres de la plage. Décoration marine soignée, jardin clos avec vue sur l'océan. Idéale pour les familles, cette maison vous offre le calme et l'authenticité de la Bretagne. Proche des sentiers côtiers GR34 et des crêperies locales.",
    location: "Bretagne",
    address: "Saint-Malo, Ille-et-Vilaine",
    pricePerNight: 130,
    bedrooms: 3,
    bathrooms: 2,
    guests: 6,
    amenities: ["WiFi", "Jardin", "Parking", "Cuisine équipée", "Lave-linge", "Animaux acceptés", "Vue mer"],
    images: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
      "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
      "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800"
    ],
    rating: 4.6,
    reviewCount: 18,
    reviews: [
      { user: "Sophie B.", rating: 5, comment: "Maison pleine de charme à deux pas de la plage. Les enfants ont adoré !", date: "2025-08-10" },
      { user: "François G.", rating: 4, comment: "Bon séjour, maison agréable et bien située. Jardin parfait pour les enfants.", date: "2025-07-22" }
    ],
    bookedDates: [
      { start: "2026-07-01", end: "2026-07-15" },
      { start: "2026-08-10", end: "2026-08-24" }
    ],
    badge: null
  },
  {
    id: 4,
    title: "Mas provençal avec oliveraie",
    description: "Authentique mas provençal du XVIIIe siècle, entièrement restauré avec goût. Entouré d'une oliveraie centenaire et de champs de lavande, cette propriété vous plonge dans l'art de vivre provençal. Piscine chauffée, cuisine d'été, et chambres aux tons naturels vous garantissent un séjour ressourçant.",
    location: "Provence",
    address: "Gordes, Vaucluse",
    pricePerNight: 320,
    bedrooms: 5,
    bathrooms: 4,
    guests: 10,
    amenities: ["WiFi", "Piscine", "Parking", "Climatisation", "Cuisine équipée", "Jardin", "Terrasse", "BBQ", "Lave-linge"],
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"
    ],
    rating: 4.9,
    reviewCount: 42,
    reviews: [
      { user: "Nathalie P.", rating: 5, comment: "Un rêve éveillé ! Le mas est sublime, la piscine divine et les environs magnifiques.", date: "2025-06-15" },
      { user: "Jean-Luc A.", rating: 5, comment: "Propriété exceptionnelle. Les cigales, la lavande... On ne voulait plus partir.", date: "2025-07-28" },
      { user: "Isabelle C.", rating: 5, comment: "Tout était au-delà de nos attentes. Un vrai havre de paix.", date: "2025-09-05" }
    ],
    bookedDates: [
      { start: "2026-06-15", end: "2026-06-30" },
      { start: "2026-07-20", end: "2026-08-15" }
    ],
    badge: "Premium"
  },
  {
    id: 5,
    title: "Villa corse pieds dans l'eau",
    description: "Villa de standing les pieds dans l'eau, avec accès direct à une crique privée. Architecture méditerranéenne, grandes baies vitrées, et terrasse ombragée face à la mer turquoise. Idéale pour un séjour luxueux en toute intimité. Équipée d'une cuisine haut de gamme et de chambres spacieuses avec vue.",
    location: "Corse",
    address: "Porto-Vecchio, Corse-du-Sud",
    pricePerNight: 400,
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    amenities: ["WiFi", "Piscine", "Parking", "Climatisation", "Cuisine équipée", "Terrasse", "Vue mer", "BBQ", "Lave-linge"],
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
      "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800",
      "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=800"
    ],
    rating: 4.7,
    reviewCount: 15,
    reviews: [
      { user: "Laurent M.", rating: 5, comment: "La vue est spectaculaire ! La crique privée est un vrai luxe.", date: "2025-08-20" },
      { user: "Camille T.", rating: 4, comment: "Superbe villa, bien équipée. Le cadre est paradisiaque.", date: "2025-09-12" }
    ],
    bookedDates: [
      { start: "2026-07-01", end: "2026-07-21" },
      { start: "2026-08-01", end: "2026-08-20" }
    ],
    badge: "Luxe"
  },
  {
    id: 6,
    title: "Cottage normand avec verger",
    description: "Ravissant cottage à colombages niché dans la campagne normande. Entouré d'un verger de pommiers et d'un potager, cette maison vous invite à la déconnexion totale. Intérieur chaleureux avec poutres apparentes, cheminée et cuisine fermière. Proche des plages du Débarquement et du Mont-Saint-Michel.",
    location: "Normandie",
    address: "Honfleur, Calvados",
    pricePerNight: 110,
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    amenities: ["WiFi", "Jardin", "Parking", "Cheminée", "Cuisine équipée", "Lave-linge", "Animaux acceptés"],
    images: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
      "https://images.unsplash.com/photo-1605146769289-440113cc3d00?w=800",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800"
    ],
    rating: 4.5,
    reviewCount: 12,
    reviews: [
      { user: "Emilie R.", rating: 5, comment: "Un petit coin de paradis ! Le verger est magnifique au printemps.", date: "2025-05-18" },
      { user: "David H.", rating: 4, comment: "Cottage charmant et très bien situé pour visiter la région.", date: "2025-10-05" }
    ],
    bookedDates: [
      { start: "2026-05-15", end: "2026-05-22" }
    ],
    badge: "Charme"
  },
  {
    id: 7,
    title: "Bastide en Dordogne avec piscine",
    description: "Magnifique bastide en pierre du Périgord, rénovée dans le respect de la tradition. Piscine chauffée dans un écrin de verdure, salle à manger d'été sous les glycines, et vue imprenable sur la vallée. Proximité des grottes de Lascaux et des plus beaux villages de France.",
    location: "Dordogne",
    address: "Sarlat-la-Canéda, Dordogne",
    pricePerNight: 200,
    bedrooms: 4,
    bathrooms: 3,
    guests: 8,
    amenities: ["WiFi", "Piscine", "Parking", "Cuisine équipée", "Jardin", "Terrasse", "BBQ", "Lave-linge"],
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800",
      "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800"
    ],
    rating: 4.8,
    reviewCount: 27,
    reviews: [
      { user: "Patrick V.", rating: 5, comment: "La bastide est sublime. Un cadre idyllique pour se ressourcer.", date: "2025-07-10" },
      { user: "Anne-Marie D.", rating: 5, comment: "Nous avons passé des vacances merveilleuses. La piscine et le jardin sont parfaits.", date: "2025-08-25" }
    ],
    bookedDates: [
      { start: "2026-07-10", end: "2026-07-24" },
      { start: "2026-08-05", end: "2026-08-19" }
    ],
    badge: null
  },
  {
    id: 8,
    title: "Appartement vue mer Cannes",
    description: "Superbe appartement de standing situé sur la Croisette à Cannes. Vue imprenable sur la baie et les îles de Lérins. Décoration moderne et raffinée, balcon avec salon extérieur. Accès direct à la plage et à proximité de tous les commerces et restaurants.",
    location: "Côte d'Azur",
    address: "Cannes, Alpes-Maritimes",
    pricePerNight: 190,
    bedrooms: 2,
    bathrooms: 1,
    guests: 4,
    amenities: ["WiFi", "Climatisation", "Vue mer", "Terrasse", "Cuisine équipée", "Lave-linge"],
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"
    ],
    rating: 4.4,
    reviewCount: 19,
    reviews: [
      { user: "Sylvie K.", rating: 5, comment: "Vue extraordinaire depuis le balcon ! Appartement très confortable.", date: "2025-05-20" },
      { user: "Romain P.", rating: 4, comment: "Bien situé sur la Croisette. Idéal pour découvrir Cannes.", date: "2025-06-15" }
    ],
    bookedDates: [
      { start: "2026-05-10", end: "2026-05-25" }
    ],
    badge: null
  },
  {
    id: 9,
    title: "Chalet de luxe Megève",
    description: "Chalet haut de gamme au coeur de Megève, avec spa privatif, salle de cinéma et conciergerie. Décoration montagnarde élégante mêlant bois et pierre. Ski-in/ski-out en hiver, golf et randonnées en été. Un lieu d'exception pour des vacances inoubliables.",
    location: "Alpes",
    address: "Megève, Haute-Savoie",
    pricePerNight: 450,
    bedrooms: 5,
    bathrooms: 4,
    guests: 12,
    amenities: ["WiFi", "Piscine", "Parking", "Cheminée", "Climatisation", "Cuisine équipée", "Terrasse", "Lave-linge"],
    images: [
      "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?w=800",
      "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800",
      "https://images.unsplash.com/photo-1595521624992-48a59aef95e3?w=800",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800"
    ],
    rating: 5.0,
    reviewCount: 8,
    reviews: [
      { user: "Catherine B.", rating: 5, comment: "Le summum du luxe ! Le spa est divin et le service conciergerie impeccable.", date: "2026-01-08" },
      { user: "Philippe L.", rating: 5, comment: "Chalet d'exception. On ne peut rêver mieux pour un séjour à la montagne.", date: "2026-02-20" }
    ],
    bookedDates: [
      { start: "2026-12-22", end: "2027-01-04" }
    ],
    badge: "Luxe"
  }
];

// Réservations de démonstration
const BOOKINGS_DATA = [
  {
    id: 1,
    propertyId: 1,
    propertyTitle: "Villa Azuréenne avec piscine",
    guestName: "Jean Dupont",
    checkIn: "2026-04-10",
    checkOut: "2026-04-17",
    guests: 6,
    totalPrice: 1750,
    status: "confirmed"
  },
  {
    id: 2,
    propertyId: 2,
    propertyTitle: "Chalet de montagne authentique",
    guestName: "Marie Martin",
    checkIn: "2026-04-05",
    checkOut: "2026-04-12",
    guests: 4,
    totalPrice: 1260,
    status: "confirmed"
  },
  {
    id: 3,
    propertyId: 4,
    propertyTitle: "Mas provençal avec oliveraie",
    guestName: "Pierre Bernard",
    checkIn: "2026-06-15",
    checkOut: "2026-06-30",
    guests: 8,
    totalPrice: 4800,
    status: "pending"
  },
  {
    id: 4,
    propertyId: 5,
    propertyTitle: "Villa corse pieds dans l'eau",
    guestName: "Sophie Laurent",
    checkIn: "2026-07-01",
    checkOut: "2026-07-21",
    guests: 6,
    totalPrice: 8000,
    status: "pending"
  },
  {
    id: 5,
    propertyId: 1,
    propertyTitle: "Villa Azuréenne avec piscine",
    guestName: "Claire Moreau",
    checkIn: "2026-03-15",
    checkOut: "2026-03-20",
    guests: 4,
    totalPrice: 1250,
    status: "cancelled"
  }
];

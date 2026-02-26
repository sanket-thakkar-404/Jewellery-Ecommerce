export interface Product {
  id: string;
  name: string;
  category: string;
  price: number | null;
  priceOnRequest: boolean;
  description: string;
  images: string[];
  featured: boolean;
  views: number;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  productId?: string;
  productName?: string;
  createdAt: string;
  status: 'new' | 'read' | 'replied';
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export const categories = [
  'All',
  'Necklaces',
  'Rings',
  'Earrings',
  'Bangles',
  'Bracelets',
  'Pendants',
  'Chains',
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Royal Heritage Necklace',
    category: 'Necklaces',
    price: 245000,
    priceOnRequest: false,
    description: 'A masterpiece crafted in 22K gold with intricate Kundan work. This heritage necklace draws inspiration from Mughal artistry, featuring hand-set uncut diamonds and natural rubies. Each piece takes over 200 hours of meticulous craftsmanship.',
    images: ['/1.webp'],
    featured: true,
    views: 1240,
    createdAt: '2025-12-01',
  },
  {
    id: '2',
    name: 'Celestial Diamond Ring',
    category: 'Rings',
    price: 89000,
    priceOnRequest: false,
    description: 'An exquisite solitaire ring featuring a brilliant-cut diamond set in platinum. The celestial design symbolizes eternal brilliance, with micro-pavé diamonds adorning the band.',
    images: ['/2.webp'],
    featured: true,
    views: 980,
    createdAt: '2025-11-15',
  },
  {
    id: '3',
    name: 'Empress Jhumka Earrings',
    category: 'Earrings',
    price: 67000,
    priceOnRequest: false,
    description: 'Traditional Jhumka earrings reimagined with contemporary elegance. Crafted in 22K gold with delicate filigree work and adorned with South Sea pearls and emeralds.',
    images: ['/3.jpg'],
    featured: true,
    views: 856,
    createdAt: '2025-10-20',
  },
  {
    id: '4',
    name: 'Maharani Bridal Set',
    category: 'Necklaces',
    price: null,
    priceOnRequest: true,
    description: 'An opulent bridal ensemble worthy of royalty. This complete set includes a statement necklace, matching earrings, maang tikka, and bangles — all crafted in 24K gold with Polki diamonds.',
    images: ['/4.jpg'],
    featured: true,
    views: 2100,
    createdAt: '2025-09-01',
  },
  {
    id: '5',
    name: 'Golden Filigree Bangles',
    category: 'Bangles',
    price: 125000,
    priceOnRequest: false,
    description: 'A set of six bangles showcasing the ancient art of filigree. Each bangle is handcrafted in 22K gold with intricate lace-like patterns that catch light from every angle.',
    images: ['/5.webp'],
    featured: false,
    views: 645,
    createdAt: '2025-08-10',
  },
  {
    id: '6',
    name: 'Lotus Pearl Pendant',
    category: 'Pendants',
    price: 42000,
    priceOnRequest: false,
    description: 'A serene lotus pendant crafted in rose gold, cradling a lustrous Akoya pearl. The petals are set with pink sapphires, creating a harmonious blend of nature and luxury.',
    images: ['/6.jpg'],
    featured: false,
    views: 512,
    createdAt: '2025-07-22',
  },
  {
    id: '7',
    name: 'Infinity Diamond Bracelet',
    category: 'Bracelets',
    price: 178000,
    priceOnRequest: false,
    description: 'A tennis bracelet featuring 42 round brilliant diamonds set in 18K white gold. The infinity-inspired clasp symbolizes unending elegance.',
    images: ['/7.webp'],
    featured: false,
    views: 723,
    createdAt: '2025-06-15',
  },
  {
    id: '8',
    name: 'Sovereign Gold Chain',
    category: 'Chains',
    price: 95000,
    priceOnRequest: false,
    description: 'A substantial 24K gold chain with a distinctive Byzantine weave. This statement piece combines ancient goldsmithing techniques with modern proportions.',
    images: ['/8.avif'],
    featured: false,
    views: 389,
    createdAt: '2025-05-30',
  },
  {
    id: '9',
    name: 'Twilight Sapphire Ring',
    category: 'Rings',
    price: 156000,
    priceOnRequest: false,
    description: 'A mesmerizing cocktail ring featuring a 3-carat Ceylon sapphire surrounded by a halo of brilliant diamonds, set in 18K white gold.',
    images: ['/9.webp'],
    featured: false,
    views: 890,
    createdAt: '2025-04-18',
  },
  {
    id: '10',
    name: 'Kundan Heritage Earrings',
    category: 'Earrings',
    price: null,
    priceOnRequest: true,
    description: 'Museum-quality Kundan earrings featuring uncut diamonds set in pure gold using the traditional lac technique. Each pair is a unique work of art.',
    images: ['/10.webp'],
    featured: false,
    views: 456,
    createdAt: '2025-03-25',
  },
  {
    id: '11',
    name: 'Art Deco Emerald Necklace',
    category: 'Necklaces',
    price: null,
    priceOnRequest: true,
    description: 'An Art Deco inspired necklace featuring Colombian emeralds and brilliant-cut diamonds set in platinum. A rare collector\'s piece.',
    images: ['/placeholder.svg'],
    featured: false,
    views: 1567,
    createdAt: '2025-02-14',
  },
  {
    id: '12',
    name: 'Temple Gold Bangles',
    category: 'Bangles',
    price: 210000,
    priceOnRequest: false,
    description: 'Inspired by South Indian temple architecture, these broad gold bangles feature intricate deity motifs and traditional gopuram patterns in 22K gold.',
    images: ['http://babulaljewellers.com/images/64ad4320f27f2a2ecdde6af1_8-Large.jpeg'],
    featured: false,
    views: 734,
    createdAt: '2025-01-20',
  },
];

export const enquiries: Enquiry[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    phone: '+91 98765 43210',
    message: 'I am interested in the Maharani Bridal Set for my wedding in March. Can you share pricing and customization options?',
    productId: '4',
    productName: 'Maharani Bridal Set',
    createdAt: '2026-02-20',
    status: 'new',
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '+91 87654 32109',
    message: 'Looking for a custom engagement ring with a 2-carat diamond. Budget around ₹3,00,000.',
    createdAt: '2026-02-18',
    status: 'read',
  },
  {
    id: '3',
    name: 'Anita Desai',
    email: 'anita@example.com',
    phone: '+91 76543 21098',
    message: 'Do you ship internationally? I would like to order the Empress Jhumka Earrings to the UK.',
    productId: '3',
    productName: 'Empress Jhumka Earrings',
    createdAt: '2026-02-15',
    status: 'replied',
  },
  {
    id: '4',
    name: 'Vikram Singh',
    email: 'vikram@example.com',
    phone: '+91 65432 10987',
    message: 'Can I visit your store to see the Royal Heritage Necklace? What are your working hours?',
    productId: '1',
    productName: 'Royal Heritage Necklace',
    createdAt: '2026-02-10',
    status: 'new',
  },
  {
    id: '5',
    name: 'Meera Patel',
    email: 'meera@example.com',
    phone: '+91 54321 09876',
    message: 'Interested in a set of gold bangles for my daughters wedding. Need 6 pieces, customized weight.',
    createdAt: '2026-02-05',
    status: 'new',
  },
];

export const monthlyEnquiries = [
  { month: 'Sep', count: 12 },
  { month: 'Oct', count: 18 },
  { month: 'Nov', count: 25 },
  { month: 'Dec', count: 42 },
  { month: 'Jan', count: 35 },
  { month: 'Feb', count: 28 },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

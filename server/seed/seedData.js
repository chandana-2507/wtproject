require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const slugify = require('../utils/slugify');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

const categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Beauty', 'Books'];

const sampleProducts = [
  {
    name: 'Wireless Noise-Cancelling Headphones',
    description:
      'Premium over-ear headphones with adaptive ANC, 30-hour battery, and plush memory foam cushions.',
    price: 199.99,
    comparePrice: 249.99,
    category: 'Electronics',
    brand: 'SoundMax',
    stock: 40,
    isFeatured: true,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        public_id: '',
      },
    ],
    variants: [{ size: '', color: 'Black', stock: 20 }, { size: '', color: 'Silver', stock: 20 }],
  },
  {
    name: 'Smart Watch Pro',
    description: 'AMOLED display, heart rate, GPS, and 5ATM water resistance.',
    price: 279.5,
    comparePrice: 329,
    category: 'Electronics',
    brand: 'PulseTech',
    stock: 55,
    isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', public_id: '' }],
    variants: [{ size: '42mm', color: 'Black', stock: 30 }, { size: '46mm', color: 'Silver', stock: 25 }],
  },
  {
    name: 'Ultrabook 14" Laptop',
    description: 'Lightweight aluminum chassis, 16GB RAM, 512GB SSD, all-day battery.',
    price: 1199,
    comparePrice: 1399,
    category: 'Electronics',
    brand: 'NovaCompute',
    stock: 18,
    images: [{ url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80', public_id: '' }],
    variants: [{ size: '14"', color: 'Gray', stock: 10 }, { size: '14"', color: 'Silver', stock: 8 }],
  },
  {
    name: '4K Action Camera',
    description: 'Waterproof housing included. Stabilization for sports and travel.',
    price: 349,
    comparePrice: 399,
    category: 'Electronics',
    brand: 'TrailVision',
    stock: 28,
    images: [{ url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80', public_id: '' }],
    variants: [{ size: '', color: 'Black', stock: 28 }],
  },
  {
    name: 'Portable Bluetooth Speaker',
    description: '360° sound, IPX7 waterproof, 12-hour playtime.',
    price: 89.99,
    comparePrice: 119.99,
    category: 'Electronics',
    brand: 'WaveBeat',
    stock: 70,
    images: [{ url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e2?w=800&q=80', public_id: '' }],
    variants: [{ size: '', color: 'Blue', stock: 35 }, { size: '', color: 'Red', stock: 35 }],
  },
  {
    name: 'Minimalist Cotton Tee',
    description: 'Organic cotton crew neck tee with relaxed fit.',
    price: 24.99,
    comparePrice: 34.99,
    category: 'Fashion',
    brand: 'UrbanThread',
    stock: 120,
    isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', public_id: '' }],
    variants: [
      { size: 'S', color: 'White', stock: 30 },
      { size: 'M', color: 'White', stock: 40 },
      { size: 'L', color: 'Black', stock: 50 },
    ],
  },
  {
    name: 'Slim Fit Denim Jeans',
    description: 'Stretch denim with tapered leg and classic five-pocket styling.',
    price: 79,
    comparePrice: 99,
    category: 'Fashion',
    brand: 'DenimCo',
    stock: 85,
    images: [{ url: 'https://images.unsplash.com/photo-1542272604-787c3835335d?w=800&q=80', public_id: '' }],
    variants: [
      { size: '30', color: 'Indigo', stock: 25 },
      { size: '32', color: 'Indigo', stock: 35 },
      { size: '34', color: 'Indigo', stock: 25 },
    ],
  },
  {
    name: 'Leather Sneakers',
    description: 'Hand-stitched leather upper with cushioned insole.',
    price: 129,
    comparePrice: 159,
    category: 'Fashion',
    brand: 'Stride',
    stock: 45,
    images: [{ url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80', public_id: '' }],
    variants: [
      { size: '9', color: 'White', stock: 15 },
      { size: '10', color: 'White', stock: 15 },
      { size: '11', color: 'Black', stock: 15 },
    ],
  },
  {
    name: 'Wool Blend Coat',
    description: 'Tailored knee-length coat for cold seasons.',
    price: 249,
    comparePrice: 299,
    category: 'Fashion',
    brand: 'NorthLine',
    stock: 22,
    images: [{ url: 'https://images.unsplash.com/photo-1539533018407-2b2d5083a621?w=800&q=80', public_id: '' }],
    variants: [
      { size: 'M', color: 'Camel', stock: 8 },
      { size: 'L', color: 'Camel', stock: 8 },
      { size: 'L', color: 'Navy', stock: 6 },
    ],
  },
  {
    name: 'Canvas Tote Bag',
    description: 'Heavy canvas with reinforced handles for everyday carry.',
    price: 45,
    comparePrice: 55,
    category: 'Fashion',
    brand: 'CarryAll',
    stock: 60,
    images: [{ url: 'https://images.unsplash.com/photo-1590874103328-eac38c683af7?w=800&q=80', public_id: '' }],
    variants: [{ size: '', color: 'Natural', stock: 30 }, { size: '', color: 'Black', stock: 30 }],
  },
  {
    name: 'Ceramic Table Lamp',
    description: 'Warm ambient lighting with linen shade and brass accents.',
    price: 68,
    comparePrice: 84,
    category: 'Home',
    brand: 'LumenHaus',
    stock: 35,
    images: [{ url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80', public_id: '' }],
    variants: [{ size: '', color: 'Cream', stock: 35 }],
  },
  {
    name: 'Memory Foam Mattress Topper',
    description: 'Cooling gel-infused memory foam for deeper sleep.',
    price: 189,
    comparePrice: 229,
    category: 'Home',
    brand: 'RestNest',
    stock: 28,
    isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', public_id: '' }],
    variants: [
      { size: 'Queen', color: 'White', stock: 14 },
      { size: 'King', color: 'White', stock: 14 },
    ],
  },
  {
    name: 'Stainless Steel Cookware Set',
    description: '10-piece induction-compatible set with tempered glass lids.',
    price: 299,
    comparePrice: 359,
    category: 'Home',
    brand: 'ChefForge',
    stock: 20,
    images: [{ url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&q=80', public_id: '' }],
    variants: [{ size: '', color: 'Silver', stock: 20 }],
  },
  {
    name: 'Throw Pillow Set (2-pack)',
    description: 'Velvet covers with removable inserts, multiple colors.',
    price: 42,
    comparePrice: 54,
    category: 'Home',
    brand: 'ComfortHue',
    stock: 80,
    images: [{ url: 'https://images.unsplash.com/photo-1584100936595-c0654b55bbe9?w=800&q=80', public_id: '' }],
    variants: [{ size: '', color: 'Sage', stock: 40 }, { size: '', color: 'Rust', stock: 40 }],
  },
  {
    name: 'Indoor Plant Starter Kit',
    description: 'Pots, soil, and care guide for beginners.',
    price: 36,
    comparePrice: 48,
    category: 'Home',
    brand: 'GreenSpace',
    stock: 50,
    images: [{ url: 'https://images.unsplash.com/photo-1463937583117-a7a2b2d2b2c8?w=800&q=80', public_id: '' }],
    variants: [{ size: '', color: 'Terracotta', stock: 50 }],
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Non-slip textured surface, 6mm cushioning, carrying strap.',
    price: 54.99,
    comparePrice: 69.99,
    category: 'Sports',
    brand: 'ZenFlow',
    stock: 90,
    images: [{ url: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80', public_id: '' }],
    variants: [{ size: 'Standard', color: 'Purple', stock: 45 }, { size: 'Standard', color: 'Teal', stock: 45 }],
  },
  {
    name: 'Adjustable Dumbbells (Pair)',
    description: 'Quick-dial weight selection from 5 to 25 lb per dumbbell.',
    price: 349,
    comparePrice: 399,
    category: 'Sports',
    brand: 'IronFlex',
    stock: 15,
    isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80', public_id: '' }],
    variants: [{ size: '', color: 'Black', stock: 15 }],
  },
  {
    name: 'Cycling Helmet',
    description: 'Lightweight with MIPS, removable visor, adjustable dial fit.',
    price: 89,
    comparePrice: 109,
    category: 'Sports',
    brand: 'Velocity',
    stock: 40,
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', public_id: '' }],
    variants: [
      { size: 'M', color: 'Matte Black', stock: 20 },
      { size: 'L', color: 'Matte Black', stock: 20 },
    ],
  },
  {
    name: 'Trail Running Shoes',
    description: 'Aggressive tread, breathable mesh upper, rock plate.',
    price: 129.99,
    comparePrice: 159.99,
    category: 'Sports',
    brand: 'TerraRun',
    stock: 52,
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', public_id: '' }],
    variants: [
      { size: '9', color: 'Gray', stock: 26 },
      { size: '10', color: 'Gray', stock: 26 },
    ],
  },
  {
    name: 'Insulated Water Bottle',
    description: 'Double-wall stainless, keeps drinks cold for 24 hours.',
    price: 32,
    comparePrice: 42,
    category: 'Sports',
    brand: 'HydroPeak',
    stock: 110,
    images: [{ url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', public_id: '' }],
    variants: [{ size: '32oz', color: 'Navy', stock: 55 }, { size: '32oz', color: 'Stone', stock: 55 }],
  },
  {
    name: 'Vitamin C Brightening Serum',
    description: '15% L-ascorbic acid with hyaluronic acid base.',
    price: 38,
    comparePrice: 48,
    category: 'Beauty',
    brand: 'GlowLab',
    stock: 75,
    images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80', public_id: '' }],
    variants: [{ size: '30ml', color: '', stock: 75 }],
  },
  {
    name: 'Matte Lipstick Set',
    description: 'Four long-wear shades in a collector tin.',
    price: 48,
    comparePrice: 58,
    category: 'Beauty',
    brand: 'VelvetRose',
    stock: 66,
    images: [{ url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80', public_id: '' }],
    variants: [{ size: '', color: 'Variety', stock: 66 }],
  },
  {
    name: 'Ceramic Hair Dryer',
    description: 'Ionic technology, 3 heat settings, lightweight design.',
    price: 74.5,
    comparePrice: 94.5,
    category: 'Beauty',
    brand: 'AeroStyle',
    stock: 33,
    images: [{ url: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=800&q=80', public_id: '' }],
    variants: [{ size: '', color: 'Rose', stock: 33 }],
  },
  {
    name: 'SPF 50 Face Sunscreen',
    description: 'Non-comedogenic, invisible finish, reef-safe filters.',
    price: 28,
    comparePrice: 36,
    category: 'Beauty',
    brand: 'SolarGuard',
    stock: 95,
    images: [{ url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', public_id: '' }],
    variants: [{ size: '50ml', color: '', stock: 95 }],
  },
  {
    name: 'Bestseller Fiction Bundle',
    description: 'Curated trio of acclaimed contemporary novels.',
    price: 45,
    comparePrice: 60,
    category: 'Books',
    brand: 'PageTurner',
    stock: 200,
    images: [{ url: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&q=80', public_id: '' }],
    variants: [{ size: '', color: '', stock: 200 }],
  },
  {
    name: 'USB-C Fast GaN Charger 65W',
    description: 'Compact wall charger with dual USB-C ports, smart power distribution, and foldable prongs.',
    price: 39.99,
    comparePrice: 49.99,
    category: 'Electronics',
    brand: 'VoltEdge',
    stock: 88,
    isFeatured: true,
    images: [{ url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80', public_id: '' }],
    variants: [{ size: '', color: 'White', stock: 50 }, { size: '', color: 'Black', stock: 38 }],
  },
];

async function seed() {
  await connectDB();

  await User.deleteMany({});
  await Product.deleteMany({});
  await Coupon.deleteMany({});

  await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin123!',
    role: 'admin',
  });

  await User.create({
    name: 'Test User',
    email: 'user@example.com',
    password: 'User123!',
    role: 'user',
  });

  for (const p of sampleProducts) {
    const baseSlug = slugify(p.name);
    let slug = baseSlug;
    let n = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${n}`;
      n += 1;
    }

    await Product.create({
      ...p,
      slug,
      ratings: Math.min(5, Math.round((4 + Math.random()) * 10) / 10),
      numReviews: Math.floor(Math.random() * 80) + 5,
      sold: Math.floor(Math.random() * 40),
    });
  }

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await Coupon.create({
    code: 'SAVE10',
    discountType: 'percent',
    discountValue: 10,
    minOrderAmount: 50,
    maxUsage: 1000,
    usedCount: 0,
    expiresAt: nextMonth,
    isActive: true,
  });

  await Coupon.create({
    code: 'FLAT15',
    discountType: 'fixed',
    discountValue: 15,
    minOrderAmount: 75,
    maxUsage: 500,
    usedCount: 0,
    expiresAt: nextMonth,
    isActive: true,
  });

  console.log('Seed completed: admin@example.com / Admin123!, user@example.com / User123!');
  console.log(`Products: ${sampleProducts.length}`);
  console.log(`Categories referenced: ${categories.join(', ')}`);
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});

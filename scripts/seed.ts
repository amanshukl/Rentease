import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Import models
const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

// Define schemas inline to avoid Next.js module resolution issues
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'user' },
  phone: String,
  city: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  cart: [],
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  category: String,
  subcategory: String,
  monthlyRent: Number,
  securityDeposit: Number,
  images: [String],
  features: [String],
  dimensions: String,
  brand: String,
  condition: { type: String, default: 'new' },
  availableStock: Number,
  totalStock: Number,
  city: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: String,
    monthlyRent: Number,
    tenure: Number,
    quantity: Number,
    securityDeposit: Number,
  }],
  totalMonthlyRent: Number,
  totalSecurityDeposit: Number,
  status: { type: String, default: 'pending' },
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },
  startDate: Date,
  endDate: Date,
  returnRequested: { type: Boolean, default: false },
}, { timestamps: true });

const TicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  subject: String,
  description: String,
  type: String,
  status: { type: String, default: 'open' },
  priority: { type: String, default: 'medium' },
  adminNotes: String,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function seed() {
  console.log('🌱 Starting database seed...\n');

  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Ticket.deleteMany({}),
  ]);
  console.log('🧹 Cleared existing data\n');

  // ── Users ──
  const adminPassword = await bcrypt.hash('admin123', 12);
  const userPassword = await bcrypt.hash('user123', 12);
  const vendorPassword = await bcrypt.hash('vendor123', 12);

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@rentease.com',
    password: adminPassword,
    role: 'admin',
    phone: '+91 98765 00001',
    city: 'Bangalore',
  });

  const testUser = await User.create({
    name: 'Test User',
    email: 'user@rentease.com',
    password: userPassword,
    role: 'user',
    phone: '+91 98765 00002',
    address: {
      street: '42 MG Road, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560034',
    },
  });

  const vendor = await User.create({
    name: 'Vendor Partner',
    email: 'vendor@rentease.com',
    password: vendorPassword,
    role: 'vendor',
    phone: '+91 98765 00003',
    city: 'Mumbai',
  });

  console.log('👤 Created users:');
  console.log('   Admin:  admin@rentease.com / admin123');
  console.log('   User:   user@rentease.com / user123');
  console.log('   Vendor: vendor@rentease.com / vendor123\n');

  // ── Products ──
  const products = [
    // Furniture
    {
      name: 'King Size Bed with Mattress',
      description: 'Premium king-size wooden bed with a high-density foam mattress for ultimate comfort. Features a sturdy solid wood frame with a rich walnut finish and built-in headboard storage.',
      category: 'furniture',
      subcategory: 'Bed',
      monthlyRent: 1299,
      securityDeposit: 2500,
      features: ['Solid wood frame', 'HD foam mattress included', 'Headboard storage', 'Anti-skid leg pads', 'Easy assembly'],
      dimensions: '78 x 72 x 36 inches',
      brand: 'WoodenStreet',
      condition: 'new' as const,
      totalStock: 10,
    },
    {
      name: '3-Seater Fabric Sofa',
      description: 'Elegant 3-seater sofa upholstered in premium fabric with high-resilience foam cushions. Perfect for living rooms, this sofa combines modern aesthetics with exceptional comfort.',
      category: 'furniture',
      subcategory: 'Sofa',
      monthlyRent: 899,
      securityDeposit: 2000,
      features: ['Premium fabric upholstery', 'High-resilience foam', 'Wooden legs', 'Removable cushion covers', 'Stain-resistant fabric'],
      dimensions: '72 x 32 x 34 inches',
      brand: 'UrbanLadder',
      condition: 'new' as const,
      totalStock: 8,
    },
    {
      name: '4-Seater Dining Table Set',
      description: 'Compact 4-seater dining table set in engineered wood with a contemporary design. Includes 4 matching chairs with cushioned seats, ideal for apartments and small dining areas.',
      category: 'furniture',
      subcategory: 'Table',
      monthlyRent: 599,
      securityDeposit: 1500,
      features: ['Engineered wood', '4 cushioned chairs included', 'Scratch-resistant top', 'Compact design', 'Easy to clean'],
      dimensions: '48 x 30 x 30 inches',
      brand: 'HomeTown',
      condition: 'new' as const,
      totalStock: 12,
    },
    {
      name: 'Ergonomic Study Desk',
      description: 'Spacious study desk with a keyboard tray and cable management system. Designed for productivity with ample workspace and a modern minimalist look.',
      category: 'furniture',
      subcategory: 'Desk',
      monthlyRent: 399,
      securityDeposit: 800,
      features: ['Keyboard tray', 'Cable management', 'Two storage drawers', 'Adjustable feet', 'Scratch-resistant surface'],
      dimensions: '48 x 24 x 30 inches',
      brand: 'IKEA',
      condition: 'new' as const,
      totalStock: 15,
    },
    {
      name: 'Ergonomic Office Chair',
      description: 'High-back ergonomic office chair with lumbar support, adjustable armrests, and breathable mesh back. Perfect for long working hours at home or office.',
      category: 'furniture',
      subcategory: 'Chair',
      monthlyRent: 349,
      securityDeposit: 700,
      features: ['Lumbar support', 'Adjustable armrests', 'Breathable mesh back', '360° swivel', 'Gas lift height adjustment'],
      dimensions: '26 x 26 x 48 inches',
      brand: 'GreenSoul',
      condition: 'like-new' as const,
      totalStock: 10,
    },
    {
      name: '5-Tier Bookshelf',
      description: 'Open-design 5-tier bookshelf crafted from engineered wood. Features a ladder-style design that adds a modern touch to any room while providing ample storage.',
      category: 'furniture',
      subcategory: 'Bookshelf',
      monthlyRent: 249,
      securityDeposit: 500,
      features: ['5 spacious shelves', 'Ladder-style design', 'Wall-mount anchor included', 'Anti-topple safety', 'Weight capacity: 50kg'],
      dimensions: '30 x 12 x 72 inches',
      brand: 'DeckUp',
      condition: 'new' as const,
      totalStock: 12,
    },
    {
      name: '3-Door Wardrobe with Mirror',
      description: 'Spacious 3-door wardrobe with a full-length mirror, multiple shelves, and a hanging rod. Engineered wood construction with a premium laminate finish.',
      category: 'furniture',
      subcategory: 'Wardrobe',
      monthlyRent: 799,
      securityDeposit: 1500,
      features: ['Full-length mirror', 'Multiple shelves', 'Hanging rod', 'Drawer unit', 'Soft-close hinges'],
      dimensions: '48 x 21 x 75 inches',
      brand: 'Godrej',
      condition: 'like-new' as const,
      totalStock: 6,
    },
    {
      name: 'Single Bed with Mattress',
      description: 'Sturdy single bed with a comfortable mattress, perfect for students and single occupants. Metal frame with a powder-coated finish for durability.',
      category: 'furniture',
      subcategory: 'Bed',
      monthlyRent: 699,
      securityDeposit: 1200,
      features: ['Metal frame', 'Powder-coated finish', 'Mattress included', 'Under-bed clearance', 'Easy assembly'],
      dimensions: '75 x 36 x 18 inches',
      brand: 'FurnitureKraft',
      condition: 'new' as const,
      totalStock: 14,
    },
    // Appliances
    {
      name: 'Samsung 253L Frost-Free Refrigerator',
      description: 'Samsung 253-liter frost-free double-door refrigerator with digital inverter technology for energy efficiency and consistent cooling performance.',
      category: 'appliance',
      subcategory: 'Refrigerator',
      monthlyRent: 799,
      securityDeposit: 2000,
      features: ['Digital inverter compressor', 'Frost-free technology', 'Convertible 5-in-1 modes', 'Anti-bacterial gasket', 'Energy rating: 3-star'],
      dimensions: '55 x 64 x 164 cm',
      brand: 'Samsung',
      condition: 'new' as const,
      totalStock: 8,
    },
    {
      name: 'LG 7kg Fully Automatic Washing Machine',
      description: 'LG 7kg fully automatic front-loading washing machine with 6 Motion Direct Drive technology. Provides thorough yet gentle washing for all fabric types.',
      category: 'appliance',
      subcategory: 'Washing Machine',
      monthlyRent: 699,
      securityDeposit: 1800,
      features: ['6 Motion DD technology', 'Smart diagnosis', 'Baby care cycle', 'Allergy care steam wash', 'Energy rating: 5-star'],
      dimensions: '60 x 55 x 85 cm',
      brand: 'LG',
      condition: 'new' as const,
      totalStock: 7,
    },
    {
      name: 'Mi 43-inch Smart TV 4A',
      description: 'Xiaomi 43-inch Full HD smart TV with built-in Chromecast, Android TV OS, and Dolby Audio. Crystal-clear display with vivid colors for an immersive viewing experience.',
      category: 'appliance',
      subcategory: 'TV',
      monthlyRent: 599,
      securityDeposit: 1500,
      features: ['Full HD 1080p display', 'Android TV with Chromecast', 'Dolby Audio + DTS-HD', '20W stereo speakers', '3 HDMI + 2 USB ports'],
      dimensions: '96 x 57 x 8 cm',
      brand: 'Xiaomi',
      condition: 'like-new' as const,
      totalStock: 10,
    },
    {
      name: 'Voltas 1.5 Ton 3-Star Split AC',
      description: 'Voltas 1.5-ton split AC with copper condenser and multi-stage filtration. Ideal for rooms up to 180 sq ft, delivering powerful and even cooling.',
      category: 'appliance',
      subcategory: 'AC',
      monthlyRent: 999,
      securityDeposit: 3000,
      features: ['Copper condenser', 'Multi-stage filtration', 'Turbo cooling mode', 'Sleep mode', 'Anti-dust filter'],
      dimensions: '95 x 30 x 21 cm (Indoor)',
      brand: 'Voltas',
      condition: 'new' as const,
      totalStock: 5,
    },
    {
      name: 'Samsung 28L Convection Microwave',
      description: 'Samsung 28-liter convection microwave oven with Tandoor technology and slim fry. Cook, bake, grill, and reheat with a single versatile appliance.',
      category: 'appliance',
      subcategory: 'Microwave',
      monthlyRent: 299,
      securityDeposit: 600,
      features: ['Convection + Grill + Solo', 'Tandoor technology', 'Slim Fry', 'Ceramic enamel cavity', 'Auto cook programs'],
      dimensions: '52 x 48 x 31 cm',
      brand: 'Samsung',
      condition: 'new' as const,
      totalStock: 12,
    },
    {
      name: 'Kent Grand RO Water Purifier',
      description: 'Kent Grand RO+UV+UF water purifier with TDS controller. Multi-stage purification ensures safe and mineral-rich drinking water for your family.',
      category: 'appliance',
      subcategory: 'Water Purifier',
      monthlyRent: 349,
      securityDeposit: 800,
      features: ['RO + UV + UF purification', 'TDS controller', '8L storage tank', 'Auto shut-off', 'Filter change indicator'],
      dimensions: '39 x 26 x 53 cm',
      brand: 'Kent',
      condition: 'new' as const,
      totalStock: 10,
    },
    {
      name: 'Havells Instanio 3L Instant Geyser',
      description: 'Havells 3-liter instant water heater with color-changing LED temperature indicator. Compact and energy-efficient, ideal for kitchen and bathroom use.',
      category: 'appliance',
      subcategory: 'Geyser',
      monthlyRent: 249,
      securityDeposit: 500,
      features: ['Instant heating', 'LED temperature indicator', 'ISI certified', 'Rust-proof body', '5-year warranty on tank'],
      dimensions: '29 x 19 x 29 cm',
      brand: 'Havells',
      condition: 'like-new' as const,
      totalStock: 8,
    },
    {
      name: 'Whirlpool 190L Single-Door Refrigerator',
      description: 'Whirlpool 190-liter single-door refrigerator with Intellisense Inverter Technology. Budget-friendly and energy-efficient, perfect for bachelors and couples.',
      category: 'appliance',
      subcategory: 'Refrigerator',
      monthlyRent: 599,
      securityDeposit: 1500,
      features: ['Intellisense inverter', 'Stabilizer-free operation', 'Insulated capillary technology', 'Honey comb moisture lock', '3-star energy rating'],
      dimensions: '52 x 57 x 130 cm',
      brand: 'Whirlpool',
      condition: 'new' as const,
      totalStock: 9,
    },
  ];

  const createdProducts = await Product.insertMany(
    products.map((p, index) => {
      const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'];
      const imageMap: Record<string, string[]> = {
        'King Size Bed with Mattress': [
          'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
        ],
        '3-Seater Fabric Sofa': [
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
          'https://images.unsplash.com/photo-1491926626787-62db157af940?w=800&q=80',
          'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
          'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
        ],
        '4-Seater Dining Table Set': [
          'https://images.unsplash.com/photo-1617098474202-0d0d7f60c788?w=800&q=80',
          'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
        ],
        'Ergonomic Study Desk': [
          'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
          'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&q=80',
          'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
          'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
        ],
        'Ergonomic Office Chair': [
          'https://images.unsplash.com/photo-1541558869434-2840d308329a?w=800&q=80',
          'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
          'https://images.unsplash.com/photo-1487015307662-6ce28210782c?w=800&q=80',
        ],
        '5-Tier Bookshelf': [
          'https://images.unsplash.com/photo-1580237541049-2d715a09486e?w=800&q=80',
          'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
          'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
        ],
        '3-Door Wardrobe with Mirror': [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
          'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
        ],
        'Single Bed with Mattress': [
          'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80',
          'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
        ],
        'Samsung 253L Frost-Free Refrigerator': [
          'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
          'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
        ],
        'LG 7kg Fully Automatic Washing Machine': [
          'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&q=80',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
          'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
        ],
        'Mi 43-inch Smart TV 4A': [
          'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=800&q=80',
          'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
          'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80',
        ],
        'Voltas 1.5 Ton 3-Star Split AC': [
          'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
          'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
        ],
        'Samsung 28L Convection Microwave': [
          'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&q=80',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
          'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80',
        ],
        'Kent Grand RO Water Purifier': [
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
          'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
          'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80',
        ],
        'Havells Instanio 3L Instant Geyser': [
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
          'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80',
          'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80',
        ],
        'Whirlpool 190L Single-Door Refrigerator': [
          'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
          'https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800&q=80',
          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
        ],
      };
      return {
        ...p,
        slug: slugify(p.name),
        images: imageMap[p.name] || ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'],
        availableStock: p.totalStock,
        city: cities[index % cities.length],
      };
    })
  );

  console.log(`📦 Created ${createdProducts.length} products\n`);

  // ── Sample Orders ──
  const now = new Date();
  const threeMonthsLater = new Date(now);
  threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
  const sixMonthsLater = new Date(now);
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
  const twoMonthsAgo = new Date(now);
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const orders = await Order.insertMany([
    {
      user: testUser._id,
      items: [
        {
          product: createdProducts[0]._id,
          productName: createdProducts[0].name,
          monthlyRent: 1299,
          tenure: 6,
          quantity: 1,
          securityDeposit: 2500,
        },
        {
          product: createdProducts[4]._id,
          productName: createdProducts[4].name,
          monthlyRent: 349,
          tenure: 6,
          quantity: 1,
          securityDeposit: 700,
        },
      ],
      totalMonthlyRent: 1648,
      totalSecurityDeposit: 3200,
      status: 'active',
      deliveryAddress: {
        street: '42 MG Road, Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560034',
      },
      startDate: oneMonthAgo,
      endDate: sixMonthsLater,
    },
    {
      user: testUser._id,
      items: [
        {
          product: createdProducts[10]._id,
          productName: createdProducts[10].name,
          monthlyRent: 599,
          tenure: 12,
          quantity: 1,
          securityDeposit: 1500,
        },
      ],
      totalMonthlyRent: 479,
      totalSecurityDeposit: 1500,
      status: 'active',
      deliveryAddress: {
        street: '42 MG Road, Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560034',
      },
      startDate: twoMonthsAgo,
      endDate: new Date(twoMonthsAgo.getTime() + 12 * 30 * 24 * 60 * 60 * 1000),
    },
    {
      user: testUser._id,
      items: [
        {
          product: createdProducts[12]._id,
          productName: createdProducts[12].name,
          monthlyRent: 299,
          tenure: 3,
          quantity: 1,
          securityDeposit: 600,
        },
      ],
      totalMonthlyRent: 299,
      totalSecurityDeposit: 600,
      status: 'completed',
      deliveryAddress: {
        street: '42 MG Road, Koramangala',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560034',
      },
      startDate: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000),
      endDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    },
  ]);

  console.log(`🛒 Created ${orders.length} sample orders\n`);

  // ── Sample Tickets ──
  await Ticket.insertMany([
    {
      user: testUser._id,
      order: orders[0]._id,
      product: createdProducts[0]._id,
      subject: 'Bed frame squeaking noise',
      description: 'The bed frame has started making a squeaking noise when getting up. It seems like one of the joints might be loose. Could you send someone to check?',
      type: 'maintenance',
      status: 'open',
      priority: 'medium',
    },
    {
      user: testUser._id,
      order: orders[1]._id,
      product: createdProducts[10]._id,
      subject: 'TV remote not working',
      description: 'The remote control that came with the TV has stopped responding. I have tried replacing the batteries but it still does not work. Please provide a replacement.',
      type: 'maintenance',
      status: 'in-progress',
      priority: 'low',
      adminNotes: 'Replacement remote has been dispatched. Expected delivery: 2 business days.',
    },
  ]);

  console.log('🎫 Created 2 sample tickets\n');

  // Update stock for ordered products
  await Product.findByIdAndUpdate(createdProducts[0]._id, { $inc: { availableStock: -1 } });
  await Product.findByIdAndUpdate(createdProducts[4]._id, { $inc: { availableStock: -1 } });
  await Product.findByIdAndUpdate(createdProducts[10]._id, { $inc: { availableStock: -1 } });

  console.log('✅ Stock updated for ordered products\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n📋 Login Credentials:');
  console.log('   Admin:  admin@rentease.com / admin123');
  console.log('   User:   user@rentease.com / user123');
  console.log('   Vendor: vendor@rentease.com / vendor123\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

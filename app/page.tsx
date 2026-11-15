import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  CreditCard,
  Truck,
  Bed,
  Sofa,
  Tv,
  AirVent,
  Wrench,
  CalendarRange,
  RotateCcw,
  Users,
  MapPin,
  Package,
  ArrowRight,
  Star,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { MOCK_PRODUCTS, TESTIMONIALS } from '@/lib/mockData';

// ── Static data ───────────────────────────────────────────────────────────────

const categories = [
  {
    name: 'Beds',
    icon: Bed,
    href: '/products?category=furniture&subcategory=Bed',
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=600&q=80',
    color: 'from-blue-600/80 to-blue-900/80',
  },
  {
    name: 'Sofas',
    icon: Sofa,
    href: '/products?category=furniture&subcategory=Sofa',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    color: 'from-purple-600/80 to-purple-900/80',
  },
  {
    name: 'Dining Sets',
    icon: Search,
    href: '/products?category=furniture&subcategory=Table',
    image: 'https://images.unsplash.com/photo-1617098474202-0d0d7f60c788?w=600&q=80',
    color: 'from-amber-600/80 to-amber-900/80',
  },
  {
    name: 'Study & WFH',
    icon: Search,
    href: '/products?category=furniture&subcategory=Desk',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
    color: 'from-green-600/80 to-green-900/80',
  },
  {
    name: 'Refrigerators',
    icon: Search,
    href: '/products?category=appliance&subcategory=Refrigerator',
    image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600&q=80',
    color: 'from-cyan-600/80 to-cyan-900/80',
  },
  {
    name: 'Washing Machines',
    icon: Search,
    href: '/products?category=appliance&subcategory=Washing+Machine',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&q=80',
    color: 'from-indigo-600/80 to-indigo-900/80',
  },
  {
    name: 'TVs',
    icon: Tv,
    href: '/products?category=appliance&subcategory=TV',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=600&q=80',
    color: 'from-rose-600/80 to-rose-900/80',
  },
  {
    name: 'ACs',
    icon: AirVent,
    href: '/products?category=appliance&subcategory=AC',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80',
    color: 'from-teal-600/80 to-teal-900/80',
  },
];

const steps = [
  { icon: Search, title: 'Browse', description: 'Explore 500+ furniture & appliances across all categories' },
  { icon: CalendarRange, title: 'Select Tenure', description: 'Choose 3, 6, or 12-month rental plans with flexible pricing' },
  { icon: CreditCard, title: 'Checkout', description: 'Pay first month rent + a fully refundable security deposit' },
  { icon: Truck, title: 'Doorstep Delivery', description: 'Free delivery & professional setup right at your doorstep' },
];

const benefits = [
  {
    icon: CreditCard,
    title: 'No Upfront Cost',
    description: 'Pay only the monthly rent and a refundable security deposit. No big purchases.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',
  },
  {
    icon: Wrench,
    title: 'Free Maintenance',
    description: 'All repairs and maintenance are covered at zero extra charge throughout your rental.',
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=80',
  },
  {
    icon: CalendarRange,
    title: 'Flexible Tenure',
    description: 'Choose from 3, 6, or 12-month plans. Extend or switch anytime with ease.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: 'Request a free pickup return online. No questions asked, no hidden charges.',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&q=80',
  },
];

const stats = [
  { icon: Package, value: '500+', label: 'Products Available' },
  { icon: Users, value: '10K+', label: 'Happy Customers' },
  { icon: MapPin, value: '100+', label: 'Cities Covered' },
  { icon: ShieldCheck, value: '4.9★', label: 'Average Rating' },
];

// ── Data Fetching ─────────────────────────────────────────────────────────────

async function getFeaturedProducts() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products?limit=8`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    if (data.products?.length) return data.products;
  } catch {
    // ignore – fall through
  }
  // Local mock fallback
  return MOCK_PRODUCTS.slice(0, 8);
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <main className="min-h-screen">

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Background image */}
        <Image
          src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=85"
          alt="Modern furnished living room"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950/90 via-primary-900/80 to-primary-800/60" />
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-2xl">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-sm text-white/90 mb-6">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>Trusted by 10,000+ customers across India</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Rent Premium{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">
                Furniture &amp; Appliances
              </span>{' '}
              the Smart Way
            </h1>

            <p className="mt-6 text-lg md:text-xl text-white/80 leading-relaxed">
              Why buy when you can rent? Get top-brand furniture and home appliances delivered to
              your doorstep at a fraction of the cost. Plans start from just 3 months.
            </p>

            {/* Key perks inline */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
              {['Free Delivery & Setup', 'Free Maintenance', 'Flexible Plans', 'Easy Returns'].map((perk) => (
                <span key={perk} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                  {perk}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn-primary bg-white text-primary-700 hover:bg-gray-100 text-base px-8 py-4">
                Browse Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="#how-it-works" className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border border-white/30 rounded-xl hover:bg-white/10 transition-all duration-200">
                How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ───────────────────────────────────────────────────────── */}
      <section className="bg-primary-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                  <div className="text-xs text-primary-300">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="section-title">Popular Categories</h2>
          <p className="section-subtitle">Find exactly what you need for your space</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} opacity-80 group-hover:opacity-90 transition-opacity`} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3">
                <span className="font-bold text-white text-sm md:text-base text-center leading-tight drop-shadow-lg">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Start renting in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center group">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-200 to-transparent" />
                )}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-50 text-primary-600 mb-4 group-hover:bg-primary-100 transition-colors shadow-sm">
                  <step.icon className="w-8 h-8" />
                </div>
                <div className="text-xs font-bold text-primary-600 mb-2 tracking-widest">STEP {i + 1}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 max-w-[200px] mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ───────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Handpicked items for your home</p>
            </div>
            <Link href="/products" className="hidden sm:inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/products" className="btn-secondary">
              View All Products <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Lifestyle / Why Choose ─────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="section-title">
              Why Choose <span className="text-gradient">RentEase</span>
            </h2>
            <p className="section-subtitle">The smartest way to furnish your home</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, idx) => (
              <div
                key={benefit.title}
                className={`card flex flex-col md:flex-row overflow-hidden hover:shadow-lg transition-shadow group ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="relative w-full md:w-2/5 aspect-[4/3] md:aspect-auto overflow-hidden shrink-0">
                  <Image
                    src={benefit.image}
                    alt={benefit.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                  <div className="absolute inset-0 bg-primary-900/20" />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-600 mb-4">
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-primary-50 to-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">Real stories from happy renters</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="card p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="flex gap-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 leading-relaxed italic flex-1">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1600&q=80"
          alt="Beautifully furnished room"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-primary-900/80" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            Ready to Furnish Your Space?
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Join thousands of happy customers who rent smart. Start browsing our collection today
            and get free delivery at your doorstep.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className="btn-primary bg-white text-primary-700 hover:bg-gray-100 text-base px-10 py-4">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link href="/auth/signup" className="inline-flex items-center justify-center px-10 py-4 text-base font-semibold text-white border border-white/30 rounded-xl hover:bg-white/10 transition-all duration-200">
              Create Account
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

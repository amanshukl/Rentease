import Link from 'next/link';
import {
  Search,
  Clock,
  CreditCard,
  Truck,
  Bed,
  Sofa,
  Table,
  Armchair,
  Refrigerator,
  WashingMachine,
  Tv,
  AirVent,
  Shield,
  Wrench,
  CalendarRange,
  RotateCcw,
  Users,
  MapPin,
  Package,
  ArrowRight,
  Star,
  CheckCircle2,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';

const categories = [
  { name: 'Beds', icon: Bed, href: '/products?subcategory=bed', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
  { name: 'Sofas', icon: Sofa, href: '/products?subcategory=sofa', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
  { name: 'Tables', icon: Table, href: '/products?subcategory=table', color: 'bg-amber-50 text-amber-600 hover:bg-amber-100' },
  { name: 'Chairs', icon: Armchair, href: '/products?subcategory=chair', color: 'bg-green-50 text-green-600 hover:bg-green-100' },
  { name: 'Refrigerators', icon: Refrigerator, href: '/products?subcategory=refrigerator', color: 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100' },
  { name: 'Washing Machines', icon: WashingMachine, href: '/products?subcategory=washing-machine', color: 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
  { name: 'TVs', icon: Tv, href: '/products?subcategory=tv', color: 'bg-rose-50 text-rose-600 hover:bg-rose-100' },
  { name: 'ACs', icon: AirVent, href: '/products?subcategory=ac', color: 'bg-teal-50 text-teal-600 hover:bg-teal-100' },
];

const steps = [
  { icon: Search, title: 'Browse', description: 'Explore our wide collection of furniture & appliances' },
  { icon: CalendarRange, title: 'Select Tenure', description: 'Choose 3, 6, or 12-month rental plans' },
  { icon: CreditCard, title: 'Checkout', description: 'Pay only the first month rent + refundable deposit' },
  { icon: Truck, title: 'Doorstep Delivery', description: 'Free delivery & setup at your doorstep' },
];

const benefits = [
  { icon: CreditCard, title: 'No Upfront Cost', description: 'Pay only the monthly rent and a refundable security deposit. No hefty purchases.' },
  { icon: Wrench, title: 'Free Maintenance', description: 'We cover all maintenance and repairs at no extra charge throughout your rental.' },
  { icon: CalendarRange, title: 'Flexible Tenure', description: 'Choose from 3, 6, or 12-month plans. Extend or return anytime.' },
  { icon: RotateCcw, title: 'Easy Returns', description: 'Hassle-free returns with free pickup. No questions asked.' },
];

const stats = [
  { icon: Package, value: '500+', label: 'Products' },
  { icon: Users, value: '10K+', label: 'Happy Customers' },
  { icon: MapPin, value: '100+', label: 'Cities' },
];

async function getFeaturedProducts() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/products?limit=8`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-white/90 mb-6">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              Trusted by 10,000+ customers across India
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
              Rent Furniture &<br />
              Appliances the{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-400">
                Smart Way
              </span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
              Why buy when you can rent? Get premium furniture and appliances delivered to your
              doorstep at a fraction of the cost. Flexible plans starting from 3 months.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/products" className="btn-primary bg-white text-primary-700 hover:bg-gray-100 text-base px-8 py-4">
                Browse Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="#how-it-works" className="btn-secondary border-white/30 text-white hover:bg-white/10 text-base px-8 py-4">
                How It Works
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative shapes */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-accent-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-40 w-48 h-48 bg-primary-400/20 rounded-full blur-2xl" />
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="section-title">Popular Categories</h2>
          <p className="section-subtitle">Find exactly what you need for your space</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300 group ${cat.color}`}
            >
              <cat.icon className="w-10 h-10 group-hover:scale-110 transition-transform" />
              <span className="font-semibold text-sm">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Renting has never been this easy</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center group">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary-200 to-transparent" />
                )}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-50 text-primary-600 mb-4 group-hover:bg-primary-100 transition-colors">
                  <step.icon className="w-8 h-8" />
                </div>
                <div className="text-xs font-bold text-primary-600 mb-2">STEP {i + 1}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 max-w-[200px] mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Handpicked items for your home</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/products" className="btn-secondary">
              View All Products
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </section>
      )}

      {/* Why Choose RentEase */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">
              Why Choose <span className="text-gradient">RentEase</span>
            </h2>
            <p className="section-subtitle">Experience the best rental service in India</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="card p-6 text-center hover:border-primary-200 group"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary-50 text-primary-600 mb-4 group-hover:bg-primary-100 transition-colors">
                  <benefit.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-white mb-3">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-4xl font-extrabold text-white">{stat.value}</div>
                <div className="text-primary-200 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to Furnish Your Space?
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
            Join thousands of happy customers who rent smart. Start browsing our collection today.
          </p>
          <Link href="/products" className="btn-primary bg-white text-primary-700 hover:bg-gray-100 text-base px-8 py-4">
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>
    </main>
  );
}

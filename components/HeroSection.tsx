import Link from 'next/link';
import {
  Truck,
  ShieldCheck,
  CalendarRange,
  ArrowRight,
  Package,
  Users,
  Star,
} from 'lucide-react';

const benefits = [
  {
    icon: ShieldCheck,
    title: 'No Large Deposits',
    description: 'Minimal security deposit to get started',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Free doorstep delivery & installation',
  },
  {
    icon: CalendarRange,
    title: 'Flexible Tenure',
    description: 'Choose 3, 6, or 12 month plans',
  },
];

const stats = [
  { icon: Package, value: '500+', label: 'Products' },
  { icon: Users, value: '10K+', label: 'Happy Customers' },
  { icon: Star, value: '4.8', label: 'Avg Rating' },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90 mb-6 border border-white/10">
            <Truck className="w-4 h-4" />
            Free delivery on all orders
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Rent Premium{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-emerald-200">
              Furniture & Appliances
            </span>
          </h1>

          {/* Sub-text */}
          <p className="mt-6 text-lg sm:text-xl text-blue-100/80 leading-relaxed max-w-2xl mx-auto">
            Transform your living space without the commitment of buying.
            High-quality furniture and appliances delivered to your doorstep.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold bg-white text-primary-700 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Browse Catalog
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border-2 border-white/25 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              How it Works
            </Link>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="flex items-center gap-3 px-5 py-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10"
              >
                <div className="p-2 bg-white/15 rounded-lg flex-shrink-0">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {benefit.title}
                  </p>
                  <p className="text-xs text-blue-200/70">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-16 flex items-center justify-center gap-8 sm:gap-16">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Icon className="w-5 h-5 text-blue-200" />
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">
                    {stat.value}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-blue-200/70">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
import { Sofa, Mail, Phone, MapPin } from 'lucide-react';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Furniture', href: '/products?category=furniture' },
  { label: 'Appliances', href: '/products?category=appliance' },
  { label: 'About Us', href: '/about' },
];

const supportLinks = [
  { label: 'Contact Us', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-primary-600 rounded-xl text-white">
                <Sofa className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white">
                Rent<span className="text-primary-400">Ease</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Premium furniture and appliance rentals made simple. Transform your
              living space without the commitment of buying.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-400" />
                <span>123 Rental Avenue, Bengaluru, Karnataka 560001</span>
              </li>
              <li>
                <a
                  href="mailto:support@rentease.in"
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-primary-400 transition-colors"
                >
                  <Mail className="w-4 h-4 flex-shrink-0 text-primary-400" />
                  support@rentease.in
                </a>
              </li>
              <li>
                <a
                  href="tel:+911234567890"
                  className="flex items-center gap-3 text-sm text-gray-400 hover:text-primary-400 transition-colors"
                >
                  <Phone className="w-4 h-4 flex-shrink-0 text-primary-400" />
                  +91 12345 67890
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} RentEase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

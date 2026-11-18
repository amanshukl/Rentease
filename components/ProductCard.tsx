'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import { formatCurrency, calculateRentalPrice, cn } from '@/lib/utils';

const FALLBACK_IMG = '/images/placeholder.svg';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    category: string;
    subcategory: string;
    monthlyRent: number;
    securityDeposit: number;
    images: string[];
    brand?: string;
    city?: string;
    condition: 'new' | 'like-new' | 'good';
    availableStock: number;
  };
}

const conditionLabels: Record<string, string> = {
  new: 'Brand New',
  'like-new': 'Like New',
  good: 'Good',
};

const conditionColors: Record<string, string> = {
  new: 'bg-green-100 text-green-800',
  'like-new': 'bg-blue-100 text-blue-800',
  good: 'bg-yellow-100 text-yellow-800',
};

export default function ProductCard({ product }: ProductCardProps) {
  const [imgSrc, setImgSrc] = useState(product.images?.[0] || FALLBACK_IMG);
  const discountedPrice = calculateRentalPrice(product.monthlyRent, 12);
  const hasDiscount = discountedPrice < product.monthlyRent;

  return (
    <Link href={`/products/${product._id}`} className="group">
      <div className="card h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImgSrc(FALLBACK_IMG)}
          />
          {product.availableStock <= 3 && product.availableStock > 0 && (
            <span className="absolute top-3 left-3 badge bg-red-100 text-red-700">
              Only {product.availableStock} left
            </span>
          )}
          {product.availableStock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="badge bg-white text-gray-900 text-sm">Out of Stock</span>
            </div>
          )}
          <span className={cn('absolute top-3 right-3 badge', conditionColors[product.condition])}>
            {conditionLabels[product.condition]}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-primary-600 uppercase tracking-wider">
              {product.subcategory}
            </span>
            {product.brand && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500">{product.brand}</span>
              </>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-3">
            {product.name}
          </h3>

          <div className="mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">
                {formatCurrency(product.monthlyRent)}
              </span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
            {hasDiscount && (
              <p className="text-xs text-green-600 font-medium mt-1">
                From {formatCurrency(discountedPrice)}/mo on 12-month plan
              </p>
            )}
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">
                Deposit: {formatCurrency(product.securityDeposit)}
              </p>
              {product.city && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3 text-primary-500" />
                  {product.city}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

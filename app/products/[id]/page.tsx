'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  ShoppingCart,
  Shield,
  Truck,
  RotateCcw,
  Loader2,
  Package,
  Minus,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency, calculateRentalPrice, cn, getStatusColor } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory: string;
  monthlyRent: number;
  securityDeposit: number;
  images: string[];
  features: string[];
  dimensions?: string;
  brand?: string;
  condition: 'new' | 'like-new' | 'good';
  availableStock: number;
  totalStock: number;
  isActive: boolean;
}

const tenureOptions = [
  { months: 3, label: '3 Months', discount: '0%' },
  { months: 6, label: '6 Months', discount: '10% off' },
  { months: 12, label: '12 Months', discount: '20% off' },
];

const conditionLabels: Record<string, string> = {
  new: 'Brand New',
  'like-new': 'Like New',
  good: 'Good',
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedTenure, setSelectedTenure] = useState(3);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setProduct(data.product || data);

        // Fetch related products
        const productData = data.product || data;
        const relatedRes = await fetch(
          `/api/products?subcategory=${productData.subcategory}&limit=4`
        );
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          setRelatedProducts(
            (relatedData.products || []).filter((p: Product) => p._id !== productData._id).slice(0, 4)
          );
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/products" className="btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  const discountedRent = calculateRentalPrice(product.monthlyRent, selectedTenure);
  const totalFirstPayment = discountedRent * quantity + product.securityDeposit * quantity;
  const inStock = product.availableStock > 0;

  const handleAddToCart = () => {
    if (!inStock) return;
    setAddingToCart(true);
    addItem({
      productId: product._id,
      name: product.name,
      image: product.images[0] || '/images/placeholder.svg',
      monthlyRent: product.monthlyRent,
      securityDeposit: product.securityDeposit,
      tenure: selectedTenure,
      quantity,
    });
    toast.success(`${product.name} added to cart!`);
    setTimeout(() => setAddingToCart(false), 500);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/products" className="hover:text-primary-600 transition-colors">Products</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to catalog
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-square bg-white rounded-2xl border border-gray-100 overflow-hidden mb-4">
              <Image
                src={product.images[selectedImage] || '/images/placeholder.svg'}
                alt={product.name}
                fill
                className="object-contain p-4"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {!inStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="badge bg-white text-gray-900 text-lg px-6 py-2">Out of Stock</span>
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      'relative w-20 h-20 rounded-xl border-2 overflow-hidden flex-shrink-0 transition-colors',
                      selectedImage === idx ? 'border-primary-500' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge bg-primary-50 text-primary-700 capitalize">{product.category}</span>
              <span className="badge bg-gray-100 text-gray-700 capitalize">{product.subcategory.replace('-', ' ')}</span>
              <span className={cn('badge', product.condition === 'new' ? 'bg-accent-100 text-accent-800' : product.condition === 'like-new' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800')}>
                {conditionLabels[product.condition]}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

            {product.brand && (
              <p className="text-gray-500 mb-4">by <span className="font-medium text-gray-700">{product.brand}</span></p>
            )}

            {/* Stock indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className={cn('w-2 h-2 rounded-full', inStock ? 'bg-accent-500' : 'bg-red-500')} />
              <span className={cn('text-sm font-medium', inStock ? 'text-accent-700' : 'text-red-600')}>
                {inStock ? (product.availableStock <= 5 ? `Only ${product.availableStock} left in stock` : 'In Stock') : 'Out of Stock'}
              </span>
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Features */}
            {product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Features</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dimensions */}
            {product.dimensions && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Dimensions</h3>
                <p className="text-sm text-gray-600">{product.dimensions}</p>
              </div>
            )}

            {/* Tenure Selector */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Select Rental Tenure</h3>
              <div className="grid grid-cols-3 gap-3">
                {tenureOptions.map((opt) => {
                  const price = calculateRentalPrice(product.monthlyRent, opt.months);
                  return (
                    <button
                      key={opt.months}
                      onClick={() => setSelectedTenure(opt.months)}
                      className={cn(
                        'relative p-4 rounded-xl border-2 text-center transition-all',
                        selectedTenure === opt.months
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {opt.months > 3 && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 badge bg-accent-100 text-accent-700 text-[10px]">
                          {opt.discount}
                        </span>
                      )}
                      <div className="text-sm font-medium text-gray-900">{opt.label}</div>
                      <div className="text-lg font-bold text-primary-600 mt-1">{formatCurrency(price)}</div>
                      <div className="text-xs text-gray-500">/month</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Quantity</h3>
              <div className="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-6 py-3 font-semibold text-gray-900 border-x border-gray-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.availableStock, q + 1))}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Price Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Rent</span>
                  <div className="text-right">
                    {discountedRent < product.monthlyRent && (
                      <span className="text-gray-400 line-through mr-2">{formatCurrency(product.monthlyRent)}</span>
                    )}
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(discountedRent)} × {quantity}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Security Deposit (refundable)</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(product.securityDeposit)} × {quantity}
                  </span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total First Payment</span>
                  <span className="text-xl font-bold text-primary-600">{formatCurrency(totalFirstPayment)}</span>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
              className="btn-primary w-full text-base py-4"
            >
              {addingToCart ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <ShoppingCart className="w-5 h-5 mr-2" />
              )}
              {!inStock ? 'Out of Stock' : addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="flex flex-col items-center text-center gap-1">
                <Shield className="w-5 h-5 text-accent-600" />
                <span className="text-xs text-gray-500">Quality Assured</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="w-5 h-5 text-accent-600" />
                <span className="text-xs text-gray-500">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <RotateCcw className="w-5 h-5 text-accent-600" />
                <span className="text-xs text-gray-500">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="section-title mb-6">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

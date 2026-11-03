'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatCurrency, calculateRentalPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  MapPin,
  Loader2,
  ShoppingBag,
  CheckCircle,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, totalMonthlyRent, totalSecurityDeposit, removeItem, updateQuantity, updateTenure, clearCart } = useCart();

  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const handlePlaceOrder = async () => {
    if (!session) {
      router.push('/auth/signin?callbackUrl=/cart');
      return;
    }

    if (!address.street || !address.city || !address.state || !address.pincode) {
      toast.error('Please fill in your delivery address');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            tenure: item.tenure,
            quantity: item.quantity,
          })),
          deliveryAddress: address,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to place order');
        return;
      }

      setOrderId(data.order._id);
      setOrderPlaced(true);
      clearCart();
      toast.success('Order placed successfully!');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Order success state
  if (orderPlaced) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-2">
            Your rental order has been placed successfully.
          </p>
          <p className="text-sm text-gray-400 mb-8">
            Order ID: <span className="font-mono font-semibold text-gray-600">{orderId}</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard" className="btn-primary">
              View My Orders
            </Link>
            <Link href="/products" className="btn-secondary">
              Continue Browsing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">
            Looks like you haven&apos;t added any items yet. Browse our catalog to find what you need!
          </p>
          <Link href="/products" className="btn-primary">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/products" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-500 text-sm">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const discountedRent = calculateRentalPrice(item.monthlyRent, item.tenure);
            const hasDiscount = discountedRent < item.monthlyRent;

            return (
              <div key={item.productId} className="card p-4 sm:p-6">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={112}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>

                    {/* Tenure selector */}
                    <div className="flex gap-2 mt-2">
                      {[3, 6, 12].map((t) => (
                        <button
                          key={t}
                          onClick={() => updateTenure(item.productId, t)}
                          className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all ${
                            item.tenure === t
                              ? 'bg-primary-50 border-primary-300 text-primary-700'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {t} mo
                        </button>
                      ))}
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-bold text-gray-900">
                        {formatCurrency(discountedRent)}
                      </span>
                      <span className="text-xs text-gray-500">/month</span>
                      {hasDiscount && (
                        <span className="text-xs text-green-600 font-medium">
                          Save {Math.round(((item.monthlyRent - discountedRent) / item.monthlyRent) * 100)}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Deposit: {formatCurrency(item.securityDeposit)}
                    </p>

                    {/* Quantity & Remove */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Monthly Rent</span>
                <span className="font-medium">{formatCurrency(totalMonthlyRent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Security Deposit</span>
                <span className="font-medium">{formatCurrency(totalSecurityDeposit)}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between text-base">
                <span className="font-semibold text-gray-900">First Payment</span>
                <span className="font-bold text-primary-600">
                  {formatCurrency(totalMonthlyRent + totalSecurityDeposit)}
                </span>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Delivery Address
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Street address"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="input-field text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="input-field text-sm"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="input-field text-sm"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Pincode"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  className="input-field text-sm"
                />
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn-primary w-full justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  Place Order (Mock)
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              This is a demo checkout. No real payment is processed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

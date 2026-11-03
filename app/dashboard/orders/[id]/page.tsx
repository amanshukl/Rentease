'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  RotateCcw,
  Loader2,
  CheckCircle,
  Clock,
  Truck,
} from 'lucide-react';

interface OrderDetail {
  _id: string;
  items: Array<{
    product: string;
    productName: string;
    monthlyRent: number;
    tenure: number;
    quantity: number;
    securityDeposit: number;
  }>;
  totalMonthlyRent: number;
  totalSecurityDeposit: number;
  status: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  startDate: string;
  endDate: string;
  returnRequested: boolean;
  returnDate?: string;
  createdAt: string;
}

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'active', label: 'Delivered & Active', icon: Truck },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
];

export default function OrderDetailPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (session && params.id) {
      fetchOrder();
    }
  }, [session, params.id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      } else {
        toast.error('Order not found');
        router.push('/dashboard');
      }
    } catch {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReturn = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnRequested: true }),
      });
      if (res.ok) {
        toast.success('Return request submitted');
        fetchOrder();
      }
    } catch {
      toast.error('Failed to request return');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Order Details</h1>
          <p className="text-sm text-gray-500 font-mono">ID: {order._id}</p>
        </div>
        <span className={`badge text-sm ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Status Timeline */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Order Status</h2>
        <div className="flex items-center justify-between">
          {statusSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-primary-100' : ''}`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      isCompleted ? 'text-primary-600' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < statusSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      index < currentStepIndex ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Items */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4" /> Items
          </h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-start py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    {item.tenure} months × {item.quantity} unit{item.quantity > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(item.monthlyRent)}/mo
                  </p>
                  <p className="text-xs text-gray-400">
                    Deposit: {formatCurrency(item.securityDeposit)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Monthly Rent</span>
              <span className="font-semibold">{formatCurrency(order.totalMonthlyRent)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-500">Security Deposit</span>
              <span className="font-semibold">{formatCurrency(order.totalSecurityDeposit)}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Rental Period
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Start Date</span>
                <span className="font-medium">{formatDate(order.startDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">End Date</span>
                <span className="font-medium">{formatDate(order.endDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ordered On</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Delivery Address
            </h2>
            <p className="text-sm text-gray-600">
              {order.deliveryAddress.street}<br />
              {order.deliveryAddress.city}, {order.deliveryAddress.state}<br />
              {order.deliveryAddress.pincode}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {order.status === 'active' && !order.returnRequested && (
        <div className="mt-6 card p-6 bg-orange-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Want to return these items?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Submit a return request and we&apos;ll schedule a pickup.
              </p>
            </div>
            <button onClick={handleRequestReturn} className="btn-secondary gap-2">
              <RotateCcw className="w-4 h-4" />
              Request Return
            </button>
          </div>
        </div>
      )}

      {order.returnRequested && (
        <div className="mt-6 card p-6 bg-yellow-50 border-yellow-200">
          <p className="text-sm font-medium text-yellow-800">
            ⏳ Return request submitted. Our team will contact you shortly for pickup scheduling.
          </p>
        </div>
      )}
    </div>
  );
}

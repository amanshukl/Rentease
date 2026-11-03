'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatsCard from '@/components/StatsCard';
import {
  Package,
  ShoppingBag,
  TrendingUp,
  LifeBuoy,
  Users,
  Plus,
  Loader2,
  ArrowRight,
} from 'lucide-react';

interface Analytics {
  totalProducts: number;
  totalOrders: number;
  activeRentals: number;
  monthlyRecurringRevenue: number;
  pendingTickets: number;
  totalUsers: number;
  recentOrders: Array<{
    _id: string;
    user: { name: string; email: string };
    totalMonthlyRent: number;
    status: string;
    createdAt: string;
    items: Array<{ productName: string }>;
  }>;
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session && session.user.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchAnalytics();
    }
  }, [session]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch {
      console.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your rental business</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Products"
          value={analytics.totalProducts}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Active Rentals"
          value={analytics.activeRentals}
          icon={ShoppingBag}
          color="green"
        />
        <StatsCard
          title="Monthly Revenue"
          value={formatCurrency(analytics.monthlyRecurringRevenue)}
          icon={TrendingUp}
          color="purple"
        />
        <StatsCard
          title="Open Tickets"
          value={analytics.pendingTickets}
          icon={LifeBuoy}
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <StatsCard
          title="Total Orders"
          value={analytics.totalOrders}
          icon={ShoppingBag}
          color="blue"
        />
        <StatsCard
          title="Registered Users"
          value={analytics.totalUsers}
          icon={Users}
          color="green"
        />
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monthly</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {analytics.recentOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{order.user?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{order.user?.email || ''}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.items?.map((i) => i.productName).join(', ') || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(order.totalMonthlyRent)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                      order.status === 'active' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {analytics.recentOrders.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">No orders yet</div>
        )}
      </div>
    </div>
  );
}

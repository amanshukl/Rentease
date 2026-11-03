'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  Package,
  ShoppingBag,
  LifeBuoy,
  Loader2,
  RotateCcw,
  ChevronRight,
  Calendar,
  AlertCircle,
} from 'lucide-react';

interface Order {
  _id: string;
  items: Array<{
    productName: string;
    monthlyRent: number;
    tenure: number;
    quantity: number;
  }>;
  totalMonthlyRent: number;
  totalSecurityDeposit: number;
  status: string;
  startDate: string;
  endDate: string;
  returnRequested: boolean;
  createdAt: string;
}

interface Ticket {
  _id: string;
  subject: string;
  type: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rentals' | 'history' | 'tickets'>('rentals');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/dashboard');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const [ordersRes, ticketsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/tickets'),
      ]);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData.tickets || []);
      }
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReturn = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnRequested: true }),
      });
      if (res.ok) {
        toast.success('Return request submitted');
        fetchData();
      } else {
        toast.error('Failed to submit return request');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const activeRentals = orders.filter((o) => o.status === 'active');
  const openTickets = tickets.filter((t) => t.status === 'open' || t.status === 'in-progress');

  const tabs = [
    { id: 'rentals' as const, label: 'Active Rentals', count: activeRentals.length },
    { id: 'history' as const, label: 'Order History', count: orders.length },
    { id: 'tickets' as const, label: 'Support Tickets', count: tickets.length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-gray-500 mt-1">Manage your rentals and support tickets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-100 rounded-xl">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{activeRentals.length}</p>
              <p className="text-sm text-gray-500">Active Rentals</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              <p className="text-sm text-gray-500">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 rounded-xl">
              <LifeBuoy className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{openTickets.length}</p>
              <p className="text-sm text-gray-500">Open Tickets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === tab.id ? 'bg-primary-100 text-primary-700' : 'bg-gray-200 text-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Active Rentals Tab */}
      {activeTab === 'rentals' && (
        <div className="space-y-4">
          {activeRentals.length === 0 ? (
            <div className="card p-12 text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No active rentals</h3>
              <p className="text-gray-500 text-sm mb-4">Start renting premium furniture and appliances today!</p>
              <Link href="/products" className="btn-primary">Browse Products</Link>
            </div>
          ) : (
            activeRentals.map((order) => (
              <div key={order._id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      {order.returnRequested && (
                        <span className="badge bg-orange-100 text-orange-800">Return Requested</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {order.items.map((i) => i.productName).join(', ')}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(order.startDate)} – {formatDate(order.endDate)}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(order.totalMonthlyRent)}/mo
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!order.returnRequested && (
                      <button
                        onClick={() => handleRequestReturn(order._id)}
                        className="btn-secondary text-sm !px-4 !py-2 gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Request Return
                      </button>
                    )}
                    <Link
                      href={`/dashboard/orders/${order._id}`}
                      className="btn-ghost text-sm gap-1"
                    >
                      Details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Order History Tab */}
      {activeTab === 'history' && (
        <div className="card overflow-hidden">
          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 text-sm">Your order history will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monthly</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {order._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(order.totalMonthlyRent)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/orders/${order._id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Support Tickets Tab */}
      {activeTab === 'tickets' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Your Tickets</h3>
            <Link href="/dashboard/tickets" className="btn-primary text-sm !px-4 !py-2">
              <AlertCircle className="w-4 h-4 mr-1" />
              New Ticket
            </Link>
          </div>

          {tickets.length === 0 ? (
            <div className="card p-12 text-center">
              <LifeBuoy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No tickets</h3>
              <p className="text-gray-500 text-sm">Need help? Create a support ticket.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="card p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`badge ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                      <span className="text-xs text-gray-400">{ticket.type}</span>
                      <span className="text-xs text-gray-400">{formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

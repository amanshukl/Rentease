'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  user: { name: string; email: string };
  items: Array<{
    productName: string;
    monthlyRent: number;
    tenure: number;
    quantity: number;
  }>;
  totalMonthlyRent: number;
  totalSecurityDeposit: number;
  status: string;
  returnRequested: boolean;
  createdAt: string;
  startDate: string;
  endDate: string;
}

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user.role === 'admin') fetchOrders();
  }, [session]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success('Order status updated');
        fetchOrders();
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const filtered = orders.filter(
    (o) => statusFilter === 'all' || o.status === statusFilter
  );

  const statuses = ['all', 'pending', 'active', 'completed', 'cancelled'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all capitalize whitespace-nowrap ${
              statusFilter === status
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {status}
            {status !== 'all' && (
              <span className="ml-1.5 text-xs">
                ({orders.filter((o) => o.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Monthly</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((order) => (
                <>
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          setExpandedOrder(expandedOrder === order._id ? null : order._id)
                        }
                        className="flex items-center gap-1 text-sm font-mono text-gray-600 hover:text-primary-600"
                      >
                        {expandedOrder === order._id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        #{order._id.slice(-8)}
                      </button>
                      {order.returnRequested && (
                        <span className="badge bg-orange-100 text-orange-800 text-[10px] mt-1">
                          Return Requested
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">{order.user?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{order.user?.email || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(order.totalMonthlyRent)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1 bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                  {expandedOrder === order._id && (
                    <tr key={`${order._id}-expanded`}>
                      <td colSpan={7} className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</h4>
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between py-1 text-sm">
                                <span className="text-gray-700">{item.productName} × {item.quantity}</span>
                                <span className="text-gray-600">
                                  {formatCurrency(item.monthlyRent)}/mo · {item.tenure}mo
                                </span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Details</h4>
                            <div className="text-sm space-y-1">
                              <p><span className="text-gray-500">Deposit:</span> {formatCurrency(order.totalSecurityDeposit)}</p>
                              <p><span className="text-gray-500">Period:</span> {formatDate(order.startDate)} – {formatDate(order.endDate)}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-sm text-gray-500">No orders found</div>
        )}
      </div>
    </div>
  );
}

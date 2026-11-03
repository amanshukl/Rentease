'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  LifeBuoy,
  Plus,
  Loader2,
  Send,
  X,
} from 'lucide-react';

interface Order {
  _id: string;
  items: Array<{ product: string; productName: string }>;
  status: string;
}

interface Ticket {
  _id: string;
  subject: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  adminNotes?: string;
  order: { _id: string };
  product: { _id: string; name?: string };
  createdAt: string;
  updatedAt: string;
}

export default function TicketsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [form, setForm] = useState({
    orderId: '',
    productId: '',
    subject: '',
    description: '',
    type: 'maintenance',
    priority: 'medium',
  });

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      const [ticketsRes, ordersRes] = await Promise.all([
        fetch('/api/tickets'),
        fetch('/api/orders'),
      ]);
      if (ticketsRes.ok) {
        const data = await ticketsRes.json();
        setTickets(data.tickets || []);
      }
      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOrders(data.orders?.filter((o: Order) => o.status === 'active') || []);
      }
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const selectedOrder = orders.find((o) => o._id === form.orderId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orderId || !form.productId || !form.subject || !form.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Ticket created!');
        setShowForm(false);
        setForm({
          orderId: '',
          productId: '',
          subject: '',
          description: '',
          type: 'maintenance',
          priority: 'medium',
        });
        fetchData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create ticket');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-sm text-gray-500">{tickets.length} ticket{tickets.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary text-sm !px-4 !py-2 gap-1"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* Create Ticket Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Create Support Ticket</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <select
                  value={form.orderId}
                  onChange={(e) => setForm({ ...form, orderId: e.target.value, productId: '' })}
                  className="input-field"
                  required
                >
                  <option value="">Select an order</option>
                  {orders.map((o) => (
                    <option key={o._id} value={o._id}>
                      Order #{o._id.slice(-8)} – {o.items.map((i) => i.productName).join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              {selectedOrder && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                  <select
                    value={form.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">Select a product</option>
                    {selectedOrder.items.map((item) => (
                      <option key={item.product} value={item.product}>
                        {item.productName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="input-field"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="return">Return</option>
                    <option value="complaint">Complaint</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="input-field"
                  placeholder="Brief description of the issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field min-h-[120px] resize-none"
                  placeholder="Provide details about your issue..."
                  required
                />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full justify-center gap-2">
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Send className="w-4 h-4" /> Submit Ticket</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Panel */}
      {selectedTicket && (
        <div className="card p-6 mb-6 border-primary-200 bg-primary-50/30">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-900">{selectedTicket.subject}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status}</span>
                <span className="badge bg-gray-100 text-gray-700">{selectedTicket.type}</span>
                <span className="badge bg-gray-100 text-gray-700">{selectedTicket.priority}</span>
              </div>
            </div>
            <button onClick={() => setSelectedTicket(null)} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">{selectedTicket.description}</p>
          {selectedTicket.adminNotes && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs font-semibold text-blue-800 mb-1">Admin Response</p>
              <p className="text-sm text-blue-700">{selectedTicket.adminNotes}</p>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-3">
            Created {formatDate(selectedTicket.createdAt)} · Updated {formatDate(selectedTicket.updatedAt)}
          </p>
        </div>
      )}

      {/* Ticket List */}
      {tickets.length === 0 ? (
        <div className="card p-12 text-center">
          <LifeBuoy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">No tickets yet</h3>
          <p className="text-gray-500 text-sm">
            Need help with a rental? Create a support ticket and our team will assist you.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <button
              key={ticket._id}
              onClick={() => setSelectedTicket(ticket)}
              className={`card p-4 w-full text-left hover:border-primary-200 transition-colors ${
                selectedTicket?._id === ticket._id ? 'border-primary-300 bg-primary-50/20' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                    <span className="text-xs text-gray-400">{ticket.type}</span>
                    <span className="text-xs text-gray-400">{formatDate(ticket.createdAt)}</span>
                  </div>
                </div>
                <span className={`badge ${
                  ticket.priority === 'high' ? 'bg-red-100 text-red-800' :
                  ticket.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {ticket.priority}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

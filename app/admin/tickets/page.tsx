'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDate, getStatusColor } from '@/lib/utils';
import { Loader2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface Ticket {
  _id: string;
  user: { name: string; email: string };
  subject: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTicketsPage() {
  const { data: session } = useSession();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (session?.user.role === 'admin') fetchTickets();
  }, [session]);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/tickets');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (ticketId: string, status: string, notes?: string) => {
    setUpdating(true);
    try {
      const body: Record<string, string> = { status };
      if (notes !== undefined) body.adminNotes = notes;

      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success('Ticket updated');
        fetchTickets();
        if (selectedTicket?._id === ticketId) {
          const data = await res.json();
          setSelectedTicket(data.ticket);
        }
      }
    } catch {
      toast.error('Failed to update ticket');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = tickets.filter(
    (t) => statusFilter === 'all' || t.status === statusFilter
  );

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-500 text-sm mt-1">{tickets.length} total tickets</p>
      </div>

      {/* Status Filter */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto">
        {['all', 'open', 'in-progress', 'resolved', 'closed'].map((status) => (
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
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Ticket</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((ticket) => (
                    <tr
                      key={ticket._id}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setAdminNotes(ticket.adminNotes || '');
                      }}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedTicket?._id === ticket._id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {ticket.subject}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {ticket.user?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge bg-gray-100 text-gray-700 capitalize">{ticket.type}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${priorityColor(ticket.priority)}`}>{ticket.priority}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(ticket.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500">No tickets found</div>
            )}
          </div>
        </div>

        {/* Ticket Detail Panel */}
        <div className="lg:col-span-1">
          {selectedTicket ? (
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-2">{selectedTicket.subject}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`badge ${getStatusColor(selectedTicket.status)}`}>{selectedTicket.status}</span>
                <span className={`badge ${priorityColor(selectedTicket.priority)}`}>{selectedTicket.priority}</span>
                <span className="badge bg-gray-100 text-gray-700 capitalize">{selectedTicket.type}</span>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-1">From</p>
                <p className="text-sm text-gray-900">{selectedTicket.user?.name}</p>
                <p className="text-xs text-gray-500">{selectedTicket.user?.email}</p>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700">{selectedTicket.description}</p>
              </div>

              {/* Update Status */}
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 mb-1">Update Status</p>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdate(selectedTicket._id, e.target.value)}
                  className="input-field text-sm"
                  disabled={updating}
                >
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Admin Notes */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" /> Admin Notes
                </p>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="input-field text-sm min-h-[80px] resize-none mb-2"
                  placeholder="Add a note for the customer..."
                />
                <button
                  onClick={() => handleUpdate(selectedTicket._id, selectedTicket.status, adminNotes)}
                  disabled={updating}
                  className="btn-primary w-full justify-center text-sm !py-2"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Notes'}
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-4">
                Created {formatDate(selectedTicket.createdAt)}
              </p>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Select a ticket to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

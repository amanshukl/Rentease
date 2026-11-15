import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Ticket from '@/models/Ticket';
import User from '@/models/User';
import { MOCK_ANALYTICS } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    try {
      await dbConnect();

      const [
        totalProducts,
        totalOrders,
        activeRentals,
        activeOrders,
        pendingTickets,
        totalUsers,
        recentOrders,
      ] = await Promise.all([
        Product.countDocuments({ isActive: true }),
        Order.countDocuments(),
        Order.countDocuments({ status: 'active' }),
        Order.find({ status: 'active' }).lean(),
        Ticket.countDocuments({ status: { $in: ['open', 'in-progress'] } }),
        User.countDocuments(),
        Order.find()
          .populate('user', 'name email')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
      ]);

      const now = new Date();
      let totalRevenue = 0;
      let monthlyRecurringRevenue = 0;

      for (const order of activeOrders as any[]) {
        monthlyRecurringRevenue += order.totalMonthlyRent;
        const endDate = new Date(order.endDate);
        const remainingMonths = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        totalRevenue += order.totalMonthlyRent * remainingMonths;
      }

      return NextResponse.json({
        totalProducts,
        totalOrders,
        activeRentals,
        totalRevenue: Math.round(totalRevenue),
        monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue),
        pendingTickets,
        totalUsers,
        recentOrders,
      });
    } catch {
      // DB offline – return mock analytics
      return NextResponse.json(MOCK_ANALYTICS);
    }
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

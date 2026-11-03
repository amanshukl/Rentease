import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Ticket from '@/models/Ticket';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Run all queries in parallel for performance
    const [
      totalProducts,
      totalOrders,
      activeRentals,
      activeOrders,
      pendingTickets,
      totalUsers,
      recentOrders,
    ] = await Promise.all([
      // Total active products
      Product.countDocuments({ isActive: true }),

      // Total orders
      Order.countDocuments(),

      // Active rentals
      Order.countDocuments({ status: 'active' }),

      // Active orders for revenue calculation
      Order.find({ status: 'active' }).lean(),

      // Pending tickets (open or in-progress)
      Ticket.countDocuments({ status: { $in: ['open', 'in-progress'] } }),

      // Total users
      User.countDocuments(),

      // Recent orders (last 5)
      Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Calculate revenue metrics
    const now = new Date();
    let totalRevenue = 0;
    let monthlyRecurringRevenue = 0;

    for (const order of activeOrders as any[]) {
      monthlyRecurringRevenue += order.totalMonthlyRent;

      // Calculate average remaining months
      const endDate = new Date(order.endDate);
      const remainingMs = endDate.getTime() - now.getTime();
      const remainingMonths = Math.max(
        0,
        Math.ceil(remainingMs / (1000 * 60 * 60 * 24 * 30))
      );
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
  } catch (error: any) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

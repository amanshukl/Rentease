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
        allProducts,
        resolvedTickets,
        ordersByUser,
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
        Product.find({ isActive: true }).select('totalStock availableStock').lean(),
        Ticket.find({ status: { $in: ['resolved', 'closed'] } }).select('createdAt updatedAt').lean(),
        Order.aggregate([
          { $group: { _id: '$user', orderCount: { $sum: 1 } } },
        ]),
      ]);

      const now = new Date();
      let totalRevenue = 0;
      let monthlyRecurringRevenue = 0;
      const revenueByCity: Record<string, number> = {};

      for (const order of activeOrders as any[]) {
        monthlyRecurringRevenue += order.totalMonthlyRent;
        const endDate = new Date(order.endDate);
        const remainingMonths = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        totalRevenue += order.totalMonthlyRent * remainingMonths;

        const orderCity = order.deliveryAddress?.city || 'Other';
        revenueByCity[orderCity] = (revenueByCity[orderCity] || 0) + order.totalMonthlyRent;
      }

      // Utilization Rate = (totalRented / totalInventory) * 100
      let totalInventory = 0;
      let totalRented = 0;
      for (const prod of allProducts as any[]) {
        const stock = prod.totalStock || 0;
        const available = prod.availableStock || 0;
        totalInventory += stock;
        totalRented += Math.max(0, stock - available);
      }
      const utilizationRate = totalInventory > 0 ? Math.round((totalRented / totalInventory) * 1000) / 10 : 0;

      // Average Ticket Resolution Time (hours)
      let totalResolutionMs = 0;
      for (const t of resolvedTickets as any[]) {
        if (t.createdAt && t.updatedAt) {
          totalResolutionMs += Math.max(0, new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime());
        }
      }
      const avgResolutionTime =
        resolvedTickets.length > 0
          ? Math.round((totalResolutionMs / resolvedTickets.length / (1000 * 60 * 60)) * 10) / 10
          : 0;

      // Retention Rate = (users with > 1 order / total users with >= 1 order) * 100
      const totalOrderingUsers = ordersByUser.length;
      const repeatUsers = ordersByUser.filter((u: any) => u.orderCount > 1).length;
      const retentionRate =
        totalOrderingUsers > 0 ? Math.round((repeatUsers / totalOrderingUsers) * 1000) / 10 : 0;

      return NextResponse.json({
        totalProducts,
        totalOrders,
        activeRentals,
        totalRevenue: Math.round(totalRevenue),
        monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue),
        pendingTickets,
        totalUsers,
        utilizationRate,
        avgResolutionTime,
        retentionRate,
        revenueByCity,
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

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id)
      .populate('items.product', 'name slug images monthlyRent category subcategory brand condition')
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify the order belongs to the user (unless admin)
    if ((order as any).user.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to view this order' },
        { status: 403 }
      );
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Order fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const isAdmin = session.user.role === 'admin';
    const isOwner = order.user.toString() === session.user.id;

    // Non-admin, non-owner cannot update
    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Not authorized to update this order' },
        { status: 403 }
      );
    }

    // Admin can update order status
    if (isAdmin && body.status) {
      const validTransitions: Record<string, string[]> = {
        pending: ['active', 'cancelled'],
        active: ['completed', 'cancelled'],
        completed: [],
        cancelled: [],
      };

      const allowedNext = validTransitions[order.status] || [];
      if (!allowedNext.includes(body.status)) {
        return NextResponse.json(
          { error: `Cannot transition from '${order.status}' to '${body.status}'` },
          { status: 400 }
        );
      }

      order.status = body.status;

      // Restore product inventory when rental is completed or cancelled
      if (body.status === 'completed' || body.status === 'cancelled') {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { availableStock: item.quantity },
          });
        }
      }
    }

    // Users (or admins) can extend rental tenure for active orders
    if ((isOwner || isAdmin) && body.action === 'extend') {
      if (order.status !== 'active') {
        return NextResponse.json(
          { error: 'Can only extend tenure for active orders' },
          { status: 400 }
        );
      }

      const extendMonths = Number(body.newTenure);
      if (![3, 6, 12].includes(extendMonths)) {
        return NextResponse.json(
          { error: 'Extension tenure must be 3, 6, or 12 months' },
          { status: 400 }
        );
      }

      const previousEndDate = new Date(order.endDate);
      const newEndDate = new Date(order.endDate);
      newEndDate.setMonth(newEndDate.getMonth() + extendMonths);
      order.endDate = newEndDate;

      if (!order.extensionLogs) {
        order.extensionLogs = [];
      }
      order.extensionLogs.push({
        extendedMonths: extendMonths,
        previousEndDate,
        newEndDate,
        requestedAt: new Date(),
      });
    }

    // Users can request return (only for active orders)
    if (isOwner && (body.returnRequested || body.action === 'return')) {
      if (order.status !== 'active') {
        return NextResponse.json(
          { error: 'Can only request return for active orders' },
          { status: 400 }
        );
      }

      order.returnRequested = true;
      order.returnDate = body.returnDate ? new Date(body.returnDate) : new Date();
    }

    // Non-admin users cannot directly change status
    if (!isAdmin && body.status) {
      return NextResponse.json(
        { error: 'Only admins can update order status' },
        { status: 403 }
      );
    }

    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate('items.product', 'name slug images monthlyRent category')
      .lean();

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error('Order update error:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

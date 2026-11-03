import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

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
    }

    // Users can request return (only for active orders)
    if (isOwner && body.returnRequested) {
      if (order.status !== 'active') {
        return NextResponse.json(
          { error: 'Can only request return for active orders' },
          { status: 400 }
        );
      }

      order.returnRequested = true;
      order.returnDate = new Date();
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

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import Order from '@/models/Order';

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

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    // Build query: admin gets all tickets, users get only their own
    const filter: any = {};
    if (session.user.role !== 'admin') {
      filter.user = session.user.id;
    }
    if (status) {
      filter.status = status;
    }

    const tickets = await Ticket.find(filter)
      .populate('order', 'status totalMonthlyRent startDate endDate')
      .populate('product', 'name slug images category')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(tickets);
  } catch (error: any) {
    console.error('Tickets fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const { orderId, productId, subject, description, type, priority } = body;

    // Validate required fields
    if (!orderId || !productId || !subject || !description || !type) {
      return NextResponse.json(
        { error: 'orderId, productId, subject, description, and type are required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['maintenance', 'return', 'complaint', 'other'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate priority if provided
    if (priority) {
      const validPriorities = ['low', 'medium', 'high'];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { error: `Priority must be one of: ${validPriorities.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Verify the order belongs to the user
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.user.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to create a ticket for this order' },
        { status: 403 }
      );
    }

    // Create ticket
    const ticket = await Ticket.create({
      user: session.user.id,
      order: orderId,
      product: productId,
      subject,
      description,
      type,
      priority: priority || 'medium',
    });

    // Populate and return the created ticket
    const populatedTicket = await Ticket.findById(ticket._id)
      .populate('order', 'status totalMonthlyRent startDate endDate')
      .populate('product', 'name slug images category')
      .lean();

    return NextResponse.json(populatedTicket, { status: 201 });
  } catch (error: any) {
    console.error('Ticket creation error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}

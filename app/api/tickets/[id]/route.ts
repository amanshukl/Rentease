import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';

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
        { error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    const ticket = await Ticket.findById(id)
      .populate('order', 'status totalMonthlyRent startDate endDate items')
      .populate('product', 'name slug images category monthlyRent')
      .populate('user', 'name email phone')
      .lean();

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Verify ownership (or admin)
    if ((ticket as any).user._id?.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Not authorized to view this ticket' },
        { status: 403 }
      );
    }

    return NextResponse.json(ticket);
  } catch (error: any) {
    console.error('Ticket fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
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

    // Admin only
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { id } = params;

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, adminNotes } = body;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Update status if provided
    if (status) {
      const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Status must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      ticket.status = status;
    }

    // Update admin notes if provided
    if (adminNotes !== undefined) {
      ticket.adminNotes = adminNotes;
    }

    await ticket.save();

    const updatedTicket = await Ticket.findById(id)
      .populate('order', 'status totalMonthlyRent startDate endDate')
      .populate('product', 'name slug images category')
      .populate('user', 'name email')
      .lean();

    return NextResponse.json(updatedTicket);
  } catch (error: any) {
    console.error('Ticket update error:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    );
  }
}

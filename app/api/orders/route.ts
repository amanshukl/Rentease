import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { calculateRentalPrice } from '@/lib/utils';

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

    // Build query
    const filter: any = { user: session.user.id };
    if (status) {
      filter.status = status;
    }

    // Admin sees all orders; users see only their own
    if (session.user.role === 'admin') {
      delete filter.user;
    }

    const orders = await Order.find(filter)
      .populate('items.product', 'name slug images monthlyRent category')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
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
    const { items, deliveryAddress } = body;

    // Validate request body
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.pincode) {
      return NextResponse.json(
        { error: 'Complete delivery address is required (street, city, state, pincode)' },
        { status: 400 }
      );
    }

    // Validate and process each item
    const orderItems = [];
    let totalMonthlyRent = 0;
    let totalSecurityDeposit = 0;

    for (const item of items) {
      const { productId, tenure, quantity } = item;

      if (!productId || !tenure || !quantity) {
        return NextResponse.json(
          { error: 'Each item must have productId, tenure, and quantity' },
          { status: 400 }
        );
      }

      if (![3, 6, 12].includes(tenure)) {
        return NextResponse.json(
          { error: 'Tenure must be 3, 6, or 12 months' },
          { status: 400 }
        );
      }

      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Product not found: ${productId}` },
          { status: 404 }
        );
      }

      if (product.availableStock < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.availableStock}` },
          { status: 400 }
        );
      }

      const monthlyRent = calculateRentalPrice(product.monthlyRent, tenure);
      const itemMonthlyTotal = monthlyRent * quantity;
      const itemDepositTotal = product.securityDeposit * quantity;

      orderItems.push({
        product: product._id,
        productName: product.name,
        monthlyRent,
        tenure,
        quantity,
        securityDeposit: product.securityDeposit,
      });

      totalMonthlyRent += itemMonthlyTotal;
      totalSecurityDeposit += itemDepositTotal;
    }

    // Calculate dates
    const startDate = new Date();
    // Use the max tenure among items for the order end date
    const maxTenure = Math.max(...items.map((item: any) => item.tenure));
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + maxTenure);

    // Create order
    const order = await Order.create({
      user: session.user.id,
      items: orderItems,
      totalMonthlyRent,
      totalSecurityDeposit,
      status: 'pending',
      deliveryAddress,
      startDate,
      endDate,
    });

    // Decrease available stock for each product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { availableStock: -item.quantity },
      });
    }

    // Clear user's cart
    await User.findByIdAndUpdate(session.user.id, {
      $set: { cart: [] },
    });

    // Populate and return the created order
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name slug images monthlyRent category')
      .lean();

    return NextResponse.json({ order: populatedOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);

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
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

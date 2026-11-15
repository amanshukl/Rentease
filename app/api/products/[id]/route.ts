import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { MOCK_PRODUCTS } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Try DB first
    try {
      await dbConnect();
      if (id.match(/^[0-9a-fA-F]{24}$/)) {
        const product = await Product.findById(id).lean();
        if (product && (product as any).isActive) {
          return NextResponse.json({ product });
        }
      }
    } catch {
      // fall through to mock lookup
    }

    // Mock lookup by id or slug
    const mock = MOCK_PRODUCTS.find((p) => p._id === id || p.slug === id);
    if (mock) {
      return NextResponse.json({ product: mock });
    }

    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  } catch (error) {
    console.error('Product fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

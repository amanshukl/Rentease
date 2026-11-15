import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { MOCK_PRODUCTS } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    try {
      await dbConnect();

      const filter: Record<string, unknown> = { isActive: true };
      if (category) filter.category = category;
      if (subcategory) {
        filter.subcategory = { $regex: new RegExp(subcategory, 'i') };
      }
      if (search) filter.$text = { $search: search };
      if (minPrice || maxPrice) {
        filter.monthlyRent = {} as Record<string, number>;
        if (minPrice) (filter.monthlyRent as Record<string, number>).$gte = parseFloat(minPrice);
        if (maxPrice) (filter.monthlyRent as Record<string, number>).$lte = parseFloat(maxPrice);
      }

      let sortOption: { [key: string]: 1 | -1 } = { createdAt: -1 };
      switch (sort) {
        case 'price-asc': sortOption = { monthlyRent: 1 }; break;
        case 'price-desc': sortOption = { monthlyRent: -1 }; break;
        case 'newest': sortOption = { createdAt: -1 }; break;
        case 'name': sortOption = { name: 1 }; break;
      }

      const skip = (page - 1) * limit;
      const [products, total] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Product.find(filter).sort(sortOption as any).skip(skip).limit(limit).lean(),
        Product.countDocuments(filter),
      ]);

      return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) });
    } catch {
      // ── Offline / no-DB fallback: serve rich mock data ──────────────────
      let results = [...MOCK_PRODUCTS];
      if (category) results = results.filter((p) => p.category === category);
      if (subcategory) results = results.filter((p) => p.subcategory.toLowerCase() === subcategory.toLowerCase());
      if (search) results = results.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
      if (minPrice) results = results.filter((p) => p.monthlyRent >= parseFloat(minPrice));
      if (maxPrice) results = results.filter((p) => p.monthlyRent <= parseFloat(maxPrice));

      switch (sort) {
        case 'price-asc': results.sort((a, b) => a.monthlyRent - b.monthlyRent); break;
        case 'price-desc': results.sort((a, b) => b.monthlyRent - a.monthlyRent); break;
        case 'name': results.sort((a, b) => a.name.localeCompare(b.name)); break;
      }

      const total = results.length;
      const paged = results.slice((page - 1) * limit, page * limit);
      return NextResponse.json({ products: paged, total, page, totalPages: Math.ceil(total / limit), source: 'mock' });
    }
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

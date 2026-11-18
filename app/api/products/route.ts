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
    const condition = searchParams.get('condition');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const city = searchParams.get('city');

    try {
      await dbConnect();

      const filter: Record<string, unknown> = { isActive: true };
      if (category) filter.category = category;
      if (subcategory) {
        filter.subcategory = { $regex: new RegExp(subcategory.replace('-', ' '), 'i') };
      }
      if (condition) filter.condition = condition;
      if (search) filter.$text = { $search: search };
      if (city) filter.city = { $regex: new RegExp(`^${city}$`, 'i') };
      if (minPrice || maxPrice) {
        filter.monthlyRent = {} as Record<string, number>;
        if (minPrice) (filter.monthlyRent as Record<string, number>).$gte = parseFloat(minPrice);
        if (maxPrice) (filter.monthlyRent as Record<string, number>).$lte = parseFloat(maxPrice);
      }

      let sortOption: { [key: string]: 1 | -1 } = { createdAt: -1 };
      switch (sort) {
        case 'price-asc':
        case 'price_asc':
          sortOption = { monthlyRent: 1 };
          break;
        case 'price-desc':
        case 'price_desc':
          sortOption = { monthlyRent: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'name':
          sortOption = { name: 1 };
          break;
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
      if (subcategory) {
        const normalizedSub = subcategory.replace('-', ' ').toLowerCase();
        results = results.filter((p) => p.subcategory.toLowerCase() === normalizedSub);
      }
      if (condition) results = results.filter((p) => p.condition === condition);
      if (search) {
        const q = search.toLowerCase();
        results = results.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            (p.brand && p.brand.toLowerCase().includes(q))
        );
      }
      if (minPrice) results = results.filter((p) => p.monthlyRent >= parseFloat(minPrice));
      if (maxPrice) results = results.filter((p) => p.monthlyRent <= parseFloat(maxPrice));
      if (city) results = results.filter((p) => p.city.toLowerCase() === city.toLowerCase());

      switch (sort) {
        case 'price-asc':
        case 'price_asc':
          results.sort((a, b) => a.monthlyRent - b.monthlyRent);
          break;
        case 'price-desc':
        case 'price_desc':
          results.sort((a, b) => b.monthlyRent - a.monthlyRent);
          break;
        case 'name':
          results.sort((a, b) => a.name.localeCompare(b.name));
          break;
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

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  icon: LucideIcon;
  title: string;
  count: number;
  href: string;
  className?: string;
}

export default function CategoryCard({
  icon: Icon,
  title,
  count,
  href,
  className,
}: CategoryCardProps) {
  return (
    <Link href={href} className={cn('group block', className)}>
      <div className="card p-6 text-center hover:-translate-y-1 transition-all duration-300 h-full">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 group-hover:bg-primary-100 rounded-2xl mb-4 transition-colors duration-300">
          <Icon className="w-8 h-8 text-primary-600" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
          {title}
        </h3>

        {/* Count */}
        <p className="text-sm text-gray-500 mt-1">
          {count} {count === 1 ? 'Product' : 'Products'}
        </p>
      </div>
    </Link>
  );
}

'use client';

import { cn } from '@/lib/utils';
import { formatCurrency, calculateRentalPrice } from '@/lib/utils';
import { Check, TrendingDown } from 'lucide-react';

interface TenureSelectorProps {
  basePrice: number;
  selectedTenure: number;
  onSelect: (tenure: number) => void;
}

const tenures = [
  { months: 3, label: '3 Months', discount: 0 },
  { months: 6, label: '6 Months', discount: 10 },
  { months: 12, label: '12 Months', discount: 20 },
];

export default function TenureSelector({
  basePrice,
  selectedTenure,
  onSelect,
}: TenureSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Select Rental Tenure
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tenures.map((tenure) => {
          const isSelected = selectedTenure === tenure.months;
          const monthlyPrice = calculateRentalPrice(basePrice, tenure.months);

          return (
            <button
              key={tenure.months}
              onClick={() => onSelect(tenure.months)}
              className={cn(
                'relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200',
                isSelected
                  ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-200'
                  : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50/50'
              )}
            >
              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Best Value Badge */}
              {tenure.months === 12 && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 badge bg-accent-500 text-white text-[10px] whitespace-nowrap">
                  Best Value
                </span>
              )}

              {/* Duration */}
              <span
                className={cn(
                  'text-sm font-semibold mb-1',
                  isSelected ? 'text-primary-700' : 'text-gray-700'
                )}
              >
                {tenure.label}
              </span>

              {/* Monthly Price */}
              <span
                className={cn(
                  'text-xl font-bold',
                  isSelected ? 'text-primary-600' : 'text-gray-900'
                )}
              >
                {formatCurrency(monthlyPrice)}
              </span>
              <span className="text-xs text-gray-500">per month</span>

              {/* Discount Indicator */}
              {tenure.discount > 0 && (
                <div className="flex items-center gap-1 mt-2 text-accent-600">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">
                    Save {tenure.discount}%
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

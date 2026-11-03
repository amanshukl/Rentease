import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="p-4 bg-primary-100 rounded-2xl">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
      <p className="text-gray-500 text-sm font-medium">Loading...</p>
    </div>
  );
}

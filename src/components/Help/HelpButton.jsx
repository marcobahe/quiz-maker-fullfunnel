'use client';

import Link from 'next/link';
import { HelpCircle } from 'lucide-react';

export default function HelpButton() {
  return (
    <Link
      href="/help"
      className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-accent hover:bg-accent-hover text-white rounded-full flex items-center justify-center shadow-lg shadow-accent/30 transition-all hover:scale-110 group"
      title="Central de Ajuda"
    >
      <HelpCircle size={22} />
      <span className="absolute right-full mr-3 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Central de Ajuda
      </span>
    </Link>
  );
}

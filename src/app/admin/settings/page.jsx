'use client';

import { Settings } from 'lucide-react';

export default function AdminSettingsPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings size={32} className="text-gray-400" />
          Configurações
        </h1>
        <p className="text-gray-400 mt-1">Configurações da plataforma</p>
      </div>

      <div className="bg-[#151837]/60 backdrop-blur border border-white/10 rounded-2xl p-12 text-center">
        <Settings size={48} className="text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">Em breve</p>
        <p className="text-gray-500 text-sm mt-1">Configurações globais da plataforma</p>
      </div>
    </div>
  );
}

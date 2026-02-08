'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Eye, X } from 'lucide-react';

export default function ImpersonationBanner() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  if (!session?.user?.impersonatingAs) return null;

  const handleStop = async () => {
    try {
      const res = await fetch('/api/admin/impersonate/stop', { method: 'POST' });
      if (res.ok) {
        await updateSession({ stopImpersonating: true });
        router.push('/admin/users');
      }
    } catch (err) {
      console.error('Error stopping impersonation:', err);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-[#F43F5E] text-white px-4 py-2 flex items-center justify-center gap-3 shadow-lg shadow-rose-500/20 text-sm font-medium">
      <Eye size={16} />
      <span>
        👁️ Visualizando como <strong>{session.user.impersonatingName || 'Usuário'}</strong>
      </span>
      <button
        onClick={handleStop}
        className="ml-4 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
      >
        <X size={12} />
        Voltar para Admin
      </button>
    </div>
  );
}

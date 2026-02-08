'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, X, Building2 } from 'lucide-react';

/**
 * Shows a blue/indigo banner at the top when a SaaS admin is browsing
 * another user's workspace (not their own).
 */
export default function AdminWorkspaceBanner() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [context, setContext] = useState(null);

  useEffect(() => {
    // Check for admin workspace context in localStorage
    try {
      const stored = localStorage.getItem('adminWorkspaceContext');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.fromAdmin) {
          setContext(parsed);
        }
      }
    } catch {}
  }, [searchParams]); // re-check when URL changes

  // Only show for SaaS admins
  const role = session?.user?.role;
  if (!context || (role !== 'owner' && role !== 'admin')) {
    return null;
  }

  // Don't show the impersonation banner AND this one at the same time
  if (session?.user?.impersonatingAs) {
    return null;
  }

  const handleExit = () => {
    localStorage.removeItem('adminWorkspaceContext');
    setContext(null);
    router.push('/admin/users');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[9998] bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-4 py-2 flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 text-sm font-medium">
      <Shield size={16} />
      <Building2 size={14} className="opacity-70" />
      <span>
        🔧 Suporte: Acessando workspace <strong>{context.workspaceName}</strong>
        {context.ownerName && <span className="opacity-70"> de {context.ownerName}</span>}
      </span>
      <button
        onClick={handleExit}
        className="ml-4 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
      >
        <X size={12} />
        Voltar para Admin
      </button>
    </div>
  );
}

'use client';

import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import { User, Mail, Lock, Camera, Trash2, ArrowLeft, Check, AlertTriangle, Loader2, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeWorkspaceId') || null;
    }
    return null;
  });

  // Form state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    image: '',
    plan: 'free',
    role: 'user',
    createdAt: '',
    hasPassword: false,
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleWorkspaceChange = (wsId) => {
    setActiveWorkspaceId(wsId);
    localStorage.setItem('activeWorkspaceId', wsId);
  };

  const handleCreateQuiz = async () => {
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Meu Novo Quiz', workspaceId: activeWorkspaceId }),
      });
      if (res.ok) {
        const quiz = await res.json();
        router.push(`/builder/${quiz.id}`);
      }
    } catch (err) {
      console.error('Failed to create quiz:', err);
    }
  };

  // Carregar dados do perfil
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetch('/api/user/profile')
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setProfile(data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  // Salvar perfil
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const body = {
      name: profile.name,
      email: profile.email,
    };

    // Se preencheu senha nova
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setMessage({ type: 'error', text: 'As senhas não coincidem' });
        setSaving(false);
        return;
      }
      if (newPassword.length < 6) {
        setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres' });
        setSaving(false);
        return;
      }
      body.newPassword = newPassword;
      if (profile.hasPassword) {
        body.currentPassword = currentPassword;
      }
    }

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        // Atualiza a sessão do NextAuth com novos dados
        await updateSession({ name: data.name, email: data.email });
        setProfile(prev => ({ ...prev, ...data, hasPassword: prev.hasPassword || !!newPassword }));
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar perfil' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão. Tente novamente.' });
    }
    setSaving(false);
  };

  // Excluir conta
  const handleDeleteAccount = async () => {
    if (deleteText !== 'EXCLUIR') return;
    setDeleting(true);

    try {
      const res = await fetch('/api/user/profile', { method: 'DELETE' });
      if (res.ok) {
        await signOut({ callbackUrl: '/login' });
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Erro ao excluir conta' });
        setDeleting(false);
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro de conexão' });
      setDeleting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-[#0f1129]">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  const planLabels = { free: 'Free', pro: 'Pro', business: 'Business', advanced: 'Advanced', enterprise: 'Enterprise' };
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0f1129]">
      <Sidebar
        onCreateQuiz={handleCreateQuiz}
        onOpenTemplates={() => router.push('/templates')}
        userName={session?.user?.name || session?.user?.email}
        activeWorkspaceId={activeWorkspaceId}
        onWorkspaceChange={handleWorkspaceChange}
      />

      <main className="flex-1 p-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/settings" className="text-sm text-gray-500 dark:text-gray-400 hover:text-accent flex items-center gap-1 mb-3">
            <ArrowLeft size={16} /> Configurações
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <User size={28} className="text-accent" />
            Minha Conta
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Gerencie seus dados pessoais e segurança</p>
        </div>

        {/* Feedback message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            {message.type === 'success' ? <Check size={20} /> : <AlertTriangle size={20} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar + Info card */}
          <div className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur border border-gray-200 dark:border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden border-2 border-accent/20">
                  {profile.image ? (
                    <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={36} className="text-accent" />
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{profile.name || 'Sem nome'}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    profile.plan === 'free' ? 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'
                    : 'bg-accent/10 text-accent'
                  }`}>
                    {planLabels[profile.plan] || profile.plan}
                  </span>
                  {memberSince && (
                    <span className="text-xs text-gray-400">Membro desde {memberSince}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dados pessoais */}
          <div className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-5">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Mail size={18} className="text-accent" />
              Dados Pessoais
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nome</label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-white dark:bg-[#151837]/60 dark:backdrop-blur border border-gray-200 dark:border-white/10 rounded-xl p-6 space-y-5">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Shield size={18} className="text-accent" />
              Segurança
            </h3>

            {!profile.hasPassword && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Você entrou via Google. Defina uma senha para também poder fazer login com email e senha.
                </p>
              </div>
            )}

            {profile.hasPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Senha Atual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {profile.hasPassword ? 'Nova Senha' : 'Definir Senha'}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {newPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition"
                  placeholder="Repita a nova senha"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">As senhas não coincidem</p>
                )}
              </div>
            )}
          </div>

          {/* Botão Salvar */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-accent hover:bg-accent/90 text-white font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check size={18} />
                Salvar Alterações
              </>
            )}
          </button>
        </form>

        {/* Zona perigosa */}
        <div className="mt-10 bg-white dark:bg-[#151837]/60 dark:backdrop-blur border border-red-200 dark:border-red-900 rounded-xl p-6">
          <h3 className="text-base font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 mb-2">
            <Trash2 size={18} />
            Zona Perigosa
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Ao excluir sua conta, todos os seus quizzes, leads, analytics e dados serão permanentemente removidos. Essa ação não pode ser desfeita.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition"
            >
              Excluir minha conta
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Digite <strong>EXCLUIR</strong> para confirmar:
              </p>
              <input
                type="text"
                value={deleteText}
                onChange={e => setDeleteText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-red-300 dark:border-red-800 bg-white dark:bg-white/5 text-gray-800 dark:text-white focus:ring-2 focus:ring-red-500/50 outline-none"
                placeholder="EXCLUIR"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteText !== 'EXCLUIR' || deleting}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Confirmar Exclusão
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteText(''); }}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

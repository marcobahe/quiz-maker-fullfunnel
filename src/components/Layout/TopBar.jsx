'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, Eye, Send, ChevronLeft, Save, Copy, ExternalLink, X, CheckCircle } from 'lucide-react';
import useQuizStore from '@/store/quizStore';
import { useState, useCallback } from 'react';

export default function TopBar({ quizId }) {
  const pathname = usePathname();
  const { quizName, setQuizName, isSaved, nodes, edges, quizStatus, scoreRanges, quizSettings } = useQuizStore();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState(null);
  const [copied, setCopied] = useState(false);

  const tabs = [
    { label: 'Canvas', path: `/builder/${quizId || 'new'}` },
    { label: 'Diagnóstico', path: `/diagnostic/${quizId || 'new'}` },
    { label: 'Integração', path: `/integration/${quizId || 'new'}` },
    { label: 'Analytics', path: `/analytics/${quizId || 'new'}` },
  ];

  const handleNameChange = (e) => {
    setQuizName(e.target.value);
  };

  const handleSave = useCallback(async () => {
    if (!quizId || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: quizName,
          canvasData: JSON.stringify({ nodes, edges }),
          scoreRanges,
          settings: quizSettings,
        }),
      });
      if (res.ok) {
        useQuizStore.getState().saveQuiz();
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  }, [quizId, quizName, nodes, edges, scoreRanges, quizSettings, saving]);

  const handlePublish = useCallback(async () => {
    if (!quizId) return;
    
    // Save first
    await handleSave();
    
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'published',
          name: quizName,
          canvasData: JSON.stringify({ nodes, edges }),
          scoreRanges,
          settings: quizSettings,
        }),
      });
      if (res.ok) {
        const quiz = await res.json();
        useQuizStore.getState().publishQuiz();
        setPublishedSlug(quiz.slug);
        setShowPublishModal(true);
        setCopied(false);
      }
    } catch (err) {
      console.error('Failed to publish:', err);
    }
  }, [quizId, quizName, nodes, edges, handleSave]);

  const quizUrl = publishedSlug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/q/${publishedSlug}` : '';

  const copyLink = () => {
    navigator.clipboard.writeText(quizUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePreview = () => {
    if (quizId) {
      window.open(`/q/${quizId}?preview=true`, '_blank');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft size={24} />
          </Link>
          
          {isEditing ? (
            <input
              type="text"
              value={quizName}
              onChange={handleNameChange}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="text-xl font-semibold text-gray-800 border-b-2 border-accent outline-none bg-transparent"
              autoFocus
            />
          ) : (
            <h1 
              className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-accent transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {quizName}
            </h1>
          )}
          
          <span className={`flex items-center gap-1 text-sm ${isSaved ? 'text-success' : 'text-amber-500'}`}>
            <Check size={16} />
            {isSaved ? 'Salvo' : 'Não salvo'}
          </span>
        </div>

        {/* Center - Tabs */}
        <nav className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path || 
              (tab.label === 'Canvas' && pathname.includes('/builder')) ||
              (tab.label === 'Analytics' && pathname.includes('/analytics'));
            return (
              <Link
                key={tab.path}
                href={tab.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-accent shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave}
            disabled={saving || isSaved}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          <button 
            onClick={handlePreview}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            <Eye size={18} />
            Preview
          </button>
          <button 
            onClick={handlePublish}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors font-medium"
          >
            <Send size={18} />
            Publicar
          </button>
        </div>
      </div>

      {/* Publish Success Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-white text-center">
              <CheckCircle size={48} className="mx-auto mb-3" />
              <h2 className="text-2xl font-bold">Quiz Publicado! 🎉</h2>
              <p className="text-green-100 mt-1">Seu quiz está no ar e pronto para receber respostas</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Link do Quiz</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={quizUrl}
                    readOnly
                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-mono"
                  />
                  <button
                    onClick={copyLink}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      copied 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-accent text-white hover:bg-accent-hover'
                    }`}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={quizUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  <ExternalLink size={18} />
                  Abrir Quiz
                </a>
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors font-medium"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

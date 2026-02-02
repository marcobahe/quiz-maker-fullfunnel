'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, Eye, Send, ChevronLeft, Save } from 'lucide-react';
import useQuizStore from '@/store/quizStore';
import { useState, useCallback } from 'react';

export default function TopBar({ quizId }) {
  const pathname = usePathname();
  const { quizName, setQuizName, isSaved, nodes, edges, quizStatus } = useQuizStore();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const tabs = [
    { label: 'Canvas', path: `/builder/${quizId || 'new'}` },
    { label: 'Diagnóstico', path: `/diagnostic/${quizId || 'new'}` },
    { label: 'Integração', path: `/integration/${quizId || 'new'}` },
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
  }, [quizId, quizName, nodes, edges, saving]);

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
        }),
      });
      if (res.ok) {
        const quiz = await res.json();
        useQuizStore.getState().publishQuiz();
        alert(`Quiz publicado! Link: ${window.location.origin}/q/${quiz.slug}`);
      }
    } catch (err) {
      console.error('Failed to publish:', err);
    }
  }, [quizId, quizName, nodes, edges, handleSave]);

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
              (tab.label === 'Canvas' && pathname.includes('/builder'));
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
    </header>
  );
}

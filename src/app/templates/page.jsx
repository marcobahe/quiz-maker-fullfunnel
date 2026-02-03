'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FileText, Plus, Filter, Search, Sparkles } from 'lucide-react';
import Sidebar from '@/components/Layout/Sidebar';
import { templates, categories } from '@/data/templates';

function TemplateCard({ template, onUse, loading }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-accent/20 transition-all overflow-hidden group">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center text-2xl">
              {template.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 group-hover:text-accent transition-colors">
                {template.name}
              </h3>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
                {template.category}
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          {template.description}
        </p>

        {/* Preview Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span>{template.canvasData.nodes.length} etapas</span>
          <span>{template.scoreRanges.length} resultados</span>
        </div>
      </div>

      {/* Action */}
      <div className="px-6 pb-6">
        <button
          onClick={() => onUse(template)}
          disabled={loading}
          className="w-full bg-accent hover:bg-accent-hover text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <Sparkles size={16} />
              Usar Template
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function EmptyState({ searchQuery, selectedCategory }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center col-span-full">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <FileText size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        {searchQuery || selectedCategory !== 'Todos' 
          ? 'Nenhum template encontrado' 
          : 'Nenhum template disponível'
        }
      </h3>
      <p className="text-gray-500 max-w-md">
        {searchQuery || selectedCategory !== 'Todos'
          ? 'Tente ajustar os filtros ou pesquise por outros termos.'
          : 'Templates aparecerão aqui em breve.'
        }
      </p>
    </div>
  );
}

export default function TemplatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('activeWorkspaceId') || null;
    }
    return null;
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

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

  const handleUseTemplate = async (template) => {
    if (creatingTemplate === template.id) return;
    
    setCreatingTemplate(template.id);
    
    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: template.name,
          canvasData: template.canvasData,
          scoreRanges: template.scoreRanges,
          settings: template.settings,
          workspaceId: activeWorkspaceId
        }),
      });
      
      if (res.ok) {
        const quiz = await res.json();
        router.push(`/builder/${quiz.id}`);
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Erro ao criar quiz');
      }
    } catch (err) {
      console.error('Failed to create quiz from template:', err);
      alert(err.message || 'Erro ao criar quiz. Tente novamente.');
    } finally {
      setCreatingTemplate(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todos' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        onCreateQuiz={handleCreateQuiz} 
        onOpenTemplates={() => {/* Already on templates page */}}
        userName={session?.user?.name || session?.user?.email} 
        activeWorkspaceId={activeWorkspaceId} 
        onWorkspaceChange={handleWorkspaceChange} 
      />
      
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FileText size={28} className="text-accent" />
            Templates de Quiz
          </h1>
          <p className="text-gray-500">Comece rápido com templates prontos para usar</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/20 focus:border-accent outline-none bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Create from Scratch */}
          <button
            onClick={handleCreateQuiz}
            className="flex items-center gap-2 px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-white rounded-lg transition-colors font-medium"
          >
            <Plus size={16} />
            Criar do Zero
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.length === 0 ? (
            <EmptyState searchQuery={searchQuery} selectedCategory={selectedCategory} />
          ) : (
            filteredTemplates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={handleUseTemplate}
                loading={creatingTemplate === template.id}
              />
            ))
          )}
        </div>

        {/* Footer Note */}
        {filteredTemplates.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Todos os templates podem ser totalmente personalizados no builder
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
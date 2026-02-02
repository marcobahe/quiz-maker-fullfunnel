'use client';

import { X, Plus, Trash2, GripVertical } from 'lucide-react';
import useQuizStore from '@/store/quizStore';

export default function PropertiesPanel() {
  const { selectedNode, updateNode, removeNode, gamificationEnabled, toggleGamification } = useQuizStore();

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 h-full flex items-center justify-center">
        <div className="text-center text-gray-400 p-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <p className="font-medium">Nenhum elemento selecionado</p>
          <p className="text-sm mt-1">Clique em um elemento no canvas para editar suas propriedades</p>
        </div>
      </div>
    );
  }

  const { data, type } = selectedNode;

  const handleQuestionChange = (value) => {
    updateNode(selectedNode.id, { question: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...(data.options || [])];
    newOptions[index] = { ...newOptions[index], text: value };
    updateNode(selectedNode.id, { options: newOptions });
  };

  const handleScoreChange = (index, value) => {
    const newOptions = [...(data.options || [])];
    newOptions[index] = { ...newOptions[index], score: parseInt(value) || 0 };
    updateNode(selectedNode.id, { options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(data.options || []), { text: `Opção ${(data.options?.length || 0) + 1}`, score: 0 }];
    updateNode(selectedNode.id, { options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = (data.options || []).filter((_, i) => i !== index);
    updateNode(selectedNode.id, { options: newOptions });
  };

  const handleDelete = () => {
    if (typeof window !== 'undefined' && window.confirm('Tem certeza que deseja excluir este elemento?')) {
      removeNode(selectedNode.id);
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Propriedades</h2>
        <button 
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Node Type */}
        <div className="bg-accent/5 rounded-lg p-3">
          <span className="text-xs font-semibold text-accent uppercase">
            {type === 'single-choice' ? 'Escolha Única' : 
             type === 'multiple-choice' ? 'Múltipla Escolha' :
             type === 'lead-form' ? 'Formulário Lead' :
             type === 'result' ? 'Resultado' : type}
          </span>
        </div>

        {/* Question/Title */}
        {(type === 'single-choice' || type === 'multiple-choice') && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pergunta
              </label>
              <textarea
                value={data.question || ''}
                onChange={(e) => handleQuestionChange(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                rows={3}
                placeholder="Digite sua pergunta..."
              />
            </div>

            {/* Options */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Opções
                </label>
                <button 
                  onClick={addOption}
                  className="text-accent hover:text-accent-hover text-sm font-medium flex items-center gap-1"
                >
                  <Plus size={16} />
                  Adicionar
                </button>
              </div>
              
              <div className="space-y-2">
                {(data.options || []).map((option, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                    <GripVertical size={16} className="text-gray-400 cursor-grab" />
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 bg-white border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-accent focus:border-transparent"
                    />
                    <input
                      type="number"
                      value={option.score || 0}
                      onChange={(e) => handleScoreChange(index, e.target.value)}
                      className="w-16 bg-white border border-gray-200 rounded px-2 py-1.5 text-sm text-center focus:ring-1 focus:ring-accent focus:border-transparent"
                      title="Pontuação"
                    />
                    <button 
                      onClick={() => removeOption(index)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Gamification Toggle */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">Gamificação</p>
                  <p className="text-sm text-gray-500">Mostrar pontos ao responder</p>
                </div>
                <button
                  onClick={toggleGamification}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    gamificationEnabled ? 'bg-accent' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      gamificationEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Lead Form Fields */}
        {type === 'lead-form' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Formulário
            </label>
            <input
              type="text"
              value={data.title || 'Capture seus dados'}
              onChange={(e) => updateNode(selectedNode.id, { title: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        )}

        {/* Result Properties */}
        {type === 'result' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Resultado
            </label>
            <input
              type="text"
              value={data.title || 'Seu Resultado'}
              onChange={(e) => updateNode(selectedNode.id, { title: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
}

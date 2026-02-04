'use client';

import { useState } from 'react';
import { 
  Gamepad2, 
  Trophy, 
  Timer, 
  Heart, 
  BarChart3, 
  Volume2, 
  Share, 
  Crown,
  Zap,
  Target,
  Sparkles,
} from 'lucide-react';
import useQuizStore from '@/store/quizStore';

export default function GamificationSettings() {
  const { quizSettings, updateQuizSettings } = useQuizStore();
  const gamification = quizSettings.gamification || {};

  const handleToggle = (key) => {
    updateQuizSettings({
      gamification: {
        ...gamification,
        [key]: !gamification[key]
      }
    });
  };

  const handleChange = (key, value) => {
    updateQuizSettings({
      gamification: {
        ...gamification,
        [key]: value
      }
    });
  };

  const handleNestedChange = (section, key, value) => {
    updateQuizSettings({
      gamification: {
        ...gamification,
        [section]: {
          ...gamification[section],
          [key]: value
        }
      }
    });
  };

  // Progress bar styles
  const progressStyles = [
    { value: 'simple', label: 'Simples', desc: 'Barra linear básica' },
    { value: 'milestones', label: 'Marcos', desc: 'Pontos de conquista' },
    { value: 'xp', label: 'XP Style', desc: 'Estilo RPG/gaming' },
  ];

  // Streak effects  
  const streakEffects = [
    { value: 'fire', label: '🔥', desc: 'Fogo' },
    { value: 'stars', label: '⭐', desc: 'Estrelas' },
    { value: 'lightning', label: '⚡', desc: 'Raios' },
  ];

  // Sound levels
  const soundLevels = [
    { value: 'subtle', label: 'Sutil', desc: 'Som baixo' },
    { value: 'medium', label: 'Médio', desc: 'Volume normal' },
    { value: 'high', label: 'Alto', desc: 'Som destacado' },
  ];

  // Lives actions
  const livesActions = [
    { value: 'email', label: 'Pedir Email', desc: 'Captura lead antes de continuar' },
    { value: 'partial', label: 'Resultado Parcial', desc: 'Mostra resultado com score atual' },
    { value: 'redirect', label: 'Redirect', desc: 'Redireciona para URL específica' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
          <Gamepad2 size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Gamificação</h2>
          <p className="text-sm text-gray-500">Configure mecânicas de engajamento para seu quiz</p>
        </div>
      </div>

      {/* Engajamento */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={18} className="text-amber-500" />
          <h3 className="font-semibold text-gray-800">Engajamento</h3>
        </div>
        
        <div className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-gray-400" />
                <span className="font-medium text-gray-700">Barra de Progresso Gamificada</span>
              </div>
              <button
                onClick={() => handleToggle('progressBar')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  gamification.progressBar ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    gamification.progressBar ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {gamification.progressBar && (
              <div className="ml-6 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Estilo</label>
                  <div className="grid grid-cols-3 gap-2">
                    {progressStyles.map((style) => (
                      <button
                        key={style.value}
                        onClick={() => handleChange('progressStyle', style.value)}
                        className={`p-2 text-xs rounded-lg border transition-colors ${
                          (gamification.progressStyle || 'simple') === style.value
                            ? 'bg-purple-50 border-purple-200 text-purple-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium">{style.label}</div>
                        <div className="text-[10px] opacity-75">{style.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Streak/Combo */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-gray-400" />
                <span className="font-medium text-gray-700">Streak/Combo</span>
              </div>
              <button
                onClick={() => handleToggle('streak')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  gamification.streak ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    gamification.streak ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {gamification.streak && (
              <div className="ml-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Multiplicador</label>
                    <select
                      value={gamification.streakMultiplier || 2}
                      onChange={(e) => handleChange('streakMultiplier', parseInt(e.target.value))}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value={2}>2x</option>
                      <option value={3}>3x</option>
                      <option value={5}>5x</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Após N acertos</label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={gamification.streakAfter || 3}
                      onChange={(e) => handleChange('streakAfter', parseInt(e.target.value) || 3)}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Efeito Visual</label>
                  <div className="flex gap-2">
                    {streakEffects.map((effect) => (
                      <button
                        key={effect.value}
                        onClick={() => handleChange('streakEffect', effect.value)}
                        className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          (gamification.streakEffect || 'fire') === effect.value
                            ? 'bg-purple-50 border-purple-200 text-purple-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span>{effect.label}</span>
                        <span className="text-xs">{effect.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timer */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Timer size={16} className="text-gray-400" />
                <span className="font-medium text-gray-700">Timer por Pergunta</span>
              </div>
              <button
                onClick={() => handleToggle('timer')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  gamification.timer ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    gamification.timer ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {gamification.timer && (
              <div className="ml-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Segundos</label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={gamification.timerSeconds || 30}
                      onChange={(e) => handleChange('timerSeconds', parseInt(e.target.value) || 30)}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Bônus Rapidez</label>
                    <select
                      value={gamification.speedBonus || 'none'}
                      onChange={(e) => handleChange('speedBonus', e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="none">Sem bônus</option>
                      <option value="low">+10% (rápida)</option>
                      <option value="medium">+25% (muito rápida)</option>
                      <option value="high">+50% (instantânea)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Experiência */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-blue-500" />
          <h3 className="font-semibold text-gray-800">Experiência</h3>
        </div>
        
        <div className="space-y-6">
          {/* Confetti */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎉</span>
              <span className="font-medium text-gray-700">Confetti no Resultado</span>
            </div>
            <button
              onClick={() => handleToggle('confetti')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                gamification.confetti !== false ? 'bg-purple-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  gamification.confetti !== false ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sons */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Volume2 size={16} className="text-gray-400" />
                <span className="font-medium text-gray-700">Sons</span>
              </div>
              <button
                onClick={() => handleToggle('sounds')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  gamification.sounds ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    gamification.sounds ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {gamification.sounds && (
              <div className="ml-6">
                <label className="block text-xs font-medium text-gray-600 mb-1">Volume</label>
                <div className="grid grid-cols-3 gap-2">
                  {soundLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleChange('soundLevel', level.value)}
                      className={`p-2 text-xs rounded-lg border transition-colors ${
                        (gamification.soundLevel || 'medium') === level.value
                          ? 'bg-purple-50 border-purple-200 text-purple-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="font-medium">{level.label}</div>
                      <div className="text-[10px] opacity-75">{level.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mecânicas */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target size={18} className="text-red-500" />
          <h3 className="font-semibold text-gray-800">Mecânicas</h3>
        </div>
        
        <div className="space-y-6">
          {/* Vidas/Corações */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-gray-400" />
                <span className="font-medium text-gray-700">Vidas/Corações</span>
              </div>
              <button
                onClick={() => handleToggle('lives')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  gamification.lives ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    gamification.lives ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {gamification.lives && (
              <div className="ml-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Quantidade</label>
                    <select
                      value={gamification.livesCount || 3}
                      onChange={(e) => handleChange('livesCount', parseInt(e.target.value))}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value={1}>1 vida</option>
                      <option value={3}>3 vidas</option>
                      <option value={5}>5 vidas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ação ao Perder Todas</label>
                    <select
                      value={gamification.livesAction || 'email'}
                      onChange={(e) => handleChange('livesAction', e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {livesActions.map((action) => (
                        <option key={action.value} value={action.value}>{action.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {gamification.livesAction === 'redirect' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">URL do Redirect</label>
                    <input
                      type="url"
                      value={gamification.livesRedirectUrl || ''}
                      onChange={(e) => handleChange('livesRedirectUrl', e.target.value)}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://exemplo.com/game-over"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Social */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Share size={18} className="text-green-500" />
          <h3 className="font-semibold text-gray-800">Social</h3>
        </div>
        
        <div className="space-y-6">
          {/* Leaderboard */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-gray-400" />
              <span className="font-medium text-gray-700">Leaderboard Público</span>
            </div>
            <button
              onClick={() => handleToggle('leaderboard')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                gamification.leaderboard ? 'bg-purple-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  gamification.leaderboard ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Desafiar Amigo */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚔️</span>
                <span className="font-medium text-gray-700">Desafie um Amigo</span>
              </div>
              <button
                onClick={() => handleToggle('challenge')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  gamification.challenge ? 'bg-purple-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    gamification.challenge ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            {gamification.challenge && (
              <div className="ml-6">
                <label className="block text-xs font-medium text-gray-600 mb-1">Texto do Compartilhamento</label>
                <textarea
                  value={gamification.challengeText || 'Acabei de fazer este quiz e consegui {{score}} pontos! Será que você consegue superar? 🔥'}
                  onChange={(e) => handleChange('challengeText', e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="Texto que será compartilhado..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {{`{score}`}} para incluir a pontuação do usuário
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
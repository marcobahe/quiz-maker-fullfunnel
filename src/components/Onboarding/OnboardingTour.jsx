'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Sparkles, ChevronRight, X, Rocket, PartyPopper } from 'lucide-react';

const TOUR_STEPS = [
  {
    target: null, // center modal
    title: 'Bem-vindo ao Quiz Maker! 🎉',
    description: 'Aqui você cria quizzes que convertem visitantes em leads qualificados. Vamos fazer um tour rápido?',
    position: 'center',
  },
  {
    target: '[data-tour="create-quiz"]',
    title: 'Crie seu primeiro Quiz',
    description: 'Clique aqui para criar um quiz do zero ou use um template pronto. É rápido e fácil!',
    position: 'right',
  },
  {
    target: '[data-tour="workspace-switcher"]',
    title: 'Workspace & Times',
    description: 'Organize seus projetos em workspaces diferentes e convide membros do seu time.',
    position: 'right',
  },
  {
    target: null,
    title: 'Canvas Visual',
    description: 'No Canvas, arraste elementos para montar o fluxo do quiz. Perguntas, lógica condicional, tudo visual!',
    position: 'center',
    icon: '🎨',
  },
  {
    target: null,
    title: 'Diagnóstico & Resultados',
    description: 'Configure as faixas de resultado no Diagnóstico. Cada lead recebe uma recomendação personalizada.',
    position: 'center',
    icon: '📊',
  },
  {
    target: null,
    title: 'Publique e Compartilhe! 🚀',
    description: 'Quando estiver pronto, publique e compartilhe o link com seus leads. Acompanhe tudo no Analytics.',
    position: 'center',
    icon: '🚀',
  },
];

export default function OnboardingTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [checked, setChecked] = useState(false);
  const overlayRef = useRef(null);

  // Check if tour should show
  useEffect(() => {
    const done = localStorage.getItem('onboardingTourDone');
    if (done) {
      setChecked(true);
      return;
    }

    // Check server-side flag too
    fetch('/api/user/onboarding')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && !data.onboardingDone) {
          // Small delay to let the dashboard render
          setTimeout(() => setActive(true), 800);
        } else if (data?.onboardingDone) {
          localStorage.setItem('onboardingTourDone', 'true');
        }
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, []);

  const updateSpotlight = useCallback(() => {
    const currentStep = TOUR_STEPS[step];
    if (!currentStep?.target) {
      setSpotlightRect(null);
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      return;
    }

    const el = document.querySelector(currentStep.target);
    if (!el) {
      setSpotlightRect(null);
      setTooltipStyle({
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 8;
    setSpotlightRect({
      top: rect.top - padding,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });

    // Position tooltip
    const pos = currentStep.position || 'right';
    if (pos === 'right') {
      setTooltipStyle({
        position: 'fixed',
        top: Math.max(16, rect.top),
        left: rect.right + 16,
      });
    } else if (pos === 'bottom') {
      setTooltipStyle({
        position: 'fixed',
        top: rect.bottom + 16,
        left: rect.left,
      });
    }
  }, [step]);

  useEffect(() => {
    if (!active) return;
    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [active, step, updateSpotlight]);

  const completeTour = useCallback(() => {
    setActive(false);
    localStorage.setItem('onboardingTourDone', 'true');
    fetch('/api/user/onboarding', { method: 'POST' }).catch(() => {});
  }, []);

  const nextStep = () => {
    if (step < TOUR_STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      completeTour();
    }
  };

  const skipTour = () => {
    completeTour();
  };

  if (!active || !checked) return null;

  const currentStep = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;
  const isFirst = step === 0;
  const isCenter = !currentStep.target;

  return (
    <div className="fixed inset-0 z-[9999]" ref={overlayRef}>
      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={skipTour} />
      
      {/* Spotlight cutout */}
      {spotlightRect && (
        <div
          className="absolute rounded-xl"
          style={{
            ...spotlightRect,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        style={{ ...tooltipStyle, zIndex: 2 }}
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-fade-in"
      >
        {/* Header accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-accent to-purple-400 rounded-t-2xl" />

        <div className="p-5">
          {/* Step icon or illustration */}
          {isFirst && (
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center">
                <Sparkles size={32} className="text-accent" />
              </div>
            </div>
          )}
          {isLast && (
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                <PartyPopper size={32} className="text-green-500" />
              </div>
            </div>
          )}
          {currentStep.icon && !isFirst && !isLast && (
            <div className="flex justify-center mb-3">
              <span className="text-4xl">{currentStep.icon}</span>
            </div>
          )}

          <h3 className="font-bold text-gray-900 text-lg mb-2 text-center">{currentStep.title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed text-center">{currentStep.description}</p>

          {/* Progress */}
          <div className="flex items-center gap-1 justify-center mt-4 mb-3">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-accent' : i < step ? 'w-1.5 bg-accent/40' : 'w-1.5 bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 mt-1">
            <button
              onClick={skipTour}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-2 py-1"
            >
              {isLast ? '' : 'Pular Tour'}
            </button>
            <button
              onClick={nextStep}
              className="bg-accent hover:bg-accent-hover text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-lg shadow-accent/20"
            >
              {isLast ? (
                <>
                  <Rocket size={16} />
                  Começar!
                </>
              ) : isFirst ? (
                <>
                  Vamos lá!
                  <ChevronRight size={16} />
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={skipTour}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

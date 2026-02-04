'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  LayoutGrid,
  Trophy,
  Plug,
  BarChart3,
  Globe,
  ChevronRight,
  ArrowRight,
  Zap,
  Palette,
  Share2,
  Check,
  Star,
  Menu,
  X,
} from 'lucide-react';
import { PLANS, PLAN_ORDER } from '@/lib/plans';

// ── Intersection Observer hook for fade-in ───────────────────
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// ── Reveal wrapper ───────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ── Public Header ────────────────────────────────────────────
function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
              <span className="text-white text-lg font-bold">Q</span>
            </div>
            <span className={`text-lg font-bold transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
              QuizMeBaby
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollTo('features')}
              className={`text-sm font-medium transition-colors hover:text-accent ${scrolled ? 'text-gray-600' : 'text-white/80'}`}
            >
              Features
            </button>
            <button
              onClick={() => scrollTo('how-it-works')}
              className={`text-sm font-medium transition-colors hover:text-accent ${scrolled ? 'text-gray-600' : 'text-white/80'}`}
            >
              Como Funciona
            </button>
            <button
              onClick={() => scrollTo('pricing')}
              className={`text-sm font-medium transition-colors hover:text-accent ${scrolled ? 'text-gray-600' : 'text-white/80'}`}
            >
              Preços
            </button>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className={`text-sm font-medium transition-colors px-4 py-2 rounded-lg ${
                scrolled ? 'text-gray-700 hover:text-accent' : 'text-white/90 hover:text-white'
              }`}
            >
              Entrar
            </Link>
            <Link
              href="/login"
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:shadow-accent/25"
            >
              Começar Grátis
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-gray-700' : 'text-white'}`}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-white/10">
            <nav className="flex flex-col gap-2 pt-4">
              <button
                onClick={() => scrollTo('features')}
                className={`text-left text-sm font-medium px-3 py-2 rounded-lg ${scrolled ? 'text-gray-700 hover:bg-gray-50' : 'text-white/90 hover:bg-white/10'}`}
              >
                Features
              </button>
              <button
                onClick={() => scrollTo('how-it-works')}
                className={`text-left text-sm font-medium px-3 py-2 rounded-lg ${scrolled ? 'text-gray-700 hover:bg-gray-50' : 'text-white/90 hover:bg-white/10'}`}
              >
                Como Funciona
              </button>
              <button
                onClick={() => scrollTo('pricing')}
                className={`text-left text-sm font-medium px-3 py-2 rounded-lg ${scrolled ? 'text-gray-700 hover:bg-gray-50' : 'text-white/90 hover:bg-white/10'}`}
              >
                Preços
              </button>
              <Link
                href="/login"
                className="bg-accent text-white text-sm font-medium px-4 py-2.5 rounded-xl text-center mt-2"
              >
                Começar Grátis
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

// ── Hero Section ─────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4c1d95]" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/30 rounded-full blur-[128px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[128px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Copy */}
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/10">
                <Sparkles size={16} className="text-yellow-400" />
                Builder visual drag & drop
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Crie Quizzes que{' '}
                <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-200 bg-clip-text text-transparent">
                  Convertem
                </span>
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="text-lg sm:text-xl text-purple-200/80 mb-8 leading-relaxed max-w-lg">
                Transforme visitantes em leads qualificados com quizzes interativos. 
                Builder visual, gamificação, analytics e integrações — tudo em uma plataforma.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-xl hover:shadow-accent/30 flex items-center justify-center gap-2 group"
                >
                  Criar Quiz Grátis
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-white/80 hover:text-white font-medium px-6 py-4 rounded-xl border border-white/20 hover:border-white/40 transition-all flex items-center justify-center gap-2"
                >
                  Ver como funciona
                </button>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="flex items-center gap-6 mt-8 text-purple-200/60 text-sm">
                <span className="flex items-center gap-1.5">
                  <Check size={16} className="text-green-400" /> Grátis para começar
                </span>
                <span className="flex items-center gap-1.5">
                  <Check size={16} className="text-green-400" /> Sem cartão de crédito
                </span>
              </div>
            </Reveal>
          </div>

          {/* Right: Mockup */}
          <Reveal delay={200}>
            <div className="relative">
              {/* Browser frame */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Browser toolbar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                    <div className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white/10 rounded-lg px-3 py-1 text-xs text-white/50 text-center">
                      quizmaker.com.br/builder
                    </div>
                  </div>
                </div>

                {/* Fake builder UI */}
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-12 gap-3">
                    {/* Sidebar */}
                    <div className="col-span-3 space-y-2">
                      <div className="bg-white/10 rounded-lg p-2 text-[10px] text-white/70 font-medium">Elementos</div>
                      {['Pergunta', 'Lead Form', 'Resultado'].map((item) => (
                        <div key={item} className="bg-white/5 rounded-lg p-2 text-[10px] text-white/50 border border-white/5">
                          {item}
                        </div>
                      ))}
                    </div>
                    {/* Canvas */}
                    <div className="col-span-9 bg-white/5 rounded-xl p-4 border border-white/10 min-h-[200px] sm:min-h-[260px]">
                      {/* Flow nodes */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="bg-accent/30 border border-accent/50 rounded-lg px-4 py-2 text-xs text-white/90 font-medium">
                          ▶ Início
                        </div>
                        <div className="w-px h-4 bg-accent/30" />
                        <div className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-xs text-white/80 w-full max-w-[200px]">
                          <div className="font-medium mb-1.5">Qual seu objetivo?</div>
                          <div className="space-y-1">
                            <div className="bg-white/10 rounded px-2 py-1 text-[10px]">A) Gerar leads</div>
                            <div className="bg-accent/20 border border-accent/30 rounded px-2 py-1 text-[10px]">B) Engajar audiência</div>
                          </div>
                        </div>
                        <div className="w-px h-4 bg-accent/30" />
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg px-4 py-2 text-xs text-white/80 flex items-center gap-2">
                          <Trophy size={12} /> Resultado
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2 border border-gray-100 animate-float-slow">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 size={16} className="text-green-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">+47%</div>
                  <div className="text-[10px] text-gray-500">conversão</div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2 border border-gray-100 animate-float-slower">
                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Zap size={16} className="text-accent" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">1.2k</div>
                  <div className="text-[10px] text-gray-500">leads/mês</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ── Features Section ─────────────────────────────────────────
const FEATURES = [
  {
    icon: LayoutGrid,
    title: 'Builder Visual',
    description: 'Crie quizzes arrastando e soltando. Fluxos visuais com canvas interativo, sem código.',
    color: 'bg-accent/10 text-accent',
  },
  {
    icon: Sparkles,
    title: 'Templates Prontos',
    description: 'Comece com templates validados para diferentes nichos e objetivos de conversão.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Trophy,
    title: 'Gamificação',
    description: 'Pontuação, rankings e resultados personalizados que engajam e retêm seus visitantes.',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: Plug,
    title: 'Integrações',
    description: 'Conecte com Webhooks, Full Funnel, e mais. Seus leads direto no CRM.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: BarChart3,
    title: 'Analytics Detalhado',
    description: 'Métricas de conversão, drop-off por pergunta, A/B testing e funil completo.',
    color: 'bg-pink-50 text-pink-600',
  },
  {
    icon: Globe,
    title: 'Domínios Customizados',
    description: 'Publique em seu próprio domínio com SSL. White-label completo para agências.',
    color: 'bg-indigo-50 text-indigo-600',
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
              Tudo que você precisa para converter
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Uma plataforma completa para criar, publicar e otimizar quizzes que transformam visitantes em clientes.
            </p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 80}>
              <div className="group p-6 rounded-2xl border border-gray-100 hover:border-accent/20 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How It Works Section ─────────────────────────────────────
const STEPS = [
  {
    number: '01',
    icon: Zap,
    title: 'Crie',
    description: 'Use nosso builder visual para montar o fluxo do seu quiz em minutos. Drag & drop, sem código.',
  },
  {
    number: '02',
    icon: Palette,
    title: 'Personalize',
    description: 'Customize cores, fontes, logo e gamificação. Deixe com a cara da sua marca.',
  },
  {
    number: '03',
    icon: Share2,
    title: 'Publique',
    description: 'Compartilhe via link, embed ou domínio próprio. Colete leads e acompanhe as métricas.',
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Como Funciona</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
              Simples como 1, 2, 3
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Do zero ao quiz publicado em menos de 10 minutos.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {STEPS.map((step, i) => (
            <Reveal key={step.number} delay={i * 150}>
              <div className="relative text-center">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] right-[-40%] h-px bg-gradient-to-r from-accent/30 to-transparent" />
                )}

                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent/10 to-purple-100 flex items-center justify-center">
                    <step.icon size={36} className="text-accent" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-white rounded-lg flex items-center justify-center text-sm font-bold shadow-lg shadow-accent/30">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Social Proof ─────────────────────────────────────────────
function SocialProofSection() {
  const stats = [
    { value: '2.500+', label: 'Quizzes Criados' },
    { value: '150k+', label: 'Leads Capturados' },
    { value: '47%', label: 'Taxa Média de Conversão' },
    { value: '4.9/5', label: 'Satisfação dos Clientes' },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-[#1e1b4b] to-[#4c1d95] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent rounded-full blur-[128px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100}>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-purple-200/70 text-sm sm:text-base">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing Preview ──────────────────────────────────────────
function PricingSection() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Preços</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-3 mb-4">
              Planos para cada fase do seu negócio
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Comece grátis e escale conforme cresce. Sem surpresas.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLAN_ORDER.map((planId, i) => {
            const plan = PLANS[planId];
            return (
              <Reveal key={planId} delay={i * 100}>
                <div
                  className={`relative rounded-2xl p-8 transition-all hover:shadow-xl ${
                    plan.popular
                      ? 'bg-gradient-to-b from-accent to-purple-700 text-white shadow-xl shadow-accent/20 scale-105 border-0'
                      : 'bg-white border border-gray-200 hover:border-accent/30'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                      <Star size={12} /> MAIS POPULAR
                    </div>
                  )}

                  <h3 className={`text-lg font-semibold mb-1 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-4 ${plan.popular ? 'text-purple-200' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                      {plan.priceLabel}
                    </span>
                    <span className={`text-sm ${plan.popular ? 'text-purple-200' : 'text-gray-500'}`}>
                      {plan.period}
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check
                          size={16}
                          className={`mt-0.5 shrink-0 ${plan.popular ? 'text-purple-200' : 'text-accent'}`}
                        />
                        <span className={plan.popular ? 'text-white/90' : 'text-gray-600'}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/login"
                    className={`w-full block text-center py-3 rounded-xl font-medium transition-all ${
                      plan.popular
                        ? 'bg-white text-accent hover:bg-gray-100'
                        : 'bg-accent hover:bg-accent-hover text-white'
                    }`}
                  >
                    {plan.price === 0 ? 'Começar Grátis' : 'Escolher Plano'}
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── CTA Section ──────────────────────────────────────────────
function CTASection() {
  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Pronto para criar quizzes que convertem?
          </h2>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de profissionais que já estão usando QuizMeBaby para capturar leads qualificados.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-xl hover:shadow-accent/30 group"
          >
            Criar Meu Primeiro Quiz
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <p className="text-sm text-gray-400 mt-4">
            Grátis para sempre no plano Free • Sem cartão de crédito
          </p>
        </Reveal>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">Q</span>
              </div>
              <span className="text-white font-bold">QuizMeBaby</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              A plataforma mais completa para criar quizzes interativos que geram leads e conversões.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Builder</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Templates</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Integrações</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Analytics</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Recursos</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pricing" className="hover:text-white transition-colors">Preços</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Suporte</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Privacidade</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} QuizMeBaby. Todos os direitos reservados.
          </p>
          <p className="text-sm flex items-center gap-1">
            Feito com <span className="text-red-400">❤️</span> no Brasil
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── Main Landing Page ────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SocialProofSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronDown,
  HelpCircle,
  BookOpen,
  Link2,
  Mail,
  Sparkles,
  Puzzle,
  Share2,
  BarChart3,
  Globe,
  Users,
  Zap,
  Shield,
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'Como criar meu primeiro quiz?',
    answer: 'Clique em "Criar Quiz" no menu lateral ou use um template pronto. Você será levado ao Canvas visual onde pode arrastar perguntas, adicionar lógica condicional e personalizar cada elemento.',
    icon: Sparkles,
  },
  {
    question: 'Como funciona o Canvas visual?',
    answer: 'O Canvas é um editor drag-and-drop onde você monta o fluxo do quiz. Adicione nós de pergunta, resultado e lógica. Conecte-os com setas para criar o caminho que o lead percorre.',
    icon: BookOpen,
  },
  {
    question: 'Como configurar faixas de resultado?',
    answer: 'Acesse a aba "Diagnóstico" no editor do quiz. Lá você define faixas de pontuação e associa cada faixa a um resultado personalizado com título, descrição e call-to-action.',
    icon: BarChart3,
  },
  {
    question: 'Como publicar e compartilhar meu quiz?',
    answer: 'Após montar o quiz, clique em "Publicar" no topo. Você receberá um link público que pode compartilhar por email, redes sociais ou embedar no seu site.',
    icon: Share2,
  },
  {
    question: 'Como integrar com outras ferramentas?',
    answer: 'Na aba "Integração" do quiz, configure webhooks ou conecte diretamente com Full Funnel. Os leads capturados são enviados automaticamente para sua ferramenta de CRM/email.',
    icon: Puzzle,
  },
  {
    question: 'Como usar domínio personalizado?',
    answer: 'Vá em Configurações → Domínios Personalizados. Adicione seu domínio e configure um CNAME apontando para nosso servidor. Após verificação, seus quizzes terão URLs com sua marca.',
    icon: Globe,
  },
  {
    question: 'Como convidar membros para meu time?',
    answer: 'Acesse Configurações → Time & Workspace. Insira o email do membro e escolha o nível de acesso (Viewer, Editor ou Admin). O usuário precisa ter conta no QuizMeBaby.',
    icon: Users,
  },
  {
    question: 'O que são os testes A/B?',
    answer: 'Os testes A/B permitem criar variantes do seu quiz para testar diferentes abordagens. O tráfego é dividido automaticamente entre as versões e você pode comparar os resultados no Analytics.',
    icon: Zap,
  },
  {
    question: 'Quais são os limites do plano Free?',
    answer: 'O plano Free permite criar até 3 quizzes com funcionalidades básicas. Faça upgrade para Pro ou Business para desbloquear quizzes ilimitados, domínios personalizados e integrações avançadas.',
    icon: Shield,
  },
  {
    question: 'Como exportar meus leads?',
    answer: 'Na página de leads do quiz, clique em "Exportar CSV". Todos os leads com suas respostas, pontuações e dados de contato serão baixados em um arquivo CSV pronto para importar em qualquer ferramenta.',
    icon: BookOpen,
  },
];

const USEFUL_LINKS = [
  { label: 'Criar um quiz do zero', href: '/', desc: 'Vá ao dashboard e clique em "Criar Quiz"' },
  { label: 'Usar templates prontos', href: '/templates', desc: 'Escolha entre templates profissionais' },
  { label: 'Configurar integrações', href: '/integrations', desc: 'Conecte com Full Funnel, webhooks e mais' },
  { label: 'Gerenciar seu time', href: '/settings/team', desc: 'Convide membros e defina permissões' },
  { label: 'Ver Analytics', href: '/analytics', desc: 'Acompanhe performance dos seus quizzes' },
];

function AccordionItem({ item, isOpen, onClick }) {
  const Icon = item.icon;
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <Icon size={18} className="text-accent" />
        </div>
        <span className="flex-1 font-medium text-gray-800 text-sm">{item.question}</span>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="px-5 pb-4 pl-[4.25rem] text-sm text-gray-600 leading-relaxed">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-gray-500 hover:text-gray-700">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <HelpCircle size={24} className="text-accent" />
              Central de Ajuda
            </h1>
            <p className="text-sm text-gray-500">Encontre respostas e aprenda a usar o QuizMeBaby</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* FAQ */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-accent/5 to-purple-50">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <HelpCircle size={18} className="text-accent" />
              Perguntas Frequentes
            </h2>
          </div>
          <div>
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                item={item}
                isOpen={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              />
            ))}
          </div>
        </div>

        {/* Useful Links */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Link2 size={18} className="text-accent" />
              Links Úteis
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {USEFUL_LINKS.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-accent transition-colors">
                    {link.label}
                  </p>
                  <p className="text-xs text-gray-500">{link.desc}</p>
                </div>
                <ChevronDown size={14} className="text-gray-400 -rotate-90" />
              </Link>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="bg-gradient-to-r from-accent/10 to-purple-50 rounded-xl border border-accent/20 p-6 text-center">
          <Mail size={32} className="text-accent mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800 mb-1">Precisa de mais ajuda?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Nossa equipe está pronta para te ajudar. Envie um email e responderemos em até 24h.
          </p>
          <a
            href="mailto:suporte@quizmaker.com.br"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            <Mail size={16} />
            suporte@quizmaker.com.br
          </a>
        </div>
      </div>
    </div>
  );
}

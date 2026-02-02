'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import TopBar from '@/components/Layout/TopBar';
import { Mail, MessageSquare, Database, Webhook, Check, Code, Copy, CheckCircle, Monitor, Smartphone, ExternalLink, Eye, EyeOff } from 'lucide-react';

const integrations = [
  { 
    id: 'email', 
    icon: Mail, 
    name: 'Email Marketing', 
    description: 'Mailchimp, ActiveCampaign, ConvertKit',
    connected: false,
    color: 'bg-blue-500'
  },
  { 
    id: 'crm', 
    icon: Database, 
    name: 'CRM', 
    description: 'HubSpot, Pipedrive, RD Station',
    connected: false,
    color: 'bg-orange-500'
  },
  { 
    id: 'chat', 
    icon: MessageSquare, 
    name: 'Comunicação', 
    description: 'WhatsApp, Telegram, Slack',
    connected: false,
    color: 'bg-green-500'
  },
  { 
    id: 'webhook', 
    icon: Webhook, 
    name: 'Webhook', 
    description: 'Zapier, Make, n8n',
    connected: false,
    color: 'bg-purple-500'
  },
];

// ── Copy button with feedback ────────────────────────────────
function CopyButton({ text, label = 'Copiar' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
        copied
          ? 'bg-green-500 text-white'
          : 'bg-accent text-white hover:bg-accent-hover'
      }`}
    >
      {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
      {copied ? 'Copiado!' : label}
    </button>
  );
}

// ── Embed Section Component ──────────────────────────────────
function EmbedSection({ quizId }) {
  const [quiz, setQuiz] = useState(null);
  const [embedStyle, setEmbedStyle] = useState('inline'); // 'inline' | 'popup'
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('600');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!quizId) return;
    fetch(`/api/quizzes/${quizId}`)
      .then((r) => r.json())
      .then((data) => setQuiz(data))
      .catch(() => {});
  }, [quizId]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://seudominio.com';
  const slug = quiz?.slug || quizId;

  // ── Generated code snippets ──────────────────────────────
  const iframeCode = `<iframe\n  src="${origin}/q/${slug}?embed=true"\n  width="${width}"\n  height="${height}"\n  frameborder="0"\n  style="border:none;"\n  allow="autoplay; fullscreen"\n></iframe>`;

  const popupCode = `<!-- Quiz Maker Embed -->\n<script src="${origin}/embed.js" data-quiz="${slug}"></script>\n<button onclick="QuizMaker.open('${slug}')" style="background:#7c3aed;color:#fff;padding:12px 24px;border:none;border-radius:8px;font-size:16px;cursor:pointer;">Fazer Quiz</button>`;

  const activeCode = embedStyle === 'inline' ? iframeCode : popupCode;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
            <Code className="text-accent" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-lg">Embed do Quiz</h3>
            <p className="text-gray-500 text-sm">Incorpore o quiz em qualquer site ou landing page</p>
          </div>
        </div>
      </div>

      {/* Style Toggle */}
      <div className="px-6 pt-5">
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setEmbedStyle('inline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              embedStyle === 'inline'
                ? 'bg-accent text-white shadow-md shadow-accent/25'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Monitor size={16} />
            Inline (iframe)
          </button>
          <button
            onClick={() => setEmbedStyle('popup')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
              embedStyle === 'popup'
                ? 'bg-accent text-white shadow-md shadow-accent/25'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Smartphone size={16} />
            Popup (modal)
          </button>
        </div>

        {/* Config Options (only for inline) */}
        {embedStyle === 'inline' && (
          <div className="flex gap-4 mb-5">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Largura</label>
              <input
                type="text"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
                placeholder="100% ou 600px"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Altura</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent/30 focus:border-accent outline-none"
                placeholder="600"
              />
            </div>
          </div>
        )}

        {/* Code Snippet */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {embedStyle === 'inline' ? 'Código HTML (iframe)' : 'Código HTML (popup)'}
            </span>
            <CopyButton text={activeCode} />
          </div>
          <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
            <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all leading-relaxed">
              {activeCode}
            </pre>
          </div>
        </div>

        {/* Direct URL */}
        <div className="mb-5">
          <span className="text-sm font-medium text-gray-700 mb-2 block">URL direta do quiz</span>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={`${origin}/q/${slug}`}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-600 text-sm"
            />
            <CopyButton text={`${origin}/q/${slug}`} label="Copiar" />
            <a
              href={`/q/${slug}?preview=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 text-sm transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Preview Toggle */}
        <div className="pb-6">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPreview ? 'Ocultar preview' : 'Mostrar preview'}
          </button>

          {showPreview && (
            <div className="mt-4 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-gray-500 ml-2 font-mono truncate">
                  {origin}/q/{slug}?embed=true
                </span>
              </div>
              <iframe
                src={`/q/${slug}?embed=true&preview=true`}
                width="100%"
                height={embedStyle === 'inline' ? height : '500'}
                style={{ border: 'none', display: 'block' }}
                title="Quiz Preview"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function IntegrationPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar quizId={params.id} />
      
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Integrações</h1>
            <p className="text-gray-500">Conecte seu quiz com suas ferramentas favoritas para automatizar o fluxo de leads.</p>
          </div>

          {/* ── Embed Section ─────────────────────────────── */}
          <div className="mb-8">
            <EmbedSection quizId={params.id} />
          </div>

          {/* ── Integration Cards ─────────────────────────── */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Conexões</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrations.map((integration) => {
                const Icon = integration.icon;
                return (
                  <div 
                    key={integration.id}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${integration.color} rounded-xl flex items-center justify-center`}>
                        <Icon className="text-white" size={24} />
                      </div>
                      {integration.connected && (
                        <span className="flex items-center gap-1 text-sm text-success bg-success/10 px-2 py-1 rounded-full">
                          <Check size={14} />
                          Conectado
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-gray-800 mb-1">{integration.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">{integration.description}</p>
                    
                    <button className={`w-full py-2 rounded-lg font-medium transition-colors ${
                      integration.connected 
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-accent text-white hover:bg-accent-hover'
                    }`}>
                      {integration.connected ? 'Configurar' : 'Conectar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Webhook URL ───────────────────────────────── */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Webhook URL</h3>
            <div className="flex gap-3">
              <input 
                type="text"
                readOnly
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/quizzes/${params.id}/webhook`}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-600 text-sm"
              />
              <CopyButton 
                text={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/quizzes/${params.id}/webhook`}
              />
            </div>
            <p className="text-gray-400 text-sm mt-2">Use esta URL para receber dados em tempo real quando um lead completar o quiz.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

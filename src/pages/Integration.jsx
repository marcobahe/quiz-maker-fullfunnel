import { useParams } from 'react-router-dom';
import TopBar from '../components/Layout/TopBar';
import { Mail, MessageSquare, Database, Webhook, Check } from 'lucide-react';

const integrations = [
  { 
    id: 'email', 
    icon: Mail, 
    name: 'Email Marketing', 
    description: 'Mailchimp, ActiveCampaign, ConvertKit',
    connected: true,
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
    connected: true,
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

export default function Integration() {
  const { id } = useParams();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <TopBar quizId={id} />
      
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Integrações</h1>
            <p className="text-gray-500">Conecte seu quiz com suas ferramentas favoritas para automatizar o fluxo de leads.</p>
          </div>

          {/* Integrations Grid */}
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

          {/* Webhook URL */}
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Webhook URL</h3>
            <div className="flex gap-3">
              <input 
                type="text"
                readOnly
                value="https://api.quizmaker.com/webhook/abc123xyz"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-gray-600 text-sm"
/>
              <button className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover transition-colors">
                Copiar
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-2">Use esta URL para receber dados em tempo real quando um lead completar o quiz.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

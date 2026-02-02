# 🧩 Quiz Maker Full Funnel — Avaliação & Plano de Conclusão

## 📊 Avaliação do Estado Atual

### Stack
- **Frontend:** React 18 + Vite + Tailwind CSS + Zustand + React Flow (@xyflow)
- **Backend:** ❌ Não existe
- **Banco:** ❌ Não existe
- **Auth:** ❌ Não existe
- **Total de código:** ~1.420 linhas em 17 arquivos

### ✅ O que funciona (Frontend/UI)
| Feature | Status | Notas |
|---------|--------|-------|
| Dashboard com métricas e lista de quizzes | ✅ Visual OK | Dados hardcoded |
| Canvas builder com React Flow | ✅ Funcional | Drag & drop, conexões visuais |
| 7 tipos de nó (Start, Single/Multiple Choice, LeadForm, Result, Media, Content) | ✅ Visual OK | Renderizam bonito |
| Painel de Elementos (drag para canvas) | ✅ Funcional | Categorizado (Perguntas, Mídia, Conteúdo, Captura, Final) |
| Painel de Propriedades (editar pergunta/opções/score) | ✅ Funcional | Edição in-place |
| Gamificação (toggle + balões de pontos) | ✅ Visual OK | Animação CSS |
| Página Diagnóstico (saúde do quiz) | ✅ Visual OK | 100% estático |
| Página Integrações (Email, CRM, Chat, Webhook) | ✅ Visual OK | 100% estático |
| UI/UX geral | ✅ Bonita | Gradiente roxo, limpa, profissional |

### 🔴 O que NÃO funciona / Não existe

#### Crítico — Sem Backend
1. **Zero persistência** — recarregou a página, perdeu tudo
2. **Sem banco de dados** — dados são hardcoded no Zustand store
3. **Sem autenticação** — não tem login, não tem usuários
4. **Sem API** — frontend puro, sem comunicação com servidor

#### Quiz Player (a parte que o público vê)
5. **Não existe quiz player** — não tem como alguém RESPONDER o quiz
6. **Sem embed** — não gera código pra colocar em site/landing page
7. **Sem URL pública** — não tem link compartilhável
8. **Sem captura real de leads** — formulário é visual, não salva nada
9. **Sem cálculo de resultado** — scoring engine não existe

#### Builder — Bugs e Limitações
10. **Bug de sintaxe:** `constIcon` no ContentNode (falta espaço: `const Icon`)
11. **Sync de estado quebrado** — React Flow usa estado local via `useNodesState`, PropertiesPanel atualiza Zustand store → canvas não reflete mudanças em tempo real
12. **addNode duplica** — `onDrop` chama `setNodes` com array completo E depois `addNode` (adiciona de novo)
13. **Sem undo/redo**
14. **Drop position ignora viewport** — quando dá zoom/pan, nó cai no lugar errado

#### Páginas Inexistentes
15. Analytics → redireciona pra Dashboard
16. Templates → redireciona pra Dashboard
17. Configurações → redireciona pra Dashboard

#### Integrações (core do produto)
18. **Sem integração WhatsApp** — nosso maior diferencial!
19. **Sem integração GHL** — essencial pra Full Funnel
20. **Sem webhook real**
21. **Sem integração de email**

---

## 🏗️ Plano de Desenvolvimento — 4 Fases

### FASE 1: Fundação (3-5 dias)
> Objetivo: Backend funcional, persistência, o quiz FUNCIONA de ponta a ponta.

#### 1.1 Backend + Banco
- **Supabase** como backend (já temos conta: marcobahe@gmail.com)
- Tabelas: `users`, `quizzes`, `questions`, `options`, `leads`, `results`, `analytics`
- Row Level Security (multi-tenant ready)
- API via Supabase client (sem server separado)

#### 1.2 Autenticação
- Supabase Auth (email/senha + magic link)
- Middleware de proteção de rotas no React Router

#### 1.3 CRUD de Quizzes
- Criar, editar, salvar, deletar quizzes
- Salvar estado do canvas (nodes + edges) como JSON
- Auto-save a cada 30 segundos

#### 1.4 Corrigir Bugs do Builder
- Fix `constIcon` → `const Icon`
- Fix sync React Flow ↔ Zustand (usar single source of truth)
- Fix `addNode` duplicação no `onDrop`
- Fix drop position considerando viewport transform
- Adicionar undo/redo (zustand middleware)

#### 1.5 Quiz Player MVP
- Rota pública: `/q/:slug` — qualquer pessoa acessa sem login
- Renderiza perguntas na ordem do fluxo
- Segue branching logic (baseado nas edges do canvas)
- Calcula score em tempo real
- Exibe resultado final
- Responsivo (mobile-first — quiz geralmente é respondido no celular)

#### 1.6 Lead Capture
- Formulário de lead funcional (nome, email, telefone)
- Salva no Supabase
- Dispara evento (pra webhook depois)

**Entregável Fase 1:** Quiz funcional end-to-end. Marco cria quiz no builder → publica → compartilha link → lead responde → dados salvos.

---

### FASE 2: Integrações (3-4 dias)
> Objetivo: Conectar com GHL e WhatsApp — os diferenciais matadores.

#### 2.1 Webhook
- Disparo automático ao completar quiz (POST com dados do lead + respostas + score)
- URL configurável por quiz
- Retry com backoff
- Log de disparos

#### 2.2 Integração GHL (GoHighLevel)
- Webhook para GHL Workflows (o mais rápido)
- Criar/atualizar contato no CRM via API
- Custom fields: score do quiz, categoria resultado, respostas
- Tags automáticas baseadas no resultado

#### 2.3 Integração WhatsApp (via Fullzapp/Waha)
- Enviar resultado personalizado via WhatsApp ao completar quiz
- Template de mensagem configurável
- Variáveis: `{{nome}}`, `{{resultado}}`, `{{score}}`, `{{categoria}}`
- Botão no resultado: "Receber no WhatsApp"

#### 2.4 Embed Widget
- Gerar `<script>` ou `<iframe>` para embed
- Widget popup (trigger por botão, scroll, tempo)
- Inline embed (dentro de div)
- Personalização: cor, tamanho, posição
- Landing page standalone (hosted pelo Quiz Maker)

**Entregável Fase 2:** Quiz se integra com GHL + WhatsApp + embed em qualquer site.

---

### FASE 3: Analytics & Templates (2-3 dias)
> Objetivo: Dados e facilidade de uso.

#### 3.1 Analytics Real
- Visualizações, completions, drop-off por pergunta
- Taxa de conversão (views → leads)
- Gráficos: funil, timeline, heatmap de respostas
- Dashboard por quiz e global

#### 3.2 Templates
- Biblioteca de templates pré-prontos (PT-BR!)
- Categorias: Lead Gen, E-commerce, Educação, Saúde, Marketing
- "Diagnóstico de Maturidade Digital" como template showcase
- Um clique pra duplicar e personalizar

#### 3.3 Página de Resultados Avançada
- Múltiplos resultados por faixa de score
- Resultados com imagem, CTA personalizado
- Redirect automático após resultado
- Compartilhar resultado nas redes sociais

#### 3.4 Diagnóstico Real
- Validação automática do fluxo do quiz
- Detectar nós órfãos (sem conexão)
- Verificar se tem resultado configurado
- Checar se scoring está completo

**Entregável Fase 3:** Analytics funcional, templates PT-BR, resultados avançados.

---

### FASE 4: Polish & SaaS (2-3 dias)
> Objetivo: Produto pronto pra vender.

#### 4.1 Multi-tenant
- Workspaces/organizações
- Planos: Free (1 quiz, 100 leads/mês) / Pro (ilimitado) / Agency (white label)
- Limites por plano

#### 4.2 UI Polish
- Configurações do usuário (perfil, senha, plano)
- Tela de onboarding
- Empty states bonitos
- Loading skeletons
- Notificações/toasts
- Responsividade completa

#### 4.3 Domínio Customizado
- Quiz publicado em domínio próprio (ou subdomínio Quiz Maker)
- SSL automático
- White label: remover "Powered by Full Funnel Quiz"

#### 4.4 Deploy
- Frontend: Vercel (já temos conta)
- Backend: Supabase (já temos conta)
- CDN para assets

**Entregável Fase 4:** SaaS pronto pra vender. Full Quiz como produto.

---

## 🎯 Prioridades Imediatas (esta semana)

### Sprint 1 — Os próximos 3 dias:
1. ✅ Fix bugs do builder (1-2h)
2. ✅ Setup Supabase + schema do banco (2-3h)
3. ✅ Auth + proteção de rotas (2-3h)
4. ✅ CRUD de quizzes com persistência (3-4h)
5. ✅ Quiz Player MVP funcional (4-6h)
6. ✅ Lead capture salvando no banco (1-2h)

### Sprint 2 — Dias 4-7:
7. Webhook funcional (2-3h)
8. Integração GHL (3-4h)
9. Integração WhatsApp (3-4h)
10. Embed widget (2-3h)

---

## 📐 Arquitetura Proposta

```
quiz-maker-fullfunnel/
├── src/
│   ├── components/
│   │   ├── Canvas/         # Builder canvas (React Flow)
│   │   ├── Dashboard/      # Métricas, tabela
│   │   ├── Gamification/   # Pontos, badges
│   │   ├── Layout/         # Sidebar, TopBar
│   │   ├── Panels/         # Elements, Properties
│   │   └── Player/         # 🆕 Quiz Player components
│   ├── hooks/              # 🆕 Custom hooks
│   ├── lib/                # 🆕 Supabase client, utils
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── CanvasBuilder.jsx
│   │   ├── Diagnostic.jsx
│   │   ├── Integration.jsx
│   │   ├── Analytics.jsx   # 🆕
│   │   ├── Templates.jsx   # 🆕
│   │   ├── Settings.jsx    # 🆕
│   │   ├── Login.jsx       # 🆕
│   │   └── QuizPlayer.jsx  # 🆕 (rota pública /q/:slug)
│   ├── store/
│   │   └── quizStore.js    # Zustand (refatorar)
│   ├── services/           # 🆕 API calls, webhooks
│   └── types/              # 🆕 (se migrar pra TS)
├── supabase/               # 🆕 Migrations, seed
└── ...
```

### Schema do Banco (Supabase)

```sql
-- Usuários (gerenciado pelo Supabase Auth)

-- Quizzes
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft', -- draft, published, archived
  canvas_data JSONB, -- nodes + edges do React Flow
  settings JSONB DEFAULT '{}', -- gamification, colors, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Leads capturados
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  answers JSONB, -- { questionId: selectedOptionId, ... }
  score INTEGER DEFAULT 0,
  result_category TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Analytics events
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes NOT NULL,
  event TEXT NOT NULL, -- 'view', 'start', 'answer', 'lead', 'complete'
  question_id TEXT,
  data JSONB DEFAULT '{}',
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Integrations config
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes NOT NULL,
  type TEXT NOT NULL, -- 'webhook', 'ghl', 'whatsapp', 'email'
  config JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 💡 Decisão Necessária do Marco

**Opção A: Manter como feature do Full Funnel**
- Embed dentro do GHL (iframe/widget)
- Não precisa de auth próprio (usa auth do Full Funnel)
- Mais rápido de entregar
- Revenue via snapshot/add-on

**Opção B: SaaS independente (Full Quiz)**
- Produto standalone com login próprio
- Pode vender fora do ecossistema GHL
- Mais trabalho, mas mais potencial de mercado
- Revenue: assinatura mensal recorrente

**Opção C: Ambos (recomendada)**
- Core é o SaaS standalone
- Integração nativa com GHL como diferencial
- Pode ser usado dentro E fora do Full Funnel
- Máximo alcance de mercado

---

*Avaliação realizada por Fully — 02/02/2026*
*Repo: github.com/marcobahe/quiz-maker-fullfunnel*

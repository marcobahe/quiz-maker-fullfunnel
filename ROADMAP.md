# 🗺️ ROADMAP — Quiz Maker Full Funnel

> Plano de implementação completo. Atualizar conforme avançamos.

---

## Fase 1 — MVP Comercializável ⚡
**Objetivo:** Produto funcional que pode ser vendido.
**Prazo estimado:** 1-2 semanas

### 1.1 Resultados com Faixas de Pontuação
- [ ] Configurar faixas no builder (ex: 0-30 = Perfil A, 31-60 = Perfil B)
- [ ] Página de resultado dinâmica baseada na pontuação
- [ ] Título, descrição e imagem customizáveis por faixa
- [ ] CTA (botão de ação) por faixa de resultado

### 1.2 Temas e Branding
- [ ] Seletor de cores primária/secundária por quiz
- [ ] Upload de logo
- [ ] Escolha de fonte (3-5 opções)
- [ ] Background customizável (cor sólida, gradiente, imagem)
- [ ] Preview em tempo real das customizações

### 1.3 Embed via iframe
- [ ] Gerar código de embed copiável
- [ ] Player responsivo que se adapta ao container
- [ ] Comunicação postMessage para altura dinâmica
- [ ] Opção de popup/modal

### 1.4 Webhook + Integração GHL
- [ ] Disparar webhook ao capturar lead (URL configurável)
- [ ] Payload customizável (lead data + respostas + score + resultado)
- [ ] Integração nativa GoHighLevel (criar/atualizar contato)
- [ ] Teste de webhook direto da UI

### 1.5 Export de Leads
- [ ] Download CSV com todos os leads
- [ ] Filtros por data e quiz
- [ ] Incluir respostas e pontuação no export

---

## Fase 2 — Diferenciais Competitivos 🚀
**Objetivo:** Features que fazem o produto se destacar.
**Prazo estimado:** 2-3 semanas

### 2.1 Templates Prontos
- [ ] Library de 5-10 templates (diagnóstico, perfil, lead gen, etc.)
- [ ] Preview de cada template
- [ ] "Usar template" → cria quiz pré-populado
- [ ] Categorização por nicho/objetivo

### 2.2 Custom Domains (CNAME)
- [ ] UI para configurar domínio personalizado
- [ ] Verificação DNS automática
- [ ] SSL automático via Let's Encrypt / Cloudflare
- [ ] Roteamento multi-tenant por hostname

### 2.3 Lógica Condicional Avançada
- [ ] Regras condicionais visuais no edge (if score > X, if opção = Y)
- [ ] Variáveis dinâmicas (nome do lead, score atual) no texto
- [ ] Skip logic (pular perguntas baseado em respostas anteriores)

### 2.4 Analytics Robustos
- [ ] Funil de drop-off (onde as pessoas abandonam)
- [ ] Tempo médio por pergunta
- [ ] Taxa de conversão por quiz
- [ ] Gráficos visuais (charts)
- [ ] Comparação entre períodos

### 2.5 A/B Testing
- [ ] Criar variantes de um quiz
- [ ] Split de tráfego configurável (50/50, 70/30, etc.)
- [ ] Dashboard comparativo de performance
- [ ] Declarar vencedor e redirecionar 100%

---

## Fase 3 — Monetização e Escala 💰
**Objetivo:** Billing, multi-tenant, white-label.
**Prazo estimado:** 2-3 semanas

### 3.1 Planos e Billing (Stripe)
- [ ] 3 planos: Free / Pro / Business
- [ ] Limites por plano (quizzes, leads/mês, features)
- [ ] Checkout com Stripe
- [ ] Portal do cliente (gerenciar assinatura)
- [ ] Trial de 14 dias no Pro

### 3.2 White-Label Completo
- [ ] Remover branding "Quiz Maker" para plano Business
- [ ] Favicon e título customizáveis
- [ ] Email de notificação com branding do cliente

### 3.3 Multi-Workspace / Times
- [ ] Convidar membros para workspace
- [ ] Roles (admin, editor, viewer)
- [ ] Workspace switcher

### 3.4 Landing Page e Onboarding
- [ ] Landing page pública do produto
- [ ] Tour guiado no primeiro acesso
- [ ] Documentação/help center
- [ ] Exemplos de quizzes públicos

---

## Fase 4 — Expansão 🌍
**Objetivo:** Features avançadas para escala.

### 4.1 API Pública
- [ ] REST API para criar/gerenciar quizzes programaticamente
- [ ] API keys e rate limiting
- [ ] Documentação Swagger/OpenAPI

### 4.2 Integrações Nativas
- [ ] Zapier / Make (Integromat)
- [ ] ActiveCampaign
- [ ] Mailchimp
- [ ] HubSpot
- [ ] Google Sheets

### 4.3 Features Avançadas
- [ ] Quiz com timer (countdown por pergunta)
- [ ] Randomização de perguntas/opções
- [ ] Mídia nas opções (imagem em cada alternativa)
- [ ] Quiz multi-idioma
- [ ] Remarketing pixel (Facebook, Google)

---

## Status Atual
- **Fase atual:** Fase 1
- **Próximo item:** 1.1 — Resultados com Faixas de Pontuação
- **Última atualização:** 2026-02-02

---

## Fase 5 — Features Avançadas 🚀
**Objetivo:** Diferenciação máxima no mercado.

### 5.1 Calculadora / Estimador 🧮
- [ ] Novo tipo de projeto: "Calculadora" (além de Quiz)
- [ ] Campos numéricos com sliders, inputs, dropdowns
- [ ] Fórmulas configuráveis (soma, multiplicação, regras condicionais)
- [ ] Resultado calculado em tempo real
- [ ] Templates: ROI, Orçamento, Economia, Preço Personalizado
- [ ] Compartilha mesma infraestrutura de leads/integrações/embed do Quiz

### 5.2 Agendamento Inteligente pós-Quiz 📅
- [ ] Embed de calendário na tela de resultado (configurável por score range)
- [ ] Integração nativa com calendários Full Funnel (Agende Conosco / Suporte)
- [ ] API free-slots pra mostrar horários reais
- [ ] Book automático ao selecionar horário
- [ ] Dados do lead pré-preenchidos no agendamento

### 5.3 Tracking de Campanhas (UTMs + Ad IDs) 📊
- [ ] Capturar UTMs da URL no Quiz Player (utm_source, utm_medium, utm_campaign, utm_content, utm_term)
- [ ] Capturar fbclid (Meta) e gclid (Google) automaticamente
- [ ] Capturar referrer da página
- [ ] Salvar dados de campanha no Lead (banco)
- [ ] Incluir no payload do webhook (campo "attribution")
- [ ] Incluir no payload da integração Full Funnel / GHL
- [ ] Dashboard de analytics por campanha/source
- [ ] Repassar como custom fields no GHL (utm_source → campo customizado)

### 5.4 Gamificação Avançada 🎮
- [ ] Mystery Box (elemento revelação)
- [ ] Card Flip (elemento revelação)
- [ ] Slot Machine (elemento revelação)
- [ ] Aba Gamificação: progress bar, streak, timer, confetti, sons, vidas, leaderboard, share


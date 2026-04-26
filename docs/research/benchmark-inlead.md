# Benchmark inLead (BR) — QuizMeBaby

> **Analyzer** · MSE · 2026-04-22 · ICO-153 (EP-BENCHMARK / Goal D23)
> Escopo: análise profunda de `inlead.digital` (features, pricing, UX, integrações, público, gaps) + matriz comparativa vs. base atual do QuizMeBaby.

---

## 1. Resumo Executivo

- **inLead é o player de referência em "funis interativos" no Brasil** — se posiciona como a *"primeira plataforma brasileira"* e construiu ecossistema completo (blog, newsletter, help center, pool de influencers). É a benchmark a bater no mercado BR de infoprodutos.
- **Reputação sólida:** Reclame Aqui 8.2/10 ("Ótimo"), Verificada, 94.1% de reclamações resolvidas, 23h tempo médio de resposta. 36 reclamações em 6 meses para uma base que a própria empresa reivindica >12k assinantes (taxa baixa).
- **4 tiers de pricing (R$97 → R$497/mês), sem plano grátis, sem trial público.** Linha gated por volume de leads, com webhook como gatekeeper do PRO.
- **Foco é laser em infoprodutos/lançamentos brasileiros** — não tem e-commerce nativo, não tem recomendação de produto, não tem AI, não tem multi-workspace/teams real, não tem API pública, não tem A/B testing, templates page é vazia.
- **Gaps exploráveis pelo QuizMeBaby:**
  1. **Teams/Workspace** — temos roles reais (owner/admin/editor/viewer); inLead só oferece "edição compartilhada" no ELITE.
  2. **A/B testing nativo** — já modelado no nosso schema; inLead não tem.
  3. **Integração GHL nativa** — nosso integration model já suporta; inLead só tem webhook genérico.
  4. **AI Analysis, Calculadora standalone, Agendamento pós-quiz** — inLead não faz, nossa roadmap Fase 5 faz.
  5. **Edge delivery (Cloudflare KV)** — performance mundial superior; inLead auto-declara "funciona em todos os países" mas sem CDN declarado.
  6. **Plano free/trial** — inLead não tem; é barreira real de conversão. Oportunidade de aquisição.
- **Gaps onde inLead tem vantagem:** autoridade de marca, social proof brasileiro (Bressan, Lucas Roudi, Matheus Sanfer etc.), integrações nativas com 10 gateways BR, comunidade/conteúdo orgânico, 3+ anos de maturidade de produto.
- **SO WHAT?** Para ganhar market share no BR, QuizMeBaby precisa (a) **atacar onde inLead é fraco** (teams, A/B, AI, e-commerce) e (b) **eliminar fricção de aquisição** (plano free/trial) e (c) **construir social proof BR rápido** (cases com produtores de conteúdo que a inLead não pegou ainda). O produto técnico já está competitivo ou superior em várias dimensões — falta *posicionamento* e *GTM*.

---

## 2. Dados Verificados de Negócio (inLead)

| Campo | Valor | Fonte |
|---|---|---|
| Razão social | inlead LTDA | Rodapé `inlead.digital` |
| CNPJ | 55.751.771/0001-02 | [Reclame Aqui](https://www.reclameaqui.com.br/empresa/inlead-digital-ltda/) |
| HQ | Navarro Building (Sala 707), R. Jaír Martins Mil Homens, 500 — São José do Rio Preto — SP 15090-080 | Rodapé site |
| Tempo de mercado | ~2 anos cadastrada no Reclame Aqui (2024–2026) | Reclame Aqui |
| Domínio principal | `inlead.digital` (migrou do `inlead.online` após incidente em 2025) | [Comunicado](https://inlead.digital/comunicados/mudancas-inlead-digital) |
| Fundador/rosto | Alexandre Murari (CEO, autor do blog + newsletter + YouTube) | Blog |
| Contatos | contato@inlead.digital · suporte@inlead.digital · Instagram @inlead.oficial · LinkedIn /inlead-oficial | Site + RA |
| Canal YouTube | 1.51k subscribers (pequeno) | inlead YT |
| Reputação RA | **8.2/10 "Ótimo"** + Selo RA Verificada | [RA](https://www.reclameaqui.com.br/empresa/inlead-digital-ltda/) |
| Reclamações 6m | 36 · 100% respondidas · 94.1% resolvidas · 64.7% voltaria a fazer negócio · nota dos avaliados 7.0 | RA (01/10/2025–31/03/2026) |
| Tempo médio de resposta | 23h | RA |

**Claims da própria empresa (NÃO verificados independentemente):** +5M acessos diários, +12k assinantes ativos, +100 novos assinantes/dia, *"presente em pelo menos 5 continentes"*. Fonte: `/sobre`. **INFERÊNCIA:** números parecem otimistas — um canal YouTube de 1.5k inscritos sugere base ativa/engajada menor que os 12k. Tratar como *aspiracional*, não como *fato*.

---

## 3. Posicionamento & Narrativa

### Tagline principal
> *"Aumente seu faturamento criando funis de vendas sem depender de VSLs, Typebots ou Páginas de Vendas."*

### Proposta de valor (3 pilares que eles martelam)
1. **Leads Qualificados** — segmentação desde o 1º clique via quiz.
2. **Eficiência na Venda** — funil simples > página estática tradicional.
3. **Retenção e Engajamento** — personalização por etapa.

### Frases-chave que repetem
- *"interatividade aumenta a permanência do lead em até 2x mais, impulsionando sua conversão em até 40%"* (sem fonte verificável no site)
- *"redução de até 40% no CPL"* (help center)
- *"O lançamento do futuro não é o que mais promete, mas o que melhor escuta."* (catchphrase própria)

### Target declarado
- **Infoprodutores** (tráfego qualificado, front-end, maximizar cliques)
- **Agências** (experiências personalizadas, high-ticket, segmentação)
- **E-commerces** (ofertas/cupons personalizados por comportamento) — *mas sem integração real com plataformas*
- **Lançamentos** (entrada interativa no lugar de VSL/iscas genéricas)

### Social proof (influencers do nicho BR)
Matheus Bressan (@bressan.ads) · Lucas Roudi (@lucasroudi) · Matheus Sanfer (@matheussanfer) · Milena Peclat · Kevones · Douglas Souza · Eriksen Guimarães · Antônio Carneiro · Henrique Carvalho · Diego Brandão. Depoimentos em vídeo + texto no /sobre e /planos.

---

## 4. Pricing (4 Tiers — Confirmados)

Fonte canônica: [help center — Como Funcionam os Planos](https://ajuda.inlead.digital/como-funcionam-os-planos-e-os-funis-na-inlead) (mais completo que `/planos` pública).

| Plano | Mensal | Anual (~) | Funis | Leads/mês | Destaques |
|---|---|---|---|---|---|
| **BASIC** | R$ 97 | R$ 1.164 | 2 | 5.000 | Componentes + domínio próprio + pixels/scripts + download de leads |
| **PRO** ⭐ | R$ 197 | R$ 2.364 | 5 | 10.000 | BASIC + **Webhook** |
| **ELITE** | R$ 297 | R$ 3.564 | 10 | 25.000 | PRO + Compartilhamento de funis + Edição compartilhada |
| **SCALE** | R$ 497 | R$ 5.964 | 25 | 100.000 | ELITE + Suporte por videochamada |

⚠️ **Inconsistência de comunicação detectada:** a página pública `/planos` lista "Webhook" nos três tiers visíveis (BASIC, PRO, ELITE) e *não mostra o SCALE*. O help center (canonical interno) coloca webhook só a partir de PRO + inclui SCALE. Isso é *ou* bug do site *ou* prática comercial questionável. Vale documentar como ponto a ser limpo na nossa própria comunicação.

**Sem plano grátis · sem trial público · planos específicos para Hotmart e Kirvano** (`/planos/hotmart`, `/planos/kirvano`) — estratégia de afiliação/parceria com os dois gateways.

---

## 5. Matriz de Features — inLead vs. QuizMeBaby

Legenda: ✅ existe · 🟡 parcial · ❌ não existe · 🔵 roadmap

### 5.1 Builder & Editor
| Feature | inLead | QuizMeBaby | Observação |
|---|---|---|---|
| Builder visual drag-and-drop | ✅ blocos | ✅ React Flow canvas | Nosso canvas é mais *nodal* (fluxo visual tipo n8n/ReactFlow); deles é mais *linear/sequencial* (pilha de blocos) |
| Undo/redo | ? não documentado | ❌ (gap AUDIT) | Parity gap |
| Auto-save | implícito | ✅ 2s debounce | Deles não documenta intervalo |
| Edição compartilhada | ✅ ELITE+ | ✅ multi-workspace + roles | Nosso é mais robusto (roles granulares) |
| Templates library | 🟡 só 1 template público visível | 🔵 Fase 3.2 roadmap | Gap deles também — oportunidade |

### 5.2 Lógica & Personalização
| Feature | inLead | QuizMeBaby |
|---|---|---|
| Sistema de score (acumulador) | ✅ SCORE global + faixas | ✅ scoreRanges |
| Faixas de resultado | ✅ intervalos E (min≤score≤max) | ✅ |
| Validador textual (CONTÉM) | ✅ VALORES com CONTÉM | 🟡 (via answers JSON) |
| Condicional por componente | ✅ regras de exibição | 🟡 (via branching edges) |
| Variáveis dinâmicas | ✅ ${nome}, ${idOpcao} | ✅ (`src/lib/dynamicVariables.js` — AUDIT flagged XSS risk) |
| Parâmetros URL passthrough | ✅ | 🟡 (UTMs capturados) |
| Shuffle de perguntas | ? não documentado | ✅ `shuffleQuestions` |
| Timer por pergunta | ? não documentado | ✅ `questionTimer` |
| Skip logic | ✅ (via condicional) | 🟡 (via edges) |

### 5.3 Componentes
| Componente | inLead | QuizMeBaby |
|---|---|---|
| Texto, botão, escolha única/múltipla | ✅ | ✅ |
| Captura (nome/email/WhatsApp) | ✅ LeadForm | ✅ LeadForm |
| Vídeo, imagem | ✅ | ✅ |
| Gráfico | ✅ | ❌ |
| Timer de escassez | ✅ | ❌ |
| Scripts personalizados (custom JS) | ✅ | 🟡 |
| Calculadora IMC (embutida) | ✅ | ❌ |
| Calculadora standalone | ❌ | 🔵 Fase 5.1 |
| Rolagem automática (scroll-to) | ✅ | ❌ |
| Emojis nas opções | ✅ doc | ✅ (nativo) |
| Gamificação (Mystery Box, Card Flip, Slot) | ❌ | 🔵 Fase 5.4 |

### 5.4 Publicação & Hosting
| Feature | inLead | QuizMeBaby |
|---|---|---|
| Quiz player público | ✅ `inlead.digital/{slug}` | ✅ `play.quizmebaby.app/{slug}` + `/q/{slug}` |
| Domínio próprio (CNAME) | ✅ | ✅ (Cloudflare Worker + KV) |
| SSL automático | ✅ | ✅ |
| Embed iframe | ? não documentado | 🔵 Fase 1.3 roadmap |
| Edge/CDN | genérico | ✅ **Cloudflare KV edge** (diferencial de performance) |
| White-label (remover "Criado via inlead") | ❌ visto em TODOS os funis de cliente | 🔵 Fase 4.2 |

### 5.5 Integrações & Tracking
| Integração | inLead | QuizMeBaby |
|---|---|---|
| Webhook | ✅ PRO+ (ou BASIC, ambíguo) | ✅ `webhookDispatcher` |
| Zapier | ✅ logo homepage | 🔵 Fase 4.2 |
| Make | ✅ + tutorial | 🔵 |
| Pixel Meta + eventos | ✅ + eventos personalizados | ✅ |
| GA4 | implícito | ✅ |
| GTM | ? | ✅ |
| GoHighLevel (GHL) | ❌ sem menção | ✅ nativo (`Integration.type=gohighlevel`) |
| RD Station | ✅ (fonte 3rd party) | ❌ |
| Mailchimp / ActiveCampaign / HubSpot | ✅ (3rd party) | 🔵 Fase 4.2 |
| Gateways BR (Hotmart, Kiwify, Eduzz, Kirvano, Ticto, Monetizze, PerfectPay, Braip, Lastlink, Green) | ✅ 10 gateways | ❌ (apenas Stripe como billing próprio) |
| WhatsApp nativo (send resultado) | ❌ | 🔵 roadmap (via Fullzapp/Waha) |
| API pública | ❌ | 🔵 Fase 4.1 |
| UTMs + fbclid/gclid | 🟡 (URL params) | ✅ `Lead.attribution` JSONB |
| Tracking de geolocalização | ? | ✅ country/region/city |

### 5.6 Leads & Analytics
| Feature | inLead | QuizMeBaby |
|---|---|---|
| Dashboard de leads | ✅ | ✅ |
| Download CSV | ✅ | ✅ + filtros de data |
| Abandono por etapa | ✅ documentado | 🔵 (AnalyticsEvent modelado) |
| Funil drop-off visual | 🟡 | 🔵 Fase 2.4 |
| Tempo médio por pergunta | 🟡 | 🔵 |
| Email notifications de leads quentes | ❌ | ✅ (instant-hot / daily / weekly) |
| A/B testing nativo | ❌ | ✅ (parent/variants + splitPercent) |

### 5.7 Times, Billing & Plataforma
| Feature | inLead | QuizMeBaby |
|---|---|---|
| Multi-workspace | 🟡 "compartilhamento" ELITE+ | ✅ `Workspace` model |
| Roles de membros | ❌ (só "edição compartilhada") | ✅ owner/admin/editor/viewer |
| Self-service billing | ✅ (checkout próprio) | ✅ Stripe |
| Plano free | ❌ | ✅ (plan="free" default) |
| Trial | ❌ | depende do Stripe |
| Onboarding guiado | ? | 🔵 |
| LGPD | ✅ declarado | assumido |

### 5.8 AI / Automação
| Feature | inLead | QuizMeBaby |
|---|---|---|
| AI Analysis de respostas | ❌ | ✅ (flagged no AUDIT — precisa timeout) |
| AI prompts / geração de quiz | ❌ (blog fala, produto não faz) | 🔵 |

---

## 6. Análise de UX do Funil Público (amostra)

Amostra analisada: `/bussolariqueza`, `/musclelab`, `/treino-personalizado-2026`, `/dieta-22-dias`, `/cortisol-kalmy`, `/workshop-depois-do-trauma`.

**Padrão que se repete:**
1. Hero com imagem + headline com promessa numérica ("perder R$25k/ano", "emagrecer 5kg em 30 dias")
2. Pergunta inicial de qualificação (idade / gênero / perfil)
3. Opções visuais com imagem + label (cards clicáveis)
4. Sequência de 3–10 perguntas com score acumulado
5. Captura de lead (nome + email + WhatsApp)
6. Página de resultado personalizada por faixa
7. CTA final → checkout Hotmart/Kiwify/Kirvano
8. Rodapé "Criado via inlead.digital" (não removível) + "Central de anúncios"

**Performance observada:** páginas carregam rápido, mobile-first, sem JavaScript pesado visível. Imagens servidas de `media.inlead.cloud` / `content.inlead.cloud` / `cloudfront.inlead.cloud` — **usam CloudFront da AWS** (não é CDN próprio, mas é CDN competente).

**Fricção de UX notável:** rodapé "Criado via inlead.digital" aparece em TODAS as páginas de cliente — branding forçado mesmo no plano mais caro. Sinal de que não há white-label completo, é uma faca na mão pra nós.

---

## 7. Help Center & Conteúdo

- **Stack:** HubSpot (meta tag `generator: HubSpot` em `ajuda.inlead.digital`).
- **~30 artigos visíveis** no help center, organizados em 5 seções: Introdução, Suporte, Integrações, Solução de problemas, Dicas Úteis.
- **Blog `inlead.digital/blog`:** 12 páginas, autor quase único (Alexandre Murari), categorias: Funil de Vendas, Quizzes, Dicas, Tutorial, Marketing digital, Infoprodutos, Dados e Insights, Survey, Eventos. Atualização consistente (pelo menos 2–3 posts/mês em 2025–2026).
- **Newsletter `news.inlead.digital`:** ~10+ edições visíveis; temas focados em conversão + funil + ROI.
- **Canal YouTube:** 1.51k subscribers (pequeno).
- **Webinars / eventos:** claim de presença na WebSummit 2026.

**SO WHAT?** Conteúdo orgânico é um moat real da inLead. Nosso projeto ainda não tem blog/newsletter. Para competir, vamos precisar de uma frente de conteúdo eventualmente — mas isso é GTM, não produto.

---

## 8. Stack Técnica (Visível Externamente)

Dados inferidos de headers, meta tags, DNS e assets:
- **Hosting de assets:** AWS CloudFront (`d9aloqs890lqz.cloudfront.net`, `cloudfront.inlead.cloud`)
- **Help center:** HubSpot (meta `generator: HubSpot`)
- **Dashboard:** subdomínio separado `dashboard.inlead.digital`
- **Staging:** `staging.inlead.digital` público (já encontrado no map)
- **Upload CDN:** `media.inlead.cloud`, `content.inlead.cloud`, `public.inlead.cloud`
- **Padrão de URL de funil:** flat, slug único em root (`inlead.digital/{slug}`)
- **Robots:** `noindex` na home — estratégia clara de SEO via blog, não via marketing da home

**INFERÊNCIA:** arquitetura parece convencional (provável Node/PHP monolito + CloudFront CDN). Sem sinais de edge computing avançado. Nosso setup **Cloudflare Worker + KV** pode entregar latência mais baixa globalmente se marketarmos bem — é diferencial *mensurável*.

---

## 9. Gaps & Oportunidades (Ranqueados)

### 🎯 Oportunidades ALTAS (exploráveis no curto prazo)

1. **Plano Free/Trial** — inLead não tem. Plano free real (1 funil, 100 leads/mês) remove a barreira de R$97 e permite aquisição orgânica + upsell.
2. **A/B testing nativo** — já modelado no schema. Marketar como "a única plataforma BR com split testing real" é *true statement*.
3. **Multi-workspace com roles granulares** — posicionar para agências como upgrade claro sobre "edição compartilhada" da inLead.
4. **Integração GHL nativa** — se o Full Funnel ecosystem é o nosso ICP, isso é *killer feature* que inLead não tem.
5. **AI Analysis de respostas** — nenhum concorrente BR faz isso. Bom hook de marketing ("IA lê as respostas e te diz quem é lead quente").
6. **White-label completo** (remover "Criado via" do footer) — dor real dos clientes ELITE da inLead.

### 🟡 Oportunidades MÉDIAS (médio prazo)

7. **Calculadora standalone** (Fase 5.1) — inLead só faz via score; calculadora dedicada atende nicho diferente.
8. **Agendamento pós-quiz** (Fase 5.2) — ninguém no BR faz isso nativamente.
9. **API pública** — inLead não tem. Atrai desenvolvedores e agências técnicas.
10. **Templates library PT-BR robusta** — inLead tem página `/templates` praticamente vazia.
11. **Gamificação avançada** (Mystery Box, Card Flip, Slot — Fase 5.4) — inLead não tem.
12. **Edge delivery messaging** — transformar nossa stack Cloudflare em narrativa de performance ("quiz que carrega em 0.3s no mundo inteiro").

### 🔴 Onde PRECISAMOS ALCANÇAR (antes de atacar)

13. **Social proof BR** — inLead tem 8+ influencers digitais do nicho. Precisamos pelo menos 3–5 cases brasileiros publicados.
14. **Integrações com gateways BR** — Hotmart, Kiwify, Kirvano, Eduzz no mínimo. Hoje só temos Stripe. Gap pesado pro ICP infoprodutor.
15. **Conteúdo orgânico** — blog, YouTube, newsletter. inLead tem 3 anos de dianteira.
16. **Maturidade de produto** — AUDIT flagou 8 críticos (rate limiting, validation, error boundaries, memory leaks). Precisa limpar antes de escalar tráfego.

---

## 10. "SO WHAT?" — Recomendações Acionáveis

### Para a Estratégia (escalar para @theboss / @TheBoss)

1. **Posicionamento de narrativa:** NÃO competir com *"primeira plataforma de funis interativos do Brasil"* — inLead já ganhou essa. Competir em **"Quiz Maker pensado para performance e escala"** ou **"A plataforma Full Funnel nativa"** (GHL + WhatsApp + AI). Diferenciar por vertical (GHL users, agências) ou por stack (performance + AI).
2. **Pricing sugerido:** Free (1 quiz, 100 leads) · Pro R$97 (5 quizzes, 10k leads — mesmo preço do BASIC deles, mas com webhook) · Business R$247 (25 quizzes, 50k, teams + A/B) · Agency R$497 (ilimitado, white-label, API). **Underprice o PRO deles mantendo features superiores.**
3. **Ataque direto à inconsistência de webhook:** messaging tipo *"webhook em todos os planos, sem pegadinha"*.
4. **GTM por nicho:** agências primeiro (teams + white-label + A/B) > lançamentos (se não conseguirmos bater inLead no infoproduto puro, atacar quem a inLead não atende bem).

### Para o Produto (para discussão com @opus / CTO squad)

1. **Prioridade imediata (antes de GA):** endereçar os 8 críticos do AUDIT. Rate limiting + validação Zod são obrigatórios antes de tráfego real.
2. **Fase 1 competitiva:** Free plan + CSV export + webhook em todos os tiers + A/B testing UI polida.
3. **Fase 2 diferenciação:** Integrações Hotmart/Kiwify/Kirvano/Eduzz (gateways BR) + GHL nativo + Templates library PT-BR (10 templates de alta qualidade).
4. **Fase 3 killer:** AI Analysis + Calculadora + Agendamento + White-label completo.

### Para Pesquisa Complementar (próximas issues)

- Benchmark do **Magoquiz** (player BR de e-commerce mencionado no 3rd party review) — ICO-\?
- Benchmark do **Typeform**, **Interact**, **Outgrow** (players globais) — ICO-\?
- Análise de **ads da inLead** na Biblioteca Meta (como eles capturam cliente)
- Coleta de **depoimentos em vídeo** dos influencers que usam inLead (material do @claudinho/@milagroso pra copy)
- Audit de **UX do dashboard da inLead** (só cadastrando uma conta — fora do escopo desta issue)

---

## 11. Fontes

### Primárias (inLead)
- Home: https://inlead.digital/
- Planos: https://inlead.digital/planos
- Sobre: https://inlead.digital/sobre
- Templates: https://inlead.digital/templates
- Blog: https://inlead.digital/blog
- Help center: https://ajuda.inlead.digital/
- Help — Planos canônicos: https://ajuda.inlead.digital/como-funcionam-os-planos-e-os-funis-na-inlead
- Help — Sistema de Score: https://ajuda.inlead.digital/sistema-de-pontos
- Help — Funis de Lançamento: https://ajuda.inlead.digital/funis-para-lan%C3%A7amento
- Help — Integrações: https://ajuda.inlead.digital/integra%C3%A7%C3%B5es
- Help — Make webhook: https://ajuda.inlead.digital/passo-a-passo-inlead-make-webhook
- Help — Meta pixel: https://ajuda.inlead.digital/como-configurar-o-pixel-do-meta-e-eventos-personalizados
- Newsletter: https://news.inlead.digital
- Comunicado mudança de domínio: https://inlead.digital/comunicados/mudancas-inlead-digital
- Funis de cliente amostrados: `/bussolariqueza`, `/musclelab`, `/treino-personalizado-2026`, `/dieta-22-dias`, `/cortisol-kalmy`, `/workshop-depois-do-trauma`, `/maquinadeclientes`, `/gabriel`, `/formulario-tiktok`, `/venancio`

### Terceiros (não-inLead)
- Reclame Aqui (reputação): https://www.reclameaqui.com.br/empresa/inlead-digital-ltda/
- Magoquiz comparison (3rd-party review independente): https://magoquiz.com/blog/inlead-o-que-e

### Base interna (QuizMeBaby)
- `prisma/schema.prisma` — modelos de dados
- `FEATURES-IMPLEMENTADAS.md` — features já shipadas
- `ROADMAP.md` — roadmap Fase 1–5
- `PLANO-QUIZ-MAKER.md` — plano original + arquitetura
- `AUDIT.md` — auditoria de 2026-02-03, 8 críticos pendentes

---

*Relatório gerado por Analyzer em 2026-04-22. Dúvidas, correções ou pedidos de aprofundamento em frentes específicas: comentar em [ICO-153](/ICO/issues/ICO-153).*

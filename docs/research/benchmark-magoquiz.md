# Benchmark Magoquiz (BR) — QuizMeBaby

> **Analyzer** · MSE · 2026-04-23 · ICO-187 (EP-BENCHMARK / Goal D30)
> Escopo: análise profunda de `magoquiz.com` (features, pricing, UX, integrações, público, gaps) + matriz comparativa vs. inLead (ICO-186) e base atual do QuizMeBaby. Mercado adjacente: **quiz-commerce BR** (recomendação de produto dentro de loja virtual), diferente do core infoproduto da inLead.

---

## 1. Resumo Executivo

- **Magoquiz é o player de referência em "quiz de recomendação de produto" pra e-commerce BR.** Posicionamento laser em loja virtual (Nuvemshop, Tray, Yampi, Loja Integrada, Bagy, VTEX) — mercado completamente distinto do core infoproduto/lançamento onde inLead e QuizMeBaby operam.
- **Atacam diretamente a inLead no próprio blog** (`/blog/inlead-o-que-e`, publicado 08/04/2026): *"A Inlead é pra funis de marketing digital e infoprodutos. O Magoquiz é pra quizzes de recomendação de produto em e-commerce."* Posicionamento competitivo muito claro e cirúrgico — separam waters pelo caso de uso.
- **Pricing SaaS simples e transparente:** 2 tiers self-service (**R$100/mês Basic · 300 interações** e **R$500/mês Pro · 2.000 interações**) + **Enterprise sob cotação** (onboarding dedicado, integrações sob demanda). Trial **30 dias grátis sem cartão**. Overage a **R$0,30/interação**. Plano Pro traz "A/B testing" e "Quizzes ilimitados" como **"em breve"** (ainda não entregues — gap claro).
- **Nicho vertical declarado:** beleza, cosméticos, fragrâncias, skincare, suplementos, moda, acessórios, pets, alimentos. Hero page é sempre **skincare**. Cases públicos: **Quintaesencia** (+226% CVR, 224x ROI), **Ju Rossi Cosméticos** (+17% ticket médio, 24.7k respostas/mês, 22,8% da receita total via quiz), **Ozon Care** (+172% CVR, +30% AOV).
- **Integrações nativas de catálogo** (diferencial vs inLead): puxam produtos, preço, foto, estoque direto da plataforma da loja. Resultado do quiz tem botão **"Adicionar ao carrinho"** com múltiplos produtos de uma vez ("adicionar rotina ao carrinho"). Essa é a peça que inLead NÃO TEM e que justifica existência do Magoquiz.
- **Stack de integração tracking:** GA4, Facebook Pixel, RD Station, Perfit, Webhook. **Não declaram:** GHL, ActiveCampaign, HubSpot, Mailchimp, Braze. CRM brasileiro (RD Station) atendido; stack gringo omisso.
- **Footprint digital enxuto:** site trilíngue (PT/EN/ES), blog SEO muito ativo (30+ posts, maioria 30/03/2026 — parece lote de conteúdo produzido de uma vez), app oficial na Tray, selo "5 estrelas Nuvemshop". Sem YouTube próprio identificável, sem comunidade grande. Contato principal via WhatsApp **+55 31 99573-5520** (Belo Horizonte/MG).
- **Fundador identificado:** Eric (autor de posts do blog assinados "Eric, fundador do Magoquiz"). Empresa não tem página "Sobre" pública (404 em `/sobre`). Razão social, CNPJ e sede **NÃO DIVULGADOS** no site — tratar como empresa mais jovem / pré-legitimação pesada que a inLead.
- **Gaps exploráveis pelo QuizMeBaby SE atacarmos e-commerce numa wave futura:**
  1. **A/B testing real** — nós já modelamos no schema; Magoquiz promete "em breve".
  2. **Multi-quiz / quizzes ilimitados** — Basic Magoquiz é **1 único quiz**; Pro promete ilimitado "em breve". QuizMeBaby já é multi-quiz desde o MVP.
  3. **AI Analysis / recomendação inteligente baseada em IA real** — Magoquiz usa lógica de condições e pontuação manual; não declara camada IA.
  4. **GHL nativo / ActiveCampaign / HubSpot** — Magoquiz só atende RD Station + Perfit no CRM. Gap grande pro mercado gringo e para infoprodutos.
  5. **Teams / roles reais** — Magoquiz não declara RBAC; QuizMeBaby tem owner/admin/editor/viewer.
  6. **Edge delivery (Cloudflare KV)** — nós temos, Magoquiz não declara CDN dedicado.
  7. **Webhook HMAC + retry + DLQ** — recém-implementado no QuizMeBaby (ICO-184/185); Magoquiz oferece "Webhook" genérico sem detalhamento de retry/segurança.
- **Gaps onde Magoquiz tem vantagem (se entrarmos e-commerce):**
  - **Integrações nativas com plataformas e-com BR** (Nuvemshop, Tray, Yampi, Loja Integrada, Bagy, VTEX) — nenhuma delas existe no QuizMeBaby hoje. Construir 6 integrações de catálogo é esforço grande.
  - **Cases BR de e-commerce reais com números auditáveis via GA4** — temos zero cases e-com; eles têm 3+ cases de marcas pequenas-médias.
  - **Botão "adicionar ao carrinho" + sincronização automática de catálogo** — funcionalidade de e-com essencial que exige dev dedicado.
  - **Presença na Tray App Store + selo Nuvemshop Next + "5 estrelas Nuvemshop"** — distribuição via marketplaces de plataformas de loja, canal de aquisição que nós não temos.
  - **Conteúdo SEO muito específico do nicho e-com beleza** (30+ posts: skincare, fragrância, pet, calçados, velas, joias, acessórios veganos).
- **SO WHAT?** Magoquiz é um concorrente **adjacente, NÃO direto** ao QuizMeBaby. Eles resolvem **problema diferente** (recomendação de SKU pra e-com) do que nós resolvemos (captura/qualificação de lead infoproduto). **Recomendação:** **NÃO abrir frente e-commerce em wave 1 nem wave 2.** Construir 6 integrações de catálogo + botão carrinho + posicionamento vertical completo é um segundo produto — não é roadmap linear. Se Full Funnel + standalone infoproduto consolidar em 2026 (Goal D30), **wave 3 (H2 2026)** pode entrar via um "QuizMeBaby for E-commerce" com Shopify + Nuvemshop como primeiras integrações — mas só depois que os 8 críticos do AUDIT e o GTM infoproduto estiverem funcionando. @theboss decide prioridade.

---

## 2. Dados Verificados de Negócio (Magoquiz)

| Campo | Valor | Fonte |
|---|---|---|
| Domínio principal | `magoquiz.com` (trilíngue: `/pt`, `/en`, `/es`) | Homepage |
| Fundador/rosto | **Eric** (identificado como "fundador do Magoquiz" em posts de blog); sobrenome não divulgado no site | [Blog: Inlead o que é](https://magoquiz.com/pt/blog/inlead-o-que-e) — campo `article:author` = "Eric" |
| Razão social / CNPJ | **NÃO DIVULGADOS no site** | — |
| Sede / endereço | **NÃO DIVULGADO no site** | Rodapé sem endereço físico |
| DDD do WhatsApp de contato | **31** (Belo Horizonte / MG) | WhatsApp +55 31 99573-5520 (rodapé + CTAs da home) |
| Contato | `contato@magoquiz.com` · WhatsApp +55 31 99573-5520 | Home + Tray App Store |
| Página `/sobre` | **404 Not Found** | `magoquiz.com/sobre` → 404 |
| Reclame Aqui | Não consta empresa cadastrada sob "Magoquiz" nos resultados (busca não retornou perfil) | Busca Reclame Aqui |
| Presença digital | Site trilíngue · Blog SEO (30+ posts) · App na **Tray App Store** · Páginas de integração (Nuvemshop, Tray, Yampi, Loja Integrada) · Selo "5 estrelas Nuvemshop" declarado no hero | Fontes múltiplas |
| Posicionamento de mercado | "Quiz de recomendação de produto pra e-commerce BR" — atacam diretamente inLead no próprio blog como "alternativa pra quem vende em loja virtual" | `/blog/inlead-o-que-e` |

> **INFERÊNCIA:** a ausência de CNPJ/razão social/endereço público, inexistência de perfil no Reclame Aqui (mesmo com blog ativo desde mar/2026) e páginas de integração ainda quebrando (VTEX retorna 500 no scrape) sugerem **empresa em estágio inicial** — provavelmente startup early-stage com 1-2 founders técnicos e pouca equipe. DDD 31 aponta hub Belo Horizonte / Minas. Não foram encontradas confirmações no LinkedIn na busca rasa.

---

## 3. Posicionamento & Narrativa

### Tagline principal (hero, PT-BR)
> *"Sua cliente não sabe qual skincare escolher. Seu quiz encontra a rotina certa e ela compra."*

Hero é sempre **skincare feminino** em todas as variantes (EN, PT, ES). Persona principal declarada: **marcas de beleza**.

### Proposta de valor (3 pilares que eles martelam)
1. **3 perguntas → 1 recomendação certa em <90 segundos** (cura problema "40 min comparando produtos")
2. **Consultor digital que atende todos ao mesmo tempo** (cura 70% dos tickets de "qual produto é pra mim")
3. **Dados de perfil direto do cliente** alimentam CRM (cura emails genéricos pra todos; 71% dos clientes esperam personalização)

### Frases-chave que repetem
- *"Cada visitante que sai sem comprar custa em média R$ 47"* — citam Baymard Institute 2024 (fonte real, mas número não cita estudo específico)
- *"Quiz converte 3x a 6x mais que a navegação tradicional"*
- *"Aumento de 26% a 226% na taxa de conversão, com média de +141%"*
- *"224x ROI"* (cliente Quintaesencia)
- *"70% dos tickets são 'qual produto é pra mim?'"*
- *"71% esperam personalização"*

### Métricas agregadas declaradas no hero
- Conversão: +226% (pico Quintaesencia)
- Ticket médio: +30%
- ROI: 47x (média)
- Retenção: +286%

**Rodapé do bloco métricas:** *"+141% conversão, +21% ticket médio, 224x ROI — MÉDIA REAL · CLIENTES COM GA4 INTEGRADO"* — diferencial de transparência: métricas só de clientes que têm GA4 conectado (subset verificável).

---

## 4. Oferta & Pricing

### Tiers de plano (PT-BR, 2026-04-23)

| Plano | Preço | Interações/mês | Quizzes | Features-chave | Trial |
|---|---|---|---|---|---|
| **Basic** | **R$ 100 / mês** | 300 | **1 único quiz** | Editor visual · Recomendações inteligentes · Captura de leads · Integrações e-com · Suporte WhatsApp · **Logo Magoquiz presente** | 30 dias grátis, sem cartão |
| **Pro** *(Mais Popular)* | **R$ 500 / mês** | 2.000 | **Quizzes ilimitados "em breve"** | Tudo do Basic + **sem branding** + página de resultado custom + tema custom em 24h + analytics avançado + VIP support + **A/B testing "em breve"** | 30 dias grátis, sem cartão |
| **Enterprise** *(Premium Service)* | **US$ 240+/mês** (*vide INFERÊNCIA abaixo*) | Ilimitadas | — | Onboarding dedicado · Integrações sob demanda · Sessão mensal de CRO · Account manager · VIP | CTA "Falar com a gente" — WhatsApp |

**Overage:** R$ 0,30 por interação acima do limite (Basic e Pro). Nunca desligam o quiz por excesso.

> **INCONSISTÊNCIA DETECTADA:** o site `/pt` mostra Enterprise como **"US$ 240,00+/mês"** enquanto Basic/Pro aparecem em reais e também duplicados como "US$ 100" e "US$ 500" em alguns pontos. O FAQ em inglês diz Basic **$20/mês** (300 interações) e Pro **$100/mês** (2000 interações), enquanto no FAQ em português diz R$100 e R$500. Hipótese mais provável: **site deixou a string "US$" em vários lugares com valores em R$** (bug de i18n) e **a página EN tem números desatualizados**. Valores reais a cobrar são os do FAQ em PT (R$100 e R$500). Enterprise precisaria confirmar direto via WhatsApp.

### Comparação com inLead (preço de entrada)

| Ferramenta | Plano entrada | Limite | Trial | Modelo de limite |
|---|---|---|---|---|
| Magoquiz | R$100/mês | 300 interações (quem **inicia** o quiz) | **30 dias grátis, sem cartão** | Por interação iniciada |
| inLead | R$97/mês | 5.000 **leads capturados** | **Sem trial** | Por lead capturado |
| Typeform | ~R$150/mês | 500 responses | Plano free limitado | Por response |

> **Leitura de pricing:** Magoquiz é **mais barato pra volume pequeno** (R$100 se 300 interações bastam) mas **escala feio e rápido**: a 3.500 interações/mês já está em R$500 + R$450 de overage = R$950. inLead começa mais caro mas **absorve muito mais volume** (5k leads no Basic). Pra um infoprodutor com 10k leads/mês, inLead vira muito mais barato. Pra uma loja pequena de cosméticos com tráfego orgânico e baixa interação, Magoquiz é acessível.

### Guarantee / reembolso
- **30 dias grátis sem cartão** cobre o teste.
- **Sem fidelidade.** Cancela quando quiser em Configurações > Gerenciar.
- **Upgrade/downgrade a qualquer momento**, com diferença ajustada na próxima fatura.
- **Não declaram garantia de reembolso após cobrança** — só "cancele quando quiser".

---

## 5. Features Declaradas

### O que Magoquiz **tem** (declarado na home + páginas de integração)
- Editor 100% visual drag-and-drop, sem código
- Smart recommendations (lógica de condições + pontuação manual — não declaram IA)
- Captura de leads
- **Sincronização automática de catálogo** com plataformas e-com
- **Botão "adicionar ao carrinho"** com múltiplos produtos (demo mostra "adicionar rotina ao carrinho" → 3 produtos de uma vez)
- Personalização visual (tema alinhado à marca)
- Insights e relatórios
- Suporte humano via WhatsApp
- Integrações nativas: **Tray, Nuvemshop, Yampi, Loja Integrada, Bagy, VTEX** (6 plataformas de e-com BR; VTEX retornou 500 no scrape)
- Tracking: GA4, Facebook Pixel, RD Station, Perfit, Webhook
- Redirecionamento pro WhatsApp no resultado (via HTML custom)
- Tema personalizado em 24h (Pro)
- Página de resultado customizada (Pro)
- Analytics avançado (Pro)

### O que Magoquiz **ainda NÃO tem** (declarado como "em breve")
- **A/B testing** (Pro: "em breve")
- **Quizzes ilimitados** (Pro: "em breve") — hoje Basic = 1 único quiz
- Templates pré-prontos — declarados genericamente como "modelos prontos" nas páginas de integração, sem galeria pública

### O que Magoquiz **NÃO faz** (gaps vs QuizMeBaby / gaps de mercado)
- AI Analysis / recomendação por LLM (trabalham com lógica de regras)
- Integração GHL / ActiveCampaign / HubSpot / Mailchimp nativa
- Multi-workspace / teams / roles reais (não declaram)
- API pública documentada (só webhook)
- Edge/CDN declarado (sem Cloudflare KV, sem latência declarada)
- Plano **gratuito permanente** (têm trial de 30 dias, não plano free)
- White-label completo (o branding da loja do cliente aparece, mas Magoquiz é a plataforma host — no tier Pro removem logo Magoquiz, mas não é multi-tenant pra agência revender)
- HMAC signature pro webhook (só dizem "Webhook" sem detalhar segurança)
- Retry / DLQ no webhook declarado
- Calculadoras standalone / agendamento pós-quiz

---

## 6. Integrações

### E-commerce (diferencial-chave vs inLead)
| Plataforma | Status | Página dedicada | Observação |
|---|---|---|---|
| **Tray** | Nativa 1-clique | ✅ [/pt/integra/tray](https://magoquiz.com/pt/integra/tray) | App oficial na Tray App Store ("Marketing" category, desenvolvido pela Magoquiz, app "paidPago") |
| **Nuvemshop** | Nativa 1-clique | ✅ [/pt/integra/nuvemshop](https://magoquiz.com/pt/integra/nuvemshop) | Hero declara "5 estrelas na Nuvemshop" |
| **Yampi** | Nativa 1-clique | ✅ [/pt/integra/yampi](https://magoquiz.com/pt/integra/yampi) | Página funcional |
| **Loja Integrada** | Nativa 1-clique | ✅ [/pt/integra/loja-integrada](https://magoquiz.com/pt/integra/loja-integrada) | Página funcional |
| **Bagy** | Declarada em blog | — | Citada em `/blog/inlead-o-que-e` como integração suportada |
| **VTEX** | Declarada em blog + citada no hero inferior | ⚠️ [/pt/integra/vtex](https://magoquiz.com/pt/integra/vtex) retorna **HTTP 500** (página quebrada em 2026-04-23) | Citada como integração mas página quebrada — possível WIP |
| Shopify | **NÃO declarado** | — | Omissão relevante — mercado LATAM usa mais Nuvemshop/Tray, Shopify é minoria |
| WooCommerce | **NÃO declarado** | — | Gap |

### CRM / Email / Analytics
- **Google Analytics 4** (nativo — usam GA4 como fonte de verdade das métricas declaradas)
- **Facebook Pixel** (nativo)
- **RD Station** (nativo — CRM BR padrão)
- **Perfit** (nativo — email marketing LATAM)
- **Webhook genérico** (sem detalhes públicos de HMAC/retry)

### Não declarados / gaps
- GoHighLevel (GHL) — gap crítico pro nosso target Full Funnel
- ActiveCampaign, HubSpot, Mailchimp, Braze, Customer.io
- Stripe webhook, gateways BR (Pagar.me, EBANX, PagSeguro)
- Zapier / Make / n8n

---

## 7. Público, Nicho & Cases

### Target declarado
- **Nicho primário explícito:** beleza, cosméticos, fragrâncias, skincare
- **Secundário (blog cobre):** suplementos, moda, acessórios, pets, alimentos, calçados, velas, joias, roupa infantil
- **Tamanho mínimo de catálogo recomendado:** 10+ produtos
- **Geografia:** Brasil primário (site PT), com versões EN e ES prontas (tentativa LATAM/US)

### Cases públicos (com métricas declaradas)

| Cliente | Nicho | Resultados declarados | Fonte da métrica |
|---|---|---|---|
| **Quintaesencia** | Fragrâncias | +226% CVR · 224x ROI · CVR 2,37% com quiz vs 0,73% sem | GA4 (declarado pelo Magoquiz) |
| **Ju Rossi Cosméticos** | Cosméticos / haircare | +17% ticket médio · 24.7k respostas/mês · **22,8% da receita total via quiz** | GA4 + Nuvemshop Next |
| **Ozon Care** | Skincare | +172% CVR · +30% ticket médio | GA4 |

### Logos de social proof no hero (12 marcas)
Amigo Panda · Cinclos · Inspire Amor · Gamo · Bluu · Dra. Simone · Avocado · Vulvas · Artemísia · Passione · Inarah · Quintaesencia

> Todas marcas aparentam ser **pequenas-médias** com catálogo de beleza/skincare/fragrância. Nenhuma grande (O Boticário, Natura, Eudora etc). Perfil cliente-alvo: **DTC/indie beauty brand BR** com R$50k-R$500k/mês de faturamento.

### Depoimentos em vídeo / quote
- **Carlos** (Gestor de Ecommerce, Ju Rossi Cosméticos) — quote + foto
- **Café Por Elas** (★★★★★)
- **Orame** (★★★★★)

---

## 8. Funil de Aquisição & UX

### Como chegam no cliente
- **SEO:** blog PT com 30+ posts altamente verticais (skincare, quiz de pele, calçado, carrinho abandonado, CPA e-com, cases reais). Muitos posts datados 30/03/2026 (provável lote produzido e publicado junto para boost de autoridade).
- **Marketplaces de plataforma:** Tray App Store, Nuvemshop App Store (citado via selo 5 estrelas).
- **Indicação direta:** contatos WhatsApp em quase todos os CTAs.
- **Comparação ativa com concorrentes:** blog tem posts "Typeform vale a pena?", "Inlead o que é", atacam nome próprio e convertem tráfego de marca dos competidores.

### Como fecham
- Trial 30 dias **sem cartão** (fricção zero de cadastro) → self-service completo
- **Onboarding humano via WhatsApp** (+55 31 99573-5520) para Enterprise / dúvidas
- **Página de agendamento de demo** via WhatsApp (sem Calendly/HubSpot Meetings declarado)

### UX site
- SvelteKit (metadata revela `_app/immutable/assets/...`, estrutura SvelteKit)
- Trilíngue (PT/EN/ES) com hreflang correto no OG
- Mobile-first, demos interativas na home (skincare quiz rodando no hero)
- CTAs duplos: "Testar Grátis" self-service + "Agendar demonstração" via WhatsApp

---

## 9. Blog & Conteúdo SEO

### Volume
- **30+ posts publicados**, a maioria em **30/03/2026** (lote de conteúdo) + publicações recorrentes abr/2026
- Post mais recente: **Quiz personalizado: como criar um quiz sob medida** (17/04/2026)
- Post comparativo atacando inLead: **Inlead: o que é, como funciona e quais são as alternativas** (08/04/2026)

### Temas dominantes
- **Vertical beleza/skincare/fragrância** — posts específicos de teste de pele, quiz de skincare, quiz de fragrância, cosméticos de alto valor
- **Verticais laterais** — pet shop, calçados, velas, joias, roupa infantil, alimentos, acessórios veganos
- **Educação e-commerce** — CPA alto, CVR, tráfego pago vs funil, carrinho abandonado, métricas de funil interativo
- **Comparativos de ferramenta** — Typeform, Inlead, "alternativas pra e-commerce"
- **Instagram / social commerce** — quiz no Instagram, marketing interativo, influenciador + ROI

### Métricas citadas nos posts (fontes de autoridade)
- Interact (tryinteract.com) — 37,6% taxa de conversão média em lead
- Shopify Brasil — CVR média 1,65-1,9% em e-commerce BR
- Baymard Institute — R$47/visitante perdido
- IBGE, Instagram Brasil (134M contas), mercado pet BR R$77bi

### Estratégia
- **SEO de cauda longa muito específica** em PT-BR, verticalizada por nicho de loja
- **SEO de marca** de concorrentes (Inlead, Typeform) — capturam tráfego deles
- **Publicação em lote** (30+ posts em 30/03) sugere uso pesado de IA para produção de conteúdo

---

## 10. Comunicação & Tom de Voz

- **Tom:** direto, coloquial, data-driven. Usa "sua cliente" no feminino (reforça nicho beleza). Português brasileiro natural.
- **Nível de sofisticação:** Stage 3-4 — educa o leitor que já sabe o que é quiz mas precisa entender por que e-commerce é diferente
- **Estrutura de copy:** problema (com estatística) → agitação (dor concreta) → solução (com case e número) → prova (logos/cases) → urgência (trial 30d)
- **Prova = números:** todos os blocos grandes terminam com % ou x ROI
- **Frases-padrão:** *"em menos de 90 segundos"*, *"sem código, sem desenvolvedor"*, *"a cada cliente que pergunta, 26 desistem em silêncio"*
- **Exemplos sempre femininos** — "sua cliente", "pele oleosa/seca/mista", "qual skincare escolher"

---

## 11. Pontos Fortes vs Pontos Fracos (visão competitiva)

### Pontos fortes Magoquiz
- **Posicionamento cirúrgico** (quiz-commerce BR, sem ambiguidade)
- **6 integrações de e-commerce BR prontas** (Tray, Nuvemshop, Yampi, Loja Integrada, Bagy, VTEX — mesmo com VTEX quebrada)
- **Cases com números GA4-validados** (diferencial de transparência: só contam métrica de quem tem GA4)
- **Trial 30d sem cartão** (fricção zero)
- **Blog SEO denso e verticalizado**
- **Presença em marketplaces de plataforma** (Tray App Store, Nuvemshop)
- **Pricing self-service claro** (R$100 / R$500 sem esconder nada)
- **Posicionamento competitivo explícito** (atacam inLead no próprio blog)

### Pontos fracos Magoquiz
- **Transparência institucional baixa** — sem CNPJ, endereço, /sobre, LinkedIn da empresa fácil
- **Sem perfil no Reclame Aqui** (barrier de confiança pra e-commerce médio/grande)
- **Basic = 1 único quiz** (limitação severa pra marcas com múltiplas linhas)
- **A/B testing e quizzes ilimitados são "em breve"** (não entregam o que Pro parece prometer)
- **Enterprise com pricing confuso** (US$240+/mês parece erro de i18n)
- **VTEX integration quebrada no site** (HTTP 500 em página de integração)
- **Sem Shopify nativo** (perda de LATAM + toda classe média-alta DTC BR que migrou pra Shopify)
- **Stack CRM limitado a RD Station + Perfit** (sem ActiveCampaign, HubSpot, Mailchimp)
- **Sem AI real na recomendação** (regras manuais; tendência de mercado vai pra LLM)
- **Sem plano gratuito permanente** (só trial)
- **Sem community / sem YouTube próprio identificável** (vs inLead que tem Alexandre Murari como rosto)
- **Base de cases pequena e no mesmo nicho** (3 cases públicos, todos beleza/skincare)

---

## 12. Matriz Comparativa — inLead vs Magoquiz vs QuizMeBaby

| Dimensão | **inLead** | **Magoquiz** | **QuizMeBaby** (hoje) | **QuizMeBaby** (com roadmap D30) |
|---|---|---|---|---|
| **Core use case** | Funil interativo p/ infoproduto/lançamento BR | Quiz de recomendação de produto p/ e-commerce BR | Quiz builder white-label p/ infoproduto (+ upgrade Full Funnel) | Idem + A/B + analytics + templates |
| **Plano entrada** | R$97/mês (5.000 leads) | R$100/mês (300 interações) | A definir (pricing tier pendente) | A definir |
| **Trial / Free** | Sem trial público | 30 dias, sem cartão | A definir | **Deveria ter free/trial** |
| **Plano mais alto** | R$497/mês (100k leads) | R$500/mês (2k interações) + Enterprise | A definir | A definir |
| **Multi-quiz** | ✅ (2 a 25 por plano) | ❌ Basic (1) · ⏳ Pro ("em breve") | ✅ Multi-quiz nativo | ✅ |
| **A/B testing** | ❌ | ⏳ "em breve" | ✅ modelado no schema | ✅ entregue |
| **Teams / Roles (RBAC)** | ⚠️ Só "edição compartilhada" no ELITE | ❌ Não declarado | ✅ owner/admin/editor/viewer | ✅ |
| **AI Analysis / LLM** | ❌ | ❌ (lógica manual) | ✅ planejado Fase 5 | ✅ |
| **Edge delivery / CDN** | ⚠️ Autodeclara "todos os países" sem detalhe | ❌ Não declarado | ✅ Cloudflare KV | ✅ |
| **Webhook HMAC + retry + DLQ** | ⚠️ Webhook genérico | ⚠️ Webhook genérico | ✅ ICO-184/185 entregue | ✅ |
| **Integração GHL nativa** | ❌ | ❌ | ✅ arquitetado | ✅ |
| **Integrações CRM BR** | RD Station, ActiveCampaign, HubSpot, Webhook | RD Station, Perfit, Webhook | Webhook + GHL | RD, GHL, AC (expansão) |
| **Integrações E-COMMERCE BR** | ❌ | ✅ **Tray, Nuvemshop, Yampi, Loja Integrada, Bagy, VTEX** | ❌ | ❌ (gap se wave 3) |
| **Botão "Adicionar ao carrinho"** | ❌ | ✅ (multi-produto) | ❌ | ❌ |
| **Templates galeria pública** | ❌ página vazia | ⚠️ "modelos prontos" mas sem galeria pública | ⏳ em construção | ✅ |
| **Reclame Aqui** | ✅ 8.2/10 Verificada | ❌ Não cadastrado | — | — |
| **Social proof** | Influencers BR de lançamento | 12 marcas DTC beleza | — | Em construção |
| **Blog SEO** | Denso, autoria CEO, newsletter | Denso, vertical e-com BR, publicado em lote | Inexistente | Em construção |
| **YouTube / rosto de marca** | Alexandre Murari (1.51k subs) | Eric (founder, sem canal público) | — | — |

---

## 13. Gaps Exploráveis (se abrir frente e-commerce em wave 3)

Se e apenas se o MSE decidir atacar e-commerce numa wave futura (**recomendação: NÃO em wave 1-2**), estes seriam os gaps exploráveis contra Magoquiz:

1. **Plano grátis permanente** (ou trial + tier gratuito limitado) — Magoquiz só tem trial 30d.
2. **Quizzes ilimitados em todos os tiers pagos** — eles prometem "em breve" no Pro; entregar já é vantagem.
3. **A/B testing real entregue** — idem.
4. **Integração Shopify nativa** — mercado DTC BR médio-alto migrou pra Shopify; Magoquiz não cobre.
5. **AI real na recomendação** (LLM que gera ranking com base em texto das respostas + embedding de produtos).
6. **Multi-tenant / white-label pra agência** — Magoquiz é single-tenant; agência que quer revender não tem modo.
7. **HMAC + retry + DLQ no webhook** — diferencial enterprise/compliance.
8. **Teams com roles reais** — para lojas com gestor de e-com + CMO + marketing ops.
9. **Edge delivery declarado** (latência <50ms global via Cloudflare KV) — performance mensurável.
10. **Reclame Aqui cadastrado + transparência CNPJ/endereço** — barrier de confiança.

**Gaps onde Magoquiz tem vantagem estrutural (e custariam caro pra nós alcançar):**
- Integração de catálogo Nuvemshop/Tray/Yampi/VTEX (cada uma é 2-4 semanas de dev)
- Botão "adicionar ao carrinho" multi-produto com sync de estoque/preço
- Casos BR GA4-validados em e-commerce
- Posts SEO específicos do vertical beleza (eles têm 1 ano de vantagem SEO)

---

## 14. Posicionamento Recomendado (em relação ao Magoquiz)

### Cenário A (wave 1-2 atual): **NÃO competir com Magoquiz**
- **QuizMeBaby é outro produto, outro mercado.** Foco infoproduto / lançamento / captura.
- **Não mencionar Magoquiz no posicionamento público** — confundiria o avatar.
- **Se cliente-infoprodutor perguntar:** "Magoquiz é bom, mas pra loja virtual. Nós atendemos quem vende curso, mentoria, infoproduto e agência — onde o funil termina em página de vendas / WhatsApp / CRM, não em checkout de loja."

### Cenário B (wave 3, H2 2026): **Entrar como "QuizMeBaby for Commerce"**
- Lançar como **extensão/plugin** do QuizMeBaby principal, não como produto separado.
- **1ª integração: Shopify** (gap de Magoquiz + mercado DTC crescente).
- **2ª integração: Nuvemshop** (líder LATAM + onde Magoquiz é forte — ataque frontal no território deles).
- **Posicionamento:** "Quiz que pensa com seu cliente, recomenda com IA e converte no carrinho — integrado com sua loja" — diferencial IA + multi-quiz + edge.
- **Pricing alvo:** Plano grátis permanente (até 100 interações/mês) + Starter R$79 (1.000 interações) + Pro R$299 (5.000 interações) — mais barato que Magoquiz em volumes médios.
- **Go-to-market:** entrar no Shopify App Store + Nuvemshop App Store no dia 1.

### Cenário C (wave 3, alternativa): **Ignorar e-commerce, dobrar em infoproduto/agência**
- Usar o tempo/equipe que seria e-com pra construir **marketplace de agências** (parceiros MSE vendem QuizMeBaby) + **Full Funnel end-to-end** com melhor integração WhatsApp/GHL/Make.
- **Mercado infoproduto BR é menor que e-com mas tem menos concorrência SaaS** e é onde o MSE tem rede/experiência.

> **Recomendação Analyzer:** Cenário C até 2026-06, reavaliar Cenário B em Q3 2026 com dados reais de churn/NPS do Full Funnel. **@theboss decide estratégia final.**

---

## 15. SO WHAT? — Implicações práticas para o projeto

1. **Magoquiz NÃO é ameaça direta ao QuizMeBaby wave 1.** Mercado adjacente, cliente diferente, funil diferente. Não redirecionar prioridade do launch D30 (Goal "QuizMeBaby operacional até 30/04/2026").
2. **Magoquiz VALIDA a tese de "quiz converte mais que página estática"** com dados GA4 de lojas BR (+141% CVR médio, +226% pico). Esse dado pode ser reusado em marketing QuizMeBaby (contexto: "se funciona pra e-commerce, funciona pra infoproduto"), **desde que citando fonte corretamente**.
3. **Existe mercado adjacente real e pouco saturado** (quiz-commerce BR). Se Magoquiz é o único player relevante em 2026 e ainda está pré-legitimação pesada (sem Reclame Aqui, sem CNPJ público, blog recém-lançado), **a janela de entrada de um segundo player técnico melhor existe em H2 2026**.
4. **Lições que o QuizMeBaby pode copiar do Magoquiz AGORA:**
   - **Trial 30d sem cartão** — eliminar fricção de cadastro.
   - **Métricas reais em GA4** como diferencial de transparência (vs concorrentes que citam % sem fonte).
   - **Blog SEO vertical denso** (publicar lote de 20-30 posts iniciais em um mês boosta autoridade).
   - **Atacar concorrente pelo nome no blog** — post "inLead vs QuizMeBaby" captura tráfego de marca da inLead.
   - **App stores de plataforma** (equivalente no nosso mercado: Hotmart marketplace de ferramentas? Kirvano? listagem em newsletters de tráfego pago?).
5. **Sinais de alerta que o Magoquiz NÃO precisa virar prioridade:**
   - Basic de **1 único quiz** mostra que estão em early stage técnico.
   - A/B e multi-quiz "em breve" há meses (se a página atual é a mesma de 30/03/2026 quando o lote de posts foi publicado, são 3+ semanas com a mesma promessa) — cadência de entrega parece lenta.
   - Sem transparência institucional + sem Reclame Aqui = fragilidade de confiança pra subir ticket.
6. **Se @theboss decidir investigar mais:**
   - Criar trial gratuito em `magoquiz.com/pt/login` e documentar onboarding real.
   - Tentar contato via WhatsApp Enterprise pra entender ticket real do Enterprise.
   - Buscar reviews reais na Nuvemshop App Store (precisaria acesso logado).
   - Pesquisar fundador "Eric Magoquiz" em LinkedIn com filtros BR.

---

## 16. Fontes

### Magoquiz (fontes primárias)
- Home PT: https://magoquiz.com/pt
- Home EN: https://magoquiz.com/
- Blog: https://magoquiz.com/pt/blog
- Post comparativo inLead: https://magoquiz.com/pt/blog/inlead-o-que-e (08/04/2026)
- Integração Nuvemshop: https://magoquiz.com/pt/integra/nuvemshop
- Integração Tray: https://magoquiz.com/pt/integra/tray
- Integração Yampi: https://magoquiz.com/pt/integra/yampi
- Integração Loja Integrada: https://magoquiz.com/pt/integra/loja-integrada
- Integração VTEX: https://magoquiz.com/pt/integra/vtex (HTTP 500 em 2026-04-23)
- Página /sobre: https://magoquiz.com/sobre (404 em 2026-04-23)
- App Tray: https://aplicativos.tray.com.br/aplicativo/magoquiz

### Autoridades citadas por Magoquiz no próprio conteúdo
- Interact Quiz Conversion Rate Report 2026: https://www.tryinteract.com/blog/quiz-conversion-rate-report/
- Baymard Institute 2024 (R$47/visitante perdido) — citado sem link direto
- Shopify Brasil — CVR médio 1,9%: https://www.shopify.com/br/blog/calculo-da-taxa-de-conversao
- Marketing LTB — 83% marketing prefere conteúdo interativo: https://marketingltb.com/blog/statistics/interactive-content-statistics/

### Referências cruzadas (benchmark anterior)
- `docs/research/benchmark-inlead.md` (ICO-186)

### Limitações da pesquisa
- **Não foi possível:** confirmar CNPJ/razão social (não divulgados), confirmar sede geográfica com certeza (DDD 31 sugere Belo Horizonte mas sem endereço público), acessar reviews logadas da Nuvemshop App Store, confirmar perfil LinkedIn da empresa (buscas rasas sem resultado), confirmar ticket real do Enterprise (CTA via WhatsApp, sem cotação pública), verificar página de integração VTEX (500 Internal Server Error em 2026-04-23), confirmar cadastro no Reclame Aqui (busca não retornou perfil da Magoquiz).
- **Tratar como INFERÊNCIA (não fato):** estágio "early-stage", 1-2 founders, DDD Belo Horizonte, uso de IA na produção de conteúdo do blog, pricing Enterprise.

---

> **Análise entregue por Analyzer (MSE) em 2026-04-23.**
> Próximos passos sugeridos: @theboss valida Cenário A/B/C → se Cenário B/C avança → Analyzer executa deep-dive em Shopify App Store analytics + competitive intel LATAM (Octane AI, Shop Quiz, Prehook) antes de qualquer decisão de wave 3.

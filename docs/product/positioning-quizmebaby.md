# Positioning QuizMeBaby — Documento de Posicionamento

> **Status:** Draft v0.2 — 22/04/2026
> **Autor:** PM (ICO-155)
> **Inputs:** TheBoss (steer estratégico pós-ICO-153) · Claudinho (copy/benchmark) · Opus (validação infra + pricing)
> **Deadline v0.2:** 24/04/2026 EOD
> **Aguarda revisão:** Opus (pra promover a done)

---

## 1. Contexto e Premissa

QuizMeBaby é um quiz builder visual com foco em captura e qualificação de leads — nasceu como feature do ecossistema Full Funnel (GHL + WhatsApp), mas tem produto suficiente para existir como SaaS standalone.

**Posicionamento híbrido resolve dois públicos com um produto:**
- **Mercado amplo:** Qualquer negócio que precisa de funis de quiz para geração de leads
- **Mercado Full Funnel:** Clientes já no ecossistema GHL/WhatsApp que ganham integração nativa e zero atrito

**Narrativa central (pós-benchmark inLead):** Não competir de frente com inLead ("primeira plataforma de funis interativos do Brasil" — posição já tomada). Atacar pelos flancos: **"Full Funnel nativo — GHL-ready + White-label real + AI"**.

---

## 2. Proposta de Valor — QuizMeBaby Standalone

### Tagline
**"Crie quizzes que qualificam. Venda para quem já quer comprar."**

### Subtítulo / One-liner
O único quiz builder BR com plano grátis, GHL nativo, white-label real e A/B testing — sem letra miúda, sem "Criado via" no rodapé do seu cliente.

### ICP Prioritário
**Agência digital que hoje paga R$197-297/mês na inLead** — dor real:
- "Edição compartilhada" fraca, sem roles granulares (owner/admin/editor/viewer)
- Sem white-label: "Criado via inlead.digital" no rodapé de *todos* os funis dos clientes deles, mesmo pagando R$497/mês
- Sem A/B testing nativo
- Sem GHL nativo (só webhook genérico)
- Sem plano free para prospectar novos clientes

### Segmentos Secundários
| Segmento | Dor Principal | Como o QMB resolve |
|---|---|---|
| Infoprodutores | Leads frios, baixa qualificação | Quiz diagnóstico segmenta o lead antes da oferta |
| Coaches e consultores | Agenda cheia de pessoas sem fit | Quiz de qualificação pré-call elimina não-qualificados |
| E-commerce | Alta taxa de bounce, baixa conversão | Quiz de produto leva ao produto certo |
| Equipes de marketing | Custo por lead alto | Quiz orgânico converte mais que formulário frio |

### Diferenciais vs. inLead (Benchmark ICO-153 confirmado)

**O que a inLead não tem — e nós temos ou teremos:**

| Diferencial | Status QMB | Narrativa |
|---|---|---|
| **Plano Free real** | ✅ Prod | "A inLead começa em R$97/mês. A gente começa de graça." |
| **A/B testing nativo** | 🔨 Schema pronto | "A única plataforma de quiz do Brasil com split test — sem plugin, sem gambiarra." |
| **GHL nativo** | ✅ Prod | "Se você usa GoHighLevel, a inLead não fala a sua língua. Nós fomos construídos pra isso." |
| **White-label completo** | 🔨 Em dev | "Seu cliente paga R$297/mês pra ter 'Criado via inlead.digital' no rodapé. Aqui não." |
| **Roles granulares** | 🔨 Roadmap | Supera "edição compartilhada" deles sem roles |
| **AI Analysis de leads** | ⚠️ Pendente (timeout AUDIT) | Nenhum concorrente BR faz |
| **Edge delivery CF KV** | ✅ Prod | "0.3s de carregamento global, mensurável" |

**Inconsistência de comunicação da inLead (munição copy):**
Página pública `/planos` lista webhook nos 3 tiers. Help center canônico coloca webhook apenas no PRO (R$197). **Gancho:** *"Webhook em todos os planos. Sem letra miúda, sem upgrade surpresa."*

**O que inLead TEM e nós ainda não temos (honestidade estratégica):**
- **10 gateways BR** (Hotmart, Kiwify, Kirvano, Eduzz, Ticto, Monetizze, PerfectPay, Braip, Lastlink, Green) — gap crítico pro ICP infoprodutor. Copy enquanto não fecharmos: *"integração via webhook com qualquer gateway — Hotmart nativo em roadmap"*
- **Social proof BR consolidado** — precisamos de 3-5 cases publicados antes de escalar campanha
- **Conteúdo orgânico** — inLead tem 3 anos de dianteira (blog/YouTube). Não bloqueia lançamento.

### Jobs to be Done (JTBD)
1. **Qualificar leads antes de falar com eles** — "Quando recebo um lead novo, quero saber se ele tem fit antes de perder 30min numa call."
2. **Automatizar a segmentação** — "Quando alguém responde meu quiz, quero que o CRM já saiba para qual funil mandar."
3. **Criar sem depender de dev** — "Quando tenho uma ideia de quiz, quero publicar hoje, não em 2 semanas."
4. **Vender quiz como serviço para clientes** (ICP agência) — "Quando entrego funis para meus clientes, quero que minha marca apareça, não a da plataforma."

---

## 3. Proposta de Valor — Upgrade Path para Clientes Full Funnel

### Mensagem Central
**"Você já tem o funil. Agora qualifique antes de entrar nele."**

### O que muda para quem já é cliente Full Funnel
| Sem QuizMeBaby | Com QuizMeBaby |
|---|---|
| Lead entra frio no funil | Lead já segmentado entra com score e categoria |
| SDR/bot precisa qualificar via pergunta no chat | Quiz faz a triagem antes do primeiro contato |
| Formulário de contato genérico | Quiz personalizado com resultado imediato |
| Tags manuais no GHL | Tags automáticas baseadas em respostas do quiz |
| WhatsApp genérico de boas-vindas | WhatsApp com resultado personalizado do quiz |

### Gatilho de Upgrade
Clientes Full Funnel são ativados com:
1. **Caso de uso concreto** no nicho deles (ex: "Faça o quiz de diagnóstico de maturidade digital")
2. **Integração zero-atrito** — GHL já conectado, só criar o quiz
3. **Snapshot de quiz** incluído no onboarding Full Funnel (entrega imediata de valor)
4. **30 dias de Pro gratuito** como parte do onboarding; oferta de migração pós-trial com desconto de fidelidade

### Framing da Oferta
> "Você já comprou o motor. O QuizMeBaby é o filtro de combustível — sem ele, qualquer lead entra."

---

## 4. Pricing Tiers

> **Validado por Opus (infra/custo) — 22/04/2026**
> Pricing anterior (R$47/R$97) era subprecificado vs. teto BR. Novo pricing maximiza posição competitiva vs. inLead.

### Tabela de Planos

| | Free | Pro | Business | Agency |
|---|---|---|---|---|
| **Preço mensal** | R$ 0 | R$ 97 | R$ 247 | R$ 497 |
| **Quizzes** | 1 | 5 | 25 | Ilimitados (fair use) |
| **Leads/mês** | 100 | 10.000 | 50.000 | Ilimitados (fair use >500k → escalar) |
| **Marca d'água** | Sim | Não | Não | Não |
| **Custom domains** | ❌ | 3 | 25 | Ilimitados |
| **Webhook** | ✅ | ✅ | ✅ | ✅ |
| **A/B testing** | ❌ | ✅ | ✅ | ✅ |
| **GHL nativo** | ❌ | ✅ | ✅ | ✅ |
| **White-label** | ❌ | ❌ | Parcial | **Completo** |
| **Teams + roles** | ❌ | ❌ | ✅ | ✅ |
| **AI Analysis** | ❌ | 500/mês | 5.000/mês | 25.000/mês + overage R$0,015 |
| **API** | ❌ | ❌ | ❌ | ✅ |
| **Storage** | 100MB | 1GB | 10GB | 100GB |
| **Suporte** | Comunidade | Email | Prioritário | Dedicado |

### Guardrails Obrigatórios (pré-requisito para pricing fechar)
1. **AI Analysis com quota por tier** — sem isso, 1 heavy user Agency pode queimar R$500+/mês
2. **WhatsApp = BYO-token (default)** — cliente traz Z-API/Evolution/Meta. A gente orquestra. Margin negativa se viramos provider.
3. **Custom domains com cap** conforme tabela acima
4. **Storage cap** para evitar abuso de assets em R2/S3
5. **Fair-use clause Agency** — ilimitado com throttle acima de 500k leads/mês OR escalonamento comercial

### Racional de Pricing

**Free** — Funil de aquisição. 1 quiz, 100 leads para validar produto sem custo. Conversão esperada: 15-20% → Pro. inLead não tem free, isso é nosso diferencial de aquisição #1.

**Pro (R$97/mês)** — Underprices o PRO deles (R$197) entregando features superiores (A/B, GHL, 10k leads). "O que a inLead cobra R$297, a gente entrega free + custom domain."

**Business (R$247/mês)** — Para agências. White-label parcial + teams com roles supera "edição compartilhada" da inLead ELITE (R$497).

**Agency (R$497/mês)** — Para agências que revendem em escala. White-label completo, API, GHL. Payback em 1-2 clientes revendidos.

### Sustentabilidade Financeira (validação Opus)
- **Custo fixo mensal baseline:** ~R$300-350 (VPS Hetzner + Postgres + CF Workers)
- **Breakeven:** 4 contas Pro (R$388 MRR) já cobrem fixo
- **Cenário 100 contas mix** (10F+70P+15B+5A): ~R$13.680 MRR vs R$1.500-2.000 custo → **~85% margem bruta**
- **Custo marginal por lead:** negligível; AI Analysis: R$0,008-0,05/análise (com quotas, controlado)

### Pricing vs. Concorrentes
| Ferramenta | Preço entrada | Notas |
|---|---|---|
| inLead (BR) | R$97/mês (sem free) | Sem A/B, sem GHL nativo, sem white-label real |
| Typeform | ~USD 29/mês | Em dólar, sem GHL nativo, sem PT-BR focus |
| Involve.me | ~USD 29/mês | Em dólar, complexo |
| Outgrow | ~USD 22/mês | Em dólar |
| ScoreApp | ~USD 49/mês | Premium, sem PT-BR nativo |
| **QuizMeBaby Free** | **R$ 0** | **Único BR com free tier real** |
| **QuizMeBaby Pro** | **R$ 97** | **GHL + A/B + 10k leads — supera inLead PRO em features** |

---

## 5. Tom de Voz da Marca

### Personalidade
QuizMeBaby é **direto, confiante e sem enrolação** — fala como um especialista que também sabe fazer piada. Brasileiro sem ser provinciano. Agressivo no benefício, gentil na abordagem.

### Os Quatro Pilares de Tom

#### 1. Direto ao ponto
❌ "Nossa plataforma inovadora oferece uma experiência de criação de quizzes revolucionária"
✅ "Crie um quiz em 10 minutos. Publique. Capture leads hoje."

#### 2. Resultado primeiro
Sempre começa pela **transformação**, não pela feature.
❌ "Temos integração com GoHighLevel"
✅ "Seus leads já chegam tagueados no GHL — sem copiar e colar"

#### 3. Brasileiro, não provinciano
Fala PT-BR fluente, usa referências locais (GHL, WhatsApp, Hotmart) mas aspira ao mercado internacional.
❌ "Arrasa demais, mano!"
✅ "Funciona. E funciona bem."

#### 4. Confiante sem arrogância
Sabe que o produto é bom. Não precisa atacar o concorrente pelo nome — deixa o dado falar.
❌ "A inLead é uma bosta, migra aqui"
✅ "Webhook em todos os planos. Sem letra miúda, sem upgrade surpresa."

### Vocabulário da Marca
| Usar | Evitar |
|---|---|
| Quiz | Formulário interativo |
| Lead qualificado | Prospect |
| Resultado | Output |
| Funil | Pipeline (quando desnecessário) |
| Integra com | Se conecta a |
| Publicar | Deploy / lançar |
| Workspace | Organização / tenant |
| White-label real | Personalização de marca |

### Copy Hooks por Canal (Claudinho — draft)

**Hero landing standalone:**
> Pare de falar com lead frio. Crie um quiz, qualifique, venda.

**Hero landing ICP agência:**
> Seu cliente paga R$297/mês pra ter o logo de outra empresa no rodapé. Não aqui.

**Free tier:**
> A inLead começa em R$97/mês. A gente começa de graça.

**GHL:**
> Se você usa GoHighLevel, a inLead não fala a sua língua. Nós fomos construídos pra isso.

**A/B:**
> A única plataforma de quiz do Brasil com split test nativo — sem plugin, sem gambiarra.

**Webhook:**
> Webhook em todos os planos. Sem letra miúda, sem upgrade surpresa.

**Email onboarding (dia 1):**
> Seu primeiro quiz já pode estar no ar. Leva 10 minutos. Segue o passo a passo.

**WhatsApp (resultado do quiz):**
> Oi [nome]! Seu resultado chegou: você é um [categoria]. Aqui está o que isso significa pra você: [link]

**Push upgrade (Free → Pro):**
> Você capturou 87 leads esse mês. No Pro, sem limite — e com GHL direto.

---

## 6. Gaps a Fechar Antes de Escalar (Não Levar Tiro)

| Gap | Criticidade | Ação necessária |
|---|---|---|
| **Gateways BR** (Hotmart/Kiwify/Kirvano/Eduzz) | 🔴 Alta pro ICP infoprodutor | Copy honesta enquanto não tiver: "webhook com qualquer gateway — Hotmart nativo em roadmap" |
| **Social proof BR** | 🔴 Alta antes de campanha agressiva | 3-5 cases publicados com resultado mensurável |
| **8 itens críticos do AUDIT** | 🔴 Alta antes de escalar | Resolver antes de qualquer campanha paga |
| **AI Analysis (timeout)** | 🟡 Média | Pendência técnica — não promover no copy até fechar |
| **A/B testing UI** | 🟡 Média | Schema pronto, UI pendente |
| **Roles granulares** | 🟡 Média | Diferencial vs. inLead ELITE |
| **Conteúdo orgânico** | 🟢 Baixa urgência | inLead tem 3 anos de dianteira. Não bloqueia lançamento. |

---

## 7. Pilares Diferenciadores (Ranqueados por Impacto)

1. **Plano Free** — inLead não tem. Remove barreira de entrada. Diferencial de aquisição #1.
2. **A/B testing nativo** — nenhum concorrente BR tem. Posição exclusiva.
3. **GHL nativo** — gap real da inLead. ICP agência adora.
4. **White-label completo** — inLead cobra R$497 e ainda mostra "Criado via inlead.digital". Faca na mão.
5. **Multi-workspace com roles granulares** — supera "edição compartilhada" da inLead.
6. **AI Analysis de leads** — ninguém no BR faz (quando corrigido o timeout).
7. **Edge delivery Cloudflare KV** — performance mensurável, marketável.

---

## 8. Próximos Passos

| Item | Status | Responsável |
|---|---|---|
| Draft v0.2 incorporar benchmark ICO-153 + infra | ✅ Feito | PM |
| Benchmark internacionais ([ICO-154](/ICO/issues/ICO-154)) ingerido | ⬜ Pendente | Analyzer |
| Revisão e aprovação | ⬜ Aguardando | Opus |
| Copy página de captura (ICP agência) | ⬜ Pós-done ICO-155 | Claudinho |
| Copy página de vendas (standalone) | ⬜ Pós-done ICO-155 | Claudinho |
| Sequência emails lançamento (5 PLF) | ⬜ Pós-done ICO-155 | Claudinho |

---

*Draft v0.2 — PM / QuizMeBaby D23 — ICO-155 — 22/04/2026*
*Inputs: TheBoss (steer estratégico) · Claudinho (copy/benchmark inLead) · Opus (validação infra+pricing)*

# Positioning QuizMeBaby — Documento de Posicionamento

> **Status:** Draft v0.1 — 22/04/2026
> **Autor:** PM (ICO-155)
> **Dependências:** Benchmark inLead ([ICO-153](/ICO/issues/ICO-153)) + Benchmark internacionais ([ICO-154](/ICO/issues/ICO-154)) — seções marcadas com `[BENCHMARK]` serão refinadas após outputs.
> **Deadline:** 25/04/2026

---

## 1. Contexto e Premissa

QuizMeBaby é um quiz builder visual com foco em captura e qualificação de leads — nasceu como feature do ecossistema Full Funnel (GHL + WhatsApp), mas tem potencial e produto suficiente para existir como SaaS standalone.

O posicionamento híbrido resolve dois públicos com um produto:
- **Mercado amplo:** Qualquer negócio que precisa de funis de quiz para geração de leads
- **Mercado Full Funnel:** Clientes já no ecossistema GHL/WhatsApp que ganham integração nativa e zero atrito

---

## 2. Proposta de Valor — QuizMeBaby Standalone

### Tagline
**"Crie quizzes que qualificam. Venda para quem já quer comprar."**

### Subtítulo / One-liner
Construtor visual de quizzes com captura de leads integrada, resultados personalizados e conexão com WhatsApp, GHL e qualquer CRM — sem código, sem frescura.

### Para quem é
| Segmento | Dor Principal | Como o QMB resolve |
|---|---|---|
| Infoprodutores | Leads frios, baixa qualificação | Quiz diagóstico segmenta o lead antes da oferta |
| Agências digitais | Precisam de algo revendável para clientes | White label + workspace por cliente |
| Coaches e consultores | Agenda cheia de pessoas sem fit | Quiz de qualificação pré-call elimina não-qualificados |
| E-commerce | Alta taxa de bounce, baixa conversão | Quiz de produto leva ao produto certo |
| Equipes de marketing | Custo por lead alto | Quiz orgânico converte mais que formulário frio |

### Por que não usar concorrentes?
> ⚠️ **[BENCHMARK]** Esta seção será refinada com dados do ICO-153 (inLead) e ICO-154 (Typeform/Involve.me/Outgrow/ScoreApp/Jotform). Lacunas competitivas confirmadas inserir aqui.

**Hipóteses de gap a validar:**
- Typeform/Jotform: sem lógica de branching visual, sem integração nativa WhatsApp BR
- Involve.me / Outgrow: caros em USD, sem foco no mercado BR, sem GHL nativo
- inLead (BR): [a confirmar via ICO-153]
- ScoreApp: bom produto mas sem PT-BR nativo, caro para o mercado BR

**Diferenciais já comprovados pelo produto:**
- Builder visual canvas (drag & drop, não linear)
- Integração nativa GHL (criar/atualizar contato com score, tags, respostas)
- Disparo WhatsApp no resultado (via Fullzapp/Waha)
- Player ultra-rápido com edge caching (Cloudflare)
- Domínios customizados nativos
- Preço em BRL, suporte BR

### Jobs to be Done (JTBD)
1. **Qualificar leads antes de falar com eles** — "Quando recebo um lead novo, quero saber se ele tem fit antes de perder 30min numa call."
2. **Automatizar a segmentação** — "Quando alguém responde meu quiz, quero que o CRM já saiba para qual funil mandar."
3. **Criar sem depender de dev** — "Quando tenho uma ideia de quiz, quero publicar hoje, não em 2 semanas."

---

## 3. Proposta de Valor — Upgrade Path para Clientes Full Funnel

### Mensagem Central
**"Você já tem o funil. Agora qualifique antes de entrar nele."**

### O que muda para quem já é cliente Full Funnel
Clientes Full Funnel já têm GHL configurado, automações rodando e WhatsApp integrado. O QuizMeBaby se encaixa no topo do funil deles como a **camada de qualificação** que faltava.

### Proposta de Upgrade
| Sem QuizMeBaby | Com QuizMeBaby |
|---|---|
| Lead entra frio no funil | Lead já segmentado entra com score e categoria |
| SDR/bot precisa qualificar via pergunta no chat | Quiz faz a triagem antes do primeiro contato |
| Formulário de contato genérico | Quiz personalizado com resultado imediato |
| Tags manuais no GHL | Tags automáticas baseadas em respostas do quiz |
| WhatsApp genérico de boas-vindas | WhatsApp com resultado personalizado do quiz |

### Gatilho de Upgrade
Clientes Full Funnel são ativados com:
1. **Caso de uso concreto** em seu nicho (ex: "Faça o quiz de diagnóstico de maturidade digital")
2. **Integração zero-atrito** — GHL já conectado, só criar o quiz
3. **Snapshot de quiz** incluído no onboarding Full Funnel (entrega imediata de valor)

### Framing da Oferta
> "Você já comprou o motor. O QuizMeBaby é o filtro de combustível — sem ele, qualquer lead entra."

---

## 4. Pricing Tiers Sugeridos

> ⚠️ **[BENCHMARK]** Pricing final deve ser validado contra concorrentes após ICO-153 e ICO-154. Os preços abaixo são baseados no Stripe setup atual e nas referências de mercado BR.

### Estrutura de Planos

| | Free | Pro | Business |
|---|---|---|---|
| **Preço mensal** | R$ 0 | R$ 47 | R$ 97 |
| **Preço anual** | — | R$ 397 (~R$ 33/mês) | R$ 897 (~R$ 75/mês) |
| **Economia anual** | — | ~30% | ~23% |
| **Quizzes** | 1 | Ilimitados | Ilimitados |
| **Leads/mês** | 100 | 2.000 | Ilimitados |
| **Integrações** | Webhook básico | GHL + WhatsApp + Webhook | Tudo + API |
| **Domínio customizado** | ❌ | ✅ | ✅ |
| **Analytics** | Básico | Completo | Completo + Export |
| **White label** | ❌ | ❌ | ✅ |
| **Workspaces** | 1 | 1 | Multi-workspace |
| **Suporte** | Comunidade | Email | Prioritário |

### Racional de Pricing

**Free** — Funil de aquisição. Uma quiz, 100 leads é suficiente pra validar o produto sem custo. Conversão esperada: 15-20% para Pro.

**Pro (R$47/mês)** — Ponto de entrada para negócios reais. Abaixo de R$50, percepção de "não é SaaS caro". Equivale a ~1 lead qualificado convertido. Comparable: Hotmart (comissão de 1 venda pequena).

**Business (R$97/mês)** — Para agências e times. Dobro do Pro justificado por white label + multi-workspace. Payback em 1 cliente revendido.

### Estratégia de Upgrade Full Funnel
Clientes Full Funnel recebem **30 dias de Pro gratuito** como parte do onboarding. Após 30 dias, oferta de migração para Pro com desconto de fidelidade (R$37/mês no primeiro ano).

### Pricing vs. Concorrentes (Hipóteses a Confirmar)
> ⚠️ **[BENCHMARK]** Preencher após ICO-153 e ICO-154.

| Ferramenta | Preço entrada | Notas |
|---|---|---|
| Typeform | ~USD 29/mês | Em dólar, sem GHL nativo |
| Involve.me | ~USD 29/mês | Em dólar |
| Outgrow | ~USD 22/mês | Em dólar, complexo |
| ScoreApp | ~USD 49/mês | Premium, sem PT-BR |
| inLead (BR) | [a confirmar] | BR, concorrente direto |
| **QuizMeBaby Pro** | **R$47/mês** | BR, GHL + WhatsApp nativo |

---

## 5. Tom de Voz da Marca

### Personalidade
QuizMeBaby é **direto, jovem e confiante** — sem jargão corporativo, sem promessa vazia. Fala como um especialista que também sabe contar uma piada.

### Os Quatro Pilares de Tom

#### 1. Direto ao ponto
❌ "Nossa plataforma inovadora oferece uma experiência de criação de quizzes revolucionária"
✅ "Crie um quiz em 10 minutos. Publique. Capture leads hoje."

#### 2. Resultado primeiro
Sempre começa pela **transformação**, não pela feature.
❌ "Temos integração com GoHighLevel"
✅ "Seus leads já chegam tagueados no GHL — sem copiar e colar"

#### 3. Brasileiro, não provinciano
Fala PT-BR fluente, usa referências locais (GHL, WhatsApp, PIX) mas aspira ao mercado internacional. Não força gírias forçadas.
❌ "Arrasa demais, mano!"
✅ "Funciona. E funciona bem."

#### 4. Confiante sem arrogância
Sabe que o produto é bom. Não precisa diminuir concorrente para se vender.
❌ "Melhor que o Typeform e mais barato que tudo"
✅ "Feito para o mercado BR, com as integrações que você já usa"

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

### Exemplos de Copy por Canal

**Hero da landing page:**
> Pare de falar com lead frio. Crie um quiz, qualifique, venda.

**Email de onboarding (dia 1):**
> Seu primeiro quiz já pode estar no ar. Leva 10 minutos. Segue o passo a passo.

**Push de upgrade (Free → Pro):**
> Você capturou 87 leads esse mês. No Pro, sem limite — e com GHL direto.

**WhatsApp (resultado do quiz):**
> Oi [nome]! Seu resultado chegou: você é um [categoria]. Aqui está o que isso significa pra você: [link]

---

## 6. Próximos Passos e Dependências

| Item | Status | Bloqueador |
|---|---|---|
| Seção 2 — Gap competitivo | 🟡 Rascunho | Aguarda ICO-153 (inLead) + ICO-154 (internacionais) |
| Seção 4 — Pricing vs. concorrentes | 🟡 Hipóteses | Aguarda ICO-153 + ICO-154 |
| Validação com Marco | ⬜ Pendente | Após benchmarks prontos |
| Versão final doc | ⬜ Pendente | Após validação |

---

*Draft v0.1 — PM / QuizMeBaby D23 — ICO-155*

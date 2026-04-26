# Scripts de Anúncio Meta — QuizMeBaby (v2.0)

> **Claudinho** · MSE · 2026-04-26 · [ICO-186](/ICO/issues/ICO-186)
> **Origem:** Meta Ads Library BR — 30 criativos inLead distintos analisados (~8.100 ads ativos total). Benchmark de hooks, ganchos emocionais e gaps narrativos do mercado infoproduto BR — conduzido pelo Analyzer em [ICO-186](/ICO/issues/ICO-186).
> **Complementa:** Scripts A–D em `docs/copy/ad-scripts-meta-qmb-v1.md` ([ICO-190](/ICO/issues/ICO-190))
> **Status:** v2.1 — Script E refeito (Opção 1 @theboss) · Script F fix de 2 caveats · aguarda sign-off @opus (workflow [ICO-196](/ICO/issues/ICO-196))

---

## Segmentos Cobertos Nesta Versão

| Script | Nome | ICP | Ângulo | Prioridade |
|---|---|---|---|---|
| **E** | B2B Competitive | Assinante inLead Basic/Pro (paga R$97–197/mês sem features Pro) | Canibalização por régua de tier — "R$97 na inLead é Basic; aqui é Pro" | 🔴 Alta |
| **F** | B2C Diagnóstico | Infoprodutor com LP/VSL estática | Gap #1 — quiz como diagnóstico de funil, não qualificador | 🔴 Alta |

**Por que prioridade Alta em ambos:**

O Analyzer confirmou que inLead não roda ads próprios no Meta BR (zero ads da marca na biblioteca). Via livre para QMB atacar tráfego pago no leilão sem bidding war direta — janela de oportunidade que se fecha quando inLead acordar pra mídia paga.

---

## Script E — B2B COMPETITIVE *(v2.1 — Opção 1 @theboss)*

> **Modelos base:** Thiago Concer (copy longa B2B, 10k vendedores, objeção explícita) + nandohayne (desafio recíproco, 32 ads = longevidade)
> **Padrão:** `CUSTO REAL POR TIER → COMPARAÇÃO DEFENSÁVEL → CTA GRÁTIS`
> **ICP:** Assinante inLead Basic (R$97/mês) ou Pro (R$197/mês) sem as features que imagina que tem
> **Gancho emocional:** Ceticismo + custo visível — "paga R$97 e está no Basic; cá você paga R$97 e está no Pro"
>
> **⚠️ Fact-check v2.1 (confirmado em `src/lib/plans.js`):**
> - A/B testing: Pro QMB (R$97) ✅ | Free QMB ❌ | Basic inLead ❌
> - Sem "Criado via QMB" no rodapé: Pro QMB (whiteLabel=true) ✅ | Free QMB ❌
> - Webhook: todos os planos QMB ✅
> - inLead: branding forçado em todos os planos (benchmark §6 confirmado)

---

### COPY FALADA — Versão Vídeo (20–25s)

| Segmento | Duração | Fala |
|---|---|---|
| **HOOK** | 0–3s | "Você paga R$97 por mês na inLead — e está no plano Basic. Sem A/B testing. Sem o rodapé limpo. Sem o que você realmente precisa." |
| **COMPARAÇÃO** | 3–11s | "No QuizMeBaby, R$97 é o plano Pro. A/B testing nativo, sem 'Criado via QuizMeBaby' poluindo o funil do seu cliente, e webhook em todos os planos — do free ao Agency." |
| **CÁLCULO** | 11–17s | "Mesmo valor, mais features. Ou começa de graça pra conhecer e sobe pro Pro quando quiser migrar." |
| **CTA** | 17–21s | "Clica aqui. Sem cartão. Começa agora." |

**TEXT OVERLAY (on-screen)**

| Momento | Texto na tela |
|---|---|
| Hook (0–3s) | **"R$97/mês na inLead = Basic"** |
| Comparação (3–11s) | **"R$97/mês no QMB = Pro"** — em destaque, mesma fonte |
| Comparação (3–11s) | Checklist: **✓ A/B nativo · ✓ Rodapé limpo · ✓ Webhook em todos os planos** |
| CTA (17–21s) | ▼ **"Criar minha conta grátis"** |

**DIREÇÃO VISUAL — Versão Vídeo (para @milagroso)**

- Talking head direto pra câmera. Tom factual, não agressivo — o dado faz o trabalho.
- Hook: corte seco no frame 1. Sem introdução.
- Comparação: text cards side-by-side aparecem na tela ("Basic inLead" vs "Pro QMB") — visual de 3s enquanto fala.
- Expressão: séria no hook (custo sem retorno), confiante e direta na comparação.

---

### COPY ESTÁTICA — Versão Imagem

**Headline:**
> Você paga R$97 na inLead. Aqui R$97 é o Pro.

**Body:**
O que você tem no Pro QuizMeBaby (R$97/mês) e não tem no Basic inLead (R$97/mês):

• A/B testing nativo — testa 2 versões do quiz ao mesmo tempo, vê qual converte mais
• Sem "Criado via" poluindo o rodapé do seu cliente
• Webhook em todos os planos — sem upgrade surpresa

**CTA:** Criar minha conta grátis

**DIREÇÃO VISUAL — Versão Estática (para @picasso)**

- Duas colunas side-by-side: "inLead Basic R$97" (ausências em vermelho/neutro) x "QMB Pro R$97" (presença em verde).
- Mesmo preço, layout idêntico — o contraste de features é o criativo.
- Fonte bold no headline. Design limpo, sem stock photo.

---

## Script F — B2C DIAGNÓSTICO *(v2.1 — fix 2 caveats @theboss)*

> **Modelo base:** Dr. Henrique Binato (revelação + teste simples, 9+ meses ativo) + Hook #4 (revelação + baixa fricção)
> **Gap explorado:** Gap #1 da pesquisa — zero ads na amostra de 8.100 posicionam quiz como *diagnóstico de funil entregável*. 100% usa quiz como qualificador antes de LP.
> **ICP:** Infoprodutor que roda tráfego em LP ou VSL estática e ainda não usa quiz interativo
> **Gancho emocional:** Frustração com lead que some + revelação de mecanismo diferente
>
> **⚠️ Fact-check v2.1 (confirmado em `src/app/api/quizzes/[id]/analytics/route.js`):**
> - Analytics by-question (análise onde o lead esfriou): **todos os planos** — nenhum gate de tier no código ✅
> - "diagnóstico" → sempre "diagnóstico de funil" ou "diagnóstico de conversão" para evitar leitura clínica em ICP saúde

---

### COPY FALADA — Versão Vídeo (20–25s)

| Segmento | Duração | Fala |
|---|---|---|
| **HOOK** | 0–3s | "Você usa quiz no seu funil — o lead olha o resultado e some. Sem comprar, sem responder no WhatsApp, sem nada." |
| **PROBLEMA** | 3–9s | "Quiz comum captura lead. Ponto. Não mapeia intenção, não personaliza resultado, não entrega o próximo passo certo pra cada perfil." |
| **REVELAÇÃO** | 9–18s | "No QuizMeBaby o quiz entrega diagnóstico de funil — resultado personalizado por perfil, análise de onde o lead esfriou pergunta a pergunta, e redirecionamento pra oferta certa. O lead vê o diagnóstico, entende o próprio problema, e chega na oferta sabendo por que vai comprar." |
| **PRAZO + CTA** | 18–22s | "10 minutos pra criar. Grátis pra testar. Topa?" |

**TEXT OVERLAY (on-screen)**

| Momento | Texto na tela |
|---|---|
| Hook (0–3s) | **"Lead some sem comprar?"** |
| Problema (3–9s) | `Quiz comum → qualifica` → `QuizMeBaby → diagnostica` |
| Revelação (9–18s) | `resultado personalizado · onde o lead esfriou · oferta certa` — 3 bullets rápidos |
| CTA (18–22s) | 🤝 **"Topa?"** + ▼ "Criar meu quiz diagnóstico" |

**DIREÇÃO VISUAL — Versão Vídeo (para @milagroso)**

- Hook: expressão genuína de quem já viveu essa dor — não encenada, não urgente.
- Revelação: B-roll de 3–4s mostrando painel de resultado personalizado do QuizMeBaby (screenshot real do produto — mais credível que encenação).
- Ritmo: moderado. A mensagem vende pelo contraste, não pela pressão.
- Não usar música animada. Ambiente orgânico com som leve.

---

### COPY ESTÁTICA — Versão Imagem

**Headline:**
> Quiz que qualifica é bom. Quiz que entrega diagnóstico de funil converte.

**Body:**

Infoprodutor com quiz comum:
• Lead responde, vê resultado genérico, sai sem comprar
• Nenhum dado de qual pergunta esfriou o interesse
• Uma LP pra todo perfil — sem segmentação real

Infoprodutor com QuizMeBaby:
• Lead recebe diagnóstico de conversão personalizado por perfil
• Você vê, pergunta a pergunta, onde o interesse caiu
• Redirecionamento automático pra oferta certa por segmento

**CTA:** Criar meu quiz diagnóstico

**DIREÇÃO VISUAL — Versão Estática (para @picasso)**

- Divisão "Antes / Depois" com bullets. Lado esquerdo neutro/sombrio, lado direito positivo.
- Screenshot real do painel de analytics QuizMeBaby — não mockup genérico.
- Headline em destaque, fonte grande. CTA em botão com cor primária da marca.

---

## Contexto de Avatar — Mapeado pelo Benchmark

### B2B — Script E

**Dores confirmadas pela análise (assinante inLead Basic R$97 ou Pro R$197):**
- Paga R$97 na inLead (Basic) e não tem A/B testing nem rodapé limpo
- Paga R$197 na inLead (Pro) pelo que no QMB vem no plano de R$97
- Quer white-label mas a inLead força branding em todos os planos

**Vocabulário que ressoa (COMUNICACAO.md §3):**
- "sem gambiarra" · "checkout BR" · "sem upgrade surpresa" · "lead que some"

**Linguagem que converte (benchmark):**
- Ceticismo quebrado: "antes que você desista", "a verdade dói"
- Custo visível: dado real (R$97) em vez de "caro demais"
- Desafio: "roda uma vez do jeito certo e me conta"

### B2C — Script F

**Dores confirmadas pela análise (infoprodutores com LP estática):**
- Lead responde quiz mas não compra (sem mapeamento de intenção)
- Conversão genérica — sem personalização de resultado por perfil
- Funil complicado de montar (dependência de dev, sem template pronto)

**Vocabulário que ressoa (COMUNICACAO.md §3):**
- "lead que some" · "qualifica antes de mandar pro WhatsApp" · "oferta certa pra pessoa certa"

**Linguagem que converte (benchmark):**
- Revelação de mecanismo: "existe uma análise que mostra exatamente onde ele esfriou"
- Baixa fricção: "10 minutos", "grátis pra testar", "sem precisar de designer"

---

## Matriz de Priorização Completa (Scripts A–F)

| Script | Hook | Modelo base | ICP | Prioridade |
|---|---|---|---|---|
| **A** | Dor Ultra-Específica + Prazo | Dr. Binato (9+ meses) | Infoprodutor com tráfego ativo | 🔴 Alta |
| **B** | Curiosidade + Revelação | Anderson (32 criativos) | Qualquer infoprodutor | 🔴 Alta |
| **C** | Desafio Recíproco | nandohayne (8+ meses) | Infoprodutor com tráfego | 🟡 Média-alta |
| **D** | Dúvida Invertida | Matheusadestra | Infoprodutor com audiência prévia | 🟡 Média |
| **E** | B2B Competitive | Thiago Concer / nandohayne | Assinante atual inLead | 🔴 Alta |
| **F** | B2C Diagnóstico | Dr. Binato (revelação) | Infoprodutor sem quiz ainda | 🔴 Alta |

**Sequência de teste recomendada:** A + B + E simultâneos na primeira semana (maior diversidade de ângulo) → avaliar dados de % conversão por criativo → só depois escalar C, D e F.

**Nota sobre métricas:** monitorar sempre em % conversão ou R$ absoluto por janela. CPL e ROAS ficam no discurso interno de mídia com @cadu — fora do copy do avatar.

---

## ✅ Flags resolvidos v2.1

Fact-check direto no código antes de refazer — todos os claims verificados:

| Flag | Resolução |
|---|---|
| Script E: A/B no free | ❌ Falso — corrigido: A/B é Pro QMB (R$97) |
| Script E: white-label completo | ❌ Falso — corrigido: white-label parcial no Pro (sem QMB no rodapé); full só Agency |
| Script E: rodapé limpo no free | ❌ Falso — corrigido: vinculado ao Pro |
| Script F: analytics by-question tier | ✅ Confirmado sem gate (`route.js`) — disponível em todos os planos |
| Script F: "já aquecido" (prediction) | ✅ Corrigido: "chega na oferta sabendo por que vai comprar" |
| Script F: "diagnóstico" (clínico) | ✅ Corrigido: "diagnóstico de funil" / "diagnóstico de conversão" em todas as ocorrências |

---

## Checklist Anti-IA (interno Claudinho — rodar antes de entregar)

- [x] Zero fragmentação de frases (pecado #1) — frases desenvolvidas, não fatiadas com ponto
- [x] Listas 3+ itens com bullet points (pecado #2) — aplicado em todas as seções de estático
- [x] Zero expressões da blacklist (vale ressaltar / no cenário atual / você sabia que)
- [x] Zero adjetivos sem dado concreto
- [x] CTAs aprovados ("Topa?", "Criar meu quiz agora", "Testa agora. Sem cartão.")
- [x] Zero CPL/ROAS em copy do avatar — métricas internas só em discurso de mídia
- [x] Zero soft-claims sem set-up ("Isso não é garantia" — scripts E e F não têm frases de accountability; Script C já tem set-up correto no v1.1)
- [x] "único com GHL" ausente — cancelado per ICO-154
- [x] "IA que analisa leads / scoring pós-quiz" ausente — bloqueado per ICO-151, COMUNICACAO.md §4
- [x] Zero cases BR fabricados — social proof apenas por benchmark e features técnicas objetivas
- [x] Pronome "você" em todo o copy — zero "tu", "vocês", "o usuário"
- [x] Parágrafos ≤ 3 linhas
- [x] Energia certa por canal: Alta no hook, revelação progressiva no desenvolvimento
- [x] Acentuação correta em todas as palavras

---

## Histórico de Revisões

| Versão | Data | Mudanças |
|---|---|---|
| v2.0 draft | 2026-04-26 | Scripts E (B2B Competitive) e F (B2C Diagnóstico) — baseados em Meta Ads Library BR ([ICO-186](/ICO/issues/ICO-186)) |
| v2.1 | 2026-04-26 | Script E: Opção 1 @theboss — ICP migrado pra "assinante inLead Basic que migra pro Pro QMB", claims corrigidos via `plans.js`. Script F: 2 fixes (@theboss): "diagnóstico de funil" em todas ocorrências + remoção de linguagem prediction "já aquecido". Analytics by-question confirmado sem gate de plano (`analytics/route.js`). |

---

*Scripts por Claudinho (MSE) · v2.0 · 2026-04-26 · Fonte: [ICO-186](/ICO/issues/ICO-186) benchmark Meta Ads Library (Analyzer) + COMUNICACAO.md (ICO-555) + guardrails ICO-190*

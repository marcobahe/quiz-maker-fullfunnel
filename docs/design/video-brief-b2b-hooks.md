# Video Brief B2B — 3 Hooks QuizMeBaby (A/B/C)

> **Milagroso** · MSE · 2026-04-23 · [ICO-191](/ICO/issues/ICO-191)
> Formato: 1080×1920 (Reels/Stories) · 30fps · MP4 + WebM
> Stack: Remotion (React for Video) · Projeto: `workers/video-ads/`

---

## Referências aplicadas

- Benchmark frame-by-frame top performers inLead → `docs/research/video-analysis-topliner.md` ([ICO-190](/ICO/issues/ICO-190))
- Brandbook QuizMeBaby v1.2 → `docs/design/quizmebaby-brand-brief.md`
- Hooks validados por Cadu → issue [ICO-191](/ICO/issues/ICO-191)

---

## Design System aplicado

### Paleta em uso

| Token            | Hex       | Papel no vídeo                              |
|------------------|-----------|---------------------------------------------|
| `bg-dark`        | `#0a0c1b` | Background base — todas as cenas            |
| `color-primary`  | `#6366f1` | Indigo — hero text, highlights, gradient    |
| `color-accent`   | `#F43F5E` | Rose — CTA buttons, palavras de urgência    |
| `color-gold`     | `#F59E0B` | Amber — números, prazo, gamificação         |
| `surface-dark`   | `#1e293b` | Cards de comparação, containers             |
| White            | `#ffffff` | Headline principal, copy de desenvolvimento |

### Gradiente hero
```
135deg: #6366f1 → #8b5cf6 → #EC4899
```

### Tipografia
- Headlines/hook: **Outfit 800** ≥ 64px
- Sub-headlines: **Outfit 700** 40–48px
- Copy development: **Inter 500** 28–32px
- Micro-copy/legal: **Inter 400** 20–22px

### CTAs (nomeados, não "Saiba Mais")
- Primário: **`CRIAR MEU QUIZ GRÁTIS`**
- Secundário: **`TESTAR SEM CARTÃO`**

---

## Hook A — Pergunta Direta de Dor

**Copy de abertura:** *"Você ainda paga R$97/mês em quiz builder?"*

**Padrão benchmark aplicado:** `DOR ULTRA-ESPECÍFICA + PRAZO` (Dr. Binato V8 — anúncio mais longevo, 9+ meses)

**Duração:** 20s = 600 frames

### Storyboard

| # | Cena | Duração | Copy on-screen | Elementos visuais | Animações | Ritmo |
|---|------|---------|----------------|-------------------|-----------|-------|
| 1 | **HOOK** | 0–2s (60fr) | "Você ainda paga" → "R$97/mês" → "em quiz builder?" | Bg dark `#0a0c1b`, linha por linha em stagger | L1: fadeIn delay 0 · L2: `scale` delay 10 (indigo, 88px) · L3: slideUp delay 25 | Corte seco, impacto |
| 2 | **IDENTIFICAÇÃO** | 2–6s (120fr) | "Enquanto você paga mensalidade," + "seus leads nem qualificam direito." | Duas linhas com `slideUp` stagger 15fr cada | Sub em Inter 500 28px branco 70% | Médio |
| 3 | **PIVOT / REVELAÇÃO** | 6–11s (150fr) | "QuizMeBaby é grátis pra começar." + "4 checkouts BR nativos." + "Relatório automático por lead." | 3 bullets com ✓ prefix, slideUp stagger 20fr · ícone checkmark `#F59E0B` | Bullets em Inter 500 28px | Ritmo de lista, construção |
| 4 | **COMPARAÇÃO** | 11–15s (120fr) | Card esquerda: `R$97/mês` tachado · Card direita: `GRÁTIS` em verde | Dois cards surface-dark lado a lado, `scale` animation · Valor riscado em rose, gratuito em `#10B981` | Cards com `slideLeft` / `slideRight` simultâneo | Contraste máximo |
| 5 | **PROVA SOCIAL** | 15–18s (90fr) | "10.000+ leads capturados" + "por criadores BR" | Número counter em Outfit 800 64px gold `#F59E0B`, `scale` de 0 | Contador de 0 → 10.000 | Impacto crescente |
| 6 | **CTA** | 18–20s (60fr) | "CRIAR MEU QUIZ GRÁTIS" em botão · "TESTAR SEM CARTÃO" sub | Botão com bg rose `#F43F5E`, slideUp delay 0 · Sub Inter regular delay 15 | Botão `scale` + pulse leve | Encerramento de urgência |

### Notas de direção (Hook A)
- Cena 1: "R$97/mês" precisa dominar o frame — Outfit 800, ~88px, cor indigo, escala de 0.7→1 com spring
- Cena 4: Momento mais contrastante — silencioso visual, deixa os cards "respirarem" por 2 cenas
- CTA: sem countdown, sem urgência artificial — a oferta gratuita já é o gatilho

---

## Hook B — Desafio + Prazo

**Copy de abertura:** *"Crie seu quiz em 10 min. Desafio."*

**Padrão benchmark aplicado:** `DESAFIO + RECIPROCIDADE` (nandohayne V1/V2 — longevidade 8+ meses)

**Duração:** 18s = 540 frames

### Storyboard

| # | Cena | Duração | Copy on-screen | Elementos visuais | Animações | Ritmo |
|---|------|---------|----------------|-------------------|-----------|-------|
| 1 | **HOOK — IMPACTO** | 0–1.5s (45fr) | "Crie seu quiz" → "em 10 min." → "Desafio." | L1 branco slideUp delay 0 · L2 gold `#F59E0B` scale delay 8 (80px) · L3 rose `#F43F5E` typewriter delay 20 | Typewriter em "Desafio." — 1 letra por 3fr | Corte seco, provocação |
| 2 | **DESAFIO EXPLICITADO** | 1.5–5s (105fr) | "Cria o quiz em 10 minutos." + "Ativa o link." + "Vê o lead chegar." | 3 steps numerados (01/02/03) em gold, desc em branco · slideUp stagger 20fr por step | Steps: Outfit 700 48px (número) + Inter 500 28px (desc) | Ritmo acelerado |
| 3 | **APOSTA** | 5–10s (150fr) | "Se não conseguir em 10 min," + "a gente configura pra você." + "De graça." | Linha 1 normal · Linha 2 + bold · "De graça." em indigo `#6366f1` bold, scale | L3 scale delay 20 — pausa dramática antes de "De graça." | Pausa + impacto |
| 4 | **TOPA?** | 10–14s (120fr) | "Topa? 🤝" | Texto grande (Outfit 800, 80px), cor branca, escala de 0 com spring · Emoji integrado | `scale` animation — preenche o frame | Convite / reciprocidade |
| 5 | **PREVIEW PRODUTO** | 14–17s (90fr) | UI mockup do quiz builder com pergunta sample: *"Qual seu maior desafio hoje?"* | Screenshot/mock com `fadeIn` lento · Overlay border indigo blur | `fadeIn` com scale suave 1.05→1 | Suave, produto real |
| 6 | **CTA** | 17–18s (30fr) | "CRIAR MEU QUIZ GRÁTIS" | Botão rose, `scale` rápido | Corte final limpo | Urgente, fechamento |

### Notas de direção (Hook B)
- Cena 1: Os 3 elementos precisam chegar em < 1.5s — ritmo acelerado é o ponto
- Cena 3: "De graça." deve aparecer com 0.5s de delay após a linha anterior — pausa intencional
- Cena 4: "Topa? 🤝" em fullscreen — sem mais elementos. Respiração.
- Cena 5: Mockup do quiz builder é o proof visual — usar screenshot real do produto se disponível

---

## Hook C — Revelação + Teste (Diferenciação)

**Copy de abertura:** *"Um quiz que entrega relatório — diferente de qualquer builder BR"*

**Padrão benchmark aplicado:** `CURIOSIDADE + REVELAÇÃO + INCLUSÃO` (Anderson V9 — 32 criativos, maior escala)

**Duração:** 22s = 660 frames

### Storyboard

| # | Cena | Duração | Copy on-screen | Elementos visuais | Animações | Ritmo |
|---|------|---------|----------------|-------------------|-----------|-------|
| 1 | **HOOK — REVELAÇÃO** | 0–2.5s (75fr) | "Um quiz" → "que entrega relatório." → "Diferente de qualquer builder BR." | L1: fadeIn branco pequeno (Inter 500 32px) · L2: blur reveal Outfit 800 64px indigo · L3: Inter 400 22px amber slideUp | `blur` animation em L2 — efeito de revelação | Curiosidade crescente |
| 2 | **O QUE É O RELATÓRIO** | 2.5–7s (150fr) | "Cada lead recebe seu resultado personalizado." + "Automaticamente." + "Sem configurar nada." | Linha por linha slideUp stagger 20fr · "Automaticamente." em gold bold · "Sem configurar nada." em branco leve | Stagger sequencial, respira | Médio, didático |
| 3 | **COMPARAÇÃO CONCORRÊNCIA** | 7–12s (150fr) | "inLead: lead vai pro sheet." vs "QuizMeBaby: relatório + funil automático." | Dois cards side-by-side · Card inLead: surface-dark neutro, label "OUTROS" · Card QMB: borda indigo, glow leve | Cards `slideLeft` / `slideRight` · Glow animado no card QMB | Contraste de produto |
| 4 | **PROVA DO RELATÓRIO** | 12–17s (150fr) | Mock: relatório com foto do lead, score, recomendação de produto | Screenshot/mockup do relatório com dados fake · `zoomIn` suave 1.1→1 · Anotações com `fadeIn` | Overlay de texto explicativo fadeIn por cima | Demonstrativo |
| 5 | **AUTORIDADE / BENCHMARK** | 17–20s (90fr) | "inLead não faz isso." + "Magoquiz não faz." + "QuizMeBaby faz." | 3 linhas com stagger 15fr · L1/L2 branco 60% · L3: branco 100% + underline indigo | `slideUp` sequencial · L3 com `scale` leve | Ritmo afirmativo |
| 6 | **CTA** | 20–22s (60fr) | "TESTAR SEM CARTÃO" principal · "Ver como funciona →" sub | Botão rose `#F43F5E` · Sub em Inter 400 · Arrow indicator | `scale` + `slideUp` sequencial | Encerramento premium |

### Notas de direção (Hook C)
- Cena 1: "blur" animation em "que entrega relatório." — é o momento de revelação, precisa de impacto
- Cena 3: Nunca mencionar concorrente de forma depreciativa — fato técnico neutro, o contraste faz o trabalho
- Cena 4: Mockup do relatório precisa parecer real — usar dados fake plausíveis (score 78/100, tags, recomendação)
- Cena 5: "QuizMeBaby faz." deve ser o frame mais limpo — sem outros elementos, só essa frase

---

## Especificações de Render

```
Format:     1080×1920 (Reels/Stories)
FPS:        30
Output:     MP4 (H.264) + WebM (VP9)
Bitrate:    4Mbps
Audio:      sem áudio (motion apenas)
Fontes:     Outfit (Google Fonts) + Inter (Google Fonts)
```

### Comando de render por variação
```bash
# Hook A
npx remotion render src/index.ts HookA out/hook-a.mp4 --props='{"variant":"A"}'
npx remotion render src/index.ts HookA out/hook-a.webm --props='{"variant":"A"}'

# Hook B
npx remotion render src/index.ts HookB out/hook-b.mp4 --props='{"variant":"B"}'
npx remotion render src/index.ts HookB out/hook-b.webm --props='{"variant":"B"}'

# Hook C
npx remotion render src/index.ts HookC out/hook-c.mp4 --props='{"variant":"C"}'
npx remotion render src/index.ts HookC out/hook-c.webm --props='{"variant":"C"}'
```

---

## Checklist pré-render

- [ ] Preview no Remotion Studio (npm run dev)
- [ ] Hook visual nos primeiros 90 frames ✅ (spec acima)
- [ ] CTA nomeado (não "Saiba mais") ✅
- [ ] Fontes carregadas via `staticFile` ou CDN
- [ ] Tipografia mínima: 48px headlines, 24px body ✅ (spec acima)
- [ ] Máx 3 cores por cena ✅ (bg + principal + destaque)
- [ ] Stagger em todos os grupos de elementos ✅
- [ ] MP4 + WebM renderes ✅ (2 por variação)

---

*Brief criado por Milagroso (Motion Designer, MSE) · [ICO-191](/ICO/issues/ICO-191) · 2026-04-23*

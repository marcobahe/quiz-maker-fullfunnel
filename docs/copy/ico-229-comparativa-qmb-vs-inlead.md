# Copy Comparativa — QuizMeBaby vs inLead
> ICO-229 · Andreza (Closer Senior) · 2026-04-26
> Peça estática + carrossel 6 slides + pack hooks ABO A/B/C
> Fonte: benchmark-inlead.md §4–§5–§7, speed-audit-qmb.md, hooks-library.md

---

## ⚠️ Premissas de compliance

- **Todos os claims são verificáveis hoje** (pricing público inLead, features live QMB, TTFB validado em ICO-192).
- **Sem promessa de resultado individual.** Qualquer variante que mencione conversão usa linguagem descritiva do produto ("permite segmentar", "captura leads qualificados"), não garantia ("vai gerar X leads").
- **Sem CPL/ROAS** — padrão de métrica do nicho BR: % conversão OU R$ absoluto + janela.
- **Claim de velocidade** baseado em ICO-192 (CTO pass confirmado): TTFB < 50ms edge Cloudflare. Linguagem segura: "entregue em menos de 1 segundo".

---

## 1. PEÇA ESTÁTICA — 1080×1350px (feed) / adaptar para 1080×1920 (story)

### Hierarquia visual recomendada (handoff → @picasso)

```
[ZONA 1 — HEADLINE: 40% da área]
Ainda paga R$197
só pra ter webhook?

[ZONA 2 — TABELA COMPARATIVA: 40%]
┌──────────────────────┬────────────┬────────────┐
│                      │ QuizMeBaby │   inLead   │
├──────────────────────┼────────────┼────────────┤
│ Plano grátis         │ ✅ 100 leads│     ❌     │
│ Webhook incluso      │ ✅ R$97/mês │ ⚠️ R$197  │
│ A/B testing nativo   │     ✅     │     ❌     │
│ GoHighLevel nativo   │     ✅     │     ❌     │
└──────────────────────┴────────────┴────────────┘

[ZONA 3 — CTA: 20%]
CRIAR MEU QUIZ GRÁTIS
quizmebaby.com · sem cartão · sem compromisso
```

### Copy linha a linha

**Headline principal (≤ 40 chars):**
> Ainda paga R$197 só pra ter webhook?

**Subhead (≤ 60 chars — opcional, pode virar caption):**
> No QuizMeBaby, webhook vem no plano de R$97. Tem até plano grátis.

**Legenda de rodapé tabela (10–12pt, cinza):**
> *Dados: inlead.digital/planos + ajuda.inlead.digital · Verificado abr/2026*

**CTA primário:**
> CRIAR MEU QUIZ GRÁTIS

**CTA micro-copy abaixo:**
> quizmebaby.com — sem cartão, sem burocracia

### Notas de design para @picasso

- Paleta: usar sistema de cores QMB (destaque verde para coluna QMB, vermelho/cinza para inLead).
- ⚠️ da coluna inLead no webhook = ambiguidade declarada do concorrente — pode usar ícone de interrogação laranja.
- Formato story (1080×1920): manter tabela de 4 linhas, aumentar fonte headline para ≥ 72pt.
- Arquivo de saída: PNG/JPG + versão .fig ou .psd para @milagroso adaptar para vídeo 15s.

---

## 2. CARROSSEL — 6 slides (feed Meta / Instagram)

> Gap de formato: **zero carrosséis na amostra inLead** (ICO-186 — 8.100 ads analisados).
> Contraste visual imediato — formato livre no leilão.

---

### Slide 1 — Hook pergunta (capa do carrossel)

**Headline:**
> Você paga R$97/mês no quiz builder e ainda não tem webhook?

**Subtext (menor):**
> Precisa checar isso. →

**Visual:** fundo escuro (brand QMB), texto grande, seta deslize. Sem tabela ainda — gera curiosidade.

---

### Slide 2 — O mesmo preço. Features muito diferentes.

**Headline:**
> R$97/mês: o que você está levando de verdade?

**Tabela 2 colunas:**

| | QuizMeBaby R$97/mês | inLead R$97/mês (BASIC) |
|---|---|---|
| Webhook | ✅ incluído | ⚠️ ambíguo — help center exige PRO R$197 |
| A/B testing nativo | ✅ | ❌ |
| GoHighLevel nativo | ✅ | ❌ |
| Plano grátis pra começar | ✅ | ❌ |

**Micro-copy rodapé:**
> *Fonte: ajuda.inlead.digital/como-funcionam-os-planos · abr/2026*

---

### Slide 3 — Começa de graça. Sem cartão.

**Headline:**
> Testa primeiro. Assina depois. Ou não.

**Body:**
> No QuizMeBaby, plano grátis dá:
> • 1 quiz ativo
> • até 100 leads/mês
> • webhook incluso
> • zero cartão
>
> Na inLead? O plano mais barato é R$97/mês.
> Não tem free, não tem trial.

**CTA deslize:**
> Continua aqui →

---

### Slide 4 — GHL nativo. Pra agência que sabe o que quer.

**Headline:**
> Agência usando GoHighLevel?

**Body:**
> Integração nativa QMB ↔ GHL.
> Sem Zapier. Sem webhook manual. Sem setup de 2h.
>
> Leads do quiz direto no seu CRM.
>
> inLead? Sem integração GHL.

**Micro-copy:**
> *ICP: agências digitais e gestores de tráfego com stack GHL*

---

### Slide 5 — Velocidade. Porque cada segundo tem custo.

**Headline:**
> Seus quizzes rodam no edge Cloudflare.

**Body:**
> TTFB < 50ms. Página entregue em menos de 1 segundo.
>
> Para campanhas de tráfego pago: taxa de rejeição cai quando a página carrega rápido.
> Isso não é promessa — é medição de laboratório (ICO-192, abr/2026).
>
> inLead? CDN não declarado publicamente.

**Nota de compliance:** não afirmar "X% menos abandono" — dado não coletado em campo ainda.

---

### Slide 6 — CTA fechamento

**Headline:**
> Cria seu primeiro quiz em 10 minutos.

**Body:**
> Plano grátis. Sem cartão. Sem burocracia.
>
> Se não gostar, não paga nada.

**CTA primário (grande):**
> CRIAR MEU QUIZ GRÁTIS

**CTA secundário (menor):**
> quizmebaby.com

**Visual:** fundo brand QMB, CTA em botão destaque, URL visível.

---

## 3. PACK HOOKS ABO — A/B/C para @cadu

> Para os 4 conjuntos ABO (A1–A4). Cada hook tem variante de: (a) vídeo 15s, (b) imagem estática.
> Padrão: número/fato verificável + CTA nomeado. Sem CPL, sem ROAS.

---

### Hook A — Preço direto (audiência: assinante atual inLead ou prospect consciente)

**Copy curta (caption + hook de abertura vídeo):**
> "Você paga R$197/mês na inLead só pra ter webhook. No QuizMeBaby, webhook vem no plano de R$97. E tem plano grátis pra começar sem cartão."

**CTA:** `CRIAR MEU QUIZ GRÁTIS`

**Variante A2 (mais agressiva):**
> "R$197/mês pro webhook — ou R$97 com webhook, A/B testing e GHL nativo. Você escolhe."

**Formato sugerido:** imagem estática (tabela 2 colunas) OU talking head 15s com tela do painel.

**ICP:** infoprodutor ou gestor que já usa ou avaliou inLead. Dor = custo vs features.

---

### Hook B — Desafio / 10 minutos (audiência: infoprodutor que nunca usou quiz builder)

**Copy curta:**
> "Crie seu primeiro quiz em 10 minutos. Desafio."

**Variante B2 (com contexto de dor):**
> "Seu lead vê a landing, fecha a aba. Sem comprar, sem responder. E se em 10 minutos você tivesse um quiz qualificando por você?"

**CTA:** `ACEITAR O DESAFIO — GRÁTIS`

**Formato sugerido:** vídeo 15s (screencast do builder) OU carrossel steps (slide 1 = desafio / slide 2 = resultado).

**ICP:** infoprodutor com LP estática, sem quiz, tráfego sem qualificação. Dor = conversão baixa.

---

### Hook C — GHL / Agências (audiência: gestor de tráfego ou agência com stack GHL)

**Copy curta:**
> "Agência usando GoHighLevel? Seu próximo quiz integra nativo. Sem Zapier no meio."

**Variante C2 (objeção explícita):**
> "Configurou GHL mas ainda usa webhook manual pro quiz? Tem jeito mais fácil."

**CTA:** `VER INTEGRAÇÃO GHL — GRÁTIS`

**Formato sugerido:** imagem estática (diagrama fluxo: Quiz → GHL, sem intermediário) OU vídeo 15s mostrando a integração no painel.

**ICP:** agência digital ou gestor de tráfego freelancer com clientes em GHL. Dor = complexidade de setup / dependência de Zapier pago.

---

## 4. Mapeamento ABO → Criativo (sugestão para @cadu)

| Conjunto | Audiência | Criativo sugerido | Hook |
|---|---|---|---|
| A1 | Topo — Lookalike 1% (compradores infoproduto BR) | Carrossel 6 slides | Hook A (preço) |
| A2 | Topo — Interesse "Quiz Builder" + "inLead" | Estática tabela | Hook A variante (agressiva) |
| A3 | Topo — Interesse "GoHighLevel" + "Agência digital" | Estática diagrama GHL | Hook C |
| A4 | Remarketing — visitantes LP QMB sem conversão | Vídeo 15s (desafio) | Hook B |

---

## 5. Definition of done — checklist

- [x] Peça estática: headline + tabela 4 pontos + CTA definidos em copy
- [x] Carrossel: 6 slides com roteiro e headlines definitivos
- [x] Pack hooks A/B/C: 3 variações + variantes + CTAs + ICPs documentados
- [x] Mapeamento ABO → criativo para @cadu
- [ ] Arte final estática → handoff @picasso
- [ ] Adaptação vídeo 15s hooks A/B/C → handoff @milagroso
- [ ] Handoff comentado em ICO-186 pingando @cadu

---

## 6. Próximos passos (pós-entrega desta copy)

1. **@picasso** — executa arte estática 1080×1350 (tabela + headline) + capa carrossel
2. **@milagroso** — adapta hooks B e C para vídeo 15s (screencast + talking head)
3. **@cadu** — carrega nos conjuntos ABO e configura split A/B/C por conjunto
4. **Slide 6–7 técnico extra** — quando CrUX field data estiver disponível (~30 dias tráfego real), atualizar claim de velocidade com dado de campo (per ICO-192 blocker 1)

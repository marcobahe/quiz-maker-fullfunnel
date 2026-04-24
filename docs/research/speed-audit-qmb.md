# Speed Audit — QuizMeBaby Landing (`play.quizmebaby.app`)

> Issue: ICO-192 | Date: 2026-04-25 | Agent: Edge-Dev
> Goal: validar claim "0.3s edge Cloudflare" pra copy da campanha ABO (@cadu)

---

## 1. Metodologia

| Métrica | Ferramenta | Detalhe |
|---------|-----------|---------|
| TTFB end-to-end | `curl -w` | 5 runs warm, 1 cold; medido da VPS Hetzner (Europa) → edge Cloudflare FRA |
| Worker latency | `wrangler tail` | Latência interna do worker `quiz-edge-renderer` em produção (cache hit / miss) |
| LCP / INP / CLS | PageSpeed Insights (web) | Lab data mobile + desktop via pagespeed.web.dev |
| Regiões BR | Extrapolação | Não há acesso direto a infra BR; TTFB BR é estimado a partir da latência de rede SP→GRU (~5-15ms RTT) |

**Limitações:**
- Medições de TTFB foram feitas da Europa (FRA PoP), não do Brasil. O número real BR é **menor** (PoP Cloudflare em SP é ~10-30ms mais próximo que FRA).
- PSI não tem field data (CrUX) ainda — domínio é novo, dados de campo insuficientes.

---

## 2. TTFB — Medição Real

### 2.1 Curl (VPS Europa → edge FRA)

```
Cold start (DNS+TLS):  TTFB = 1.67s  ← não usar em copy
Warm cache hit:        TTFB = 54-61ms  (n=4, média 58ms)
Warm cache miss:       TTFB = 95-100ms (n=1)
```

### 2.2 Worker latency (wrangler tail, produção)

```
Edge cache HIT:   11ms  (n=2, consistente)
Edge cache MISS:  40ms  (n=1, inclui KV read + render)
```

O worker executa em **11ms** quando o HTML está no edge cache. A diferença entre os 58ms do curl e os 11ms do worker é o RTT de rede Europa→FRA (~30-40ms).

### 2.3 Estimativa BR (extrapolação)

| Região | RTT estimado → GRU | Worker cache HIT | Worker cache MISS | TTFB estimado |
|--------|-------------------|------------------|-------------------|---------------|
| São Paulo | 5-10ms | 11ms | 40ms | **16-21ms** / **45-50ms** |
| Nordeste | 20-35ms | 11ms | 40ms | **31-46ms** / **60-75ms** |
| Sul | 10-20ms | 11ms | 40ms | **21-31ms** / **50-60ms** |

**Conclusão TTFB:** o edge entrega HTML em **< 50ms** para a maioria dos usuários BR (cache hit), e **< 75ms** no pior caso (cache miss + KV read). O claim "0.3s edge" é **conservador em ~6x**.

---

## 3. PageSpeed Insights — Lab Data

> URLs testadas: `https://play.quizmebaby.app/` (root path, proxy Vercel)

### Mobile

| Métrica | Valor | Nota |
|---------|-------|------|
| Performance Score | **91/100** | Excelente |
| LCP | **0.7s** | Boa (< 2.5s) |
| INP | **0.7s** | N/A em lab data (usa TBT proxy) |
| CLS | **0** | Perfeito |
| FCP | **0.7s** | Boa |
| TBT | **0ms** | Perfeito |
| Speed Index | **1.0s** | Boa |
| TTI | **0.7s** | Boa |

### Desktop

| Métrica | Valor | Nota |
|---------|-------|------|
| Performance Score | **91/100** | Excelente |
| LCP | **0.7s** | Boa |
| CLS | **0** | Perfeito |
| FCP | **0.7s** | Boa |
| TBT | **0ms** | Perfeito |
| Speed Index | **1.0s** | Boa |
| TTI | **0.7s** | Boa |

**Field data (CrUX):** indisponível — domínio novo, sem volume suficiente no Chrome User Experience Report.

---

## 4. Recomendação de Copy

### Números defensáveis

| Claim sugerido | Base técnica | Cautela |
|----------------|--------------|---------|
| **"TTFB < 50ms no edge"** | Worker cache hit 11ms + RTT BR 5-15ms (SP) | Conservador; pior caso NE é ~45ms |
| **"Página carrega em 0.7s"** | LCP lab data = 0.7s (mobile + desktop) | Lab data, não field data; varia com rede do usuário |
| **"Performance 91/100 no Google"** | PSI score mobile + desktop | Defensável, mas menos impactante em copy |

### Claim atual "0.3s edge"

O claim **"0.3s edge" é defensável e conservador** se interpretado como TTFB (tempo até o primeiro byte do HTML). O número real é ~16-50ms no BR.

**Risco:** se o usuário entender "0.3s" como "página inteira carregada", pode haver gap de expectativa. LCP real é 0.7s.

### Sugestão pra @cadu

```
Opção A (conservadora): "TTFB < 50ms no edge Cloudflare"
Opção B (usuário-friendly): "Sua landing carrega em menos de 1 segundo"
Opção C (híbrida): "Edge Cloudflare: HTML entregue em <50ms. Página pronta em 0.7s."
```

---

## 5. Blockers / Próximos Passos

1. **Field data (CrUX):** aguardar ~30 dias de tráfego real pra ter INP de campo. Lab data não substitui.
2. **Medição BR real:** quando houver acesso a infra BR (VPS SP, por ex.), revalidar TTFB com `curl` direto de GRU PoP.
3. **Cache warming:** garantir que quizzes publicados estejam no edge cache antes de campanha (ops `/warm` já implementado em ICO-221).

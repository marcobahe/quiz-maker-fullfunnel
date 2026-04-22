# Handoff de Design — ICO-149
## Landing QuizMeBaby + Upgrade-path Full Funnel

> Autor: UI-UX-Designer | Data: 2026-04-22 | Status: pronto para implementação
> Arquivo destino: `src/components/Landing/LandingPage.jsx` (719 linhas atual)
> Tokens de referência: `docs/design/quizmebaby-brand-brief.md` + `docs/design/design-tokens.md`

---

## Resumo Executivo

A landing page atual está funcional mas usa cores hard-coded (`#1e1b4b`, `#312e81`, `#4c1d95`) que divergem do design system aprovado. Este handoff alinha cada seção com os tokens oficiais, aplica o novo wordmark tipográfico, o tagline aprovado, e adiciona o **upgrade-path Full Funnel** na seção de pricing.

**Mudanças por seção:**

| Seção | Tipo de mudança | Esforço |
|-------|----------------|---------|
| Header — Logo | Wordmark tipográfico `Quiz`**`Me`**`Baby` | Baixo |
| Hero | Fundo + headline + tagline + badge | Médio |
| Pricing | Adicionar card Full Funnel + upgrade-path banner | Médio |
| CTA final | Tagline oficial | Baixo |
| Footer | Wordmark + tagline | Baixo |

---

## 1. Header — Logo

### Atual
```jsx
<div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-content: center">
  <span className="text-white text-lg font-bold">Q</span>
</div>
<span className={`text-lg font-bold transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
  QuizMeBaby
</span>
```

### Novo (wordmark tipográfico aprovado)
```jsx
{/* Logo — sem símbolo Q quadrado, wordmark tipográfico */}
<div className="flex items-center">
  <span className={`text-xl font-extrabold tracking-tight transition-colors font-display ${
    scrolled ? 'text-gray-900' : 'text-white'
  }`}>
    Quiz<span className="text-primary">Me</span>Baby
  </span>
</div>
```

**Por quê:** O símbolo "Q" quadrado foi descartado no processo de brand (ICO-157/ICO-159). A identidade tipográfica com "Me" em índigo é a direção aprovada.

---

## 2. Hero Section

### O que muda

**2.1 — Background gradient**

Atual: `from-[#1e1b4b] via-[#312e81] to-[#4c1d95]`
Novo: `from-[#0a0c1b] via-[#1e1040] to-[#2d1b69]` com blobs indexados aos tokens

```jsx
{/* Background */}
<div className="absolute inset-0" style={{
  background: 'linear-gradient(135deg, #0a0c1b 0%, #1e1040 50%, #2d1b69 100%)'
}} />
<div className="absolute inset-0 opacity-40">
  <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-[120px]"
    style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.45) 0%, transparent 70%)' }} />
  <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-[120px]"
    style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)' }} />
  <div className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full blur-[100px]"
    style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)' }} />
</div>
```

**2.2 — Badge / eyebrow**

Atual: "Builder visual drag & drop"
Novo:
```jsx
<div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/10">
  <Sparkles size={16} className="text-[#F59E0B]" />
  Quiz full-funnel para marketeiros BR
</div>
```

**2.3 — Headline**

Atual: "Crie Quizzes que Convertem"
Novo:
```jsx
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 font-display tracking-tight">
  Parece brincadeira.{' '}
  <span style={{
    background: 'linear-gradient(135deg, #a5b4fc 0%, #c084fc 50%, #f9a8d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  }}>
    Converte pra valer.
  </span>
</h1>
```

**2.4 — Subtítulo**

Atual: "Transforme visitantes em leads qualificados com quizzes interativos. Builder visual, gamificação, analytics e integrações — tudo em uma plataforma."
Novo (mais curto, mais direto, tom de voz BR):
```jsx
<p className="text-lg sm:text-xl mb-8 leading-relaxed max-w-lg" style={{ color: 'rgba(165,180,252,0.8)' }}>
  Crie quizzes que qualificam leads, segmentam audiência e guiam cada pessoa pro produto certo — sem código.
</p>
```

**2.5 — CTAs**

Primário: manter `bg-accent` (`#F43F5E`) — é o correto para CTA de conversão
Secundário: manter border white/20

```jsx
<Link
  href="/login"
  className="bg-accent hover:bg-accent-hover text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-xl hover:shadow-accent/30 flex items-center justify-center gap-2 group font-display"
>
  Criar meu quiz agora
  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
</Link>
```

**2.6 — Social proof badges (abaixo dos CTAs)**

Atual: "Grátis para começar · Sem cartão de crédito"
Novo: adicionar métrica de conversão
```jsx
<div className="flex flex-wrap items-center gap-6 mt-8 text-sm" style={{ color: 'rgba(165,180,252,0.6)' }}>
  <span className="flex items-center gap-1.5">
    <Check size={16} className="text-green-400" /> Grátis para começar
  </span>
  <span className="flex items-center gap-1.5">
    <Check size={16} className="text-green-400" /> Sem cartão de crédito
  </span>
  <span className="flex items-center gap-1.5">
    <Check size={16} className="text-[#F59E0B]" /> Média de 68% de conversão
  </span>
</div>
```

**2.7 — Mockup (lado direito)**

O mockup existente já está bem estruturado. Ajustes:
- URL no browser: `quizmebaby.com/builder` (era `quizmaker.com.br/builder`)
- Logo dentro do mockup: `QuizMeBaby` (sem símbolo Q)
- Floating badge "+47% conversão" → manter, é bom

---

## 3. Pricing Section — Upgrade-path Full Funnel

Esta é a mudança mais estratégica. Precisamos:
1. Adicionar card **Full Funnel** como plano premium destacado
2. Adicionar **banner de upgrade** para clientes existentes

### 3.1 — Banner de Upgrade (acima dos cards)

Adicionar banner contextual antes dos cards de pricing quando cliente já é Pro/Business:
```jsx
{/* Upgrade Banner — Full Funnel */}
<Reveal>
  <div className="mb-12 rounded-2xl overflow-hidden max-w-5xl mx-auto"
    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #EC4899 100%)' }}>
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8">
      <div className="text-white">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={18} className="text-[#F59E0B]" />
          <span className="text-sm font-bold uppercase tracking-wider text-white/70">Full Funnel</span>
        </div>
        <h3 className="text-xl md:text-2xl font-extrabold font-display mb-1">
          Já tem o QuizMeBaby? Migre pro Full Funnel.
        </h3>
        <p className="text-white/70 text-sm max-w-md">
          Integração automática dos seus quizzes com GHL, e-mail marketing e WhatsApp. Seu funil completo em uma stack.
        </p>
      </div>
      <div className="shrink-0">
        <Link
          href="/upgrade-full-funnel"
          className="inline-flex items-center gap-2 bg-white text-[#6366f1] font-bold px-6 py-3 rounded-xl text-sm transition-all hover:shadow-xl hover:shadow-white/20 group"
        >
          Ver upgrade com desconto
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  </div>
</Reveal>
```

### 3.2 — Cards de Pricing — adicionar Full Funnel

Alterar de 3 planos (`['free', 'pro', 'business']`) para 4 planos, com Full Funnel como 4º card especial:

```jsx
<div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
  {/* Planos Free, Pro, Business — mantém estrutura atual */}
  {['free', 'pro', 'business'].map((planId, i) => {
    const plan = PLANS[planId];
    return (
      <Reveal key={planId} delay={i * 100}>
        {/* card atual — sem mudança estrutural */}
      </Reveal>
    );
  })}

  {/* Full Funnel — card especial */}
  <Reveal delay={300}>
    <div className="relative rounded-2xl overflow-hidden border-0 shadow-2xl"
      style={{ background: 'linear-gradient(160deg, #0a0c1b 0%, #1e1040 50%, #2d1b69 100%)' }}>
      
      {/* Badge topo */}
      <div className="absolute -top-0 left-0 right-0 h-1"
        style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #EC4899)' }} />
      
      <div className="p-8">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={16} className="text-[#F59E0B]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#F59E0B]">Recomendado</span>
        </div>
        
        <h3 className="text-xl font-extrabold text-white font-display mb-1">Full Funnel</h3>
        <p className="text-sm text-white/50 mb-6">Stack completo: Quiz + GHL + WhatsApp + IA</p>

        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white font-display">R$497</span>
            <span className="text-sm text-white/50">/mês</span>
          </div>
          <div className="text-xs text-[#F59E0B] mt-1 flex items-center gap-1">
            <Check size={12} />
            Clientes QuizMeBaby ganham 20% off
          </div>
        </div>

        <ul className="space-y-3 mb-8">
          {[
            'Tudo do Business',
            'Integração GHL nativa',
            'Automação WhatsApp (leads → contato)',
            'Qualificação por IA',
            'Funnels pré-configurados',
            'Onboarding 1:1 incluso',
          ].map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-white/80">
              <Check size={16} className="mt-0.5 shrink-0 text-[#6366f1]" />
              {feature}
            </li>
          ))}
        </ul>

        <Link
          href="/upgrade-full-funnel"
          className="w-full block text-center py-3 rounded-xl font-bold text-sm transition-all font-display"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }}
        >
          Conhecer Full Funnel →
        </Link>
      </div>
    </div>
  </Reveal>
</div>
```

### 3.3 — Heading da seção Pricing (atualizar)

```jsx
<span className="text-[#6366f1] font-semibold text-sm uppercase tracking-wider">Preços</span>
<h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3 mb-4 font-display">
  Do quiz isolado ao funil completo
</h2>
<p className="text-lg text-gray-500 max-w-2xl mx-auto">
  Comece grátis, cresça no seu ritmo. Ou pule direto pro Full Funnel.
</p>
```

---

## 4. CTA Section — Tagline oficial

### Atual
"Pronto para criar quizzes que convertem?"

### Novo
```jsx
<h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 font-display">
  Parece brincadeira.<br />
  <span className="text-[#6366f1]">Converte pra valer.</span>
</h2>
<p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
  Junte-se a marketeiros e criadores BR que já qualificam leads com QuizMeBaby.
</p>
```

---

## 5. Footer — Wordmark + tagline

### Logo no footer

```jsx
{/* Brand no footer */}
<div className="flex items-center gap-2 mb-3">
  <span className="text-lg font-extrabold font-display text-white">
    Quiz<span className="text-[#6366f1]">Me</span>Baby
  </span>
</div>
<p className="text-sm leading-relaxed mb-1 text-gray-400">
  Parece brincadeira. Converte pra valer.
</p>
<p className="text-xs text-gray-600">
  Quiz full-funnel para marketeiros e criadores BR.
</p>
```

---

## 6. Checklist de Implementação

```
[ ] Header logo: remover Q quadrado, aplicar wordmark tipográfico
[ ] Hero background: atualizar para #0a0c1b → #1e1040 → #2d1b69
[ ] Hero blobs: alinhados aos tokens (indigo, violet, rose)
[ ] Hero badge: "Quiz full-funnel para marketeiros BR"
[ ] Hero H1: tagline "Parece brincadeira. Converte pra valer."
[ ] Hero H1 gradiente: usar tokens aprovados (lavanda/violet/rose)
[ ] Hero subtítulo: copy novo mais direto
[ ] Hero CTA primário: texto "Criar meu quiz agora"
[ ] Hero CTA social proof: adicionar "68% conversão"
[ ] Hero mockup URL: quizmebaby.com/builder
[ ] Pricing heading: "Do quiz isolado ao funil completo"
[ ] Pricing: banner upgrade Full Funnel acima dos cards
[ ] Pricing: grid de 4 colunas, card Full Funnel adicional (dark)
[ ] Pricing card FF: stripe gradiente topo, features GHL/WhatsApp/IA
[ ] Pricing card FF: badge "20% off pra clientes QuizMeBaby"
[ ] CTA section: tagline oficial
[ ] Footer: wordmark tipográfico sem símbolo
[ ] Footer: tagline "Parece brincadeira. Converte pra valer."
```

---

## 7. Notas de Implementação

### font-display
O Tailwind já tem `fontFamily.display: ["Outfit", ...]` configurado. Usar `font-display` para todos os títulos e CTAs. **Não usar `font-bold` isolado em headings** — sempre `font-extrabold font-display`.

### Cores via token vs hard-coded
- Usar `bg-primary` / `text-primary` onde possível (Tailwind config já tem `primary: "#6366f1"`)
- Usar `bg-accent` para CTAs de conversão (já configurado como `#F43F5E`)
- Para gradiente hero e blobs: usar `style={}` inline apenas quando o token Tailwind não existe

### Rota `/upgrade-full-funnel`
Ainda não existe — criar como página estática simples ou redirect temporário para `/pricing` enquanto a página Full Funnel não está pronta. Não bloquear o handoff por isso.

### Grid de 4 colunas no mobile
Em mobile (< md), os 4 cards de pricing devem ser exibidos em coluna única com scroll. Usar `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`.

### Teste visual mínimo
Após implementação, verificar:
1. Logo legível em fundo dark (hero) e light (scrolled)
2. H1 com gradiente renderiza em Safari (testar -webkit-text-fill-color)
3. Card Full Funnel não quebra em grid md:2 colunas
4. Banner de upgrade não empurra conteúdo em mobile

---

## 8. Assets Pendentes (Picasso / ICO-165)

Os PNGs do moodboard (Tier 1) ainda estão sendo gerados. Quando disponíveis em `screenshots/brand/`:
- `moodboard-A3.png` pode substituir o browser mockup no hero (ou ser usado em seção de features)
- `moodboard-D1.png` ou `moodboard-D4.png` podem ser usados como background OG image
- Não bloquear implementação por esses assets — o hero mockup inline é suficiente para v1

---

_Handoff gerado por UI-UX-Designer | ICO-157 → ICO-149_

# QuizMeBaby — Brand Brief v1.1
> D23 | Autor: UI-UX-Designer | Status: validado pós-moodboard ICO-159

---

## 1. Posicionamento de Marca

### Quem é o QuizMeBaby?
QuizMeBaby é uma **plataforma de quiz full-funnel** para marketeiros e infoprodutores brasileiros. Ela transforma perguntas em pipeline — capturando leads qualificados, segmentando audiência e guiando o usuário para o resultado certo (e para o produto certo).

### O que o nome significa?
- **Quiz** — o produto principal. Quiz interativo, engajante, que converte.
- **Me** — empoderamento. "Faça quiz comigo" / "me quiz" (eu sei o quiz). Agency do usuário.
- **Baby** — acessível, sem fricção, sem intimidação. Não é enterprise moroso, é tool de creator.

Sonoridade: irreverente, memorável, com pegada BR. Ressoa com "Baby Shark" + cultura de quiz de Instagram + sensação de "isso é fácil e eu consigo".

### Tagline oficial (validado D23)
> **"Parece brincadeira. Converte pra valer."**

### Arquétipo de marca
**O Trickster Estratégico** — parece brincadeira, mas converte pra valer.
- Duolingo (gamificação séria com cara divertida)
- Hotmart (credibilidade de negócio BR)
- Typeform (elegância de UX em quiz)

---

## 2. Persona Visual

### Quem é nosso usuário primário?
**Infoprodutor/a BR**, 25–45 anos, que já usa GHL, Hotmart ou Kiwify, vende curso/mentoria, quer qualificar lead antes de mandar pro WhatsApp ou funil de vendas. Usa o celular pra tudo. Não tem paciência pra tool complexa.

### Imagem mental que a marca deve evocar
> "Essa tool parece séria e converte, mas é gostoso de usar."

Referências de produto: Typeform + Duolingo + Lemon Squeezy
Referências estéticas: gradiente cósmico escuro + glassmorphism + UI tátil 3D

---

## 3. Paleta de Cores

### Cores Primárias

| Token            | Hex       | Uso                                      |
|------------------|-----------|------------------------------------------|
| `--color-primary`      | `#6366f1` | Indigo — ação principal, links, foco     |
| `--color-primary-dark` | `#4f46e5` | Hover do primário, depth                 |
| `--color-accent`       | `#F43F5E` | Rose — CTA de conversão, urgência, alert |
| `--color-gold`         | `#F59E0B` | Amber — gamificação, badges, premium     |

### Cores de Suporte

| Token              | Hex       | Uso                                      |
|--------------------|-----------|------------------------------------------|
| `brand-pink`       | `#EC4899` | Personalidade, destaque secundário       |
| `brand-blue`       | `#3B82F6` | Info, links externos                     |
| `brand-orange`     | `#F97316` | Alerta suave, highlight                  |
| `brand-teal`       | `#14B8A6` | Sucesso alternativo, análise             |

### Fundos

| Token              | Hex       | Uso                                      |
|--------------------|-----------|------------------------------------------|
| `bg-dark`          | `#0a0c1b` | Background dark mode (default UI)        |
| `surface-dark`     | `#1e293b` | Cards, modais dark                       |
| `bg-light`         | `#f0f4ff` | Background light mode                    |
| `surface-light`    | `#ffffff` | Cards, inputs light                      |

### Paleta do Gradiente Hero (uso em landing + onboarding)
```
from: #6366f1 (indigo)  →  via: #8b5cf6 (violet)  →  to: #EC4899 (pink)
```
Direção preferida: `135deg` (diagonal baixo-direita = movimento/progresso)

### Semânticas

| Situação  | Cor        | Hex       |
|-----------|------------|-----------|
| Sucesso   | Green      | `#10B981` |
| Erro      | Rose       | `#F43F5E` |
| Aviso     | Amber      | `#F59E0B` |
| Info      | Blue       | `#3B82F6` |

---

## 4. Tipografia

### Escala de Fontes

| Papel        | Família           | Pesos usados      | Notas                              |
|--------------|-------------------|-------------------|------------------------------------|
| `display`    | **Outfit**        | 600, 700, 800     | Títulos, hero, CTAs grandes        |
| `body`       | **Spline Sans**   | 400, 500          | Parágrafos, labels, tooltips       |
| `sans`       | **Inter**         | 400, 500, 600     | UI elements, tabelas, badges       |

### Escala Tipográfica (px → rem)

| Label     | Size     | Weight | Line-height | Uso típico                    |
|-----------|----------|--------|-------------|-------------------------------|
| `hero`    | 48–64px  | 800    | 1.1         | H1 da landing                 |
| `h1`      | 36px     | 700    | 1.2         | Título de página               |
| `h2`      | 28px     | 700    | 1.3         | Seção / painel                |
| `h3`      | 22px     | 600    | 1.35        | Card title, modal title        |
| `body-lg` | 18px     | 400    | 1.6         | Lead text, onboarding          |
| `body`    | 16px     | 400    | 1.6         | Padrão                        |
| `body-sm` | 14px     | 400    | 1.5         | Metadados, helper text         |
| `caption` | 12px     | 500    | 1.4         | Labels, badges, micro-copy     |

---

## 5. Tom de Voz (Brand Voice)

### Pilares

| Pilar          | Significa                                               | Anti-pattern                       |
|----------------|---------------------------------------------------------|------------------------------------|
| **Direto**     | Uma frase, uma ideia. Sem enrolação.                   | "Utilizando nossa plataforma..."   |
| **Celebratório** | Cada lead capturado merece reconhecimento.            | Indiferença ao resultado           |
| **De igual pra igual** | Fala com marketeiro, não pra marketeiro.      | Tom corporativo/burocrático        |
| **Credível**   | Linguagem de negócio (funil, ROI, conversão, lead)     | Hype vazio sem dado                |

### Exemplos de Copy

| Situação           | Tom certo                                      | Tom errado                          |
|--------------------|------------------------------------------------|-------------------------------------|
| Empty state quiz   | "Seu quiz tá dormindo. Vamos acordar?"         | "Nenhum quiz encontrado."           |
| Sucesso de lead    | "🎉 +1 lead qualificado. Esse funil tá fire." | "Lead capturado com sucesso."       |
| Error state        | "Algo deu ruim. Tenta de novo em 3 segundos." | "Erro interno do servidor."         |
| Onboarding step 1  | "Primeiro: como vai se chamar seu quiz?"       | "Digite o nome do questionário."    |
| CTA principal      | "Criar meu quiz agora"                         | "Iniciar criação de questionário"   |

### Regras de Escrita
- PT-BR, informal com profissionalismo
- "Você" (não "tu", não "o usuário")
- Emojis: só nos contextos de celebração/gamificação — máx 1 por mensagem
- Números em destaque: "3x mais leads", não "triplicar a captura de leads"
- Evitar: "solução", "ferramenta robusta", "ecossistema", "experiência"

---

## 6. Moodboard — 16 Referências Visuais

### Referências de Produto/UX (o que copiar na alma)

| # | Referência       | O que absorver                                      |
|---|------------------|-----------------------------------------------------|
| 1 | **Typeform**     | Perguntas em tela cheia, uma de cada vez. Foco total. Sem ruído. |
| 2 | **Duolingo**     | Gamificação integrada ao produto, não cosmética. Celebração constante. |
| 3 | **Hotmart**      | Credibilidade BR, infoprodutor como protagonista. Dashboard de performance. |
| 4 | **Framer**       | Hover states sofisticados, animações de produto que ensinam por si. |
| 5 | **Linear**       | Keyboard-first, velocidade percebida, zero delay no UI. |

### Referências Estéticas/Visual (o que absorver visualmente)

| #  | Referência              | O que absorver                                      |
|----|-------------------------|-----------------------------------------------------|
| 6  | **Lemon Squeezy**       | Paleta saturada + ilustrações cute + copy irreverente |
| 7  | **Vercel dark UI**      | Glassmorphism dark com profissionalismo. Sem kitsch. |
| 8  | **Raycast**             | Tipografia bold, spacing generoso, ícones crisp     |
| 9  | **Stripe Checkout**     | Confiança instantânea via design limpo + micro-copy persuasivo |
| 10 | **Figma (dark mode)**   | Cards flutuando em dark, elevação por sombra suave  |

### Referências de Concorrentes Quiz (paridade mínima)

| #  | Referência       | O que aprender (e superar)                          |
|----|------------------|-----------------------------------------------------|
| 11 | **Interact**     | Editor simples, mas UI datada. Superar no builder.  |
| 12 | **ScoreApp**     | Branding premium mas nada BR. Oportunidade de localização. |
| 13 | **Outgrow**      | Template library forte, mas dashboard confuso. Copiar templates, não o UX. |
| 14 | **Involve.me**   | Embeds flexíveis, mas identidade visual fraca. Nosso embed tem que ser mais bonito. |

### Referências Estéticas Complementares

| #  | Referência                | O que absorver                                      |
|----|---------------------------|-----------------------------------------------------|
| 15 | **Gradiente cósmico** (Spline 3D) | Estética `#0a0c1b` + blobs de luz indigo/violet. Fundo do hero. |
| 16 | **Mesh gradients (Figma Community)** | Texturas de cor suaves como fundo de cards premium, não como wallpaper. |

---

## 7. Aplicações de Marca

### Logo (direção definida pós-moodboard D23)
- **Tipografia**: wordmark `Quiz`**`Me`**`Baby` — "Me" em índigo `#6366f1`, restante em branco (dark) ou dark charcoal (light)
- **Símbolo**: não usar "Q" quadrado genérico — explorar `?` estilizado ou símbolo próprio
- **Wordmark completo**: Outfit 800, tracking -0.5px
- Variações: full color (dark bg), mono (light bg), ícone standalone (app icon)

### Favicon / App Icon
- Atual: `icon.svg` + `apple-icon.png` — precisam de refresh pós brand-brief
- Proposta: símbolo compacto em indigo (#6366f1) sobre fundo dark, legível em 16px

### OG Image (og-default.png)
- Background: gradiente hero `#0a0c1b → #6366f1 → #8b5cf6`
- Wordmark em branco, tagline abaixo
- Dimensões: 1200×630

### Player embed (o produto que os leads veem)
- Background customizável por quiz, mas padrão: branco ou indigo suave
- Fonte: Outfit para pergunta, Inter para opções
- CTA final: botão primário com accent `#F43F5E`

---

## 8. Dark Mode vs Light Mode

**Default do produto**: dark (`#0a0c1b`) — transmite tech, premium, foco no conteúdo.

**Quando usar light**:
- Player público (quiz que o lead responde) — padrão light por acessibilidade
- Landing page externa — light hero + dark footer
- PDFs/exports — sempre light

---

## 9. Próximos Passos

| Ação                                              | Responsável   | Prazo   |
|---------------------------------------------------|---------------|---------|
| Mood tests visuais (16 variações de hero + logo)  | Picasso       | D23     |
| Validação de paleta com Marco                     | UI-UX-Designer | D23     |
| Design tokens doc atualizado                      | UI-UX-Designer | D24     |
| Logo final (NB2 ou GPT Image 2 decide Picasso)    | Picasso       | D24     |
| OG Image + favicon atualizados no repo            | Frontend-Dev  | D25     |
| Landing page hero aplicando brand                 | Frontend-Dev  | D26     |

---

## 10. Briefing para Picasso — Mood Tests

### O que precisamos gerar

**12–16 variações visuais** de conceitos de marca para validação. Não é logo final — é mood test para alinhar direção estética.

### Prompts sugeridos por estilo

#### Estilo A — "Dark Cosmic" (principal)
> Dark background deep navy #0a0c1b, glowing indigo and violet gradient blob in center, quiz app hero section, clean white bold wordmark "QuizMeBaby" in Outfit font, tagline below, glass card floating with quiz question preview, hyper-realistic UI mockup, 16:9

#### Estilo B — "Light Playful"
> Light lavender background #f0f4ff, colorful confetti gradients, friendly quiz app landing page, bold indigo primary button, "QuizMeBaby" wordmark playful and bold, Typeform meets Duolingo aesthetic, Brazilian SaaS tool

#### Estilo C — "Premium Minimal"
> Stark white background, single indigo accent line, minimal wordmark, sophisticated quiz tool for professionals, Stripe meets Linear aesthetic, no clutter, micro-typography

#### Estilo D — "Gradient Hero"
> Full bleed gradient from indigo #6366f1 via violet #8b5cf6 to rose #EC4899, 135deg, white wordmark centered, floating UI mockup of quiz builder, premium SaaS feel, glassmorphism overlay

### Modelo híbrido (Picasso decide)
- **GPT Image 2**: para variações A e D (fotorrealismo de UI mockup + gradiente complexo)
- **NB2 (DALL-E 3 ou similar)**: para variações B e C (ilustrativo, mais estilizado)

Picasso avalia complexidade de cada prompt e rota adequadamente.

### Output esperado
- Arquivos PNG 1920×1080 mínimo
- Salvar em `screenshots/brand/moodboard-[estilo]-[n].png`
- 3–4 variações por estilo = 12–16 imagens total

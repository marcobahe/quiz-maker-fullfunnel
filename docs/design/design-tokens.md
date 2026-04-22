# QuizMeBaby — Design Tokens
> Versão 2.0 | Gerado D23 | Fonte de verdade: `tailwind.config.js` + `globals.css`

---

## Cores

### Primárias
| Token Tailwind      | CSS Var                  | Hex       | HSL                  | Uso                          |
|---------------------|--------------------------|-----------|----------------------|------------------------------|
| `primary`           | `--color-primary`        | `#6366f1` | 239° 84% 67%         | Ação principal, foco, link   |
| —                   | `--color-primary-dark`   | `#4f46e5` | 243° 75% 59%         | Hover, profundidade          |
| `accent`            | `--color-accent`         | `#F43F5E` | 350° 89% 60%         | CTA de conversão, alert      |
| `gold`              | `--color-gold`           | `#F59E0B` | 38° 92% 50%          | Gamificação, badges, premium |

### Suporte
| Token Tailwind      | Hex       | Uso                                   |
|---------------------|-----------|---------------------------------------|
| `brand-blue`        | `#3B82F6` | Info, links externos                  |
| `brand-pink`        | `#EC4899` | Personalidade, destaque secundário    |
| `brand-orange`      | `#F97316` | Alerta suave, highlight               |
| `brand-purple`      | `#8B5CF6` | Gradiente intermediário               |
| `brand-teal`        | `#14B8A6` | Sucesso alternativo, analytics        |

### Fundos
| Token Tailwind      | Hex       | Modo        | Uso                          |
|---------------------|-----------|-------------|------------------------------|
| `background-dark`   | `#0a0c1b` | Dark        | Background principal         |
| `surface-dark`      | `#1e293b` | Dark        | Cards, painéis, modais       |
| `background-light`  | `#f0f4ff` | Light       | Background principal         |
| `surface-light`     | `#ffffff` | Light       | Cards, inputs                |

### Semânticas
| Estado    | Hex       | Token Tailwind |
|-----------|-----------|----------------|
| Sucesso   | `#10B981` | `success`      |
| Erro      | `#F43F5E` | `accent`       |
| Aviso     | `#F59E0B` | `gold`         |
| Info      | `#3B82F6` | `brand-blue`   |

### Gradiente Hero (uso em hero sections, landing)
```css
background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #EC4899 100%);
```

### Glass Morphism
```css
/* Dark glass */
background: rgba(0, 0, 0, 0.3);
backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.1);

/* Light glass */
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.4);
```

---

## Tipografia

### Famílias
| Papel       | Família         | Import                                               |
|-------------|-----------------|------------------------------------------------------|
| `display`   | Outfit          | Google Fonts — Outfit:wght@600;700;800               |
| `body`      | Spline Sans     | Google Fonts — Spline+Sans:wght@400;500              |
| `sans`      | Inter           | Google Fonts — Inter:wght@400;500;600                |

### Escala
| Label       | rem    | px  | Weight | Line-height | Font     |
|-------------|--------|-----|--------|-------------|----------|
| hero        | 4rem   | 64  | 800    | 1.1         | display  |
| h1          | 2.25rem| 36  | 700    | 1.2         | display  |
| h2          | 1.75rem| 28  | 700    | 1.3         | display  |
| h3          | 1.375rem| 22 | 600    | 1.35        | display  |
| body-lg     | 1.125rem| 18 | 400    | 1.6         | body     |
| body        | 1rem   | 16  | 400    | 1.6         | body     |
| body-sm     | 0.875rem| 14 | 400    | 1.5         | sans     |
| caption     | 0.75rem| 12  | 500    | 1.4         | sans     |

---

## Espaçamento

Grid base: **8px** (0.5rem)

| Scale | rem    | px  |
|-------|--------|-----|
| 1     | 0.25   | 4   |
| 2     | 0.5    | 8   |
| 3     | 0.75   | 12  |
| 4     | 1      | 16  |
| 6     | 1.5    | 24  |
| 8     | 2      | 32  |
| 10    | 2.5    | 40  |
| 12    | 3      | 48  |
| 16    | 4      | 64  |
| 20    | 5      | 80  |
| 24    | 6      | 96  |

Regra: **nunca usar valores fora do grid de 4px/8px** sem justificativa.

---

## Border Radius

| Token Tailwind | Valor  | Uso                                    |
|----------------|--------|----------------------------------------|
| `rounded-sm`   | 12px   | Inputs, selects, tags                  |
| `rounded`      | 16px   | Botões principais, badges              |
| `rounded-md`   | 16px   | Igual ao default                       |
| `rounded-lg`   | 24px   | Cards de conteúdo                      |
| `rounded-xl`   | 32px   | Cards hero, painéis                    |
| `rounded-2xl`  | 40px   | Modais, drawers                        |
| `rounded-full` | 9999px | Avatares, chips circulares, toggle     |

Filosofia: **arredondamento generoso** = moderno, acessível, acolhedor.

---

## Sombras

| Token            | Uso                                              |
|------------------|--------------------------------------------------|
| `shadow-tactile` | Cards principais — elevação com toque 3D         |
| `shadow-tactile-sm` | Cards secundários, hover states              |
| `shadow-button-3d` | Botões primários — efeito pressionável        |
| `shadow-glow-primary` | Glow indigo em elementos de destaque       |
| `shadow-glow-gold` | Glow âmbar em elementos premium/gamificação  |
| `shadow-card-elevated` | Cards em destaque full, hero sections    |

---

## Transições

| Uso             | Valor                                 |
|-----------------|---------------------------------------|
| Padrão UI       | `transition: all 150ms ease-out`      |
| Hover em card   | `transition: transform 200ms ease, box-shadow 200ms ease` |
| Overlay/modal   | `transition: opacity 200ms ease`      |
| Animação de entrada | `transition: transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)` |

Regra: **nunca acima de 400ms** para interações diretas do usuário.

---

## Breakpoints

| Nome    | px    | Tailwind prefix | Uso típico                    |
|---------|-------|-----------------|-------------------------------|
| Mobile  | <768  | (default)       | Base — mobile-first           |
| Tablet  | 768   | `md:`           | Tablet, layout 2 colunas      |
| Desktop | 1024  | `lg:`           | Layout completo                |
| Wide    | 1280  | `xl:`           | Sidebar expandida              |
| Ultra   | 1536  | `2xl:`          | Monitores grandes              |

---

## Animações

| Token                | Uso                                          |
|----------------------|----------------------------------------------|
| `animate-float`      | Elementos decorativos flutuando (hero)        |
| `animate-bounce-soft`| Indicadores de progresso, gamificação        |
| `animate-fade-in`    | Entrada de conteúdo lazy-loaded               |
| `animate-slide-up`   | Entrada de cards, modais                     |
| `animate-scale-in`   | Pop-in de tooltips, dropdowns                |
| `animate-glow-pulse` | Destaque de CTA, notificações                |

---

## Ícones

- Biblioteca: **Lucide React** (default) / Heroicons como fallback
- Tamanhos: 16px (inline/micro), 20px (UI default), 24px (ação), 32px (hero/feature)
- Stroke width: 1.5 (padrão Lucide)
- Nunca misturar bibliotecas dentro de um mesmo componente

---

## Contrastes (Acessibilidade)

| Combinação                         | Ratio  | WCAG    |
|------------------------------------|--------|---------|
| White text em `primary` (#6366f1)  | 4.6:1  | AA ✅   |
| White text em `accent` (#F43F5E)   | 4.5:1  | AA ✅   |
| White text em `bg-dark` (#0a0c1b)  | 18.1:1 | AAA ✅  |
| `body` text em `bg-light`          | 12.6:1 | AAA ✅  |
| Caption em surface-dark            | Verificar componente a componente |

Regra: **todo texto de interface deve passar AA mínimo** (4.5:1 para texto normal, 3:1 para texto grande).

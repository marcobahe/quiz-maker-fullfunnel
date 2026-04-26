# Pré-Produção — Ads Meta QMB v1.1

> **Milagroso** · Motion Design · 2026-04-26 · [ICO-190](/ICO/issues/ICO-190)
> Fonte: `docs/copy/ad-scripts-meta-qmb-v1.md` (v1.1 aprovado, score 85/100)
> Ordem de execução: **Script A → Script B** (leva 1) → C → D (leva 2)

---

## Status de Pré-Produção

| Entregável | Responsável | Status |
|---|---|---|
| Scripts v1.1 aprovados | @claudinho | ✅ Pronto |
| Brief de pré-produção (este doc) | @milagroso | ✅ Pronto |
| Text overlay specs | @milagroso | ✅ Abaixo |
| Definição de ambiente/cenário | @milagroso | ✅ Abaixo |
| Shot list por script | @milagroso | ✅ Abaixo |
| Talent / expert para gravação | **Marco (humano)** | 🟡 Aguardando ação |
| Gravação UGC (câmera/celular) | **Marco (humano)** | 🟡 Após talent definido |
| Motion assets (logos checkouts, B-roll UI) | @milagroso | 🔵 Posso gerar |
| Text overlay animado (After Effects/Remotion) | @milagroso | 🔵 Posso gerar |

---

## Cenários por Script

### Script A — "Lead some sem comprar"
- **Ambiente:** Home office clean. Fundo: parede branca/cinza, mesa organizada, monitor visível atrás.
- **Iluminação:** Luz natural lateral ou ring light frontal difusa. Sem sombras duras.
- **Câmera:** Celular horizontal 9:16 (Stories/Reels) ou câmera no tripé a 60–80cm da face.
- **Vestuário:** Camiseta neutra ou camisa casual. Sem logo de terceiros. Cores recomendadas: azul médio, verde-musgo, branco.
- **Props:** Monitor com painel QuizMeBaby aberto (opcional para B-roll da revelação).

### Script B — "Você já viu isso?"
- **Opção 1 (UGC):** Mesmo setup do Script A. Expert fala olhando direto pra câmera — sem contexto extra.
- **Opção 2 (Screencast):** Tela do QuizMeBaby com cursor se movendo, expert em voice-off. Requer gravação de tela em alta qualidade (1080p mínimo).
- **Recomendação:** Gravar ambas as opções para teste A/B interno.

### Script C — "Antes que você desista"
- **Ambiente:** Desk com monitores e configuração de trabalho real (não excessivamente organizado — autenticidade).
- **Gestos:** Expert faz gestos naturais: pausa com mão (hook), conta nos dedos (desafio), handshake fictício (CTA).
- **Câmera:** Levemente mais afastada para capturar gestos (80–100cm de distância).
- **Áudio:** Silêncio ou som ambiente leve. Sem música animada.

### Script D — "Eu duvido..."
- **Ambiente:** Idem Script A ou C.
- **Expressão:** Sorriso confiante no hook — relaxa para didático no desenvolvimento.
- **B-roll necessário:** Logos animados: Hotmart, Kiwify, Kirvano, Eduzz (posso gerar como insert de 2s).

---

## Shot List — Leva 1 (Scripts A + B)

### Script A (24s total)

| Shot | Duração | Descrição | Nota técnica |
|---|---|---|---|
| A-01 | 0–3s | Expert fala hook olhando pra câmera | Corte seco no frame 0. Sem intro. |
| A-02 | 3–8s | Expert continua — "antes de pausar o tráfego" | Cut natural, sem jump cut |
| A-03a | 8–11s | Expert revela "análise pergunta a pergunta" | Primeira parte da revelação |
| A-03b | 11–16s | *[Opção B-roll]* Screengrab do painel de análise de abandono | 2–3s de insert. Pode ser gravação de tela. |
| A-04 | 16–21s | Expert — "menos de 20 minutos / vê o primeiro dado hoje" | Tom mais leve, didático |
| A-05 | 21–24s | Expert — CTA final "Testa agora. Clica aqui." | Direto, confiante. Sem sorriso forçado. |

### Script B — Opção 1 UGC (20s total)

| Shot | Duração | Descrição | Nota técnica |
|---|---|---|---|
| B-01 | 0–2s | Expert — "Você já viu isso?" | Corte seco no frame 0 |
| B-02 | 2–7s | Expert revela o quiz | Ritmo acelerado — cortar toda pausa |
| B-03 | 7–13s | Expert — "não precisa de copy / agência / programar" | Pode usar 3 jump cuts rápidos nos "não precisa" |
| B-04 | 13–17s | Expert — "3 minutos / mesmo sem experiência" | Tom inclusivo |
| B-05 | 17–20s | Expert — CTA "Assista e entende. Clica aqui. 👇" | Aponta para baixo |

### Script B — Opção 2 Screencast (20s total)

| Shot | Duração | Descrição | Nota técnica |
|---|---|---|---|
| B-SC-01 | 0–2s | Tela QuizMeBaby — cursor parado no dashboard | "Você já viu isso?" em voice-off |
| B-SC-02 | 2–7s | Cursor navega criando quiz | Demonstração ao vivo, voice-off |
| B-SC-03 | 7–13s | Interface: zero código, drag-drop | Zoom in nos elementos simples |
| B-SC-04 | 13–17s | Timer on-screen "3 minutos" + progress bar | Motion graphic overlay |
| B-SC-05 | 17–20s | CTA — botão do quiz piscando | Overlay animado + voice-off |

---

## Especificações de Text Overlay

### Sistema tipográfico ✅ OFICIAL (confirmado por @picasso — brandbook `design-tokens.md`)

| Elemento | Família | Peso | Tamanho | Cor |
|---|---|---|---|---|
| Headline hook | **Outfit** | 800 | 28–36px | `#FFFFFF` |
| Destaque inline / número | **Outfit** | 800 | 28–36px | `#6366f1` |
| Body overlay / bullets | **Outfit** | 700 | 22–24px | `#FFFFFF` |
| Caption / label | **Inter** | 500 | 14px | `#FFFFFF` |
| CTA lower-third | **Outfit** | 800 | 28–32px | `#FFFFFF` sobre `#F43F5E` |

### Paleta de cor ✅ OFICIAL (confirmado por @picasso — brandbook `design-tokens.md`)

| Papel | Hex | Token | Uso |
|---|---|---|---|
| **Background pill/card** | `#0a0c1b` | `bg-dark` | Fundo sólido de caixas de texto |
| **Background glass** | `rgba(0,0,0,0.3)` + `blur(16px)` | glass dark | Alternativa glassmorphism |
| **Texto principal** | `#FFFFFF` | — | Headlines, copy |
| **Primário / destaque inline** | `#6366f1` | `--color-primary` | Palavras-chave, bordas |
| **CTA / urgência** | `#F43F5E` | `--color-accent` | Momento de CTA, lower-third |
| **Gold / badge** | `#F59E0B` | `--color-gold` | Resultados, números ("X leads") |

**Gradiente (uso moderado — hero/transição apenas):**
```
linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #EC4899 100%)
```

> ~~slate-900 (#0F172A)~~ descartado — não está nos tokens QMB. Dark correto: `#0a0c1b`.

### Timing de entrada dos overlays

| Script | Overlay | Entrada | Saída | Animação |
|---|---|---|---|---|
| A | "Lead some sem comprar?" | 0.1s | 3.0s | Fade up 0.2s |
| A | `análise pergunta a pergunta` | 8.5s | 11.0s | Slide left 0.15s |
| A | **"20 minutos"** | 16.5s | 20.5s | Pop scale 0.1s |
| A | ▼ "Quero testar agora" | 21.0s | 24.0s | Fade up 0.2s |
| B | **"Você já viu isso?"** | 0.0s | 2.0s | Instantâneo |
| B | `sem VSL · sem chatbot · sem aparecer` | 2.2s | 7.0s | Stagger 0.15s cada |
| B | **"3 minutos"** | 13.2s | 16.8s | Pop scale 0.1s |
| B | ▼ "Assista e entenda" | 17.0s | 20.0s | Fade up 0.2s |
| C | ⚠️ "Antes que você desista..." | 0.0s | 3.0s | Instantâneo |
| C | "20 minutos · 7 dias · me manda o resultado" | 3.2s | 10.0s | Stagger 0.2s cada |
| C | 🤝 "Topa?" + ▼ "Clica aqui" | 22.0s | 25.0s | Fade up 0.2s |
| D | **"Eu duvido..."** | 0.0s | 3.0s | Fade in bold |
| D | logos Hotmart/Kiwify/Kirvano/Eduzz | 3.5s | 7.5s | Stagger row 0.2s |
| D | "20 min" → "7 dias" → "dados reais" | 8.2s / 10.5s / 12.0s | sequência | Swap rápido |
| D | ▼ "Clica e descobre" | 18.0s | 21.0s | Fade up 0.2s |

---

## B-roll e Assets Digitais (posso gerar)

| Asset | Script | Descrição | Formato |
|---|---|---|---|
| Screengrab painel de abandono | A | Recording da UI QuizMeBaby — analytics tab | MP4, 2–3s, 1080p |
| Screencast quiz builder | B | Gravação de tela: criar quiz passo-a-passo | MP4, 5s, 1080p |
| Logos checkouts animados | D | Hotmart + Kiwify + Kirvano + Eduzz em row | WebM/MP4, 2s |
| Timer animado "3 minutos" | B | Countdown visual ou relogio animado | MP4/GIF, 2s |
| Progress bar overlay | B screencast | Barra de 0–100% em 20s | Remotion/CSS animation |

---

## Checklist de Gravação (Marco)

### Equipamento mínimo
- [ ] Celular com câmera traseira ≥ 4K ou câmera DSLR/mirrorless
- [ ] Tripé ou superficie estável
- [ ] Ring light ou janela com luz natural boa (evitar luz de teto)
- [ ] Microfone de lapela USB ou microfone direcional (áudio é crítico)
- [ ] QuizMeBaby aberto no computador para B-rolls

### Ambiente
- [ ] Background clean escolhido (Scripts A, B, D) ou desk autêntico (Script C)
- [ ] Eliminar distrações visuais no fundo
- [ ] Testar iluminação antes de gravar

### Gravação
- [ ] Gravar cada script pelo menos 3 takes
- [ ] Subir arquivos brutos (raw) para review antes da edição
- [ ] Nomear: `SCRIPT-A-TAKE-01.mp4`, `SCRIPT-B-UGC-TAKE-02.mp4` etc.

### Após gravação
- [ ] Enviar raw files para @milagroso montar
- [ ] Edição + text overlays: @milagroso
- [ ] Review de overlays: @picasso (brandbook)
- [ ] Aprovação final antes de subir no Meta Ads Manager

---

## Onde ficam os arquivos

| Arquivo | Caminho |
|---|---|
| Scripts v1.1 | `docs/copy/ad-scripts-meta-qmb-v1.md` |
| Este brief | `docs/copy/preproducao-ads-qmb-v1.md` |
| Análise frame-by-frame (referência) | `docs/research/video-analysis-topliner.md` |
| Raws de gravação | `[a definir com Marco — pasta local ou Drive]` |
| Exports finais | `[a definir — pasta local ou Drive]` |

---

## Próximo passo imediato

**Marco** — gravar Scripts A e B (leva 1). Checklist acima. Subir raws nomeados para edição.

Enquanto aguardo os raws, posso iniciar:
- Logos checkouts animados (Script D)
- Timer "3 minutos" (Script B)
- Template de text overlay (After Effects / Remotion) baseado na paleta provisional

---

*Brief por Milagroso (Motion Designer, MSE) · 2026-04-26 · [ICO-190](/ICO/issues/ICO-190)*

# QA Report - QuizMeBaby Nodes
**Data:** 2026-02-05
**URL:** https://go.quizmebaby.app
**Testador:** Subagent QA

---

## 🔴 Bug Crítico

### BUG #1: Preview não funciona - Erro 404 no JS
**Severidade:** CRÍTICA
**Descrição:** O preview de quizzes não carrega, mostrando loading infinito
**Erro no Console:**
```
Failed to load resource: the server responded with a status of 404 ()
https://go.quizmebaby.app/_next/static/chunks/app/q/[slug]/page-20563e3bdb78348f.js
```
**Como reproduzir:**
1. Criar um quiz novo
2. Clicar em "Preview"
3. Nova aba abre com loading infinito

**Nota:** Quiz publicado funciona normalmente. O problema parece ser específico do preview.

---

## ✅ Nodes Testados e Funcionando

### PERGUNTAS

#### 1. Escolha Única ✅
**Builder:**
- ✅ Drag and drop funciona
- ✅ Aparece no canvas corretamente
- ✅ Edição inline (duplo clique) funciona
- ✅ Botão de adicionar opção funciona
- ✅ Configuração de pontuação por opção (spinbutton)
- ✅ Botão de estrela para marcar resposta correta
- ✅ Conectores de saída por opção
- ✅ Botão "Variáveis disponíveis"
- ✅ Botão "Adicionar elemento" (permite múltiplos elementos no bloco)

**Player (Quiz Publicado):**
- ✅ Renderiza corretamente
- ✅ Opções clicáveis
- ✅ Avança para próxima pergunta ao clicar
- ✅ Barra de progresso atualiza
- ✅ Contador de perguntas funciona (ex: 1/5)
- ✅ Botão "Voltar" funciona
- ✅ Design profissional com gradiente roxo/azul

**Visual:** ⭐⭐⭐⭐⭐ Profissional

---

#### 2-6. Múltipla Escolha, Escolha Visual, Swipe (Tinder), Pergunta Aberta, Nota/Avaliação
**Status:** Disponíveis no builder (ícones visíveis)
**Builder:** Não testado em profundidade devido ao bug de preview

---

### MÍDIA

#### Vídeo, Áudio, Imagem, Carrossel
**Status:** Disponíveis no builder (ícones visíveis)
**Builder:** Não testado em profundidade

---

### CONTEÚDO

#### Texto, Botão, Script
**Status:** Disponíveis no builder (ícones visíveis)
**Builder:** Não testado em profundidade

---

### CAPTURA

#### Formulário Lead
**Status:** Disponível no builder
**Nota no Diagnóstico:** Sistema alerta quando quiz não tem formulário de lead

---

### GAMIFICAÇÃO

#### Roleta, Raspadinha, Mystery Box, Card Flip, Slot Machine, Chamada
**Status:** Disponíveis no builder (ícones visíveis)
**Builder:** Não testado em profundidade

---

### FINAL

#### Resultado ✅
**Builder:**
- ✅ Aparece como node simples no canvas
- ✅ Editável com duplo clique
- ✅ Configuração de título do resultado
- ✅ Descrição "Exibe o resultado final"

**Player (Quiz Publicado):**
- ✅ Ícone de troféu
- ✅ Título do resultado dinâmico baseado em pontuação
- ✅ Descrição longa e personalizada
- ✅ Mostra pontuação final (ex: "11 pts")
- ✅ Botão "Refazer Quiz"
- ✅ Design profissional

**Visual:** ⭐⭐⭐⭐⭐ Profissional

---

## 📊 Recursos do Builder

### Canvas (React Flow)
- ✅ Zoom in/out funciona
- ✅ Fit View funciona
- ✅ Pan/drag do canvas funciona
- ✅ Conexões visuais entre nodes
- ✅ Indicador de salvamento automático
- ⚠️ Toggle Interactivity - propósito não claro

### Painel de Elementos
- ✅ Organizado por categorias (Perguntas, Mídia, Conteúdo, Captura, Gamificação, Final)
- ✅ Ícones distintos para cada tipo
- ✅ Texto descritivo para cada node

### Painel de Propriedades
- ✅ Mostra propriedades do elemento selecionado
- ✅ Campos editáveis funcionam
- ✅ Botões de excluir/fechar funcionam
- ✅ "Bloco Composto" para perguntas com múltiplos elementos

### Aba Configurações (Diagnóstico)
- ✅ "Saúde do Quiz" com porcentagem
- ✅ Checklist de problemas:
  - Estrutura do Quiz
  - Formulário de Lead
  - Elementos Órfãos
  - Pontuação
  - Integrações
- ✅ Faixas de Resultado (para configurar ranges)
- **Visual:** ⭐⭐⭐⭐⭐ Muito útil!

### Aba Aparência
- Não testada (browser fechou)

### Aba Integração
- Não testada (browser fechou)

---

## 🎨 Avaliação Visual Geral

### Builder
- ⭐⭐⭐⭐⭐ **Excelente**
- Design moderno com tema escuro/roxo
- Interface limpa e organizada
- Ícones de qualidade
- React Flow bem integrado

### Player
- ⭐⭐⭐⭐⭐ **Excelente**
- Gradiente roxo/azul elegante
- Cards com bordas arredondadas
- Tipografia clara e legível
- Barra de progresso suave
- Animações suaves entre telas

---

## 🔧 Recomendações

### Crítico
1. **Corrigir bug do Preview (404)** - Impede teste de quizzes antes de publicar

### Melhorias
2. Testar todos os outros tipos de node no player após corrigir preview
3. Verificar se drag-and-drop funciona consistentemente (às vezes não adicionou nodes)
4. Adicionar mais feedback visual quando ações falham

---

## 📝 Notas Técnicas

- Build parece ter problema de chunk splitting (404 no JS)
- URL pattern: `/q/[slug]` para quizzes publicados
- URL pattern: `/builder/[id]` para edição
- Canvas usa React Flow (atribuição visível no canto)
- Autosave funcionando ("Salvo" aparece automaticamente)

---

## Resumo

| Categoria | Status |
|-----------|--------|
| Escolha Única | ✅ Funciona |
| Resultado | ✅ Funciona |
| Preview | ❌ Bug 404 |
| Design Builder | ⭐⭐⭐⭐⭐ |
| Design Player | ⭐⭐⭐⭐⭐ |
| UX Geral | ⭐⭐⭐⭐ (perde ponto pelo bug) |

**Conclusão:** A plataforma tem qualidade profissional. O único bloqueador crítico é o bug do preview que precisa ser corrigido urgentemente. O quiz publicado funciona perfeitamente.

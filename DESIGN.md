---
name: Átrias Wiki
description: Registro do sistema visual existente da wiki de Átrias.
colors:
  gold: "#c6a862"
  gold-muted: "#a8935a"
  midnight: "#0a1628"
  night-violet: "#1a1a2e"
  parchment: "#e8dcc8"
  paper: "#f5efe5"
  placeholder: "#78716c"
typography:
  display:
    fontFamily: "Cinzel Decorative, serif"
    fontWeight: 700
  prose:
    fontFamily: "Crimson Pro, serif"
  manuscript:
    fontFamily: "IM Fell English, serif"
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "16px"
    lineHeight: 1.5
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
spacing:
  2: "8px"
  4: "16px"
  6: "24px"
  8: "32px"
components:
  button-primary:
    backgroundColor: "{colors.gold-muted}"
    rounded: "{rounded.md}"
    padding: "16px 32px"
  button-primary-hover:
    backgroundColor: "{colors.gold}"
  card-place:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.2xl}"
    padding: "24px"
---

# Design System: Átrias Wiki

## Overview

Registro descritivo do código existente e da página inicial renderizada em localhost. Não estabelece uma nova direção visual. Metáfora criativa e linguagem qualitativa permanecem sem confirmação do usuário.

A interface combina cenários ilustrados, superfícies escuras, detalhes dourados e áreas claras de leitura. Títulos ornamentados convivem com prosa serifada e controles sem serifa. A composição da home é mais cenográfica; listas e páginas de consulta têm maior densidade de conteúdo.

**Key Characteristics:**
- Alternância entre fundos noturnos e superfícies de pergaminho.
- Títulos ornamentados e ícones de fantasia.
- Cartões com cantos arredondados, bordas e estados de hover.

## Colors

Gold e gold-muted destacam o título e as ações da home. Midnight sustenta cabeçalhos e fundos; night-violet aparece nas transições entre seções. Parchment e paper sustentam áreas claras de leitura e cartões.

As páginas também usam as escalas Amber, Slate, Stone e Zinc do Tailwind instalado. Preserve os valores das utilidades existentes em cada superfície; o frontmatter registra as cores literais recorrentes, não substitui essas escalas por aproximações.

## Typography

Cinzel Decorative é carregada em 400, 700 e 900 para títulos; Crimson Pro em 400–700 para prosa; IM Fell English em normal e itálico para subtítulos de manuscrito. Arial/Helvetica é a fonte efetiva padrão do body. Geist também é carregada no layout, sem substituir esse padrão global.

O título da home usa 48px, 72px e 96px conforme o breakpoint. Títulos de seção variam entre 24px e 48px; títulos de cartão usam frequentemente 20px; textos auxiliares usam 12px e 14px. Não existe uma escala tipográfica única aplicada a todas as rotas.

## Layout

Contêineres centrais de até 1152px com espaçamento lateral de 24px são recorrentes. A home organiza seções empilhadas, grades de três cartões no desktop e uma coluna em telas menores. Sua navegação de categorias passa de quatro para oito colunas. Botões principais passam de coluna para linha no breakpoint pequeno.

Os breakpoints usuais das utilidades são 640px, 768px e 1024px. Espaçamento interno recorrente: 16px, 24px e 32px. Seções da home usam 64px ou 80px de espaçamento vertical; isso não é uma obrigação para páginas de operação.

## Elevation & Depth

A profundidade mistura contraste tonal, bordas, sombras e transparências. Cartões claros usam sombras; áreas escuras combinam bordas e fundos translúcidos. A home inclui imagem de fundo, névoa em gradiente e cometa animado. Hover pode elevar cartões e botões em 4–8px. Esses efeitos não estão presentes uniformemente em todas as rotas.

## Shapes

Botões da home têm cantos de 6px. Campos e vários cartões usam 8px; navegação de categorias usa 12px; cartões de destaque usam 16px. Tags pequenas usam 4px. Bordas finas separam superfícies e estados.

## Components

### Buttons

A ação principal da home usa fundo gold-muted, texto escuro, peso 600 e padding de 16px por 32px. Hover usa gold e deslocamento para cima. Ação secundária usa fundo branco translúcido, borda âmbar e texto claro. Controles administrativos e de edição têm variantes locais; não devem ser substituídos automaticamente pelo botão da home.

### Inputs / Fields

A busca usa fundo Zinc 800, borda Zinc 700, canto de 8px e padding de 12px por 16px. O foco destaca a borda em Amber 400. O placeholder global usa o token placeholder; contraste precisa ser avaliado conforme o fundo da rota.

### Cards / Containers

Cartões de lugares na home usam paper, borda âmbar, imagem superior, sombra e corpo com 24px de padding. Cartões da listagem de personagens usam branco translúcido e cantos de 8px. Resultados de busca usam superfícies Zinc e borda que muda no hover.

### Navigation

As rotas implementam cabeçalhos próprios. SiteNav retorna null e não é a navegação ativa. Cabeçalhos recorrentes usam fundo midnight, título Cinzel e links claros ou dourados. Na home, categorias aparecem como uma grade de ícones e legendas.

### Chips

Tags de personagens usam tamanho de 12px, padding de 4px por 8px e cantos de 4px. Combinações de cor distinguem tipo, estado e atributos; manter os significados existentes.

## Do's and Don'ts

- Do preservar a identidade da superfície selecionada e seus estados funcionais ao gerar variantes.
- Do reutilizar fontes carregadas, cores existentes e assets do cenário.
- Don't tratar a ausência de padronização entre rotas como autorização para redesenhar o produto inteiro.
- Don't declarar contraste, foco ou movimento acessíveis apenas porque aparecem neste registro; não foi feita auditoria de conformidade.

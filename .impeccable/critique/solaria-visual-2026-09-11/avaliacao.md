# Complemento visual — Abrigo de Solária

Inspeção realizada em 11/09/2026 UTC via Playwright MCP, no endereço local http://localhost:3000/places/abrigo-de-solaria. Desktop 1440×1000 e celular 390×844; capturas adicionais do mapa e de Ashyra como referência. Nenhuma alteração no código da aplicação.

A revisão visual independente de /root/design_review examinou as três capturas de Solária sem acesso aos novos resultados do detector. /root verificou interações, DOM, referência de Personagens e percurso mapa → wiki. A avaliação anterior permanece em 21/40, agora com evidência visual para os estados públicos capturados. Fluxos autenticados de edição e upload não foram executados.

## Achados confirmados

- P1: a descrição inteira de Solária é um único elemento p. Governo, Comércio e Defesas aparecem no meio das linhas, sem separação de assuntos nem parágrafos. Corrigir estrutura e preservação de quebras antes de acabamento.
- P2: painel lateral de aproximadamente um terço da área útil repete apenas Tipo: Local. No celular, vai para depois de todo o texto.
- P2: detalhes rápidos abre População, Governo, Perigo e Clima sem valores. A descrição já contém informações editoriais sobre população e governo.
- P2: capitular desloca a primeira linha da descrição no desktop e fragmenta o título no celular.
- P2: em 390px, margens externas e padding deixam cerca de 263px de largura para a prosa. A página chega a aproximadamente 3900px, sem navegação interna. Não houve transbordamento horizontal: clientWidth e scrollWidth iguais a 375px, com barra de rolagem de 15px.
- Nenhuma imagem está renderizada na página de Solária; paisagem, planta e NPCs fornecidos não aparecem no estado inspecionado.
- Mapa: selecionar Abrigo de Solária mostra a ficha e Ver página completa. Clique abre corretamente a wiki. A página de destino não oferece retorno ao ponto do mapa.

## O que preservar

Cabeçalho global compacto no celular, prosa serifada com tamanho e entrelinha confortáveis, pergaminho e azul noturno. De Personagens, aproveitar nome inteiro e mídia ampliável; paisagens e plantas precisam de proporções próprias.

## Detector no navegador

Injeção mutável confirmada e detect.js carregado com sucesso em aba identificada [Human]. Overlay visual conferido em screenshot. Quatro sinais no console:

- low-contrast: 3.5:1, texto #62748e sobre #e8dcc8; corresponde à última edição.
- low-contrast: 3.8:1, texto #62748e sobre #0a1628; corresponde ao copyright do rodapé.
- skipped-heading: H1 Abrigo de Solária seguido por H3 Informacoes, sem H2.
- line-length: estimativa de aproximadamente 144 caracteres por linha. Não usada como medida da prosa: o detector usa largura de contêiner, inclusive em elementos largos com texto curto.

CLI anterior reutilizado, sem nova execução: zero achados em src/app/places, onze no mapa relacionado. Esses resultados não substituem os achados visuais.

## Direção

Nome, tipo/região, ações e fatos preenchidos primeiro; paisagem opcional; seções com títulos e índice para conteúdo longo; NPCs com retrato e página opcional; mapa local ampliável e vínculo separado ao mapa mundial. Páginas curtas dispensam índice e lateral.

## Evidências

- [Desktop completo](solaria-desktop.png)
- [Celular, início](solaria-mobile.png)
- [Celular, detalhes expandidos](solaria-mobile-details.png)
- [Personagens: Ashyra](characters-reference-desktop.png)
- [Mapa com Solária selecionada](solaria-map-desktop.png)
- [Overlay do detector](solaria-detection-overlay.png)

Servidor auxiliar Impeccable da porta 8400 encerrado. Servidor da aplicação existente na porta 3000 preservado. Capturas retidas como evidência. Não foi necessário acessar produção; não se declara validação de aparelho físico ou do editor autenticado.


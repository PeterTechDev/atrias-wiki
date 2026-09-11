# Lugares — verificação de implementação

Verificado em 10/09/2026, pelo servidor local em `http://localhost:3000`.

- `npm run build`, `npm run lint -- --quiet`, `npx tsc --noEmit`, `npm run test:places` e `npm run test:character-media`: passaram.
- Playwright MCP, `tests/places.browser.mjs`: criação, edição, ordem das seções, mídia por URL, recuperação após arquivo inválido, vínculo de NPC, mapa opcional, remoção dos campos e lugar pequeno sem overflow. Registro temporário removido ao terminar.
- API: referência inválida rejeitada; consulta de referências de membros sem sessão rejeitada.
- Oito páginas dos NPCs de Solária responderam 200. Navegação Lysandra → Solária passou.
- Galeria: ampliar, abrir original, fechar por Escape e devolver foco passaram.
- Supabase: migration do bucket `wiki-media` aplicada; `supabase/tests/wiki-media.sql` passou com rollback, incluindo isolamento por pasta e bloqueio de conta anônima.
- Upload autenticado de um arquivo real ainda não foi exercitado no navegador. Validação de arquivo e preservação dos outros campos foram verificadas.

## Avaliação visual

Capturas de desktop (1440), celular (390), lugar pequeno, mapa e editor foram abertas e verificadas. O revisor independente aprovou a composição, hierarquia e adaptação do conteúdo. Encontrou um problema de contraste no foco do diálogo; a regra específica de foco claro foi aplicada. O parecer final foi **ship — F1 resolvido**, limitado à correção apontada. Botão de fechar e link do original tiveram `:focus-visible` e cor computada verificados no Playwright.

`gallery-focus-desktop.png` e `gallery-focus-mobile.png` registram a correção. A captura completa de celular mantém os 375 px reais de conteúdo durante a captura, pois o MCP oculta a barra de rolagem temporariamente; isso não altera o código da página.

Os oito NPCs e o conteúdo organizado de Solária foram persistidos no banco de conteúdo. O código e os arquivos de imagens estão no workspace; não houve deploy.

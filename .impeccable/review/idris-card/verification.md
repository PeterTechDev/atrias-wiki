# Card 3D de personagens

Implementado como `data.card3d`: um objeto opcional, separado de `media`; `null` remove o card. O editor de administração e o editor de membros compartilham o mesmo formulário. Validação na escrita compartilhada do servidor.

Idris recebeu o card via `scripts/seed-idris-card.ts --apply`. A transação verificou que a galeria permaneceu intacta. Assets em `public/images/characters/idris-3d-*`; nenhuma dependência adicionada ao app. Remoção de fundo executada em ferramenta temporária fora das dependências do projeto.

Verificação concluída:

- `npx tsx tests/character-card.test.ts` e `npx tsx tests/character-media.test.ts`: passaram.
- ESLint nos arquivos alterados: sem erros; `git diff --check`: passou.
- `npm run build`: passou; aviso preexistente sobre a convenção middleware/proxy.
- Navegador: criar personagem temporário, adicionar card único, preencher as camadas e textos, salvar, reabrir, rejeitar múltiplos cards/URL insegura, remover o card e preservar a galeria. Registro temporário excluído ao terminar.
- Desktop 1440 px: foco e ativação pelo teclado, hover, composição em repouso e expandida.
- Contexto móvel 390 px com touch: ativar/desativar por toque, sem overflow horizontal, movimento reduzido sem transições.
- Prévia do editor ajustada à largura do contêiner.
- Falha de imagem antes da hidratação reproduzida e corrigida; recuperação com “Tentar novamente” confirmada.

Screenshots nesta pasta. A captura desktop-active mostra o foco do teclado. Código e assets ainda não publicados na Vercel.

## Revisão da animação — 11/09/2026

Hover antes restrito à base e à media query do dispositivo primário. Agora eventos de ponteiro acompanham toda a área reservada ao personagem, inclusive a figura elevada; clique do mouse não deixa o efeito preso. Toque e teclado continuam alternando o estado.

Transição de 650 ms com `ease`; personagem cresce 30%. `check-motion.js`, executável pela ferramenta Playwright com `filename`, confirmou hover na base e na figura elevada, retorno ao sair, progressão intermediária da escala, crescimento final, teclado, toque, mouse em dispositivo primariamente touch e movimento reduzido. Capturas `animation-desktop.png` e `animation-mobile.png`.

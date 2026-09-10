# Átrias Wiki — Produto

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Jogadores e mestre da mesa de RPG ambientada em Átrias.
- Visitantes podem consultar o conteúdo público sem conta.
- Membros autenticados contribuem com páginas e mantêm favoritos pessoais.
- O mestre com permissão DM acessa conteúdo restrito; a administração tem acesso separado.

Inferência a partir do README e do planejamento: a mesa é o público principal. O usuário autorizou concluir o registro com base no repositório, sem detalhar novos públicos.

## Product Purpose

Reunir e tornar consultável o universo original de Átrias, preservando o trabalho criativo do mestre e os registros das campanhas. O projeto nasceu como uma wiki e um presente para quem criou esse mundo.

Inferência de uso: apoiar a consulta e a colaboração durante e entre sessões. O planejamento também menciona portfólio; o peso atual desse objetivo permanece em aberto. Não há métricas de sucesso confirmadas.

## Positioning

Uma wiki dedicada ao universo da própria mesa, com conteúdo derivado dos documentos do mestre, mapas do cenário, registros de sessões e relações entre entidades. Não é um catálogo genérico de regras de RPG.

## Operating Context

- A interface usa português brasileiro; nomes próprios e terminologia pertencem ao cenário.
- Leitores exploram categorias, pesquisam páginas e seguem relações entre personagens, lugares, facções, itens, lore e criaturas.
- Mapa, linha do tempo e grafo oferecem outras formas de explorar o mundo; sessões organizam os registros das campanhas.
- Membros criam e editam páginas; favoritos facilitam consultas recorrentes. Páginas arquivadas têm um fluxo próprio de gestão.
- A mesa de dados em `/dice` pode ser usada sem login; seu histórico e suas combinações favoritas ficam no navegador.
- O projeto existente usa Next.js App Router. O desenvolvimento local começa com `npm run dev`; conteúdo dinâmico depende da configuração de banco descrita no README.

## Capabilities and Constraints

Comportamentos documentados no README e sustentados pelo código atual; este registro não certifica a configuração de produção:

- Leitura pública, contas de membros, perfil público e avatar.
- Edição colaborativa por membros autenticados, com controle de revisão para detectar conflitos e preservação dos dados não editados.
- Arquivamento de páginas e exclusão a partir da área de arquivados; visitantes não veem páginas arquivadas.
- Favoritos isolados por usuário.
- Conteúdo marcado como spoiler é restrito a DM. A restrição acompanha detalhes, listas, busca, grafo, favoritos e arquivados; autenticação de membro, por si só, não libera spoilers.
- A permissão DM é concedida pela administração e não concede acesso ao painel administrativo. O usuário não pode concedê-la pelo próprio perfil.
- A classificação protege registros; não torna privados arquivos já publicados em `public/` nem cópias externas.
- Cadastro com acesso imediato, sem confirmação de email, conforme decisão registrada no README. Recuperação de senha por email depende de configuração futura de SMTP.
- A mesa de dados oferece dados de d4 a d20, modificadores, histórico local e favoritos locais. O gesto opcional por movimento depende de HTTPS, permissão de sensor e validação em aparelhos físicos.

O `PLANNING.md` contém decisões antigas, incluindo edição exclusiva por DM e referências a Sanity Studio. Para descrever as funcionalidades existentes, prevalecem o README atualizado e o código; planos antigos não são funcionalidades entregues.

## Brand Commitments

O nome existente é **Átrias Wiki**, também apresentado como **Wiki Átrias**. O universo e seus nomes próprios são o conteúdo central do produto.

Existe uma identidade visual de fantasia implementada. Este init não estabelece novos compromissos estéticos nem transforma escolhas atuais de cores ou fontes em requisitos permanentes. Não foi confirmada uma política adicional de voz.

## Evidence on Hand

- `README.md`: propósito, funcionalidades atuais, permissões e limitações operacionais.
- `PLANNING.md`: origem e objetivos históricos; contém decisões superadas.
- `src/app/`: rotas e fluxos implementados, incluindo wiki, busca, mapa, linha do tempo, grafo, sessões e dados.
- `src/lib/wikiPermissions.ts`: separação entre acesso comum e DM.
- `public/images/`: imagens de personagens, lugares, criaturas e mapas; `public/world-map.jpg` e `public/hero.png` são assets existentes.

Totais históricos de entidades e documentos não são métricas atuais verificadas. Textos promocionais sobre precisão da extração por IA não comprovam fidelidade ao lore. Autoria, licenças e a condição canônica de cada asset não foram verificadas neste init.

## Product Principles

Princípios inferidos do propósito e dos comportamentos existentes, a revisar se o responsável definir outra direção:

1. Preservar o lore e os nomes do universo; não inventar fatos para preencher a interface.
2. Facilitar encontrar e compreender o conteúdo da mesa.
3. Manter colaboração, acesso a spoilers e administração como permissões distintas.
4. Proteger contribuições contra perda de dados e manter favoritos pessoais isolados.

## Open Decisions

- Prioridade relativa entre uso da mesa, apresentação a novos visitantes e portfólio.
- Necessidades específicas de acessibilidade e eventual padrão formal exigido; nenhuma conformidade foi verificada ou declarada.
- Outros compromissos de produto, autoria e voz que não estejam registrados no repositório.

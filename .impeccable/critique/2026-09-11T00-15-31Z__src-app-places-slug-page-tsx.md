---
target: "Lugares: Solária, mídia, NPCs e integração opcional com mapa"
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\places\\[slug]\\page.tsx"
target_fingerprint: "sha256:9b2fc46145e33ba92f10879f8c40485281183d00ace68abc0c73c1e59e42941d"
target_path: "C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\places\\[slug]\\page.tsx"
timestamp: 2026-09-11T00-15-31Z
slug: src-app-places-slug-page-tsx
---
Method: dual-agent (A: /root/design_review · B: /root/detector_review)

**Lugares precisa de uma reorganização de conteúdo, além do layout.** Solária já contém Governo, Comércio e Defesas, mas a página trata tudo como descrição corrida. Personagens é a referência certa para identidade, ações, galeria e navegação; Lugares precisa acrescentar pessoas, cartografia e seções flexíveis.

Avaliação provisória: código e HTML servido foram inspecionados; o navegador falhou ao iniciar, portanto não houve validação visual de desktop/celular.

**Especificidade e pontos fortes**

As fontes, o pergaminho e o lore pertencem a Átrias. A composição antiga de cartões, porém, não facilita as perguntas da mesa: onde fica, quem vive ali e o que há para fazer.
A listagem já tem busca que ignora acentos, contagem e recuperação de busca vazia. Personagens fornece padrões reutilizáveis. A edição já preserva campos não alterados e detecta conflitos de revisão.

| Heurística | Nota /4 | Principal observação |
|---|---:|---|
| Visibilidade do estado | 2 | Ficha vazia não explica a ausência de dados. |
| Linguagem do usuário | 3 | Leitura em português; editor parcialmente em inglês. |
| Controle e liberdade | 2 | Faltam atalhos dentro do artigo longo. |
| Consistência | 2 | Lugares ainda usa a organização anterior a Personagens. |
| Prevenção de erros | 3 | Há revisão e confirmação de arquivamento. |
| Reconhecimento | 2 | Pessoas e localização exigem nova busca. |
| Eficiência | 2 | Favoritos existem; navegação por assuntos não. |
| Estética e simplicidade | 2 | Coluna lateral e ficha não acompanham o conteúdo disponível. |
| Recuperação de erros | 2 | Algumas mensagens são genéricas. |
| Ajuda contextual | 1 | Foto, mapa e referências não têm orientação suficiente. |
| **Total provisório** | **21/40** | **Aceitável, com melhorias importantes.** |

**Cinco prioridades**

1. **P1 — Transformar categorias em seções reais.** História, geografia e residentes são inicializados vazios no componente, sem conexão com o conteúdo. Em Solária, os títulos Governo, Comércio e Defesas estão dentro da descrição, sem navegação. Permitir seções opcionais com título e texto; preservar e reorganizar o lore existente. Sugestão: `$impeccable shape`.

2. **P1 — Separar fotos, mapa local e mapa do mundo.** Hoje `data.map || entity.image` mostra apenas um arquivo e chama qualquer imagem de “Mapa”. O formulário oferece “Map URL”, sem galeria de lugares. Usar a paisagem na apresentação, a planta da vila em “Mapas” com ampliação e uma ação independente “Ver no mapa de Átrias”. Criar/editar deve permitir enviar fotos, visualizar prévia, ordenar, remover e preencher legenda/descrição acessível. O editor de Personagens pode ser reaproveitado, mas hoje aceita endereços: upload de arquivo ainda precisa ser implementado. Sugestão: `$impeccable shape`.

3. **P1 — Dar espaço aos NPCs mesmo sem página própria.** As referências enviadas precisam de nome, função, descrição e retrato opcionais. Barão Aric Valtor e Lysandra, por exemplo, devem aparecer como pessoas consultáveis, com vínculo opcional a Personagens. Enquanto não houver página, manter a informação legível, sem link quebrado nem obrigação de criar todos os NPCs antes. Sugestão: `$impeccable layout`.

4. **P2 — Adaptar a composição à quantidade de informação.** A página sempre reserva uma lateral; “Ver detalhes rápidos” abre rótulos mesmo sem valores; editar/favoritar ficam no fim. Colocar identidade e ações no topo, exibir somente fatos preenchidos e gerar índice apenas para várias seções. Um lugar com um parágrafo deve continuar compacto. Sugestão: `$impeccable distill`.

5. **P2 — Completar o caminho entre mapa e wiki.** O mapa já tem marcador de Solária com link para a página. Falta a volta: a página deve abrir o mapa centralizado no marcador correspondente. Vínculo opcional; lugar sem marcador continua completo. O cadastro do mapa é separado e fixo no código, então essa associação precisa ser compartilhada para evitar divergências. Sugestão: `$impeccable clarify`.

**Como reorganizaria a página**

| Ordem | Conteúdo |
|---|---|
| 1 | Nome inteiro, tipo/região, favoritar e editar. |
| 2 | Paisagem ou foto principal opcional, introdução e ficha curta. |
| 3 | Índice com somente as seções existentes. |
| 4 | Visão geral, História, Governo, Comércio e Defesas, conforme o conteúdo. |
| 5 | Pessoas do lugar: retrato, nome, função, descrição e página vinculada quando existir. |
| 6 | Locais de interesse e mapas locais ampliáveis; acesso opcional ao mapa de Átrias. |
| 7 | Última edição e retorno à lista/ao topo. |

Para Solária, isso acomoda a paisagem, a planta e os oito NPCs das referências. Para um lugar pequeno, basta título, texto e eventual foto. As categorias não devem virar um formulário obrigatório igual para todos.

Na listagem, manter a base atual e acrescentar acesso claro ao mapa. A maior mudança necessária está no detalhe e no editor.

**Carga de leitura e pontos de atrito**

Quem consulta durante a sessão precisa localizar Governo ou Defesas sem percorrer o artigo inteiro. Quem contribui encontra nove campos de lugar no mesmo grupo, alguns em inglês, sem espaço adequado para pessoas e fotos. Para leitores de tela, os títulos embutidos na descrição não são cabeçalhos; o expansor também não informa seu estado com `aria-expanded`.

A exploração começa bem na busca, mas perde continuidade quando exige procurar novamente cada pessoa ou lugar citado. A organização proposta mantém essas relações próximas do texto.

**Detector e observações menores**

Nenhum alerta automático em `src/app/places`. Nos arquivos relacionados, 11 alertas no mapa: oito de cor, um de fonte e dois de tamanho. Boa parte das cores e o tamanho 14px já são admitidos pelo DESIGN.md; não justificam alterações automáticas. O alerta da fonte merece correção: o popup pede “Cinzel”, enquanto o projeto carrega “Cinzel Decorative”.

O detector não identificou os principais problemas de conteúdo, mídia e navegação. Também corrigiria acentos dos rótulos, removeria a capitular do nome e retiraria do fluxo do visitante o clique que copia coordenadas de depuração.

**Decisões para a reorganização**

Você quer poder criar e reordenar categorias próprias em cada lugar?
Para NPCs ainda sem página, quer uma ação “Criar página” junto da referência?

---

Complemento posterior: a inspeção visual foi realizada com sucesso via Playwright MCP. Veja [avaliação visual e capturas](solaria-visual-2026-09-11/avaliacao.md). A limitação de navegador descrita nesta crítica inicial foi superada para os estados públicos desktop e celular inspecionados; nota mantida em 21/40.

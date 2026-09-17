# Categorias, mídias e Divindades

## Escopo

Extensão local do sistema existente: tornar a edição de imagens consistente nas oito categorias editáveis e acrescentar Divindades. Modos: **Read** para consultar listas e páginas; **Operate** para criar e editar. A identidade visual existente permanece, sem nova composição exploratória, tokens ou componentes visuais.

## Operação

`AdminEntityForm` apresenta `CharacterMediaEditor` antes dos detalhes opcionais para Personagem, Lugar, Facção, Item, Conhecimento, Criatura, Divindade e Outros. A mídia tem estado compartilhado independente dos campos da categoria e acompanha a troca de categoria. A duplicação da galeria no `PlaceEditor` foi removida; mapas conservam seu fluxo próprio.

O editor reutilizado oferece endereço ou envio de imagem, legenda, crédito, descrição alternativa, ordenação e remoção; também conserva o suporte existente a arquivos de vídeo. Nenhuma mídia é obrigatória. O formulário valida e envia a coleção comum, e mudanças nela participam do aviso de alterações não salvas.

Divindade usa nome, descrição e mídias comuns, mais alinhamento, domínios separados por vírgulas e símbolo nos detalhes opcionais. Não exige lore inventado nem registros de exemplo persistidos.

## Leitura

`/deities` reutiliza `WikiArchive`, com ordenação em português e metadados de domínio e alinhamento. `/deities/[slug]` reutiliza o CSS da página de personagem, `ImageGallery`, ações de contribuição e favorito, texto com links da wiki e registro de edição. Fatos e referências vazios são omitidos; a ausência de história tem mensagem explícita.

As categorias passam a resolver miniaturas por `getCharacterPortrait`: primeira imagem válida da coleção; registros antigos ainda podem usar a imagem legada. Uma coleção explicitamente vazia remove esse fallback. As páginas de detalhe reutilizam `ImageGallery` e a leitura comum de mídia.

Divindades participa das entradas de navegação, home, administração, busca, grafo, links da wiki, favoritos e arquivados. A extensão segue os fluxos existentes de acesso e contribuição.

## Continuidade visual

Permanecem o pergaminho de leitura, superfícies noturnas, detalhes âmbar/dourados, Cinzel para títulos, Crimson para prosa e controles sem serifa. Campos e ações conservam seus tratamentos locais; o botão cenográfico da home não é aplicado ao editor. A galeria mantém proporções da imagem, legenda/crédito e ampliação em diálogo nativo. Nenhum asset raster de produto foi criado.

## Evidência e limites

Verificação e capturas estão registradas em `../review/categories/documentation.md`. A lista observada estava vazia. A imagem existente `Zercrom.jpg` foi usada apenas em prévia não salva; upload real e publicação não foram exercitados. Nenhuma conformidade abrangente de acessibilidade é declarada.

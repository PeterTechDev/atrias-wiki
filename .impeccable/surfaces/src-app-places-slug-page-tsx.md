# Lugares — detalhe e contribuição

Alvo: `src/app/places/[slug]/page.tsx`. Relacionados: `place.module.css`, `PlaceEditor.tsx`, `ImageUpload.tsx`, `src/app/map/WorldMap.tsx` e detalhe de Personagens.

## Direction contract

**THESIS:** Consulta de um lugar durante a sessão: identidade, assuntos, pessoas e cartografia próximos do lore. A crítica aprovada substitui a lateral e os painéis vazios por conteúdo opcional.

**OWN-WORLD:** Extensão da identidade existente: pergaminho, azul noturno, detalhes dourados, Cinzel para títulos e Crimson para leitura. Reutiliza galeria, favoritos e ações de contribuição de Personagens.

**STORY:** O leitor identifica o lugar, encontra um assunto pelo índice e segue pessoas ou localização. O membro organiza seções, retratos e mapas sem preencher fatos desconhecidos.

**FIRST VIEWPORT:** Breadcrumb, nome dominante, tipo/região e ações; galeria opcional, ficha preenchida e índice. Conteúdo central de até 1104px, prosa limitada a 76ch. Pessoas passam de duas colunas para uma no celular; mapas locais ficam depois do artigo.

**FORM:** Extensão comum do sistema vigente, aprovada após crítica. Ordem de candidatos e seed key não se aplicam: não houve escolha de novo mundo visual.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implementação observada

- Introdução e categorias são seções semânticas; índice aparece apenas com vários destinos. Fatos, pessoas, mídia e mapas vazios não geram painéis.
- Pessoas aceitam retrato, função, descrição e vínculo opcional. Páginas existentes recebem links; referências sem vínculo oferecem criar personagem. Solária tem oito retratos provenientes da folha do usuário; os recortes e a autoria não informada estão registrados em `public/images/characters/solaria/SOURCE.md`. Não foi gerada arte.
- Fotos/ilustrações e mapas locais usam galerias separadas. O vínculo opcional ao mapa de Átrias abre o marcador; o mapa oferece retorno às páginas associadas.
- Editor usa campos rotulados, reordenação de seções e estados de envio/erro. Upload aceita JPG, PNG ou WebP de até 5 MB em pasta do membro, informa publicação e preserva os demais campos diante de falha.

## Verificação e limites

Comparação documental com PRODUCT.md, DESIGN.md, `.impeccable/design.json` e detalhe de Personagens; inspeção do código dos alvos acima. Evidências de execução e capturas: `.impeccable/review/places/verification.md`. Parecer independente informado: **ship — F1 resolvido**; foco do diálogo escuro agora usa contorno claro. Upload autenticado de arquivo real ainda não foi exercitado no navegador.

Diferença preexistente preservada: Personagens usa títulos em peso 400 e cores locais de leitura/foco que o frontmatter global não enumera; DESIGN.md já reconhece variação entre rotas. Lugares acompanha essa linguagem, sem promover seus valores locais a novos tokens globais. DESIGN.md e `.impeccable/design.json` foram preservados integralmente; nenhuma deriva global foi reparada.

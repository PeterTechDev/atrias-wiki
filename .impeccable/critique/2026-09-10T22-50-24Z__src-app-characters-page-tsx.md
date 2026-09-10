---
target: "Listagens de arquivos: characters, places e demais categorias"
total_score: 14
max_score: 32
na_heuristics: 5,9
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\characters\\page.tsx"
target_fingerprint: "sha256:58d7a33e8f07e735d4a12d042dfc6662329c1c142aba96c5508393b74015951e"
target_path: "C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\characters\\page.tsx"
timestamp: 2026-09-10T22-50-24Z
slug: src-app-characters-page-tsx
---
Method: dual-agent (A: /root/design_review · B: /root/evidence)

O layout comum faz sentido; a estrutura atual dá mais espaço à apresentação do que à consulta. Preserve a fantasia de Átrias e transforme essas páginas em índices de acervo.

Escopo: characters e places vistos no navegador, incluindo mobile 390×844; factions, items, lore, monsters e others inspecionados no código. Modo Read. Avaliação da listagem, não do produto inteiro.

| Heurística | Nota /4 | Evidência |
|---|---:|---|
| Status | 2 | Categoria clara; falta contagem |
| Correspondência com mundo real | 2 | Fallbacks parecem fatos; desconhecido vermelho |
| Controle e liberdade | 2 | Retorno à Home, sem caminho direto a Arquivos na maioria |
| Consistência | 2 | Mesma identidade; imagens e others divergem |
| Prevenção de erros | n/a | Edição fora do escopo |
| Reconhecimento | 2 | Nomes ajudam; etiquetas repetidas não distinguem |
| Eficiência | 1 | Sem busca local numa lista extensa |
| Estética e minimalismo | 1 | Abertura alta e excesso de elementos repetidos |
| Recuperação de erros | n/a | Falhas não exercitadas |
| Ajuda | 2 | Introdução temática, pouca orientação de consulta |
| Total | 14/32 | Fraco: 44% das heurísticas aplicáveis |

Funciona: paleta pergaminho/azul noturno, nomes e imagens do universo, cartões inteiros como links nativos. A identidade é reconhecível, embora a composição seja genérica de catálogo de RPG.

1. **P1 — Consulta lenta e abertura alta.** Os primeiros registros chegam perto de 450–500px; não há busca local. Adotar cabeçalho compacto como /browse, breadcrumb alinhado com retorno a Arquivos, título e contagem, contribuição secundária e busca por nome. Não começar por filtros de campos incompletos. Comandos: shape e distill.
2. **P1 — Mobile quebra em personagens.** A 390px há overflow horizontal e título cortado. Corrigir largura/encolhimento dos contêineres e quebra do título. Em places o cabeçalho ocupa cerca de 460px antes do primeiro cartão. Comando: adapt.
3. **P1 — Ausência de dados apresentada como informação.** Aventureiro é fallback, não necessariamente classe real; Desconhecido recebe vermelho. Outras categorias usam Comum/Historia como padrão. Omitir etiquetas sem dados reais, tratar desconhecido de forma neutra e remover badge vazio de perigo em places. Comando: clarify.
4. **P2 — Cartões dependem de imagens inconsistentes.** Silhuetas de personagens ocupam 192px; lugares sem imagem esticam ao lado dos ilustrados. Priorizar nome e resumo, com miniatura menor quando houver imagem; variar mídia por categoria. Comando: layout.
5. **P2 — Hierarquia e leitura ruidosas.** Faixas escuras, títulos ornamentados, badges e CTA em cada cartão competem. Reduzir elementos repetidos, ampliar descrições de 14px e reservar ornamento aos títulos principais. Links precisam de nome acessível conciso: o de Thaveus anuncia biografia inteira apesar do clamp visual. Comando: typeset e harden.

Carga cognitiva moderada a alta: falham foco, hierarquia e redução progressiva. Mais de quatro registros são opções visíveis, mas o problema é a falta de meios de localizar, não a quantidade isoladamente. A jornada começa ambientada e perde força na repetição de silhuetas e metadados vazios.

Personas: jogador durante sessão precisa rolar para localizar um nome; visitante pode tomar fallbacks como fatos; leitor de tela encontra links com descrições excessivamente longas.

Observações menores: acentos ausentes, interface e descrições em idiomas misturados, breadcrumb centralizado. O mapa de Akos merece conferência editorial, não substituição automática.

Detector: zero achados nos sete arquivos. O resultado não invalida os problemas de composição e o overflow vistos no browser, nem certifica acessibilidade. Sem falsos positivos. Contraste e teclado não auditados integralmente.

Direção: uma base comum de arquivo compacto, mantendo paleta e ícones, com mídia e metadados próprios de cada categoria. /browse já oferece precedente no repositório. Não é necessário redesenhar a identidade nem criar sete componentes independentes de infraestrutura.

Questão para a próxima etapa: priorizar consulta compacta ou manter galeria com retratos maiores?

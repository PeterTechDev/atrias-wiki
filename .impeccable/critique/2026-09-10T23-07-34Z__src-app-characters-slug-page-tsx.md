---
target: Página de personagem /characters/thaveus
total_score: 18
max_score: 32
na_heuristics: 5,10
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\characters\\[slug]\\page.tsx"
target_fingerprint: "sha256:86cc498b537047802226ac6b186823387e6a9e1badb23fb5abe487530efc33da"
target_path: "C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\characters\\[slug]\\page.tsx"
timestamp: 2026-09-10T23-07-34Z
slug: src-app-characters-slug-page-tsx
---
Método: duas avaliações independentes (A: /root/design_review; B: /root/detector).
Alvo: src/app/characters/[slug]/page.tsx. Modo: Read.

A identidade de fantasia funciona, mas a composição trata uma página central como artigo com sidebar. A oportunidade é unir apresentação do personagem, consulta rápida e acervo visual, preservando a prosa.

| Heurística | Nota /4 | Evidência |
|---|---:|---|
| Visibilidade do estado | 3 | Breadcrumb presente; expansão sem aria-expanded. |
| Linguagem do universo | 3 | Termos adequados; rótulos genéricos e acentos ausentes. |
| Controle e liberdade | 1 | Escape não fechou imagem no teste. |
| Consistência e padrões | 2 | Paleta coerente; galeria usa div clicável e modal sem semântica. |
| Prevenção de erros | n/a | Edição e ações destrutivas fora do escopo. |
| Reconhecimento | 2 | Fatos dispersos e detalhes escondidos. |
| Eficiência | 2 | Consulta exige atravessar a narrativa. |
| Estética e minimalismo | 3 | Atmosfera boa; painel Neutro recebe peso excessivo. |
| Recuperação de erros | 2 | Sem fallback explícito de mídia no código; rede não simulada. |
| Ajuda | n/a | Leitura não exige ajuda dedicada. |
| Total | 18/32 | Aceitável; 56%. |

Acertos: identidade creme/azul/dourado; ilustração conectada à história; relato em primeira pessoa com encerramento forte.

Prioridades:
1. P1 — Acervo não suportado na rota. Ela passa apenas entity.image ao ImageGallery, que suporta imagens mas não vídeos. Definir mídia principal e coleção ordenada, com legendas/créditos opcionais. Comando: impeccable shape.
2. P1 — Mídia subordinada. Pequena no desktop e posterior à narrativa na ordem móvel do código. Colocar identidade e mídia antes do relato; manter proporções diversas. Comandos: impeccable layout/adapt.
3. P1 — Ampliação inacessível. Thumbnail div sem teclado; fechamento sem nome; foco não transferido; Escape falhou ao vivo. Usar acionador botão e diálogo acessível com foco e retorno. Comando: impeccable harden.
4. P2 — Consulta lenta. Detalhes rápidos depois da biografia, alinhamento duplicado. Ficha compacta perto do título e âncoras somente para seções reais em textos longos. Preservar lore. Comandos: impeccable layout/clarify.
5. P2 — Hierarquia decorativa excessiva. Cartão escuro inteiro para Neutro, breadcrumb centrado, capitular fragmentando H1. Compactar fatos, alinhar navegação e manter nome inteiro. Comandos: impeccable typeset/distill.

Mídia proposta:
| Acervo | Comportamento |
|---|---|
| Nenhum | Abertura editorial sem espaço vazio. |
| Uma imagem | Maior, proporção preservada, ampliar; sem setas/contador. |
| Várias imagens | Principal e miniaturas; acesso explícito à coleção. |
| Imagens e vídeos | Vídeo com indicador e duração quando disponível, controles, sem autoplay, legendas quando houver fala. |
| Muitos itens | Prévia compacta; coleção completa sob demanda. |

Ordem móvel: nome, identidade, mídia, fatos essenciais, relato. Evitar recortar todo retrato como banner. Legendas e créditos distinguem versões e contextos.

Carga cognitiva: não há excesso de escolhas na captura; problema é localizar informação na sequência longa.
Jornada emocional: atmosfera inicial boa, vale de texto contínuo, encerramento autoral forte. Mídia pode dar ritmo sem interromper cada parágrafo.

Personas: jogador recorrente demora para consultar fatos; usuário móvel encontra mídia depois da história pela ordem do código; usuário de teclado não abre thumbnail normalmente e Escape falha; mestre curador não dispõe de coleção multimídia na rota.

Observações: corrigir acentos de Raça/Informações/Afiliação/História; omitir cartões vazios; evitar legenda que só repete nome; não inventar lore.
Detector: 1 aviso side-tab em page.tsx:125 (border-l-4), falso positivo para esta tela porque quote é sempre vazio. ImageGallery: zero achados; isso não certifica acessibilidade.
Evidência: duas abas independentes confirmaram composição desktop e falha do Escape; viewport móvel e falhas de rede não testados. API de avaliação somente leitura não permitiu overlay; usados CLI, screenshot, árvore acessível e interação.

Decisões para próxima etapa: abertura com retrato de referência ou cena do universo; escopo de mídia/abertura ou reorganização da página inteira.

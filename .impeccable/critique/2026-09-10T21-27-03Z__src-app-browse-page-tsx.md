---
target: "/browse — Image #1"
total_score: 21
max_score: 36
na_heuristics: 5
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\browse\\page.tsx"
target_fingerprint: "sha256:eb785f652586e04d1ce7f5292af35c679d8afc0aa43c34b20a7d6b138f4a20d9"
target_path: "C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\browse\\page.tsx"
timestamp: 2026-09-10T21-27-03Z
slug: src-app-browse-page-tsx
---
Method: dual-agent (A: /root/design_review · B: /root/detector_evidence)

A identidade de fantasia funciona; a hierarquia ainda pode servir melhor à consulta. A recomendação é refinar, preservando pergaminho, azul noturno, dourado e iconografia.

Avaliação de /browse: imagem enviada, página local desktop e código. Modo Read. A versão ao vivo inclui uma barra de conta acima do cabeçalho, ausente na imagem.

| Heurística | Nota /4 | Evidência |
|---|---:|---|
| Estado do sistema | 3 | Localização e contagens claras. |
| Linguagem familiar | 3 | Categorias compreensíveis; “Outros” pouco informativo. |
| Controle e liberdade | 3 | Links nativos e retorno ao início. |
| Consistência | 3 | Cartões previsíveis; larguras e pesos divergentes. |
| Prevenção de erros | n/a | Sem formulário ou ação destrutiva nesta superfície. |
| Reconhecimento | 3 | Ícones rotulados e descrições úteis. |
| Eficiência | 1 | Busca existente sem acesso neste hub. |
| Estética e economia visual | 2 | Painel do título e extras competem com o catálogo. |
| Recuperação de erros | 1 | Falha nas contagens interrompe a renderização; achado estático. |
| Ajuda contextual | 2 | Descrições explicam categorias; subtítulo apenas ambienta. |
| Total | 21/36 | 58% — aceitável; avaliação heurística, não teste com usuários. |

Especificidade: a linguagem visual pertence a Átrias, mas a composição ainda é um diretório genérico de cartões. Não precisa de mais decoração; precisa expressar a prioridade de encontrar conteúdo.

O que funciona:
- Pergaminho, azul noturno e símbolos criam unidade e atmosfera.
- Nome, ícone, descrição e contagem dão boas pistas sobre cada categoria.
- Cartões inteiros são links, com áreas generosas para clique.

Prioridades:
1. P1 — Busca ausente no ponto de consulta. Quem conhece o nome de um personagem precisa primeiro escolher uma categoria, embora /search já exista. Dar acesso visível à busca e tornar “Adicionar registro” secundário. Reutilizar a busca existente, conferindo sua apresentação em português. Comando: impeccable shape.
2. P2 — Blocos sem alinhamento comum. Breadcrumb centralizado, título com cerca de 700 px, catálogo de 1100 px e extras de 810 px criam ilhas. Usar um contêiner comum e alinhar breadcrumb e título à esquerda; reduzir a caixa elevada em torno do título. Comando: impeccable layout.
3. P2 — Ferramentas secundárias pesam mais que o arquivo. Mesa de Dados, Sessões e Mapa atraem atenção pela massa escura. Identificar o grupo e reduzir sua ênfase. “Outros 0” merece tratamento discreto, preservando acesso para contribuição. Não esconder categorias úteis só para fechar a grade. Comando: impeccable distill.
4. P2 — Texto auxiliar pequeno para consulta rápida. Descrições em Crimson Pro a 14 px têm pouca presença ao lado dos títulos ornamentados. Experimentar 16 px nas descrições e melhor peso aparente nos rótulos, mantendo a fonte de fantasia na identidade. Contraste não foi medido. Comando: impeccable typeset.
5. P2 — Contagens condicionam a disponibilidade do diretório. A página aguarda getEntityCounts antes de renderizar e a função propaga falhas. Manter links disponíveis se as estatísticas falharem, sinalizando contagem indisponível. Achado de código; indisponibilidade não foi reproduzida. Comando: impeccable harden.

Carga cognitiva moderada: três alertas no checklist — agrupamento de sete pares, prioridade visual e quantidade de escolhas. Sete categorias visíveis não exigem memorizar sete itens; não há motivo para escondê-las mecanicamente. O custo real está no caminho indireto para buscar um nome e na competição com ferramentas auxiliares.

Jornada emocional: a identidade acolhe e os cartões orientam; a consulta perde ritmo sem busca direta. O rodapé fecha com voz coerente. O espaço vazio decorre parcialmente do rodapé preso à base da viewport e não precisa ser preenchido com conteúdo inventado.

Personas:
- Jogador durante a sessão: consulta por nome fica indireta.
- Visitante novo: descrições ajudam, mas “Outros” não antecipa o conteúdo.
- Leitor com baixa visão: texto auxiliar e traços finos merecem verificação de zoom e contraste; não há falha de acessibilidade comprovada.

Observações menores: trocar “Home” por “Início”; dar nome ao breadcrumb e aria-current ao item atual. “Adicionar registro” começa em Outros, mas o formulário permite mudar o tipo: não é categoria bloqueada.

Detector: uma execução sobre src/app/browse/page.tsx, saída [], exit 0, zero achados e nenhum falso positivo. A ausência de achados automáticos não contradiz a crítica de hierarquia e navegação. Inspeção desktop confirmou larguras diferentes, tipografia e ausência de busca no hub. Mobile, leitor de tela, contraste e falha de rede não foram testados.

Pergunta de direção: priorizar consulta por nome conhecido ou exploração por categorias?

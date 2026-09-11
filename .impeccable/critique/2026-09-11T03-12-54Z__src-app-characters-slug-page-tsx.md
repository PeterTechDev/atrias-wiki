---
target: "Página de personagem: Idris Rucandel e destaque do Card 3D"
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\characters\\[slug]\\page.tsx"
target_fingerprint: "sha256:575fb1f97d2c70755d74d5e3db905bd73f99caf5cb451f8d34720c629ee0ebf4"
target_path: "C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\characters\\[slug]\\page.tsx"
timestamp: 2026-09-11T03-12-54Z
slug: src-app-characters-slug-page-tsx
---
Method: dual-agent (A: /root/design_review · B: /root/evidence)

O Card 3D está com destaque excessivo porque ocupa uma seção inteira no caminho da leitura. Sua posição e a altura reservada pesam mais que o efeito em si. Modo: Read.

A identidade pertence à Átrias: pergaminho, ilustrações e tipografia têm coerência. O problema é a composição, que intercala uma demonstração interativa entre apresentação e biografia.

| Heurística | Nota /4 | Evidência |
|---|---:|---|
| Visibilidade do estado | 3 | Breadcrumb e estados de mídia claros |
| Linguagem e mundo real | 3 | Ficha clara; Card 3D desloca o foco do lore |
| Controle e liberdade | 3 | Fechar galeria e reverter efeito previstos |
| Consistência | 3 | Identidade coesa; mídia separada em dois lugares |
| Prevenção de erros | 3 | Confirmação de arquivamento prevista no código |
| Reconhecimento | 3 | Ficha e miniaturas explícitas |
| Eficiência | 2 | História distante, sem âncora neste exemplo |
| Estética e minimalismo | 2 | Feature secundária interrompe leitura |
| Recuperação de erros | 3 | Mensagens e nova tentativa previstas |
| Ajuda contextual | 3 | Instrução do efeito presente |
| Total | 28/40 | Bom, com deficiência de hierarquia |

Notas de design, não certificação de acessibilidade. Estados de erro/controle avaliados também pelo código; sem teste exaustivo de interação.

Pontos fortes:
- Nome, retrato e quatro fatos permitem reconhecer o personagem rapidamente.
- História tem prosa serifada, largura contida e bom espaçamento.
- Card possui suporte previsto a teclado, movimento reduzido e falhas de imagem; preservar.

Prioridades:
1. P1 — Seção recreativa interrompe o caminho até a história. No desktop observado, ocupa 872px e a história começa em y=1789px. Card parado mede cerca de 320×320px, mas o palco reserva aproximadamente 666px de altura para expansão. Colocar “Ver card 3D” como ação discreta junto à galeria, abrindo a experiência sob demanda. Preservar a animação inteira dentro dessa apresentação. Apenas diminuir sombra, título ou imagem não resolve. Comandos: impeccable layout + quieter.
2. P2 — Representações do personagem ficam editorialmente separadas. A galeria já reúne imagens e vídeos; a seção Card 3D cria outro centro visual para o mesmo personagem. Reunir a descoberta do 3D junto ao retrato, como modalidade opcional, mantendo a imagem principal estática por padrão. Comando: impeccable distill.

Direção recomendada: identidade + ficha + retrato, depois história; acesso opcional ao 3D junto à galeria. Um botão discreto abrindo um dialog mantém a feature descobrível e libera o fluxo editorial.

Carga cognitiva moderada: falham foco único, hierarquia e revelação progressiva. Não há excesso comprovado de escolhas equivalentes: são três ações editoriais, duas miniaturas e quatro fatos, estes últimos não são opções. O custo vem da troca de contexto.

Jornada: a ilustração cria interesse, o vazio interrompe o ritmo, a demonstração cria outro pico e a história chega tarde. A experiência opcional preserva a descoberta.

Personas:
- Jogador recorrente: consulta fatos rapidamente, mas atravessa 872px adicionais para alcançar a história.
- Visitante novo: duas áreas de mídia sugerem importância editorial excessiva para o efeito.
- Usuário de teclado: suporte existe no código, mas a dica só menciona mouse/toque; observação menor, não bloqueio comprovado.

Observações: nesta entidade o índice não aparece porque só há uma seção textual; primeiro remover a interrupção antes de adicionar atalhos compensatórios. Arquivar por emoji e data final com precisão administrativa merecem eventual acabamento fora do foco principal. Mobile inferido pelo CSS, não capturado.

Detector CLI: zero ocorrências em src/app/characters/[slug]/page.tsx e src/components/CharacterCard.tsx, ambos exit 0. Sem falsos positivos; ausência de alertas não valida hierarquia.

Questions skipped: 2 Priority Issues; a intenção de manter o 3D como feature secundária já foi informada.

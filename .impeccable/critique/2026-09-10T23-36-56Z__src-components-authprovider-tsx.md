---
target: header nas imagens 1, 2 e 3
total_score: 12
max_score: 20
na_heuristics: 3,5,7,9,10
p0_count: 0
p1_count: 0
target_identity: "file:C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\components\\AuthProvider.tsx"
target_fingerprint: "sha256:5df8fcd12954a868f8250b5d1d45aab6dd58975954618d9b67855a32fcaba864"
target_path: "C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\components\\AuthProvider.tsx"
timestamp: 2026-09-10T23-36-56Z
slug: src-components-authprovider-tsx
---
Crítica do header — imagens 1, 2 e 3

Avaliações independentes de design e código/detector. Evidência visual: imagens fornecidas; não houve teste interativo ou mobile.

Veredito: o header parece uma barra de autenticação anexada à página. A identidade de Átrias aparece na marca, mas a composição não a integra à conta. A maior oportunidade é uma única linha, no mesmo container do conteúdo.

Acertos: azul profundo e dourado coerentes com a wiki; marca tipográfica com personalidade; avatar e nome distinguem claramente o estado autenticado.

Prioridades:
1. [P2] Duas faixas e dois alinhamentos. Na imagem 3, aproximadamente 120 px são usados para marca e conta em andares separados. A marca alinha com o conteúdo, a conta com a janela. Nas imagens 1–2, quase toda a faixa está vazia. Unificar em uma linha de cerca de 64 px, com marca à esquerda e conta à direita dentro do max-w-6xl existente. Comando: $impeccable layout.
2. [P2] Conta pouco explícita como controle. Peter com avatar parece identificação estática, embora abra um menu. Adicionar chevron discreto e preservar o suporte a teclado existente. Simplificar Entrar / Criar conta para Entrar se o cadastro continuar claramente disponível na tela de destino. Comando: $impeccable clarify.

Heurísticas Nielsen, escala 0–4:
| Heurística | Nota | Evidência |
|---|---|---|
| Visibilidade do estado | 3 | Visitante e autenticado distinguíveis |
| Correspondência com mundo real | 3 | Nome e avatar familiares |
| Controle e liberdade | n/a | Interação não testada |
| Consistência e padrões | 2 | Dois alinhamentos |
| Prevenção de erros | n/a | Fora do recorte |
| Reconhecimento | 2 | Menu sem indicação visual de abertura |
| Flexibilidade e eficiência | n/a | Percurso não testado |
| Estética e minimalismo | 2 | Duas faixas para pouco conteúdo |
| Recuperação de erros | n/a | Fora do recorte |
| Ajuda e documentação | n/a | Não necessária neste recorte |
| Total | 12/20 | Aceitável, composição precisa melhorar |

Carga cognitiva: poucos elementos, mas a separação entre marca, conta e conteúdo dificulta orientação. Não há excesso de opções visíveis.
Personas: visitante encontra acesso à conta antes da identidade da wiki; colaborador precisa descobrir que avatar/nome abre perfil e favoritos. A chegada transmite sobriedade, mas a faixa vazia enfraquece a sensação de uma interface integrada.
Observação menor: escudo colorido destoa dos ícones monocromáticos da página; manter avatar personalizado tem prioridade sobre uniformidade decorativa.
Detector: zero ocorrências em src/components/AuthProvider.tsx. A composição foi confirmada em src/app/browse/page.tsx e src/app/layout.tsx. Não foram medidos contraste, foco ou comportamento responsivo.
Direção proposta: preservar cores e fontes; reorganizar antes de adicionar decoração ou navegação.
Questions skipped: 2 Priority Issues; a crítica não exige uma decisão para ser concluída.

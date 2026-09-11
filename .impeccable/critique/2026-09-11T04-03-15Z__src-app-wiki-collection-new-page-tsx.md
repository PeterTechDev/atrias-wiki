---
target: Página de adicionar registro /wiki/others/new, variante Personagem
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\wiki\\[collection]\\new\\page.tsx"
target_fingerprint: "sha256:60dcb186251a17aee2520871fa625a89504ff9226480044728ef521afb420ebd"
target_path: "C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\wiki\\[collection]\\new\\page.tsx"
timestamp: 2026-09-11T04-03-15Z
slug: src-app-wiki-collection-new-page-tsx
---
Method: dual-agent (A: /root/design_review · B: /root/detector_review)

**A página tem identidade de Átrias, mas ainda pede ao colaborador que pense como administrador.** Para incentivar os primeiros registros, a prioridade é deixar claro que uma contribuição pequena já tem valor e pode ser complementada depois.

Avaliação do print, código e página autenticada no navegador. A rota inicia corretamente em **Outros**; a imagem mostra **Personagem** selecionado. A ficha longa pertence a essa variante.

**O que funciona**
- Pergaminho, pena e título dão pertencimento ao universo; controles convencionais facilitam preencher.
- “A página funciona também sem imagens” reduz a pressão de produzir algo completo.
- Já existem proteção ao sair com alterações, preservação de campos ao trocar categoria e manutenção do texto após falha de rede.

**Prioridades**

1. **P1 — O formulário faz uma contribuição simples parecer uma ficha completa.** Personagem acrescenta 13 campos, além de mídia e card 3D, antes de “Criar página”. Não fica claro o que pode ser ignorado. Exibir primeiro categoria, nome, descrição orientada e visibilidade; recolher detalhes opcionais e manter a ação de criar próxima do conteúdo principal. Informar “Você pode complementar depois”. O card 3D deve aparecer entre os últimos enriquecimentos. Comandos: `$impeccable distill` e `$impeccable onboard`.

2. **P1 — O título contradiz a categoria escolhida.** Ao trocar para Personagem, permanecem “Adicionar Outro”, “Criar uma página em Outros” e o breadcrumb de Outros. Isso gera dúvida sobre onde o registro vai aparecer. Usar “Criar página” como título estável, categoria no início e navegação coerente; ou sincronizar o título com a seleção. Comando: `$impeccable clarify`.

3. **P1 — A recuperação de erro fica longe de quem acabou de preencher.** O botão está no fim; o erro geral aparece no topo, sem anúncio acessível nem transferência de foco. Na ficha longa, a pessoa pode interpretar a falha como um botão que não respondeu. Mostrar erros junto aos campos pertinentes, anunciar o resumo e mantê-lo próximo à ação. Preservar a proteção de texto existente. Comando: `$impeccable harden`.

4. **P2 — Jargão recebe mais destaque do que orientação.** “Slug” ocupa tanto espaço quanto Nome, embora seja automático. “New”, “Character details”, “Race” e “Class” interrompem o português. Apresentar a URL como informação secundária, editável sob demanda; traduzir os rótulos e orientar a descrição: “Quem ou o que é? Conte o que o grupo já sabe.” Comando: `$impeccable clarify`.

5. **P2 — Publicação e visibilidade não estão suficientemente explícitas.** O checkbox desmarcado acompanha “Somente mestres podem acessar. Desmarque…”, confundindo instrução com estado atual. Mostrar “Visível para todos” ou “Somente mestres” conforme a seleção; esclarecer que criar publica. Após sucesso, confirmar “Página criada” e oferecer continuar editando ou criar outra. Comando: `$impeccable clarify`.

**Saúde da experiência — 21/40**

Notas heurísticas de 0 a 4; avaliação qualitativa, não medição de abandono.

| Heurística | Nota | Principal evidência |
|---|---:|---|
| Visibilidade do estado | 2 | Há “Salvando…”, mas categoria e localização divergem. |
| Linguagem do usuário | 2 | Inglês e “Slug” no fluxo em português. |
| Controle e liberdade | 3 | Cancelamento protegido e dados preservados entre categorias. |
| Consistência | 2 | Controles previsíveis; títulos e idioma inconsistentes. |
| Prevenção de erros | 2 | Validações presentes; mínimo necessário pouco claro. |
| Reconhecimento | 2 | Rótulos e referências ajudam; faltam exemplos de conteúdo. |
| Eficiência | 2 | Slug automático; ficha opcional alonga o caminho. |
| Estética e minimalismo | 2 | Marca coerente; detalhes competem com a tarefa principal. |
| Recuperação de erros | 2 | Texto preservado; erro distante e sem anúncio. |
| Ajuda contextual | 2 | Orienta mídia, mas não explica quanto basta preencher. |
| **Total** | **21/40** | **Aceitável, com melhorias significativas necessárias.** |

**Carga cognitiva e jornada**

A variante Personagem perde hierarquia, foco e divulgação progressiva: URL, referências, mídia, card 3D e combate aparecem antes de concluir. As sete categorias estão num seletor recolhido; isso, isoladamente, não exige um assistente de várias etapas.

A entrada comunica pertencimento. A ficha extensa pode transformar vontade de colaborar em receio de não saber o suficiente. O final entrega a página por redirecionamento, mas poderia reforçar que a contribuição deu certo e continua editável. Essa interpretação precisa ser validada com colaboradores; não foi medida em testes de uso.

**Pessoas mais afetadas**
- Primeiro colaborador: não sabe se precisa preencher raça, classe e combate para registrar um personagem.
- Pessoa que usa leitor de tela: o erro geral não tem anúncio nem foco direcionado; os campos básicos têm rótulos associados.
- Pessoa no celular, sujeita a interrupções: a ficha empilhada exige mais rolagem. Há aviso de saída, mas não rascunho persistido. O risco mobile é inferido do código; não houve inspeção mobile.

**Detalhes menores**
- Marca, link Wiki, voltar e breadcrumb repetem navegação antes da tarefa.
- Alterar Nome sobrescreve um slug personalizado durante a criação.
- No desktop inspecionado, Criar e Cancelar medem cerca de 36–38 px de altura; há espaço para ampliar a área de toque.

**Detector:** zero achados em sete arquivos: rota, AdminEntityForm, AdminShell, CharacterMediaEditor, CharacterCardEditor, WikiTextEditor e PlaceEditor. Isso não invalida os problemas de fluxo encontrados na revisão humana. Sem falsos positivos; nenhuma sobreposição visual foi injetada.

**Direção recomendada:** uma página compacta para começar, com detalhes opcionais expansíveis e confirmação clara da publicação. Preservar a identidade de fantasia. O maior ganho virá de reduzir a exigência percebida, sem adicionar etapas.

Perguntas para decidir o próximo trabalho:
- O registro inicial pode conter só nome, com descrição opcional, ou deve exigir nome e uma frase?
- A próxima intervenção deve priorizar os três P1 ou incluir também linguagem, visibilidade e confirmação de sucesso?

---
target: "http://localhost:3000/wiki/favorites"
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\wiki\\favorites\\page.tsx"
target_fingerprint: "sha256:dd9ac1e060861ff7e08e1e21e7b2690690f58138b66a7570a701e7e4ba3f1c65"
target_path: "C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\wiki\\favorites\\page.tsx"
timestamp: 2026-09-11T03-23-20Z
slug: src-app-wiki-favorites-page-tsx
---
Method: dual-agent (A: /root/design_review · B: /root/detector_review)

**Veredito:** a página tem uma base clara, mas funciona como uma página de leitura quando deveria facilitar reencontrar referências. O cabeçalho preserva a identidade de Átrias; o corpo ainda parece um gerenciador genérico de favoritos. A maior melhoria é encurtar os itens, sem adicionar mais controles.

**Saúde do design: 21/40 — aceitável, com melhorias relevantes.** Notas de 0 a 4; avaliação combina desktop autenticado e estados inspecionados no código.

| Heurística | Nota | Principal observação |
|---|---:|---|
| Visibilidade do estado | 3 | Carregamento e erros existem; remoção não identifica seu progresso. |
| Correspondência com o mundo real | 4 | Nomes, categorias e ações usam linguagem familiar. |
| Controle e liberdade | 2 | Remoção sem desfazer local; “Voltar” leva sempre ao início. |
| Consistência | 2 | A ação de tentar novamente não corresponde sempre à falha. |
| Prevenção de erros | 3 | Bloqueia ações duplicadas e preserva item quando a remoção falha. |
| Reconhecimento | 2 | Biografia compete com nome e categoria; estado vazio exige conhecimento prévio. |
| Eficiência | 2 | Abertura direta e busca global ajudam; cartões enormes prejudicam a consulta. |
| Estética e minimalismo | 1 | Um único favorito ocupa quase toda a tela. |
| Recuperação de erros | 2 | Mensagem clara, mas retry de remoção apenas recarrega a lista. |
| Ajuda contextual | 0 | Falta explicar como adicionar o primeiro favorito. |

**O que funciona**

- Cabeçalho reconhecível, busca global e título claro dão orientação.
- Nome, categoria e indicação de arquivamento oferecem informações úteis para reconhecer a página.
- A remoção só desaparece da lista após sucesso; erros usam `role="alert"`.

**Prioridades**

1. **P1 — Biografias inteiras impedem a leitura rápida da lista.** O cartão de Thaveus mediu 862 px de altura em desktop, com 3.412 caracteres. O nome acessível do link também inclui toda a biografia. Exibir um resumo de duas ou três linhas, destacar nome e categoria e dar ao link um nome acessível curto. Apenas cortar visualmente com CSS não resolve o anúncio longo. Evidência: `src/app/wiki/favorites/page.tsx:60–62`. Comando: `$impeccable distill`.
2. **P2 — “Tentar novamente” pode repetir a operação errada.** Pelo código, após falha na remoção, o botão recarrega os favoritos em vez de remover novamente. Separar a recuperação das duas falhas ou rotular explicitamente “Recarregar favoritos”; mostrar “Removendo…” no item afetado. Evidência: `page.tsx:39–55`; falha não provocada no navegador. Comando: `$impeccable harden`.
3. **P2 — Estados vazio e sem login não orientam o próximo passo.** O vazio só informa ausência; sem login, somem o título e o contêiner habitual. Manter a estrutura e explicar “Abra uma página e use ‘Adicionar aos favoritos’”, com acesso à exploração. Evidência: `page.tsx:17–18,57`; estados avaliados no código. Comando: `$impeccable onboard`.
4. **P2 — Remover recebe destaque excessivo e um alvo pequeno.** A ação dourada compete com o nome branco da página; seu botão mede 140 × 20 px no desktop. Dar prioridade visual à abertura, aumentar a área clicável e distinguir o nome acessível por item. Evidência: `page.tsx:60–64`. Comando: `$impeccable polish`.

**Carga cognitiva e jornada**

Não há excesso de opções no estado observado: só um favorito. Há excesso de conteúdo, hierarquia fraca e pouca divulgação progressiva; no vazio, falta orientação. A chegada mantém a familiaridade de Átrias, mas a biografia transforma uma consulta rápida em leitura longa. No código, a remoção termina sem confirmação explícita. Filtros, pastas e ações em lote não têm necessidade demonstrada nesta avaliação.

**Personas**

- **Alex, usuário frequente:** abre o favorito em um clique, mas precisaria atravessar biografias para comparar vários itens.
- **Sam, leitor de tela ou acesso motor:** encontra um link com a biografia inteira, botões repetidos sem o nome da entidade e alvo de remoção baixo.
- **Jordan, primeiro acesso:** o estado vazio não ensina a salvar uma página; a tela sem login perde sua identificação.

Para o jogador consultando referências durante uma sessão, contexto documentado em PRODUCT.md, a prioridade é reconhecer e abrir rapidamente.

**Observações menores:** “← Voltar” deveria identificar seu destino real, como “Início”. Carregamento de conta e conteúdo final mudam de alinhamento. Não foram verificadas interação em celular, navegação por teclado ou conformidade de contraste.

**Detector e evidências:** zero achados nos quatro arquivos examinados: favorites/page.tsx, layout.tsx, AuthProvider.tsx e GlobalSearch.tsx. Sem falsos positivos. As duas inspeções independentes concordaram sobre a biografia longa, o link excessivo e a remoção. O detector não capturou esses problemas de uso; zero achados não significa aprovação de UX. Sem overlay: a API de navegador permite apenas avaliação JavaScript de leitura. Foram usados screenshot, árvore de acessibilidade e medidas do DOM.

**Questões para orientar a melhoria:** priorizar a consulta rápida, os estados e erros, ou ambos? Aplicar os dois primeiros ajustes, os quatro itens prioritários, ou incluir também as observações menores?

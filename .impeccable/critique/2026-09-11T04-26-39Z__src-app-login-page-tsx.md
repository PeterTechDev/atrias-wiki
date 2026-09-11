---
target: criar/editar perfil (tela original; registro após implementação)
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\login\\page.tsx"
target_fingerprint: "sha256:26a59d58d9aded40fe3125f23bb7072a5d1d7ddd6906262aeb1def3ed9917da3"
target_path: "C:\\Users\\Peter\\Documents\\Sideprojects\\atrias-wiki\\src\\app\\login\\page.tsx"
timestamp: 2026-09-11T04-26-39Z
slug: src-app-login-page-tsx
---
Method: dual-agent (A: /root/design_review · B: /root/evidence)

# Criar e editar perfil — crítica e implementação

Avaliação da tela original enviada pelo usuário e do código antes das mudanças. Nota original: 27/40, aceitável, com melhorias relevantes. A impressão digital deste registro corresponde à implementação posterior; a nota NÃO avalia essa implementação.

| Heurística | Nota /4 | Evidência original |
| --- | --- | --- |
| Estado do sistema | 3 | Feedback existe, sem prévia da foto |
| Mundo real | 3 | Email aparenta ser editável |
| Controle e liberdade | 2 | Sem remoção explícita da foto selecionada |
| Consistência | 2 | Emojis, radio azul e upload em inglês |
| Prevenção de erros | 3 | Foto validada só ao salvar |
| Reconhecimento | 3 | Sem prévia da identidade pública |
| Eficiência | 3 | Avatar e upload separados |
| Estética | 2 | Hierarquia uniforme e cartão estreito |
| Recuperação | 3 | Mensagens preservam dados, mas ficam distantes |
| Ajuda | 3 | Limites claros, email sem explicação |
| Total | 27/40 | Aceitável |

A identidade noturna, o dourado e a Cinzel combinam com Átrias. A composição original é genérica e os emojis parecem provisórios. Forças: ação principal clara, labels persistentes, limites e informação de visibilidade pública.

## Prioridades originais

- P1: avatar e foto competem; reunir, mostrar prévia, validar imediatamente e permitir remover seleção.
- P2: email parece editável; exibir como dado da conta.
- P2: falta hierarquia; separar imagem, identidade pública e dados da conta.
- P2: emojis inconsistentes; usar família visual de fantasia mantendo IDs existentes.
- P2: nomes acessíveis duplicados nos radios e ajuda dentro do nome do campo; separar nomes e descrições.

Carga cognitiva moderada: falhas de agrupamento, hierarquia e divisão das tarefas. Não requer wizard. A entrada acolhe; a seleção sem prévia gera dúvida; a confirmação termina o fluxo sem antecipar o resultado visual.

Personas: iniciante tenta editar email; usuário de leitor de tela ouve nomes duplicados; usuário no celular percorre controles de imagem separados. Observações menores: rota /login também serve edição; não confundir usuário com classe de personagem.

## Implementado

Emblemas locais de Game-icons.net com créditos CC BY 3.0, preview de avatar e nome, grade adaptativa, radio nativo com foco e check, upload em português com preview/remoção/validação imediata, email estático e dados agrupados. Foto e avatar usam o mesmo fluxo existente de persistência; IDs preservados. Teste executável em tests/profile-photo.test.ts.

A e B inspecionaram abas independentes de login/cadastro; perfil original via screenshot e código. Detector original: 2 avisos gray-on-color, prováveis falsos positivos em texto escuro sobre amarelo claro. Detector final: 1 aviso no CTA, mesmo caso. Desktop e mobile 390px conferidos no cadastro; nome e seleção por teclado exercitados. Edição autenticada e upload/salvamento reais não exercitados por falta de sessão autenticada no navegador de teste.

Questions skipped: usuário já solicitou aplicação das melhorias de avatar, layout e experiência; não há decisão bloqueante para esse escopo.

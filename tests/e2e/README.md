# E2E do mapa (PET-101)

Estes testes sobem o Next.js neste repositório e abrem `/map` no Chromium. Eles não usam o preview da Vercel. A escrita de fixture só é aceita em `127.0.0.1` ou `localhost`, e somente no banco `atrias_wiki_e2e`. Qualquer outro host ou banco encerra o processo.

O deep link `/map?place=abrigo-de-solaria` precisa de uma linha local porque `import-output/entities.json` não traz esse lugar. A fixture grava apenas o slug e o nome já definidos em `src/lib/mapLocations.ts`. Isso não reproduz o artigo do lugar nem o banco de produção. A imagem assertada é `public/world-map.jpg`.

## Dependências

- Node.js 22+
- npm
- PostgreSQL local, escutando em `127.0.0.1:5432`
- Chromium instalado pelo Playwright

O `docker compose` deste repositório cria o banco de desenvolvimento `atrias_wiki`. Esse banco não é o alvo destes testes. Não aponte `DATABASE_URL` de produção, nem de preview, para esta suíte: o valor é ignorado na subida do servidor do e2e, e uma `MAP_E2E_DATABASE_URL` que não seja o banco efêmero local é recusada.

Na raiz do repositório:

```bash
npm ci
npx playwright install chromium
```

Se o Chromium reclamar de bibliotecas do sistema:

```bash
sudo npx playwright install-deps chromium
```

## Postgres efêmero

Escolha uma senha nova, só desta role local. Use letras e números, para o shell não reinterpretar o valor. Não reutilize senha de produção, de CI ou de um `DATABASE_URL` já existente.

```bash
export MAP_E2E_DB_PASSWORD='<senha-local>'
export MAP_E2E_PORT=3100
```

Substitua `<senha-local>` antes de exportar. Se o PostgreSQL local ainda não aceita conexão, suba só o cluster da sua máquina. No pacote Debian/Ubuntu:

```bash
sudo pg_ctlcluster 16 main start
```

Se outro PostgreSQL local já estiver no ar para o restante do wiki, deixe-o rodando e crie apenas a role e o banco abaixo.

```bash
sudo -u postgres psql -v ON_ERROR_STOP=1 <<SQL
DROP DATABASE IF EXISTS atrias_wiki_e2e;
DROP ROLE IF EXISTS atrias_e2e;
CREATE ROLE atrias_e2e LOGIN PASSWORD '${MAP_E2E_DB_PASSWORD}';
CREATE DATABASE atrias_wiki_e2e OWNER atrias_e2e;
SQL
sudo -u postgres psql -d atrias_wiki_e2e -v ON_ERROR_STOP=1 -c 'GRANT ALL ON SCHEMA public TO atrias_e2e;'
```

`DROP DATABASE` falha se ainda houver uma sessão do e2e aberta. Encerre antes o processo da `MAP_E2E_PORT`, como na seção de limpeza.

A URL equivalente, se quiser fixá-la você mesmo:

```bash
export MAP_E2E_DATABASE_URL="postgres://atrias_e2e:${MAP_E2E_DB_PASSWORD}@127.0.0.1:5432/atrias_wiki_e2e"
```

Sem uma dessas duas variáveis, o servidor de teste não arranca.

## Executar

A configuração do Playwright sobe `tests/e2e/web-server.ts`, que prepara a fixture e inicia `next dev` na `MAP_E2E_PORT`. `reuseExistingServer` fica desligado: se `http://127.0.0.1:${MAP_E2E_PORT}/map` já responder, ou se a porta estiver ocupada, a rodada falha. Ela não entra num Next já aberto.

```bash
export MAP_E2E_DB_PASSWORD='<senha-local>'
export MAP_E2E_PORT=3100
npm run test:e2e:map
```

O script já passa `--retries=0`. Há projetos `desktop` e `mobile`.

Checagens de código que não abrem o browser nem o banco:

```bash
npx tsx tests/map-canvas.test.ts
npm run test:places
```

## Limpar

Isto remove só a role, o banco e o processo deste e2e. Não derruba outros bancos, não apaga `atrias_wiki` e não encerra o PostgreSQL se ele também atende o resto da máquina.

```bash
port="${MAP_E2E_PORT:-3100}"
if command -v fuser >/dev/null 2>&1; then
  fuser -k "${port}/tcp" || true
fi
sudo -u postgres psql -v ON_ERROR_STOP=1 <<'SQL'
DROP DATABASE IF EXISTS atrias_wiki_e2e;
DROP ROLE IF EXISTS atrias_e2e;
SQL
```

`fuser -k` mata o que estiver escutando nessa porta. Use a mesma `MAP_E2E_PORT` com que o teste subiu, para não encerrar outro serviço.

Se o cluster PostgreSQL foi iniciado somente para esta suíte e nada mais depende dele:

```bash
sudo pg_ctlcluster 16 main stop
```

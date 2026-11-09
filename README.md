# Llama eterna

Área de membros do **Llama eterna**: módulos, aulas, feed, comunidade e perfil.

As aulas continuam nas páginas originais e abrem dentro do app. Qualquer e-mail válido entra, e todo mundo vê o mesmo conteúdo. O e-mail só identifica o perfil de quem já está autenticado; não libera a conta de outra pessoa.

## Como entrar

1. Abra o app.
2. Digite qualquer e-mail válido.
3. Os módulos, o feed e a comunidade abrem em seguida.

No app publicado, quem entra é a pessoa autenticada no Cursor. Neste computador, o servidor simula um visitante de teste (`dev@example.com`) para as telas funcionarem sem essa autenticação.

## Rodar localmente

```bash
npm install
npm run dev
```

O servidor sobe em [http://localhost:4179](http://localhost:4179).

Sem `DATABASE_URL`, os perfis, posts e comentários ficam num Postgres local em `.data/`. Com `DATABASE_URL`, o app usa esse banco e aplica `migrations/` no build.

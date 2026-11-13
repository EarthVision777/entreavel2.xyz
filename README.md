# Llama eterna

Área de membros do **Llama eterna**: módulos, aulas, feed, comunidade e perfil.

As aulas continuam nas páginas originais e abrem dentro do app. A área abre direto nos módulos, sem tela de entrada.

## Como entrar

1. Abra o app.
2. Os módulos aparecem na hora, sem tela de entrada.

No app publicado, quem entra é a pessoa autenticada no Cursor. Neste computador, o servidor simula um visitante de teste (`dev@example.com`) para as telas funcionarem sem essa autenticação.

## Rodar localmente

```bash
npm install
npm run dev
```

O servidor sobe em [http://localhost:4179](http://localhost:4179).

Sem `DATABASE_URL`, os perfis, posts e comentários ficam num Postgres local em `.data/`. Com `DATABASE_URL`, o app usa esse banco e aplica `migrations/` no build.

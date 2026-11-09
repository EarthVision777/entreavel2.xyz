# Llama eterna

Área de membros do **Llama eterna** (Reconquista Seu Amor): login por e-mail, módulos, aulas, feed de atualizações, comunidade e perfil.

Esta cópia usa o catálogo e as capas originais. As aulas continuam nas páginas em que já estavam publicadas e abrem dentro do app.

## Como entrar

1. Abra o app.
2. Use o e-mail de acesso `desert.quest147@gmail.com` para ver todos os módulos.
3. Qualquer outro e-mail válido cria um perfil de aluna. Os módulos pagos (ritual pessoal e carta canalizada) ficam bloqueados e levam ao checkout.

## Rodar localmente

```bash
npm install
npm run dev
```

O servidor sobe em [http://localhost:4179](http://localhost:4179).

Sem `DATABASE_URL`, os perfis, posts e comentários ficam num Postgres local em `.data/`. Com `DATABASE_URL`, o app usa esse banco e aplica `migrations/` no build.

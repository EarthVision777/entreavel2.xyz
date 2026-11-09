create table users (
  id text primary key,
  name text,
  email text not null unique,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now()
);

create table sessions (
  token text primary key,
  user_id text not null references users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table posts (
  id text primary key,
  user_id text not null references users (id) on delete cascade,
  content text not null,
  image_url text,
  created_at timestamptz not null default now()
);

create table comments (
  id text primary key,
  post_id text not null references posts (id) on delete cascade,
  user_id text not null references users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table likes (
  post_id text not null references posts (id) on delete cascade,
  user_id text not null references users (id) on delete cascade,
  primary key (post_id, user_id)
);

create table feed_posts (
  id text primary key,
  content text not null,
  image_url text,
  created_at timestamptz not null default now()
);

create index posts_created_at_idx on posts (created_at desc);
create index comments_post_idx on comments (post_id, created_at desc);

insert into feed_posts (id, content, created_at) values
(
  'feed-bienvenida',
  'Tu área ya está abierta. Empieza por Presentación y sigue el orden: preparación, ritual, activación y señales.',
  now() - interval '6 days'
),
(
  'feed-bonus',
  'Los bonus de baños magnéticos y de protección están en Inicio. La carta canalizada y el ritual personal se piden desde sus accesos.',
  now() - interval '1 day'
);

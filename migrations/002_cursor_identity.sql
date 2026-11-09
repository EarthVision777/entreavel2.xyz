alter table users add column cursor_sub text;
create unique index users_cursor_sub_key on users (cursor_sub);

update users
set role = 'member',
    name = 'Perfil de teste',
    email = 'unused-seed@example.com'
where id = '6e38918c-3683-499d-b7e7-a608f2240e24';

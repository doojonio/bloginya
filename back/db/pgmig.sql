-- 1 up
create extension if not exists "uuid-ossp";

create table
    users (
        id uuid primary key default uuid_generate_v4 (),
        email text unique not null,
        username text unique not null,
        google_id text unique,
        google_token jsonb,
        google_userinfo jsonb,
        created_at timestamp not null default now ()
    );

create table
    users_sessions (
        id uuid primary key default uuid_generate_v4 (),
        user_id uuid not null references users (id),
        ip inet not null,
        app text,
        created_at timestamp not null default now (),
        used_at timestamp not null default now ()
    );

create table
    collections (
        id uuid primary key default uuid_generate_v4 (),
        user_id uuid not null references users (id),
        parent_id uuid references collections (id),
        title text,
        description text,
        img_src text,
        created_at timestamp not null default now ()
    );

create type blog_status as enum ('draft', 'pub', 'del');

create table
    blogs (
        id uuid primary key default uuid_generate_v4 (),
        user_id uuid not null references users (id),
        document jsonb not null,
        status blog_status not null default 'draft',
        title text not null,
        img_src text,
        collection_id uuid references collections (id),
        created_at timestamp not null default now (),
        modified_at timestamp,
        published_at timestamp,
        deleted_at timestamp
    )
    -- 1 down
drop table blogs;

drop type blog_status;

drop table collections;

drop table users_sessions;

drop table users;

-- -- 2 up
-- select 1 from users;
-- -- 2 down
-- select 2 from users;
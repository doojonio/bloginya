-- 1 up
create extension if not exists "uuid-ossp";

create type user_role as enum ('owner', 'creator', 'visitor');

create table
    users (
        id uuid primary key default uuid_generate_v4 (),
        email text unique not null,
        username text unique not null,
        role user_role not null default 'visitor',
        google_id text unique,
        google_token jsonb,
        google_userinfo jsonb,
        created_at timestamp not null default now ()
    );

create table
    sessions (
        id uuid primary key default uuid_generate_v4 (),
        user_id uuid not null references users (id),
        ip inet not null,
        app text,
        created_at timestamp not null default now (),
        used_at timestamp not null default now ()
    );

create table
    categories (
        id uuid primary key default uuid_generate_v4 (),
        user_id uuid not null references users (id),
        parent_id uuid references categories (id),
        title text,
        short text unique,
        priority integer,
        description text,
        picture text,
        created_at timestamp not null default now ()
    );

create type post_status as enum ('draft', 'pub', 'del');

create table
    posts (
        id uuid primary key default uuid_generate_v4 (),
        user_id uuid not null references users (id),
        document jsonb not null,
        status post_status not null default 'draft',
        title text not null,
        picture text,
        category_id uuid references categories (id),
        priority integer,
        created_at timestamp not null default now (),
        modified_at timestamp,
        published_at timestamp,
        deleted_at timestamp
    )
    -- 1 down
drop table posts;

drop type post_status;

drop table categories;

drop table sessions;

drop table users;

drop type user_role;

-- -- 2 up
-- select 1 from users;
-- -- 2 down
-- select 2 from users;
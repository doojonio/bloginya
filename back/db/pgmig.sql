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
        description text,
        picture text,
        category_id uuid references categories (id),
        priority integer,
        created_at timestamp not null default now (),
        modified_at timestamp,
        published_at timestamp,
        deleted_at timestamp
    );

create table
    tags (
        id uuid primary key default uuid_generate_v4 (),
        name text unique not null
    );

create table
    post_tags (
        post_id uuid not null references posts (id),
        tag_id uuid not null references tags (id),
        primary key (post_id, tag_id)
    );

create index post_tags_post_id_idx on post_tags (post_id);

create index post_tags_tag_id_idx on post_tags (tag_id);

create table
    shortnames (
        name text primary key,
        post_id uuid references posts (id),
        category_id uuid references categories (id),
        CHECK (
            post_id IS NOT NULL
            OR category_id IS NOT NULL
        ),
        CHECK (
            post_id IS NULL
            OR category_id IS NULL
        )
    );

create unique index shortnames_post_id_idx on shortnames (post_id);

create index shortnames_category_id_idx on shortnames (category_id);

create table
    comments (
        id uuid primary key default uuid_generate_v4 (),
        user_id uuid not null references users (id),
        post_id uuid not null references posts (id),
        content text not null,
        created_at timestamp not null default now (),
        edited_at timestamp
    );

create index comments_post_id_idx on comments (post_id);

create table
    post_likes (
        post_id uuid not null references posts (id),
        user_id uuid not null references users (id),
        primary key (post_id, user_id)
    );

create index post_likes_post_id_idx on post_likes (post_id);

create table
    post_stats (
        post_id uuid primary key references posts (id),
        short_views integer not null default 0,
        medium_views integer not null default 0,
        long_views integer not null default 0
    );

create table
    uploads (
        id uuid primary key default uuid_generate_v4 (),
        user_id uuid not null references users (id),
        post_id uuid not null references posts (id),
        original_path text not null,
        original_type text not null,
        thumbnail_path text,
        medium_path text,
        large_path text,
        created_at timestamp not null default now ()
    );

create index uploads_post_id_idx on uploads (post_id);

-- 1 down
drop table post_stats;

drop table post_likes;

drop table comments;

drop table uploads;

drop table shortnames;

drop table post_tags;

drop table tags;

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
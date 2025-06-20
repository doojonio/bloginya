-- 1 up
create extension if not exists "uuid-ossp";

create domain cool_id as varchar(12);

create or replace function random_string() returns cool_id as $$
    select substr(md5(random()::text), 0, 13);
$$ language sql;

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
        id cool_id primary key default random_string (),
        user_id uuid not null references users (id),
        parent_id cool_id references categories (id),
        title text,
        priority integer,
        description text,
        created_at timestamp not null default now ()
    );

create table
    uploads (
        path text primary key,
        type text not null,
        user_id uuid not null references users (id),
        thumbnail_path text,
        medium_path text,
        large_path text,
        created_at timestamp not null default now ()
    );

create type post_status as enum ('draft', 'pub', 'del');

create table
    posts (
        id cool_id primary key default random_string(),
        user_id uuid not null references users (id),
        category_id cool_id references categories (id),
        title text not null,
        document jsonb not null,
        status post_status not null default 'draft',
        description text,
        priority integer,
        picture_wp text references uploads (path),
        picture_pre text references uploads (path),
        enable_likes boolean not null default true,
        enable_comments boolean not null default true,
        created_at timestamp not null default now (),
        modified_at timestamp,
        published_at timestamp,
        deleted_at timestamp
    );

create table
    post_drafts (
        post_id cool_id primary key references posts (id),
        title text not null,
        document jsonb not null,
        picture_wp text references uploads (path),
        picture_pre text references uploads (path)
    );

create table
    post_uploads (
        path text not null references uploads (path),
        post_id cool_id not null references posts (id),
        primary key (path, post_id)
    );

create index post_uploads_post_id_idx on post_uploads (post_id);

create table
    tags (
        id int generated by default as identity primary key,
        name text unique not null,
        check (length (name) > 1)
    );

create table
    post_tags (
        post_id cool_id not null references posts (id),
        tag_id int not null references tags (id),
        primary key (post_id, tag_id)
    );

create index post_tags_post_id_idx on post_tags (post_id);

create index post_tags_tag_id_idx on post_tags (tag_id);

create table
    shortnames (
        name text primary key,
        post_id cool_id references posts (id),
        category_id cool_id references categories (id),
        check (
            post_id is not null
            or category_id is not null
        ),
        check (
            post_id is null
            or category_id is null
        )
    );

create unique index shortnames_post_id_idx on shortnames (post_id);

create index shortnames_category_id_idx on shortnames (category_id);

create table
    comments (
        id cool_id primary key default random_string(),
        user_id uuid not null references users (id),
        post_id cool_id not null references posts (id),
        content text not null,
        created_at timestamp not null default now (),
        edited_at timestamp
    );

create index comments_post_id_idx on comments (post_id);

create table
    post_likes (
        post_id cool_id not null references posts (id),
        user_id uuid not null references users (id),
        primary key (post_id, user_id)
    );

create index post_likes_post_id_idx on post_likes (post_id);

create table
    post_stats (
        post_id cool_id primary key references posts (id),
        short_views integer not null default 0,
        medium_views integer not null default 0,
        long_views integer not null default 0
    );

-- 1 down
drop table post_stats;

drop table post_likes;

drop table comments;

drop table shortnames;

drop table post_tags;

drop table tags;

drop table post_uploads;

drop table post_drafts;

drop table posts;

drop table uploads;

drop type post_status;

drop table categories;

drop table sessions;

drop table users;

drop type user_role;

drop function random_string();

drop domain cool_id;


-- -- 2 up
-- select 1 from users;
-- -- 2 down
-- select 2 from users;
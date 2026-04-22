create table users (
    id         bigserial    primary key,
    first_name varchar(100) not null,
    last_name  varchar(100) not null,
    username   varchar(100) not null unique,
    email      varchar(255) not null unique,
    password   varchar(255) not null,
    role       varchar(20)  not null default 'ROLE_USER',
    created_at timestamp    not null
);

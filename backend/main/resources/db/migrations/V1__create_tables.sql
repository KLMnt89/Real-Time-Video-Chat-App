create table contact (
                         id          bigserial primary key,
                         first_name  varchar(100) not null,
                         last_name   varchar(100) not null,
                         email       varchar(255) not null unique,
                         phone       varchar(50),
                         status      varchar(20)  not null default 'OFFLINE',
                         created_at  timestamp    not null
);

create table room (
                      id            bigserial primary key,
                      name          varchar(255) not null,
                      mux_space_id  varchar(255),
                      invite_code   varchar(255) not null unique,
                      status        varchar(20)  not null default 'ACTIVE',
                      created_at    timestamp    not null,
                      ended_at      timestamp,
                      created_by    varchar(255) not null
);

create table room_participants (
                                   room_id    bigint not null references room(id) on delete cascade,
                                   contact_id bigint not null references contact(id) on delete cascade,
                                   primary key (room_id, contact_id)
);

create table meeting (
                         id           bigserial primary key,
                         title        varchar(255) not null,
                         description  text,
                         status       varchar(20)  not null default 'SCHEDULED',
                         scheduled_at timestamp,
                         started_at   timestamp,
                         ended_at     timestamp,
                         created_by   varchar(255) not null,
                         room_id      bigint references room(id) on delete set null
);

create table meeting_participants (
                                      meeting_id bigint not null references meeting(id) on delete cascade,
                                      contact_id bigint not null references contact(id) on delete cascade,
                                      primary key (meeting_id, contact_id)
);

create table meeting_note (
                              id         bigserial primary key,
                              content    text         not null,
                              written_by varchar(255) not null,
                              created_at timestamp    not null,
                              updated_at timestamp    not null,
                              meeting_id bigint       not null references meeting(id) on delete cascade
);
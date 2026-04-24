create table chat_message (
    id       bigserial primary key,
    room_id  bigint       not null references room(id) on delete cascade,
    sender   varchar(255) not null,
    content  text         not null,
    sent_at  timestamp    not null
);

create index idx_chat_message_room_id on chat_message(room_id);

create table room_note (
    id         bigserial primary key,
    room_id    bigint       not null unique references room(id) on delete cascade,
    content    text,
    updated_at timestamp    not null,
    updated_by varchar(255)
);

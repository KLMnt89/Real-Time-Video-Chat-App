insert into contact (first_name, last_name, email, phone, status, created_at) values
                                                                                  ('Марија',    'Костовска',  'm.kostovska@co.mk',  '+389 70 111 222', 'ONLINE',  now()),
                                                                                  ('Томислав',  'Стојков',    't.stojkov@co.mk',    '+389 70 333 444', 'BUSY',    now()),
                                                                                  ('Ана',       'Митревска',  'a.mitrevska@co.mk',  '+389 70 555 666', 'ONLINE',  now()),
                                                                                  ('Емил',      'Блажевски',  'e.blazevski@co.mk',  '+389 70 777 888', 'OFFLINE', now()),
                                                                                  ('Петар',     'Николов',    'p.nikolov@co.mk',    '+389 70 999 000', 'OFFLINE', now()),
                                                                                  ('Сара',      'Јовановска', 's.jovanovska@co.mk', '+389 71 100 200', 'ONLINE',  now());

insert into meeting (title, description, status, scheduled_at, started_at, ended_at, created_by) values
                                                                                                     ('Sprint планирање',
                                                                                                      'Планирање на Q2 sprint со тимот',
                                                                                                      'ACTIVE',
                                                                                                      now(),
                                                                                                      now(),
                                                                                                      null,
                                                                                                      'admin'),

                                                                                                     ('Design review',
                                                                                                      'Преглед на нов UI дизајн',
                                                                                                      'SCHEDULED',
                                                                                                      now() + interval '3 hours',
                                                                                                      null,
                                                                                                      null,
                                                                                                      'admin'),

                                                                                                     ('1:1 со Мартина',
                                                                                                      'Неделен 1:1 разговор',
                                                                                                      'ENDED',
                                                                                                      now() - interval '2 hours',
                                                                                                      now() - interval '2 hours',
                                                                                                      now() - interval '1 hour 15 minutes',
                                                                                                      'admin'),

                                                                                                     ('Client demo – Тетекс',
                                                                                                      'Демо на апликацијата за клиентот Тетекс',
                                                                                                      'SCHEDULED',
                                                                                                      now() + interval '5 hours',
                                                                                                      null,
                                                                                                      null,
                                                                                                      'admin'),

                                                                                                     ('Backend sync',
                                                                                                      'Технички состанок за API интеграција',
                                                                                                      'SCHEDULED',
                                                                                                      now() + interval '1 day',
                                                                                                      null,
                                                                                                      null,
                                                                                                      'admin'),

                                                                                                     ('Retro – Март',
                                                                                                      'Ретроспектива на изминатиот месец',
                                                                                                      'ENDED',
                                                                                                      now() - interval '2 days',
                                                                                                      now() - interval '2 days',
                                                                                                      now() - interval '2 days' + interval '1 hour',
                                                                                                      'admin');

insert into meeting_participants (meeting_id, contact_id) values
                                                              (1, 1), (1, 2), (1, 3),
                                                              (2, 1), (2, 3),
                                                              (3, 2),
                                                              (4, 1), (4, 2), (4, 3), (4, 4),
                                                              (5, 2), (5, 3), (5, 5),
                                                              (6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 6);

insert into meeting_note (content, written_by, created_at, updated_at, meeting_id) values
                                                                                       ('Договоривме 3 главни задачи: Auth модул, Dashboard UI и API интеграција со Mux.',
                                                                                        'admin', now(), now(), 1),

                                                                                       ('Рокот е 30 Април. Секој член го зема по еден таск.',
                                                                                        'admin', now(), now(), 1),

                                                                                       ('Марија го презентираше новиот дизајн. Одобрен со мали корекции на боите.',
                                                                                        'admin', now(), now(), 2),

                                                                                       ('Разговаравме за напредокот на проектот и следните чекори.',
                                                                                        'admin', now(), now(), 3),

                                                                                       ('Клиентот бара додатна функционалност за снимање на состаноци.',
                                                                                        'admin', now(), now(), 4),

                                                                                       ('Ретроспективата покажа дека треба подобрување на комуникацијата помеѓу тимовите.',
                                                                                        'admin', now(), now(), 6),

                                                                                       ('Следен спринт фокус: подобрување на перформансите и bug fixing.',
                                                                                        'admin', now(), now(), 6);
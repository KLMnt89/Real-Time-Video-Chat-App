# Huddle — Real-Time Video Chat App

A full-stack video conferencing application built with Spring Boot and React, powered by LiveKit for real-time WebRTC communication.

## Features

- **Instant meetings** — create a room in one click and share the invite link
- **Scheduled meetings** — plan meetings with participants from your contacts
- **Guest join** — anyone can join via invite link without an account (enter name as guest)
- **In-call experience**
  - Real-time video and audio (WebRTC via LiveKit)
  - Screen sharing
  - In-call chat (persisted to DB, synced live via DataChannel)
  - Collaborative notes (synced live to all participants, exportable as `.txt`)
  - Participant list with join times
  - Join/leave toasts
- **Contacts** — address book with Online / Busy / Offline status
- **Groups** — organize contacts into groups
- **Notes** — per-meeting notes and per-room notes
- **Dashboard** — live stats, mini calendar, upcoming meetings countdown, active rooms panel
- **Profile** — update name, username, email, password
- **Invite links** — expire after 24 hours; rooms auto-close after 120 minutes
- **Rate limiting** — max 10 rooms per user per hour
- **SSE** — dashboard stats update in real time without polling

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 4.0.5, Java 21 |
| Database | PostgreSQL 15 |
| Video | LiveKit Cloud (WebRTC) |
| Auth | Spring Security + JWT + Refresh Tokens |
| Frontend | React 18 + Vite |
| Reverse proxy | Nginx (Docker) |
| Migrations | Flyway (local) / PostgreSQL init scripts (Docker) |

## Project Structure

```
mux-video-rooms/
├── backend/
│   └── main/
│       ├── java/mk/ukim/finki/muxvideorooms/
│       │   ├── config/        # Security, JWT, CORS, password encoder
│       │   ├── model/         # Entities: User, Room, Meeting, Contact, ...
│       │   ├── model/enums/   # RoomStatus, MeetingStatus, ContactStatus, UserRole
│       │   ├── repository/    # JPA repositories
│       │   ├── service/       # Business logic + LiveKit integration
│       │   └── web/           # REST controllers + GlobalExceptionHandler
│       └── resources/
│           ├── db/migrations/ # Flyway SQL migrations (V1–V8)
│           └── application.properties
├── frontend/
│   └── src/
│       ├── api/               # Axios API client
│       ├── components/        # Sidebar, TopBar, ConfirmModal, PrivateRoute
│       ├── context/           # AuthContext
│       └── pages/             # All page components
├── docker-compose.yml
├── start.sh                   # Start (preserves data)
└── reset.sh                   # Full reset (wipes DB, re-runs migrations)
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- A [LiveKit Cloud](https://livekit.io) account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/mrkskq/Real-Time-Video-Chat-App.git
cd Real-Time-Video-Chat-App
```

### 2. Create the `.env` file

Create a `.env` file in the project root with the following variables:

```env
POSTGRES_DB=muxvideorooms
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

LIVEKIT_URL=wss://your-livekit-host.livekit.cloud
LIVEKIT_PUBLIC_URL=wss://your-livekit-host.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret

JWT_SECRET=your_base64_encoded_jwt_secret
```

### 3. Start the application

```bash
bash start.sh
```

This runs `docker compose up --build`. Data in the database is preserved between restarts.

Open **http://localhost** in your browser.

### Clean reset (wipes all data)

```bash
bash reset.sh
```

Use this when you add new migration files or need a completely fresh database.

## Default Admin Account

On first startup an admin user is created automatically:

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin123` |

## Ports

| Service | Port |
|---|---|
| Frontend (Nginx) | `80` → http://localhost |
| Spring Boot API | `8080` |
| PostgreSQL | `5432` |
| Frontend dev server (Vite) | `5173` (outside Docker only) |

## API Overview

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT + refresh token |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Invalidate refresh token |

### Rooms
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/rooms` | List all rooms |
| GET | `/api/rooms/active` | List active rooms |
| POST | `/api/rooms` | Create a new room |
| POST | `/api/rooms/join/:code` | Join via invite code (public) |
| POST | `/api/rooms/:id/end` | End a room |
| DELETE | `/api/rooms/:id` | Delete a room |
| GET | `/api/rooms/:id/participant-log` | Get participant log |

### Meetings
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/meetings` | List all meetings |
| POST | `/api/meetings` | Schedule a meeting |
| POST | `/api/meetings/:id/start` | Start a meeting (creates LiveKit room) |
| POST | `/api/meetings/:id/end` | End a meeting |
| POST | `/api/meetings/:id/cancel` | Cancel a meeting |

### Other
- `GET /api/contacts` — contacts CRUD
- `GET /api/groups` — groups CRUD
- `GET /api/meetings/:id/notes` — meeting notes CRUD
- `GET /api/rooms/:id/note` — room note (get/save)
- `GET /api/rooms/:id/chat` — chat messages
- `GET /api/sse/subscribe` — SSE stream for real-time dashboard updates

## How Invite Links Work

1. User clicks **Meeting now** → room is created → invite link is generated (`/join/:code`)
2. Link is valid for **24 hours**
3. Logged-in users join automatically using their account name
4. Guests can join without an account by entering their first and last name
5. After 24 hours the backend returns `410 Gone` and the frontend shows an "Link expired" screen
6. Rooms auto-close after **120 minutes** (configurable via `room.auto-close.minutes`)

## Database Migrations

Migrations live in `backend/main/resources/db/migrations/` and run in order:

| File | Description |
|---|---|
| V1 | Core tables (rooms, meetings, contacts, users) |
| V2 | Seed data |
| V3 | LiveKit field rename |
| V4 | Users table updates |
| V5 | Refresh tokens |
| V6 | Chat messages + room notes |
| V7 | lastSeenAt, expiresAt, participant log |
| V8 | Groups |

Flyway is **enabled** for local development and **disabled** in Docker (PostgreSQL runs the SQL files directly on first start via `/docker-entrypoint-initdb.d`).

## Environment Notes

- JWT is stateless; tokens are stored in `localStorage` on the client
- `JwtAuthFilter` updates `User.lastSeenAt` on every request (throttled to 1 DB write per 60s per user)
- Rate limiting uses the display name as key — tracked in memory per JVM instance
- `createdBy` on Room and Meeting is a display name string, not a foreign key to users

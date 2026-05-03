-- Add lastSeenAt to users for presence tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP;

-- Add expiresAt to room for invite link expiry (24h)
ALTER TABLE room ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- Back-fill existing rooms: set expires_at = created_at + 24h
UPDATE room SET expires_at = created_at + INTERVAL '24 hours' WHERE expires_at IS NULL;

-- Participant join/leave log
CREATE TABLE IF NOT EXISTS room_participant_log (
    id               BIGSERIAL PRIMARY KEY,
    room_id          BIGINT       NOT NULL REFERENCES room(id) ON DELETE CASCADE,
    participant_name VARCHAR(255) NOT NULL,
    joined_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    left_at          TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_participant_log_room_id ON room_participant_log(room_id);

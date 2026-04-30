CREATE TYPE space_type AS ENUM ('office', 'gym', 'library', 'other');
CREATE TYPE membership_role AS ENUM ('member', 'manager');

CREATE TABLE spaces (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  type        space_type  NOT NULL,
  address     TEXT,
  invite_code TEXT        UNIQUE NOT NULL,
  created_by  UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE space_memberships (
  id        UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id  UUID            NOT NULL REFERENCES spaces (id) ON DELETE CASCADE,
  user_id   UUID            NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role      membership_role NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  UNIQUE (space_id, user_id)
);

CREATE INDEX space_memberships_user_idx  ON space_memberships (user_id);
CREATE INDEX space_memberships_space_idx ON space_memberships (space_id);

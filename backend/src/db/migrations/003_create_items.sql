CREATE TYPE item_type   AS ENUM ('lost', 'found');
CREATE TYPE item_status AS ENUM ('open', 'claimed', 'resolved', 'expired');

CREATE TABLE items (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id       UUID        NOT NULL REFERENCES spaces (id) ON DELETE CASCADE,
  reported_by    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  type           item_type   NOT NULL,
  status         item_status NOT NULL DEFAULT 'open',
  title          TEXT        NOT NULL,
  description    TEXT,
  category       TEXT        NOT NULL,
  location_label TEXT,
  date_reported  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_occurred  DATE,
  expires_at     TIMESTAMPTZ,
  search_vector  TSVECTOR GENERATED ALWAYS AS (
    to_tsvector('english',
      coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(category, '')
    )
  ) STORED
);

CREATE INDEX items_space_status_date_idx ON items (space_id, status, date_reported DESC);
CREATE INDEX items_search_vector_idx     ON items USING GIN (search_vector);
CREATE INDEX items_reported_by_idx       ON items (reported_by);

CREATE TABLE item_photos (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id       UUID        NOT NULL REFERENCES items (id) ON DELETE CASCADE,
  url           TEXT        NOT NULL,
  thumbnail_url TEXT,
  display_order INT         NOT NULL DEFAULT 0,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX item_photos_item_idx ON item_photos (item_id);

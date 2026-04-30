CREATE TYPE claim_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE claims (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     UUID         NOT NULL REFERENCES items (id) ON DELETE CASCADE,
  claimant_id UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  message     TEXT         NOT NULL,
  status      claim_status NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  UNIQUE (item_id, claimant_id)
);

CREATE INDEX claims_item_idx     ON claims (item_id);
CREATE INDEX claims_claimant_idx ON claims (claimant_id);

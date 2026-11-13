CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  id TEXT NOT NULL UNIQUE,
  expires INTEGER NOT NULL,
  requests INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX sessions_expiry ON sessions(expires);
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  owner TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  name TEXT NOT NULL COLLATE NOCASE,
  rating TEXT NOT NULL CHECK(rating IN ('ADULTS','KIDS')),
  UNIQUE(owner,name)
);
CREATE TABLE favorites (
  profile TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  game TEXT NOT NULL,
  PRIMARY KEY(profile,game)
);
CREATE TABLE catalog (id INTEGER PRIMARY KEY CHECK(id=1), payload TEXT NOT NULL, refreshed INTEGER NOT NULL);
CREATE TABLE budget (day INTEGER PRIMARY KEY, used INTEGER NOT NULL);

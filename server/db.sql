CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL, 
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

SELECT * FROM issues JOIN users ON issues.user_id=users.id

CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  floor TEXT NOT NULL,
  room TEXT NOT NULL,
  device TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE users ADD CONSTRAINT unique_username UNIQUE(username);
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE(email);
create table contact(
  id serial primary key,
  name text not null,
  email text not null unique,
	message text not null 
)

drop table issues
drop table users
ALTER TABLE issues ADD COLUMN remark TEXT;

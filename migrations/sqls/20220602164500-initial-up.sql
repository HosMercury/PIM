create table users
(
  id int primary key not null auto_increment,
  firstname varchar(50) not null,
  lastname varchar(50) not null,
  username varchar(50) not null unique,
  password varchar(100) not null,
  created_at timestamp default current_timestamp
);

CREATE TABLE session(
  sid                     VARCHAR(100) PRIMARY KEY NOT NULL,   
  session                 VARCHAR(2048) DEFAULT '{}',   
  lastSeen                DATETIME DEFAULT NOW() 
);

create table locals
(
  id int primary key not null auto_increment,
  name varchar(50) not null,
  abbreviation varchar(10) not null,
  direction enum('left','right') default 'left',
  created_at timestamp default current_timestamp
);

CREATE TABLE attributes (
	id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
	name varchar(50) NOT NULL,
	required boolean NOT NULL DEFAULT FALSE,
	validation varchar(50),
	created_at timestamp DEFAULT CURRENT_TIMESTAMP
);
create table users (
	id int primary key not null auto_increment,
	firstname varchar(50) not null,
	lastname varchar(50) not null,
	username varchar(50) not null unique,
	password varchar(100) not null,
	created_at datetime default now()
);

create table session (
	sid varchar(100) primary key not null,
	session varchar(2048) default '{}',
	lastSeen datetime default now()
);

create table locals (
	id int primary key not null auto_increment,
	language varchar(50) not null,
	abbreviation varchar(10) not null,
	direction enum ('left','right') default 'left',
	created_at datetime default now()
);

create table attributes (
	id int primary key not null auto_increment,
	type varchar(50) not null,
	required boolean not null default false,
	min varchar(50),
  max varchar(50),
  unit varchar(50),
	created_at datetime default now()
);

create table attr_options (
	id int primary key not null auto_increment,
  attribute_id int not null references attributes(id) on delete cascade,
	value varchar(50) not null,
	created_at datetime default now()
);

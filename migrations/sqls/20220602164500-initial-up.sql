create table users (
	id int unsigned  primary key not null auto_increment,
	firstname varchar(50) not null,
	lastname varchar(50) not null,
	username varchar(50) not null unique,
	password varchar(100) not null,
	created_at datetime default now(),
	updated_at datetime default now()
);

create table session (
	sid varchar(100) primary key not null,
	session varchar(2048) default '{}',
	lastSeen datetime default now()
);

create table locals (
	id int unsigned  primary key not null auto_increment,
	language varchar(50) not null,
	abbreviation varchar(10) not null unique,
	direction enum ('ltr','rtl') default 'ltr',
	created_at datetime default now(),
	updated_at datetime default now()
);

create table categories (
	id int unsigned  primary key not null auto_increment,
	name varchar(255) not null,
	description varchar(255),
	parent int unsigned ,
	created_at datetime default now(),
	updated_at datetime default now()
);

create table attributes (
	id int unsigned  primary key not null auto_increment,
	type varchar(255) not null,
	name varchar(255) not null,
	en_label varchar(255) not null,
	description varchar(255),
	required boolean not null default false,
	default_value varchar(255),
	min int unsigned ,
  max int unsigned ,
  unit varchar(255),
	created_at datetime default now(),
	updated_at datetime default now()
);

create table attr_options (
	id int unsigned  primary key not null auto_increment,
  attribute_id int unsigned  not null references attributes(id) on delete cascade,
	value varchar(50) not null,
	created_at datetime default now(),
	updated_at datetime default now()
);

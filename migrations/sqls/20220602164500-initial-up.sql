SET GLOBAL time_zone = 'Africa/Cairo';


create table users (
	id int unsigned primary key not null auto_increment,
	firstname varchar(50) not null,
	lastname varchar(50) not null,
	username varchar(50) not null unique,
	password varchar(100) not null,
	created_at timestamp default now(),
	updated_at timestamp default now()
);

create table session (
	sid varchar(100) primary key not null,
	session varchar(2048) default '{}',
	lastSeen timestamp default now()
);

-- locals that set from settings
create table locals (
	id int unsigned primary key not null auto_increment,
	name varchar(50) not null,
	abbreviation varchar(10) not null unique,
	direction enum ('ltr','rtl') default 'ltr',
	created_at timestamp default now(),
	updated_at timestamp default now()
);

create table slugs (
	id int unsigned primary key not null auto_increment,
	name varchar(255) not null,
	description varchar(255),
	created_at timestamp default now(),
	updated_at timestamp default now()
);

create table categories (
	id int unsigned primary key not null auto_increment,
	name varchar(255) not null,
	description varchar(255),
	parent int unsigned ,
	created_at timestamp default now(),
	updated_at timestamp default now()
);

create table groups (
	id int unsigned primary key not null auto_increment,
	name varchar(255) not null unique, -- unique checked in router
	description varchar(255),
	created_at timestamp default now(),
	updated_at timestamp default now()
);

create table attributes (
	id int unsigned primary key not null auto_increment,
	type varchar(255) not null,
	name varchar(255) not null,
	description varchar(255),
	required boolean not null default 0,
	default_value text,
	min int unsigned,
  max int unsigned,
  unit varchar(255),
	created_at timestamp default now(),
	updated_at timestamp default now()
);

create table attribute_choice (
	id int unsigned primary key not null auto_increment,
	choice varchar(255) not null,
  attribute_id int unsigned  not null references attributes(id) on delete cascade,
	created_at timestamp default now(),
	updated_at timestamp default now()
);

create table attribute_local (
	id int unsigned primary key not null auto_increment,
	local varchar(255) not null,
  attribute_id int unsigned  not null references attributes(id) on delete cascade,
  local_id int unsigned  not null references locals(id) on delete cascade,
	created_at timestamp default now(),
	updated_at timestamp default now()
);

create table attribute_group (
	id int unsigned primary key not null auto_increment,
  attribute_id int unsigned  not null references attributes(id) on delete cascade,
  group_id int unsigned  not null references groups(id) on delete cascade,
	created_at timestamp default now(),
	updated_at timestamp default now()
);



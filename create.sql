CREATE TABLE podcast_list(
	id int unique,
	itunes_link varchar(100) NOT NULL,
	podcast varchar(100),
	img varchar(100),
	category varchar(50),
	language varchar(50),
	rating varchar(50),
	reviews varchar(50),
	url varchar(100),
	api_data varchar(4096),
	PRIMARY KEY (id)  -- id must be unique
);

CREATE TABLE episode(
	podcast_id int NOT NULL,
	podcast varchar(50),
	episode varchar(50),
	release_date varchar(20), #DATE NOT NULL FORMAT 'MM/DD/YY' DEFAULT DATE '01/01/2001',
	info varchar(200),
	FOREIGN KEY (podcast_id) REFERENCES podcast_list(id)
);

CREATE TABLE user(
	uid smallint unsigned not null auto_increment,
	fname varchar(50),
	lname varchar(50),
	email varchar(50),
	created_at int(11) DEFAULT NULL,
  	updated_at int(11) DEFAULT NULL,
	PRIMARY KEY (uid)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE user_collection(
	uid smallint unsigned NOT NULL,
	pid int NOT NULL,
	FOREIGN KEY (uid) REFERENCES user(uid),
	FOREIGN KEY (pid) REFERENCES podcast_list(id)
);
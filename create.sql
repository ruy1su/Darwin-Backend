CREATE TABLE podcast(
	id int unique,
	itunes_link varchar(100) NOT NULL,
	podcast varchar(50),
	img varchar(100),
	category varchar(50),
	language varchar(50),
	rating varchar(50),
	reviews varchar(50),
	url varchar(100),
	api_data TEXT NOT NULL,
	PRIMARY KEY (id)  -- id must be unique
)

CREATE TABLE episode(
       id int unique NOT NULL,
       podcast_id int NOT NULL,
       podcast varchar(50),
       episode varchar(50),
       release_date varchar(20), #DATE NOT NULL FORMAT 'MM/DD/YY' DEFAULT DATE '01/01/2001',
       info varchar(200),
       PRIMARY KEY (id),
       FOREIGN KEY (podcast_id) REFERENCES podcast(id)
);

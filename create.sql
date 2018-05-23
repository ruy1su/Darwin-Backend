CREATE TABLE podcast_test(
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
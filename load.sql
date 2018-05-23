load data local infile 'test-itunes-podcast-details.csv' into table podcast_test fields terminated by ','
enclosed by '"'
lines terminated by '\n'
IGNORE 1 LINES
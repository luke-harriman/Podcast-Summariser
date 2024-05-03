CREATE TABLE newsletters (
    release_date DATE,
    start_time INT,
    end_time INT,
    word_position_start INT,
    word_position_end INT,
    uploader VARCHAR,
    uploader_id VARCHAR,
    channel_id VARCHAR,
    video_id VARCHAR,
    video_title TEXT,
    video_description_summary TEXT,
    chapter TEXT,
    text_data TEXT,
    images BYTEA[]
);

DROP TABLE IF EXISTS newsletters;


DELETE FROM newsletters;
-- ALTER TABLE newsletters ADD COLUMN word_pos_end integer;

SELECT SUM(word_count) AS total_word_count
FROM (
    SELECT COUNT(*) AS word_count
    FROM newsletters, regexp_split_to_table(newsletters.text_data, '\s+') AS words
) AS subquery;

SELECT * FROM newsletters;
SELECT * FROM newsletters WHERE array_length(images, 1) IS NOT NULL;




CREATE TABLE users (
	full_name varchar, 
	email varchar, 
	password varchar
);

DROP TABLE IF EXISTS users;
DELETE FROM users;

INSERT INTO users VALUES (1, 'luke', 'luke.m.h.002@gmail.com', 'harriman-password');

SELECT * FROM users;




CREATE TABLE creator_lists (
	email varchar, 
	creator_link varchar,
	creator_name varchar
);
INSERT INTO creator_lists VALUES ('luke@gmail.com', 'https://www.youtube.com/@joerogan', 'joerogan');
DROP TABLE IF EXISTS creator_lists;

SELECT * FROM creator_lists;


CREATE TABLE agent_configurations (
	email varchar, 
	key_words varchar[],
	multi_media boolean
);
INSERT INTO agent_configurations VALUES ('luke.m.h.002@gmail.com', ARRAY['AI', 'Finance', 'Start-Ups'], True);
SELECT * FROM agent_configurations;


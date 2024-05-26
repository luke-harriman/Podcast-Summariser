-- ============================================
-- Extensions
-- ============================================

-- Create uuid-ossp extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: Newsletters
-- ============================================

-- Create newsletters table
CREATE TABLE newsletters (
    insert_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, 
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
    images BYTEA[],
    is_dato BOOLEAN NOT NULL DEFAULT False
);

-- Drop newsletters table if exists
DROP TABLE IF EXISTS newsletters;

-- Delete entries from newsletters where uploader is 'JRE Daily Clips'
DELETE FROM newsletters WHERE chapter = '';

-- Select distinct uploader_id from newsletters
SELECT DISTINCT uploader_id FROM newsletters;

-- Calculate the total word count
SELECT SUM(word_count) AS total_word_count
FROM (
    SELECT COUNT(*) AS word_count
    FROM newsletters, regexp_split_to_table(newsletters.text_data, '\s+') AS words
) AS subquery;

-- Select all columns from newsletters
SELECT * FROM newsletters;

-- Alter column in_dato to have a default value of False
ALTER TABLE newsletters ALTER COLUMN in_dato SET DEFAULT False;

-- Update all rows in newsletters to set in_dato to False
UPDATE newsletters SET in_dato = False;

-- Select all rows from newsletters where images array is not null
SELECT * FROM newsletters WHERE array_length(images, 1) IS NOT NULL;

-- ============================================
-- Table: Users
-- ============================================

-- Create users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR, 
    email VARCHAR, 
    password VARCHAR
);

-- Drop users table if exists
DROP TABLE IF EXISTS users;

-- Delete all entries from users
DELETE FROM users;

-- Insert a sample user into users table
INSERT INTO users (full_name, email, password) VALUES ('luke', 'luke.m.h.002@gmail.com', 'harriman-password');

-- Select all columns from users
SELECT * FROM users;

-- ============================================
-- Table: Subscriptions
-- ============================================

-- Create subscriptions table
CREATE TABLE subscriptions (
    user_id INT NOT NULL,
    email VARCHAR(255), 
    amount_total INT, 
    currency VARCHAR(10),
    stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY,
    status VARCHAR(50) NOT NULL,
    payment_link VARCHAR(255), 
    invoice_id VARCHAR(255), 
    customer_id VARCHAR(255),
    period_end INT, 
    period_start INT, 
    created_at INT
);

-- Drop subscriptions table if exists
DROP TABLE IF EXISTS subscriptions;

-- Delete specific entries from subscriptions
DELETE FROM subscriptions WHERE user_id IN (0, 1);

-- Select all columns from subscriptions
SELECT * FROM subscriptions;

-- Add a unique constraint on user_id and stripe_subscription_id
ALTER TABLE subscriptions ADD CONSTRAINT unique_user_or_subscription UNIQUE (user_id, stripe_subscription_id);

-- Drop the unique constraint for handling conflicts in next.js
ALTER TABLE subscriptions DROP CONSTRAINT unique_user_or_subscription;

-- Insert a sample subscription into subscriptions table
INSERT INTO subscriptions (user_id, email, stripe_subscription_id, status, period_end)
VALUES (1, 'luke.m.h.002@gmail.com', 'sub_abc', 'success', 1703980800); -- Note: Use UNIX timestamp for period_end

-- ============================================
-- Timestamp Column Information
-- ============================================

-- Using int type for unix timestamp columns
-- Explanation of the range of int types for unix timestamp columns:
-- Name      Size     Minimum               Maximum
-- smallint  2 bytes  -32768                +32767
-- integer   4 bytes  -2147483648           +2147483647
-- bigint    8 bytes  -9223372036854775808  +9223372036854775807

-- Name      Size     Minimum Date      Maximum Date
-- smallint  2 bytes  1969-12-31        1970-01-01
-- integer   4 bytes  1901-12-13        2038-01-18
-- bigint    8 bytes  -292275055-05-16  292278994-08-17

-- ============================================
-- Table: User Configurations
-- ============================================

-- Create user_configurations table if not exists
CREATE TABLE IF NOT EXISTS user_configurations (
    email VARCHAR COLLATE pg_catalog."default" NOT NULL,
    creator_link VARCHAR[] COLLATE pg_catalog."default",
    creator_name VARCHAR[] COLLATE pg_catalog."default",
    key_words VARCHAR[] COLLATE pg_catalog."default",
    multi_media BOOLEAN,
    CONSTRAINT user_configurations_pkey PRIMARY KEY (email)
);

-- Select all columns from user_configurations
SELECT * FROM user_configurations;
DELETE FROM user_configurations WHERE email = 'luke.m.h.002@gmail.com';
ALTER TABLE user_configurations
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
-- ============================================
-- Table: Weekly User Configuration Snapshot
-- ============================================

-- Drop weekly_user_configuration_snapshot table if exists
DROP TABLE IF EXISTS weekly_user_configuration_snapshot;

-- Create weekly_user_configuration_snapshot table
CREATE TABLE weekly_user_configuration_snapshot (
    snapshot_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,        -- Column for the timestamp with timezone
	start_at TIMESTAMPTZ DEFAULT date_trunc('day', CURRENT_TIMESTAMP - EXTRACT(DOW FROM CURRENT_TIMESTAMP) * INTERVAL '1 day'), 
	user_id int, 
	full_name varchar,
    email TEXT,                       -- Column for storing email addresses
    creator_link TEXT[],              -- Column for storing an array of URLs
    creator_name TEXT[],              -- Column for storing an array of creator names
    key_words TEXT[],                 -- Column for storing an array of keywords
    multi_media BOOLEAN               -- Column for storing an array of keywords
);

DROP TABLE weekly_user_configuration_snapshot;
SELECT * FROM weekly_user_configuration_snapshot;

DELETE FROM weekly_user_configuration_snapshot WHERE email = 'luke.m.h.002@gmail.com'
UPDATE weekly_user_configuration_snapshot SET snapshot_time = '2024-05-10 21:52:29.557094+10' WHERE user_id = 1;


-- Cron Job
INSERT INTO weekly_user_configuration_snapshot (user_id, full_name, email, creator_link, creator_name, key_words, multi_media)
SELECT u.user_id as user_id 
	, u.full_name as full_name
	, uc.email as email
	, uc.creator_link as creator_link
	, uc.creator_name as creator_name 
	, uc.key_words as keywords
	, uc.multi_media as multi_media
FROM user_configurations uc
JOIN users u
	ON uc.email = u.email;



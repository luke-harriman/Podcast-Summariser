
import psycopg2
from config import config
import json 
import logging

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def insert_data(dictionary):
    """Insert data into the newsletters table."""
    sql = """INSERT INTO newsletters(release_date, start_time, end_time, word_position_start, word_position_end, uploader, uploader_id, channel_id, video_id, video_title, video_description_summary, chapter, text_data, images)
             VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"""

    try:
        # Read database configuration
        params = config()
        logging.debug("Database connection parameters: %s", params)
        logging.debug("Attempting to connect to the database.")
        with psycopg2.connect(**params) as conn:
            logging.debug("Database connection successful.")
            with conn.cursor() as cur:
                logging.debug("Cursor obtained.")
                # Execute insert query
                cur.execute(sql, (
                    dictionary['release_date'], 
                    dictionary['start_time'], 
                    dictionary['end_time'], 
                    dictionary['word_position_start'], 
                    dictionary['word_position_end'], 
                    dictionary['uploader'], 
                    dictionary['uploader_id'], 
                    dictionary['channel_id'], 
                    dictionary['video_id'], 
                    dictionary['video_title'], 
                    dictionary['video_description_summary'], 
                    dictionary['chapter'], 
                    dictionary['text_data'], 
                    dictionary['images']
                ))
                # Commit the changes to the database
                conn.commit()
                logging.debug("Data inserted successfully.")
    except (Exception, psycopg2.DatabaseError) as error:
        print("Error while inserting data:", error)
        if conn:
            conn.rollback()
    finally:
        # Closing of the connection is handled by the context manager
        print("Database connection closed.")
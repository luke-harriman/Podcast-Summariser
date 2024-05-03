
import psycopg2
from config import config
import json 
import logging
import time

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def insert_data(dictionary):
    """Insert data into the newsletters table."""
    sql = """INSERT INTO newsletters(release_date, start_time, end_time, word_position_start, word_position_end, uploader, uploader_id, channel_id, video_id, video_title, video_description_summary, chapter, text_data, images)
             VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"""

    try:
        # Read database configuration
        params = config()
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

if __name__ == "__main__":
    insert_data({
        "release_date": "2022-10-10",
        "start_time": 0,
        "end_time": 10,
        "word_position_start": 0,
        "word_position_end": 10,
        "uploader": "Luke",
        "uploader_id": "123",
        "channel_id": "456",
        "video_id": "789",
        "video_title": "Title",
        "video_description_summary": "Summary",
        "chapter": "Chapter",
        "text_data": "Text",
        "images": ['0x234', '0x345']
    })
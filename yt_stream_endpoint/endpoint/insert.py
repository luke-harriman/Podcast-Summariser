
import psycopg2
from config import config
import json 

def insert_data(dictionary):
    """Insert data into the newsletters table."""
    sql = """INSERT INTO newsletters(release_date, start_time, end_time, word_position_start, word_position_end, uploader, uploader_id, channel_id, video_id, video_title, video_description_summary, chapter, text_data, images)
             VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"""
    conn = None
    try:
        # read database configuration
        params = config()
        # connect to the PostgreSQL server
        conn = psycopg2.connect(**params)
        # create a new cursor
        cur = conn.cursor()
        # Execute insert query
        cur.execute(sql, (dictionary['release_date'], dictionary['start_time'], dictionary['end_time'], dictionary['word_position_start'], dictionary['word_position_end'], dictionary['uploader'], dictionary['uploader_id'], dictionary['channel_id'], dictionary['video_id'], dictionary['video_title'], dictionary['video_description_summary'], dictionary['chapter'], dictionary['text_data'], dictionary['images']))
        # commit the changes to the database
        conn.commit()
        # close communication with the database
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()

if __name__ == '__main__':
    # Example data
    with open('/Users/lukeh/Desktop/python_projects/youtube_scraper/yt_stream_endpoint/endpoint/example/transformed_data.json') as f:
        data = json.load(f)
    for i in data:
        insert_data(i)

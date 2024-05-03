import psycopg2
from PIL import Image
import io
from dotenv import load_dotenv
import os

load_dotenv()

# Database connection parameters

conn_params = {
    'dbname': os.getenv('DATABASE'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST')
}
def fetch_images():
    """A function to query the binary image data from postgrs and render it using PIL."""
    conn = None 
    try:
        # Connect to your postgres DB
        conn = psycopg2.connect(**conn_params)
        
        # Open a cursor to perform database operations
        with conn.cursor() as cur:
            # Execute a query
            cur.execute("SELECT start_time, end_time, images FROM newsletters")
            
            # Retrieve query results
            rows = cur.fetchall()

            print(rows)
            
            for row in rows:
                start_time, end_time, images = row
                
                for i, img_data in enumerate(images):
                    # Convert binary data to image
                    image = Image.open(io.BytesIO(img_data))
                    # Display the image
                    image.show(title=f"{start_time}-{end_time}")
                    
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if conn is not None:
            conn.close()

if __name__ == "__main__":
    print(conn_params)
    fetch_images()
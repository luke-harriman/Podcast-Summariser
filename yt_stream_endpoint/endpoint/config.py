import os
from dotenv import load_dotenv

def config():
    load_dotenv()

    db = {
        'host': os.getenv('DB_HOST'),
        'database': os.getenv('DATABASE'),
        'user': os.getenv('DB_USER'),
        'password': os.getenv('DB_PASSWORD'),
        'port': os.getenv('DB_PORT', '5432') 
    }

    if not all(db.values()):
        missing = [k for k, v in db.items() if not v]
        raise Exception(f"Missing database configuration for {' '.join(missing)}")

    return db
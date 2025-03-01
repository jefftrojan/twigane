from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

def test_connection():
    try:
        client = MongoClient(os.getenv('MONGODB_URL'))
        db = client[os.getenv('DATABASE_NAME')]
        # Test the connection
        db.command('ping')
        print("Successfully connected to MongoDB!")
        return True
    except Exception as e:
        print(f"Failed to connect to MongoDB: {e}")
        return False

if __name__ == "__main__":
    test_connection()
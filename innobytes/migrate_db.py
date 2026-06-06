import sys
import os

# Append current directory to path so database can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import init_db

def migrate():
    print("Running database migrations...")
    try:
        init_db()
        print("✅ Database migrations completed successfully! All tables verified.")
    except Exception as e:
        print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    migrate()

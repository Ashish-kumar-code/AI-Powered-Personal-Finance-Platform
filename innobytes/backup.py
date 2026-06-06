import shutil
import os

def backup_database():
    backup_folder = "backups"
    os.makedirs(backup_folder, exist_ok=True)

    src_file = "finance.db"
    backup_file = os.path.join(backup_folder, "finance_backup.db")

    try:
        shutil.copy2(src_file, backup_file)
        print(f"✅ Backup successful! File saved to {backup_file}")
    except Exception as e:
        print(f"❌ Backup failed: {e}")

def restore_database():
    backup_folder = "backups"
    backup_file = os.path.join(backup_folder, "finance_backup.db")
    src_file = "finance.db"

    if not os.path.exists(backup_file):
        print("❌ No backup file found! Please backup first.")
        return

    try:
        shutil.copy2(backup_file, src_file)
        print("✅ Database restored successfully!")
    except Exception as e:
        print(f"❌ Restore failed: {e}")

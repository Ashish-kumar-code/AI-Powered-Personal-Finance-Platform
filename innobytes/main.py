from reports import generate_report
from auth import register_user, login_user
from database import init_db
from budget import set_budget, check_budget, show_budget_summary
from transactions import add_transaction, view_transactions, delete_transaction
from backup import backup_database, restore_database

import os
import getpass

def main():
    init_db() 
    print("Files in current directory:", os.listdir())

    print("==== Personal Finance Manager ====")
    print("1. Register")
    print("2. Login")
    choice = input("Enter your choice: ")

    if choice == "1":
        username = input("Choose a username: ")
        password = getpass.getpass("Choose a password: ")
        register_user(username, password)

    elif choice == "2":
        username = input("Enter username: ")
        password = getpass.getpass("Enter password: ")
        user_id = login_user(username, password)

        if user_id:
            while True:
                print("\n--- Dashboard ---")
                print("1. Add Income")
                print("2. Add Expense")
                print("3. View Transactions")
                print("4. Delete Transaction")
                print("5. Generate Report")   
                print("6. Set Budget")
                print("7. View Budget Summary")
                print("8. Backup Data")
                print("9. Restore Data")
                print("10. Logout")


                dash_choice = input("Choose an option: ")

                if dash_choice == "1":
                    category = input("Category (e.g., Salary, Freelance): ")
                    amount = float(input("Amount: ₹"))
                    desc = input("Description (optional): ")
                    date = input("Enter date (YYYY-MM-DD) or press Enter for today: ")

                    if not date:
                         date = None
                    add_transaction(user_id, "Income", category, amount, desc, date)

                elif dash_choice == "2":
                    category = input("Category (e.g., Food, Rent, Travel): ")
                    amount = float(input("Amount: ₹"))
                    desc = input("Description (optional): ")
                    date = input("Enter date (YYYY-MM-DD) or press Enter for today: ")
                    from datetime import datetime
                    if not date:
                        now = datetime.now()
                        date = None
                        month = now.month
                        year = now.year
                    else:
                        dt = datetime.strptime(date, "%Y-%m-%d")
                        month = dt.month
                        year = dt.year
                    check_budget(user_id, category, amount, month, year)
                    add_transaction(user_id, "Expense", category, amount, desc, date)

                elif dash_choice == "3":
                    view_transactions(user_id)

                elif dash_choice == "4":
                    transaction_id = input("Enter Transaction ID to delete: ")
                    delete_transaction(user_id, transaction_id)

                elif dash_choice == "5":  
                    report_type = input("Report Type - Monthly (m) / Yearly (y): ").lower()
                    if report_type == "m":
                        month = input("Enter month (1-12): ")
                        year = input("Enter year (e.g., 2025): ")
                        generate_report(user_id, month, year)
                    elif report_type == "y":
                        year = input("Enter year (e.g., 2025): ")
                        generate_report(user_id, year=year)
                    else:
                        print("Invalid report type.")
                elif dash_choice == "6":
                     category = input("Category (e.g., Food, Rent): ")
                     amount = float(input("Budget Amount: ₹"))
                     month = input("Month (1-12): ")
                     year = input("Year (e.g., 2025): ")
                     set_budget(user_id, category, amount, month, year)

                elif dash_choice == "7":
                    month = input("Enter month (1-12): ")
                    year = input("Enter year (e.g., 2025): ")
                    show_budget_summary(user_id, month, year)

                elif dash_choice == "8":
                    backup_database()

                elif dash_choice == "9":
                  restore_database()

                elif dash_choice == "10":
                  print("✅ Logged out.")
                  break


        else:
             print("❌ Invalid choice.")

if __name__ == "__main__":
    main()



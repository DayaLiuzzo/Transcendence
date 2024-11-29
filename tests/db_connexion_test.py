import subprocess
import os

# Helper function to run shell commands
def run_command(command):
    try:
        result = subprocess.run(command, text=True, shell=True, capture_output=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Command failed: {e}")
        print(e.output)
        return None

# Define mapping of services to their containers and databases
services = [
    {"python_container": "auth", "app_name": "auth_app", "db_container": "db_auth", "db_name": "auth", "db_user": "auth_user"},
    {"python_container": "users", "app_name": "users_app", "db_container": "db_users", "db_name": "users", "db_user": "users_user"},
    {"python_container": "friends", "app_name": "friends_app", "db_container": "db_friends", "db_name": "friends", "db_user": "friends_user"},
]

# Loop through each service and test
for service in services:
    python_container = service["python_container"]
    app_name = service["app_name"]
    db_container = service["db_container"]
    db_name = service["db_name"]
    db_user = service["db_user"]

    print(f"\nTesting service: {python_container}, app: {app_name}, database: {db_name}")

    # Step 1: Save data in the Python container
    print(f"Saving data in the Python container ({python_container}) for app '{app_name}'...")

    save_data_script = f"""
from {app_name}.models import Book
new_book = Book(title="Automated Test", author="Test Script")
new_book.save()
print(Book.objects.all().values())
exit()
    """

    # Write the Python script to a temporary file inside the Python container
    temp_script_path = "/tmp/save_data_script.py"
    command_write_script = f"echo \"{save_data_script}\" > {temp_script_path}"

    run_command(f"docker exec -i {python_container} bash -c '{command_write_script}'")

    # Step 2: Execute the script in the container
    command_execute_script = f"docker exec -i {python_container} python {temp_script_path}"
    save_output = run_command(command_execute_script)

    if save_output:
        print("Data saved successfully in Django:")
        print(save_output)
    else:
        print(f"Failed to save data for {app_name} in Python container {python_container}.")

    # Step 2: Verify data in the database
    print(f"Verifying data in the database ({db_name}) using container ({db_container})...")
    check_data_query = f"SELECT * FROM {app_name}_book;"
    command_check_data = (
        f'docker exec -i {db_container} '
        f'psql -U {db_user} -d {db_name} -c "{check_data_query}"'
    )
    db_output = run_command(command_check_data)

    if db_output:
        print(f"Data in the database for {app_name}:")
        print(db_output)
    else:
        print(f"Failed to retrieve data for {app_name} in database {db_name}.")

    # Step 3: Test database connectivity
    print(f"Testing connectivity to database ({db_name}) in container ({db_container})...")
    db_connect_test = "SELECT 1;"
    command_db_connect = (
        f'docker exec -i {db_container} '
        f'psql -U {db_user} -d {db_name} -c "{db_connect_test}"'
    )
    db_connect_output = run_command(command_db_connect)

    if db_connect_output:
        print("Database connectivity test passed:")
        print(db_connect_output)
    else:
        print(f"Database connectivity test failed for {db_name}.")

print("\nAll tests completed!")

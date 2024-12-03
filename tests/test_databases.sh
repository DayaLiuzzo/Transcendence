#!/bin/bash

# Define colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'  # No Color (reset)

# Define the services and their configurations
services=(
    "auth auth_app db_auth auth auth_user"
    "users users_app db_users users users_user"
    "friends friends_app db_friends friends friends_user"
    "rooms rooms_app db_rooms rooms rooms_user"
    "game game_app db_game game game_user"
)

# Loop through each service and test
for service in "${services[@]}"; do
    # Parse the service details
    python_container=$(echo $service | cut -d' ' -f1)
    app_name=$(echo $service | cut -d' ' -f2)
    db_container=$(echo $service | cut -d' ' -f3)
    db_name=$(echo $service | cut -d' ' -f4)
    db_user=$(echo $service | cut -d' ' -f5)

    # Create a specific output file for each service
    output_file="${python_container}_output.txt"

    # Add separation between different services
    echo -e "\n\n\n${CYAN}------------------- TESTING ${python_container} -------------------${NC}" | tee -a $output_file
    echo -e "Service: ${python_container}, App: ${app_name}, Database: ${db_name}" | tee -a $output_file
    echo -e "-------------------\n\n" | tee -a $output_file

    # Step 1: Save data in the Python container
    echo -e "${YELLOW}Saving data in the Python container (${python_container}) for app '${app_name}'...${NC}" | tee -a $output_file
    echo -e "\n" | tee -a $output_file  # Add a newline before the next action

    # Prepare the script to save data into the database
    save_data_script="
    export DJANGO_SETTINGS_MODULE=${db_name}_service.settings && \
    python -c 'import django; django.setup(); from ${app_name}.models import Book; \
    new_book = Book(title=\"${db_name} Test\", author=\"Test Script\"); new_book.save(); \
    print(Book.objects.all().values())'
    "

    # Step 2: Run the script directly inside the container using docker exec
    echo -e "${CYAN}Running the Django shell script inside container ${python_container}...${NC}" | tee -a $output_file
    save_output=$(docker exec -i ${python_container} bash -c "${save_data_script}")

    # Print output
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Data saved successfully in Django:${NC}" | tee -a $output_file
        echo "$save_output" | tee -a $output_file
    else
        echo -e "${RED}Failed to save data for ${app_name} in Python container ${python_container}.${NC}" | tee -a $output_file
    fi

    # Add some space to separate the Docker commands from database tests
    echo -e "\n\n" | tee -a $output_file

    # Step 3: Verify data in the database
    echo -e "${YELLOW}Verifying data in the database (${db_name}) using container (${db_container})...${NC}" | tee -a $output_file
    check_data_query="SELECT * FROM ${app_name}_book;"
    db_output=$(docker exec -i ${db_container} psql -U ${db_user} -d ${db_name} -c "${check_data_query}")

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Data in the database for ${app_name}:${NC}" | tee -a $output_file
        echo "$db_output" | tee -a $output_file
    else
        echo -e "${RED}Failed to retrieve data for ${app_name} in database ${db_name}.${NC}" | tee -a $output_file
    fi

    # Add some space to separate the database check from connectivity test
    echo -e "\n\n" | tee -a $output_file

    # Step 4: Test database connectivity
    echo -e "${YELLOW}Testing connectivity to database (${db_name}) in container (${db_container})...${NC}" | tee -a $output_file
    db_connect_test="SELECT 1;"
    db_connect_output=$(docker exec -i ${db_container} psql -U ${db_user} -d ${db_name} -c "${db_connect_test}")

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Database connectivity test passed:${NC}" | tee -a $output_file
        echo "$db_connect_output" | tee -a $output_file
    else
        echo -e "${RED}Database connectivity test failed for ${db_name}.${NC}" | tee -a $output_file
    fi

    # Add extra newline for better separation between services
    echo -e "\n\n\n" | tee -a $output_file
done

# Final message after all tests
echo -e "${CYAN}All tests completed!${NC}" | tee -a $output_file

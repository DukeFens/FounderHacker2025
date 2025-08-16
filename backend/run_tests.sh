#!/bin/bash

# Simple script to run tests from the backend directory

echo "=== Backend Test Runner ==="
echo "Choose an option:"
echo "1. Run all tests (automated)"
echo "2. Run API tests only"
echo "3. Run usage examples"
echo "4. Start Flask server only"
echo "5. Test specific endpoint"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "Running all tests..."
        cd tests
        python run_tests.py
        ;;
    2)
        echo "Running API tests..."
        cd tests
        python test_api.py
        ;;
    3)
        echo "Running usage examples..."
        cd tests
        python example_usage.py
        ;;
    4)
        echo "Starting Flask server..."
        python flask_server.py
        ;;
    5)
        echo "Testing specific endpoint..."
        echo "Available endpoints:"
        echo "- health"
        echo "- reset-counter"
        echo "- update-reps"
        read -p "Enter endpoint name: " endpoint
        
        case $endpoint in
            "health")
                curl http://localhost:5000/api/health
                ;;
            "reset-counter")
                curl -X POST http://localhost:5000/api/reset-counter
                ;;
            "update-reps")
                curl -X POST http://localhost:5000/api/update-reps \
                  -H "Content-Type: application/json" \
                  -d '{"reps": 5, "stage": "down", "exercise_type": "pullup"}'
                ;;
            *)
                echo "Unknown endpoint: $endpoint"
                ;;
        esac
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        ;;
esac

#!/usr/bin/env python3
"""
Backend Test Runner - Cross-platform script to run tests and manage the Flask server
"""

import os
import sys
import subprocess
import requests

def run_all_tests():
    """Run all tests automatically"""
    print("Running all tests...")
    os.chdir("tests")
    result = subprocess.run([sys.executable, "auto_test_runner.py"])
    return result.returncode == 0

def run_api_tests():
    """Run API tests only"""
    print("Running API tests...")
    os.chdir("tests")
    result = subprocess.run([sys.executable, "test_api.py"])
    return result.returncode == 0

def run_examples():
    """Run usage examples"""
    print("Running usage examples...")
    os.chdir("tests")
    result = subprocess.run([sys.executable, "example_usage.py"])
    return result.returncode == 0

def start_flask_server():
    """Start Flask server"""
    print("Starting Flask server...")
    print("Press Ctrl+C to stop the server")
    try:
        subprocess.run([sys.executable, "flask_server.py"])
    except KeyboardInterrupt:
        print("\nServer stopped by user")

def test_endpoint():
    """Test a specific endpoint"""
    print("Testing specific endpoint...")
    print("Available endpoints:")
    print("- health")
    print("- reset-counter")
    print("- update-reps")
    
    endpoint = input("Enter endpoint name: ").strip()
    
    try:
        if endpoint == "health":
            response = requests.get("http://localhost:5000/api/health", timeout=5)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
            
        elif endpoint == "reset-counter":
            response = requests.post("http://localhost:5000/api/reset-counter", timeout=5)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
            
        elif endpoint == "update-reps":
            data = {"reps": 5, "stage": "down", "exercise_type": "pullup"}
            response = requests.post("http://localhost:5000/api/update-reps", 
                                   json=data, timeout=5)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
            
        else:
            print(f"Unknown endpoint: {endpoint}")
            
    except requests.exceptions.RequestException as e:
        print(f"Error: {e}")
        print("Make sure the Flask server is running!")

def main():
    """Main function"""
    print("=== Backend Test Runner ===")
    print("Choose an option:")
    print("1. Run all tests (automated)")
    print("2. Run API tests only")
    print("3. Run usage examples")
    print("4. Start Flask server only")
    print("5. Test specific endpoint")
    
    try:
        choice = input("Enter your choice (1-5): ").strip()
        
        if choice == "1":
            success = run_all_tests()
            print("✅ All tests completed!" if success else "❌ Some tests failed!")
            
        elif choice == "2":
            success = run_api_tests()
            print("✅ API tests completed!" if success else "❌ API tests failed!")
            
        elif choice == "3":
            success = run_examples()
            print("✅ Examples completed!" if success else "❌ Examples failed!")
            
        elif choice == "4":
            start_flask_server()
            
        elif choice == "5":
            test_endpoint()
            
        else:
            print("Invalid choice. Please run the script again.")
            
    except KeyboardInterrupt:
        print("\nOperation cancelled by user")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()

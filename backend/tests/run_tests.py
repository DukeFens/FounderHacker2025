#!/usr/bin/env python3
"""
Script to automatically start Flask server and run tests
"""

import subprocess
import time
import signal
import sys
import os

def start_flask_server():
    """Start Flask server in background"""
    print("Starting Flask server...")
    
            # Start Flask server in background
        server_process = subprocess.Popen(
            [sys.executable, "../flask_server.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
    
    print(f"Flask server started with PID: {server_process.pid}")
    return server_process

def wait_for_server():
    """Wait for server to be ready"""
    import requests
    
    print("Waiting for server to be ready...")
    max_attempts = 30
    attempt = 0
    
    while attempt < max_attempts:
        try:
            response = requests.get("http://localhost:5000/api/health", timeout=2)
            if response.status_code == 200:
                print("✅ Server is ready!")
                return True
        except:
            pass
        
        attempt += 1
        time.sleep(1)
        print(f"Attempt {attempt}/{max_attempts}...")
    
    print("❌ Server failed to start")
    return False

def run_tests():
    """Run the test suite"""
    print("\nRunning tests...")
    
    result = subprocess.run([sys.executable, "test_api.py"], capture_output=True, text=True, cwd=".")
    
    print("=== Test Output ===")
    print(result.stdout)
    
    if result.stderr:
        print("=== Errors ===")
        print(result.stderr)
    
    return result.returncode == 0

def cleanup(server_process):
    """Clean up server process"""
    if server_process:
        print(f"\nStopping Flask server (PID: {server_process.pid})...")
        server_process.terminate()
        
        try:
            server_process.wait(timeout=5)
            print("✅ Server stopped gracefully")
        except subprocess.TimeoutExpired:
            print("⚠️  Server didn't stop gracefully, forcing...")
            server_process.kill()
            server_process.wait()

def main():
    """Main function"""
    print("=== Flask Server Test Runner ===")
    
    # Check if we're in the right directory
    if not os.path.exists("../flask_server.py"):
        print("❌ Error: flask_server.py not found!")
        print("Make sure you're in the backend/tests directory")
        sys.exit(1)
    
    server_process = None
    
    try:
        # Start server
        server_process = start_flask_server()
        
        # Wait for server to be ready
        if not wait_for_server():
            print("❌ Failed to start server")
            return False
        
        # Run tests
        success = run_tests()
        
        if success:
            print("\n✅ All tests completed successfully!")
        else:
            print("\n❌ Some tests failed!")
        
        return success
        
    except KeyboardInterrupt:
        print("\n⚠️  Interrupted by user")
        return False
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False
        
    finally:
        # Always cleanup
        cleanup(server_process)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

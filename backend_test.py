import requests
import sys
import json
from datetime import datetime
import os

class DaVizAPITester:
    def __init__(self, base_url="https://insight-hub-233.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_dataset_id = None
        self.test_row_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        headers = {'Content-Type': 'application/json'} if not files else {}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.text else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_create_dataset(self):
        """Test dataset creation"""
        dataset_data = {
            "name": f"Test Dataset {datetime.now().strftime('%H%M%S')}",
            "description": "Test dataset for API testing",
            "columns": [
                {"name": "Name", "type": "text"},
                {"name": "Age", "type": "number"},
                {"name": "Date", "type": "date"}
            ]
        }
        success, response = self.run_test("Create Dataset", "POST", "datasets", 200, data=dataset_data)
        if success and 'id' in response:
            self.test_dataset_id = response['id']
            print(f"   Created dataset ID: {self.test_dataset_id}")
        return success

    def test_get_datasets(self):
        """Test getting all datasets"""
        return self.run_test("Get All Datasets", "GET", "datasets", 200)

    def test_get_dataset_by_id(self):
        """Test getting specific dataset"""
        if not self.test_dataset_id:
            print("❌ Skipped - No dataset ID available")
            return False
        return self.run_test("Get Dataset by ID", "GET", f"datasets/{self.test_dataset_id}", 200)

    def test_update_dataset(self):
        """Test updating dataset"""
        if not self.test_dataset_id:
            print("❌ Skipped - No dataset ID available")
            return False
        
        update_data = {
            "name": f"Updated Test Dataset {datetime.now().strftime('%H%M%S')}",
            "description": "Updated description"
        }
        return self.run_test("Update Dataset", "PUT", f"datasets/{self.test_dataset_id}", 200, data=update_data)

    def test_create_data_row(self):
        """Test creating data row"""
        if not self.test_dataset_id:
            print("❌ Skipped - No dataset ID available")
            return False
        
        row_data = {
            "dataset_id": self.test_dataset_id,
            "data": {
                "Name": "John Doe",
                "Age": "25",
                "Date": "2025-01-01"
            }
        }
        success, response = self.run_test("Create Data Row", "POST", "data-rows", 201, data=row_data)
        if success and 'id' in response:
            self.test_row_id = response['id']
            print(f"   Created row ID: {self.test_row_id}")
        return success

    def test_get_data_rows(self):
        """Test getting data rows for dataset"""
        if not self.test_dataset_id:
            print("❌ Skipped - No dataset ID available")
            return False
        return self.run_test("Get Data Rows", "GET", f"data-rows/{self.test_dataset_id}", 200)

    def test_update_data_row(self):
        """Test updating data row"""
        if not self.test_row_id:
            print("❌ Skipped - No row ID available")
            return False
        
        update_data = {
            "Name": "Jane Doe",
            "Age": "30",
            "Date": "2025-01-02"
        }
        return self.run_test("Update Data Row", "PUT", f"data-rows/{self.test_row_id}", 200, data=update_data)

    def test_csv_upload(self):
        """Test CSV file upload"""
        if not self.test_dataset_id:
            print("❌ Skipped - No dataset ID available")
            return False
        
        # Create a simple CSV content
        csv_content = "Name,Age,Date\nAlice,28,2025-01-03\nBob,32,2025-01-04"
        
        files = {'file': ('test.csv', csv_content, 'text/csv')}
        return self.run_test("Upload CSV", "POST", f"upload-csv/{self.test_dataset_id}", 200, files=files)

    def test_ai_prediction(self):
        """Test AI prediction endpoint"""
        if not self.test_dataset_id:
            print("❌ Skipped - No dataset ID available")
            return False
        
        prediction_data = {
            "dataset_id": self.test_dataset_id,
            "column_name": "Age",
            "prediction_points": 3
        }
        print("   Note: AI prediction may take 10-15 seconds...")
        return self.run_test("AI Prediction", "POST", "predict", 200, data=prediction_data)

    def test_delete_data_row(self):
        """Test deleting data row"""
        if not self.test_row_id:
            print("❌ Skipped - No row ID available")
            return False
        return self.run_test("Delete Data Row", "DELETE", f"data-rows/{self.test_row_id}", 200)

    def test_delete_dataset(self):
        """Test deleting dataset"""
        if not self.test_dataset_id:
            print("❌ Skipped - No dataset ID available")
            return False
        return self.run_test("Delete Dataset", "DELETE", f"datasets/{self.test_dataset_id}", 200)

def main():
    print("🚀 Starting DaViz API Testing...")
    print("=" * 50)
    
    tester = DaVizAPITester()
    
    # Test sequence
    test_results = []
    
    # Basic API tests
    test_results.append(("Root API", tester.test_root_endpoint()))
    
    # Dataset CRUD operations
    test_results.append(("Create Dataset", tester.test_create_dataset()))
    test_results.append(("Get All Datasets", tester.test_get_datasets()))
    test_results.append(("Get Dataset by ID", tester.test_get_dataset_by_id()))
    test_results.append(("Update Dataset", tester.test_update_dataset()))
    
    # Data row operations
    test_results.append(("Create Data Row", tester.test_create_data_row()))
    test_results.append(("Get Data Rows", tester.test_get_data_rows()))
    test_results.append(("Update Data Row", tester.test_update_data_row()))
    
    # File upload
    test_results.append(("CSV Upload", tester.test_csv_upload()))
    
    # AI prediction (may be slow)
    test_results.append(("AI Prediction", tester.test_ai_prediction()))
    
    # Cleanup
    test_results.append(("Delete Data Row", tester.test_delete_data_row()))
    test_results.append(("Delete Dataset", tester.test_delete_dataset()))
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\nTests passed: {tester.tests_passed}/{tester.tests_run}")
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"Success rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
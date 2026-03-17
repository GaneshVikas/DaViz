"""
Backend Tests for DaViz New Features - Iteration 2
Testing: Chat API, Insights API, Sort/Group data operations
"""
import pytest
import requests
import os
import time

# Get base URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    BASE_URL = "https://predictive-data.preview.emergentagent.com"

# Test dataset ID from previous testing
TEST_DATASET_ID = "788dc6c2-4d76-4a07-96b9-3d933146d4af"


class TestChatAPI:
    """Test the tutorial chatbot /api/chat endpoint"""
    
    def test_chat_basic_question(self):
        """Test basic chat response"""
        response = requests.post(
            f"{BASE_URL}/api/chat",
            json={
                "message": "How do I create a chart?",
                "session_id": "pytest-session-1",
                "conversation_history": []
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "response" in data, "Response should contain 'response' field"
        assert "session_id" in data, "Response should contain 'session_id' field"
        assert len(data["response"]) > 50, "Response should be substantive"
        assert data["session_id"] == "pytest-session-1", "Session ID should match request"
        print(f"Chat response received: {data['response'][:100]}...")
    
    def test_chat_with_conversation_history(self):
        """Test chat maintains conversation context"""
        # First message
        history = []
        response1 = requests.post(
            f"{BASE_URL}/api/chat",
            json={
                "message": "What chart types are available?",
                "session_id": "pytest-session-2",
                "conversation_history": history
            }
        )
        assert response1.status_code == 200
        data1 = response1.json()
        
        # Update history with first exchange
        history.append({"role": "user", "content": "What chart types are available?"})
        history.append({"role": "assistant", "content": data1["response"]})
        
        # Second message referencing the first
        response2 = requests.post(
            f"{BASE_URL}/api/chat",
            json={
                "message": "Which one is best for time series data?",
                "session_id": "pytest-session-2",
                "conversation_history": history
            }
        )
        assert response2.status_code == 200
        data2 = response2.json()
        assert len(data2["response"]) > 30, "Should provide context-aware response"
        print(f"Conversation context test passed - response: {data2['response'][:100]}...")
    
    def test_chat_empty_message(self):
        """Test chat with empty message - should fail gracefully"""
        response = requests.post(
            f"{BASE_URL}/api/chat",
            json={
                "message": "",
                "session_id": "pytest-session-3",
                "conversation_history": []
            }
        )
        # API should handle empty message somehow (might return error or default response)
        # Checking that it doesn't crash
        assert response.status_code in [200, 400, 422], f"Expected handled response, got {response.status_code}"


class TestInsightsAPI:
    """Test the AI Insights /api/insights endpoint"""
    
    def test_insights_basic(self):
        """Test basic insights generation"""
        response = requests.post(
            f"{BASE_URL}/api/insights",
            json={
                "dataset_id": TEST_DATASET_ID,
                "column_name": "salary",
                "chart_type": "bar"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "insights" in data, "Response should contain 'insights' field"
        assert "summary" in data, "Response should contain 'summary' field"
        assert len(data["insights"]) > 100, "Insights should be substantive"
        assert data["summary"]["row_count"] > 0, "Should have row count in summary"
        assert data["summary"]["column_count"] > 0, "Should have column count in summary"
        print(f"Insights response: {data['insights'][:150]}...")
    
    def test_insights_without_column(self):
        """Test insights without specifying column"""
        response = requests.post(
            f"{BASE_URL}/api/insights",
            json={
                "dataset_id": TEST_DATASET_ID,
                "column_name": None,
                "chart_type": "pie"
            }
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "insights" in data
    
    def test_insights_invalid_dataset(self):
        """Test insights with invalid dataset ID"""
        response = requests.post(
            f"{BASE_URL}/api/insights",
            json={
                "dataset_id": "invalid-dataset-id-12345",
                "column_name": "salary",
                "chart_type": "bar"
            }
        )
        assert response.status_code == 404, f"Expected 404 for invalid dataset, got {response.status_code}"


class TestDatasetEndpoints:
    """Test existing dataset endpoints work with sort/group context"""
    
    def test_get_dataset(self):
        """Verify test dataset exists and has data"""
        response = requests.get(f"{BASE_URL}/api/datasets/{TEST_DATASET_ID}")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["id"] == TEST_DATASET_ID
        assert "columns" in data
        assert len(data["columns"]) >= 2, "Dataset should have multiple columns for sort/group testing"
        assert data["row_count"] >= 3, "Dataset should have enough rows for testing"
        print(f"Dataset has {data['row_count']} rows and {len(data['columns'])} columns")
    
    def test_get_data_rows(self):
        """Test fetching all data rows for sort/group"""
        response = requests.get(f"{BASE_URL}/api/data-rows/{TEST_DATASET_ID}")
        assert response.status_code == 200
        
        rows = response.json()
        assert isinstance(rows, list)
        assert len(rows) >= 3, "Need at least 3 rows to test sort/group"
        
        # Verify each row has required fields
        for row in rows:
            assert "id" in row
            assert "dataset_id" in row
            assert "data" in row
            assert row["dataset_id"] == TEST_DATASET_ID
        
        print(f"Retrieved {len(rows)} data rows")


class TestAPIHealth:
    """Basic API health checks"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "DaViz API"
    
    def test_datasets_list(self):
        """Test datasets list endpoint"""
        response = requests.get(f"{BASE_URL}/api/datasets")
        assert response.status_code == 200
        datasets = response.json()
        assert isinstance(datasets, list)
        print(f"Found {len(datasets)} datasets")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

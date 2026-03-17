from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import pandas as pd
import io
from openai import OpenAI
client = OpenAI()
import pymysql
import psycopg2
import sqlite3

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

class DatasetCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    columns: List[Dict[str, str]]

class Dataset(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = ""
    columns: List[Dict[str, str]]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    row_count: int = 0

class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    columns: Optional[List[Dict[str, str]]] = None

class DataRowCreate(BaseModel):
    dataset_id: str
    data: Dict[str, Any]

class DataRow(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dataset_id: str
    data: Dict[str, Any]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PredictionRequest(BaseModel):
    dataset_id: str
    column_name: str
    prediction_points: int = 5

class ChatRequest(BaseModel):
    message: str
    session_id: str
    conversation_history: Optional[List[Dict[str, str]]] = []
    dataset_id: Optional[str] = None

class InsightsRequest(BaseModel):
    dataset_id: str
    column_name: Optional[str] = None
    chart_type: Optional[str] = None

class DatabaseConnectionRequest(BaseModel):
    db_type: str  # mysql, postgresql, sqlite
    host: Optional[str] = "localhost"
    port: Optional[int] = None
    database: str
    username: Optional[str] = None
    password: Optional[str] = None
    
class DatabaseTableRequest(BaseModel):
    db_type: str
    host: Optional[str] = "localhost"
    port: Optional[int] = None
    database: str
    username: Optional[str] = None
    password: Optional[str] = None
    table_name: str

class DatabaseImportRequest(BaseModel):
    db_type: str
    host: Optional[str] = "localhost"
    port: Optional[int] = None
    database: str
    username: Optional[str] = None
    password: Optional[str] = None
    table_name: str
    dataset_name: str
    custom_query: Optional[str] = None

@api_router.get("/")
async def root():
    return {"message": "DaViz API"}

@api_router.post("/datasets", response_model=Dataset)
async def create_dataset(dataset: DatasetCreate):
    dataset_obj = Dataset(**dataset.model_dump())
    doc = dataset_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.datasets.insert_one(doc)
    return dataset_obj

@api_router.get("/datasets", response_model=List[Dataset])
async def get_datasets():
    datasets = await db.datasets.find({}, {"_id": 0}).to_list(1000)
    for ds in datasets:
        if isinstance(ds['created_at'], str):
            ds['created_at'] = datetime.fromisoformat(ds['created_at'])
        row_count = await db.dataset_rows.count_documents({"dataset_id": ds['id']})
        ds['row_count'] = row_count
    return datasets

@api_router.get("/datasets/{dataset_id}", response_model=Dataset)
async def get_dataset(dataset_id: str):
    dataset = await db.datasets.find_one({"id": dataset_id}, {"_id": 0})
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    if isinstance(dataset['created_at'], str):
        dataset['created_at'] = datetime.fromisoformat(dataset['created_at'])
    row_count = await db.dataset_rows.count_documents({"dataset_id": dataset_id})
    dataset['row_count'] = row_count
    return dataset

@api_router.put("/datasets/{dataset_id}", response_model=Dataset)
async def update_dataset(dataset_id: str, dataset_update: DatasetUpdate):
    existing = await db.datasets.find_one({"id": dataset_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    update_data = {k: v for k, v in dataset_update.model_dump().items() if v is not None}
    if update_data:
        await db.datasets.update_one({"id": dataset_id}, {"$set": update_data})
    
    updated = await db.datasets.find_one({"id": dataset_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    row_count = await db.dataset_rows.count_documents({"dataset_id": dataset_id})
    updated['row_count'] = row_count
    return updated

@api_router.delete("/datasets/{dataset_id}")
async def delete_dataset(dataset_id: str):
    result = await db.datasets.delete_one({"id": dataset_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Dataset not found")
    await db.dataset_rows.delete_many({"dataset_id": dataset_id})
    return {"message": "Dataset deleted successfully"}

@api_router.post("/data-rows", response_model=DataRow)
async def create_data_row(row: DataRowCreate):
    dataset = await db.datasets.find_one({"id": row.dataset_id}, {"_id": 0})
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    row_obj = DataRow(**row.model_dump())
    doc = row_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.dataset_rows.insert_one(doc)
    return row_obj

@api_router.get("/data-rows/{dataset_id}", response_model=List[DataRow])
async def get_data_rows(dataset_id: str):
    rows = await db.dataset_rows.find({"dataset_id": dataset_id}, {"_id": 0}).to_list(10000)
    for row in rows:
        if isinstance(row['created_at'], str):
            row['created_at'] = datetime.fromisoformat(row['created_at'])
    return rows

@api_router.put("/data-rows/{row_id}", response_model=DataRow)
async def update_data_row(row_id: str, data: Dict[str, Any]):
    result = await db.dataset_rows.update_one(
        {"id": row_id},
        {"$set": {"data": data}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Row not found")
    
    updated = await db.dataset_rows.find_one({"id": row_id}, {"_id": 0})
    if isinstance(updated['created_at'], str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    return updated

@api_router.delete("/data-rows/{row_id}")
async def delete_data_row(row_id: str):
    result = await db.dataset_rows.delete_one({"id": row_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Row not found")
    return {"message": "Row deleted successfully"}

@api_router.post("/upload-csv/{dataset_id}")
async def upload_csv(dataset_id: str, file: UploadFile = File(...)):
    dataset = await db.datasets.find_one({"id": dataset_id}, {"_id": 0})
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    try:
        contents = await file.read()
        
        # Check file extension and parse accordingly
        if file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(contents), engine='openpyxl' if file.filename.endswith('.xlsx') else 'xlrd')
        elif file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload CSV, XLS, or XLSX files.")
        
        columns = dataset['columns']
        column_names = [col['name'] for col in columns]
        
        rows_created = 0
        for _, row in df.iterrows():
            row_data = {}
            for col_name in column_names:
                if col_name in df.columns:
                    value = row[col_name]
                    if pd.isna(value):
                        row_data[col_name] = ""
                    else:
                        row_data[col_name] = str(value)
                else:
                    row_data[col_name] = ""
            
            row_obj = DataRow(dataset_id=dataset_id, data=row_data)
            doc = row_obj.model_dump()
            doc['created_at'] = doc['created_at'].isoformat()
            await db.dataset_rows.insert_one(doc)
            rows_created += 1
        
        return {"message": f"Successfully imported {rows_created} rows", "rows_created": rows_created}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@api_router.post("/predict")
async def predict_values(request: PredictionRequest):
    try:
        rows = await db.dataset_rows.find({"dataset_id": request.dataset_id}, {"_id": 0}).to_list(10000)
        
        if len(rows) < 3:
            raise HTTPException(status_code=400, detail="Need at least 3 data points for prediction")
        
        values = []
        for row in rows:
            val = row['data'].get(request.column_name)
            if val:
                try:
                    values.append(float(val))
                except ValueError:
                    pass
        
        if len(values) < 3:
            raise HTTPException(status_code=400, detail="Not enough numeric values for prediction")
        
        # Predict same number of points as historical data
        num_predictions = len(values)
        
        data_summary = f"Historical data: {values[:20]}" if len(values) > 20 else f"Historical data: {values}"
        data_summary += f"\nTotal data points: {len(values)}"
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[
        {
            "role": "system",
            "content": "You are a data analysis expert. Analyze the data and predict future values based on trends."
        },
        {
            "role": "user",
            "content": f"""Given this time series data: {data_summary}

Analyze the trend and provide {num_predictions} future predicted values.
Respond ONLY with a JSON array of numbers, nothing else. Example: [45.2, 47.1, 48.9, 50.2, 51.8]"""
        }
    ]
)

response_text = response.choices[0].message.content
        
        import json
        try:
            response_text = response.strip()
            if response_text.startswith('```'):
                lines = response_text.split('\n')
                response_text = '\n'.join([line for line in lines if not line.startswith('```')])
            
            predictions = json.loads(response_text)
            if not isinstance(predictions, list):
                predictions = [predictions]
            
            return {
                "predictions": predictions[:num_predictions],
                "historical_count": len(values),
                "column_name": request.column_name
            }
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse AI prediction response")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@api_router.post("/chat")
async def chat_with_bot(request: ChatRequest):
    try:
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        
        # Fetch dataset context if dataset_id is provided
        dataset_context = ""
        if request.dataset_id:
            dataset = await db.datasets.find_one({"id": request.dataset_id}, {"_id": 0})
            if dataset:
                rows = await db.dataset_rows.find({"dataset_id": request.dataset_id}, {"_id": 0}).to_list(100)
                
                columns = dataset.get('columns', [])
                
                # Analyze numeric columns
                stats_info = []
                for col in columns:
                    if col['type'] == 'number':
                        values = []
                        for row in rows:
                            try:
                                values.append(float(row['data'].get(col['name'], 0)))
                            except ValueError:
                                pass
                        if values:
                            stats_info.append(f"- {col['name']}: min={min(values):.1f}, max={max(values):.1f}, avg={sum(values)/len(values):.1f}")
                
                # Sample data
                sample_rows = rows[:5]
                sample_data = []
                for row in sample_rows:
                    sample_data.append(str(row.get('data', {})))
                
                dataset_context = f"""
CURRENT DATASET CONTEXT (user is viewing this dataset):
- Dataset Name: {dataset.get('name', 'Unknown')}
- Description: {dataset.get('description', 'No description')}
- Total Rows: {len(rows)}
- Columns: {', '.join([f"{c['name']} ({c['type']})" for c in columns])}

Column Statistics:
{chr(10).join(stats_info) if stats_info else 'No numeric columns'}

Sample Data (first 5 rows):
{chr(10).join(sample_data[:3])}

The user can see this data and is asking questions about it. Provide specific, data-aware answers.
"""
        
        system_message = f"""You are DaViz Assistant, a helpful chatbot for the DaViz data visualization platform. 
        
DaViz Features you can help users with:
1. **Creating Datasets**: Users can create datasets by entering data manually or uploading CSV/Excel files
2. **Data Visualization**: 10 chart types available - Bar, Horizontal Bar, Stacked Bar, Line, Area, Scatter, Radar, Composed, and Pie charts
3. **Data Operations**: Sort data by any column (ascending/descending), Group data by categories, Calculate statistics (count, sum, mean, median, mode, min, max)
4. **AI Predictions**: Generate future value predictions using AI based on historical data trends
5. **Chart Download**: Download any chart as a PNG image
6. **Data Management**: Add, edit, delete rows; Import CSV/Excel files to existing datasets

How to use DaViz:
- Start by clicking "Get Started" on the landing page
- Create a new dataset or upload a CSV/Excel file
- Once in the dataset view, select X and Y axis columns for visualization
- Use the chart type buttons to switch between different visualizations
- Use the Data Operations toolbar to sort, group, or view statistics
- Click "Generate AI Predictions" to see future trend forecasts

{dataset_context}

IMPORTANT: When the user has a dataset loaded, you can see and analyze their actual data. Provide specific insights about THEIR data, not generic advice. Reference actual column names, values, and patterns you observe.

Be friendly, helpful, and concise. Guide users step-by-step when they ask how to do something."""

       
        context = ""
        if request.conversation_history:
            for msg in request.conversation_history[-10:]:  # Keep last 10 messages for context
                role = msg.get('role', 'user')
                content = msg.get('content', '')
                context += f"{role}: {content}\n"
        messages = [
    {
        "role": "system",
        "content": system_message
    }
]

# Add conversation history (structured)
if request.conversation_history:
    for msg in request.conversation_history[-10:]:
        messages.append({
            "role": msg.get("role", "user"),
            "content": msg.get("content", "")
        })

# Add current user message
messages.append({
    "role": "user",
    "content": request.message
})

response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=messages
)

response_text = response.choices[0].message.content
       
        return {
            "response": response,
            "session_id": request.session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

@api_router.post("/insights")
async def generate_insights(request: InsightsRequest):
    try:
        # Fetch dataset info
        dataset = await db.datasets.find_one({"id": request.dataset_id}, {"_id": 0})
        if not dataset:
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Fetch rows
        rows = await db.dataset_rows.find({"dataset_id": request.dataset_id}, {"_id": 0}).to_list(10000)
        
        if len(rows) == 0:
            return {
                "insights": "No data available yet. Add some rows to get AI-powered insights!",
                "summary": {"row_count": 0, "column_count": len(dataset['columns'])}
            }
        
        # Prepare data summary
        columns = dataset['columns']
        data_summary = {
            "dataset_name": dataset['name'],
            "total_rows": len(rows),
            "columns": []
        }
        
        for col in columns:
            col_name = col['name']
            col_type = col['type']
            values = [row['data'].get(col_name) for row in rows if row['data'].get(col_name)]
            
            col_info = {
                "name": col_name,
                "type": col_type,
                "non_null_count": len(values)
            }
            
            if col_type == 'number':
                numeric_vals = []
                for v in values:
                    try:
                        numeric_vals.append(float(v))
                    except ValueError:
                        pass
                if numeric_vals:
                    col_info["min"] = min(numeric_vals)
                    col_info["max"] = max(numeric_vals)
                    col_info["mean"] = sum(numeric_vals) / len(numeric_vals)
                    col_info["sample_values"] = numeric_vals[:5]
            else:
                col_info["sample_values"] = values[:5]
            
            data_summary["columns"].append(col_info)
        
       response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[
        {
            "role": "system",
            "content": "You are a data analyst expert. Provide clear, actionable insights about datasets."
        },
        {
            "role": "user",
            "content": prompt
        }
    ]
)

response_text = response.choices[0].message.content
        
        prompt = f"""Analyze this dataset and provide insights:

Dataset: {data_summary['dataset_name']}
Total Rows: {data_summary['total_rows']}
Columns: {data_summary['columns']}
"""
        
        if request.column_name:
            prompt += f"\nFocus especially on the column: {request.column_name}"
        
        if request.chart_type:
            prompt += f"\nThe user is viewing this data as a {request.chart_type} chart."
        
        prompt += """

Provide:
1. **Key Patterns**: 2-3 notable patterns or trends you observe
2. **Data Quality**: Any potential data issues (missing values, outliers)
3. **Recommendations**: 2-3 actionable suggestions for analysis or visualization

Keep response under 200 words. Use bullet points. Be specific with numbers."""

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        return {
            "insights": response,
            "summary": {
                "row_count": len(rows),
                "column_count": len(columns),
                "dataset_name": dataset['name']
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insights error: {str(e)}")

# Database Connection Helper Functions
def get_db_connection(db_type: str, host: str, port: int, database: str, username: str, password: str):
    """Create a database connection based on the type"""
    try:
        if db_type == "mysql":
            port = port or 3306
            conn = pymysql.connect(
                host=host,
                port=port,
                user=username,
                password=password,
                database=database,
                cursorclass=pymysql.cursors.DictCursor
            )
            return conn
        elif db_type == "postgresql":
            port = port or 5432
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=username,
                password=password,
                database=database
            )
            return conn
        elif db_type == "sqlite":
            conn = sqlite3.connect(database)
            conn.row_factory = sqlite3.Row
            return conn
        else:
            raise ValueError(f"Unsupported database type: {db_type}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")

def get_tables(conn, db_type: str):
    """Get list of tables from database"""
    cursor = conn.cursor()
    if db_type == "mysql":
        cursor.execute("SHOW TABLES")
        tables = [list(row.values())[0] for row in cursor.fetchall()]
    elif db_type == "postgresql":
        cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
        tables = [row[0] for row in cursor.fetchall()]
    elif db_type == "sqlite":
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
    cursor.close()
    return tables

def get_table_columns(conn, db_type: str, table_name: str):
    """Get columns of a specific table"""
    cursor = conn.cursor()
    if db_type == "mysql":
        cursor.execute(f"DESCRIBE `{table_name}`")
        columns = [{"name": row['Field'], "type": row['Type']} for row in cursor.fetchall()]
    elif db_type == "postgresql":
        cursor.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = %s
        """, (table_name,))
        columns = [{"name": row[0], "type": row[1]} for row in cursor.fetchall()]
    elif db_type == "sqlite":
        cursor.execute(f"PRAGMA table_info(`{table_name}`)")
        columns = [{"name": row[1], "type": row[2]} for row in cursor.fetchall()]
    cursor.close()
    return columns

def get_table_preview(conn, db_type: str, table_name: str, limit: int = 10):
    """Get preview rows from a table"""
    cursor = conn.cursor()
    if db_type == "mysql":
        cursor.execute(f"SELECT * FROM `{table_name}` LIMIT {limit}")
        rows = cursor.fetchall()
    elif db_type == "postgresql":
        cursor.execute(f'SELECT * FROM "{table_name}" LIMIT {limit}')
        columns = [desc[0] for desc in cursor.description]
        rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
    elif db_type == "sqlite":
        cursor.execute(f"SELECT * FROM `{table_name}` LIMIT {limit}")
        columns = [desc[0] for desc in cursor.description]
        rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
    cursor.close()
    return rows

@api_router.post("/database/test-connection")
async def test_database_connection(request: DatabaseConnectionRequest):
    """Test if database connection is successful"""
    try:
        conn = get_db_connection(
            request.db_type,
            request.host,
            request.port,
            request.database,
            request.username,
            request.password
        )
        conn.close()
        return {"success": True, "message": "Connection successful!"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Connection failed: {str(e)}")

@api_router.post("/database/tables")
async def list_database_tables(request: DatabaseConnectionRequest):
    """List all tables in the database"""
    try:
        conn = get_db_connection(
            request.db_type,
            request.host,
            request.port,
            request.database,
            request.username,
            request.password
        )
        tables = get_tables(conn, request.db_type)
        conn.close()
        return {"tables": tables}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to list tables: {str(e)}")

@api_router.post("/database/table-info")
async def get_table_info(request: DatabaseTableRequest):
    """Get columns and preview data from a table"""
    try:
        conn = get_db_connection(
            request.db_type,
            request.host,
            request.port,
            request.database,
            request.username,
            request.password
        )
        columns = get_table_columns(conn, request.db_type, request.table_name)
        preview = get_table_preview(conn, request.db_type, request.table_name, 10)
        
        # Count total rows
        cursor = conn.cursor()
        if request.db_type == "mysql":
            cursor.execute(f"SELECT COUNT(*) as count FROM `{request.table_name}`")
            count = cursor.fetchone()['count']
        elif request.db_type == "postgresql":
            cursor.execute(f'SELECT COUNT(*) FROM "{request.table_name}"')
            count = cursor.fetchone()[0]
        elif request.db_type == "sqlite":
            cursor.execute(f"SELECT COUNT(*) FROM `{request.table_name}`")
            count = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        
        return {
            "columns": columns,
            "preview": preview,
            "total_rows": count
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to get table info: {str(e)}")

@api_router.post("/database/import")
async def import_from_database(request: DatabaseImportRequest):
    """Import data from database table into a DaViz dataset"""
    try:
        conn = get_db_connection(
            request.db_type,
            request.host,
            request.port,
            request.database,
            request.username,
            request.password
        )
        
        # Get columns and determine types
        db_columns = get_table_columns(conn, request.db_type, request.table_name)
        
        # Map database types to DaViz types
        def map_type(db_type: str) -> str:
            db_type_lower = db_type.lower()
            if any(t in db_type_lower for t in ['int', 'float', 'double', 'decimal', 'numeric', 'real']):
                return 'number'
            return 'text'
        
        columns = [{"name": col["name"], "type": map_type(col["type"])} for col in db_columns]
        
        # Create the dataset
        dataset_obj = Dataset(
            name=request.dataset_name,
            description=f"Imported from {request.db_type} database: {request.database}.{request.table_name}",
            columns=columns
        )
        doc = dataset_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.datasets.insert_one(doc)
        
        # Fetch all data using custom query or table
        cursor = conn.cursor()
        if request.custom_query:
            cursor.execute(request.custom_query)
        else:
            if request.db_type == "mysql":
                cursor.execute(f"SELECT * FROM `{request.table_name}`")
            elif request.db_type == "postgresql":
                cursor.execute(f'SELECT * FROM "{request.table_name}"')
            elif request.db_type == "sqlite":
                cursor.execute(f"SELECT * FROM `{request.table_name}`")
        
        # Get column names
        if request.db_type == "mysql":
            all_rows = cursor.fetchall()
        else:
            col_names = [desc[0] for desc in cursor.description]
            all_rows = [dict(zip(col_names, row)) for row in cursor.fetchall()]
        
        cursor.close()
        conn.close()
        
        # Insert rows into DaViz
        rows_created = 0
        for row_data in all_rows:
            # Convert all values to strings for consistency
            cleaned_data = {}
            for key, value in row_data.items():
                if value is None:
                    cleaned_data[key] = ""
                else:
                    cleaned_data[key] = str(value)
            
            row_obj = DataRow(dataset_id=dataset_obj.id, data=cleaned_data)
            row_doc = row_obj.model_dump()
            row_doc['created_at'] = row_doc['created_at'].isoformat()
            await db.dataset_rows.insert_one(row_doc)
            rows_created += 1
        
        return {
            "success": True,
            "dataset_id": dataset_obj.id,
            "dataset_name": request.dataset_name,
            "rows_imported": rows_created,
            "columns": len(columns)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Import failed: {str(e)}")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

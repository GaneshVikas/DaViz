````python
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
import pymysql
import psycopg2
import sqlite3

# ================== SETUP ==================
openai_client = OpenAI()

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = mongo_client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ================== MODELS ==================
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

class ChatRequest(BaseModel):
    message: str
    session_id: str
    conversation_history: Optional[List[Dict[str, str]]] = []

class InsightsRequest(BaseModel):
    dataset_id: str
    column_name: Optional[str] = None
    chart_type: Optional[str] = None

# ================== BASIC ROUTES ==================
@api_router.get("/")
async def root():
    return {"message": "DaViz API"}

# ================== DATASET ==================
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
    return datasets

# ================== CSV UPLOAD ==================
@api_router.post("/upload-csv/{dataset_id}")
async def upload_csv(dataset_id: str, file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    rows_created = 0
    for _, row in df.iterrows():
        row_obj = DataRow(dataset_id=dataset_id, data=row.to_dict())
        doc = row_obj.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.dataset_rows.insert_one(doc)
        rows_created += 1

    return {"rows_created": rows_created}

# ================== PREDICT ==================
@api_router.post("/predict")
async def predict_values(request: PredictionRequest):
    rows = await db.dataset_rows.find({"dataset_id": request.dataset_id}).to_list(10000)

    values = []
    for row in rows:
        try:
            values.append(float(row['data'].get(request.column_name)))
        except:
            pass

    if len(values) < 3:
        raise HTTPException(status_code=400, detail="Not enough data")

    response = openai_client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": "Predict future values"},
            {"role": "user", "content": str(values)}
        ]
    )

    import json
    text = response.choices[0].message.content

    if text.startswith("```"):
        text = "\n".join(line for line in text.split("\n") if "```" not in line)

    return {"predictions": json.loads(text)}

# ================== CHAT ==================
@api_router.post("/chat")
async def chat_with_bot(request: ChatRequest):

    messages = [{"role": "system", "content": "You are a helpful assistant"}]

    if request.conversation_history:
        for msg in request.conversation_history[-10:]:
            messages.append(msg)

    messages.append({"role": "user", "content": request.message})

    response = openai_client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=messages
    )

    return {
        "response": response.choices[0].message.content,
        "session_id": request.session_id
    }

# ================== INSIGHTS ==================
@api_router.post("/insights")
async def insights(request: InsightsRequest):

    dataset = await db.datasets.find_one({"id": request.dataset_id})
    rows = await db.dataset_rows.find({"dataset_id": request.dataset_id}).to_list(10000)

    prompt = f"""
Dataset: {dataset['name']}
Rows: {len(rows)}
Columns: {dataset['columns']}
"""

    response = openai_client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": "Give insights"},
            {"role": "user", "content": prompt}
        ]
    )

    return {
        "insights": response.choices[0].message.content
    }

# ================== APP ==================
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown():
    mongo_client.close()
````

# Module Descriptions for DaViz

## 1. Frontend Modules

### 1.1 Pages Module
**Location:** `/app/frontend/src/pages/`
**Purpose:** Main application pages and routing

#### Landing.js
- **Purpose:** Landing page with hero section and features
- **Key Features:**
  - Custom logo display (large, 32px)
  - Hero image showcasing data visualization
  - Feature cards (Dynamic Datasets, CSV/Excel Import, AI Predictions)
  - Call-to-action buttons
  - Footer section
- **Dependencies:** React Router, Lucide Icons

#### Dashboard.js
- **Purpose:** Main dashboard showing all datasets
- **Key Features:**
  - Dataset grid display
  - Dataset cards with metadata (rows, columns, date)
  - Delete dataset functionality (hover to show)
  - Empty state handling
  - Navigation to dataset details
- **State Management:** useState, useEffect
- **API Calls:** GET /api/datasets, DELETE /api/datasets/{id}

#### CreateDataset.js
- **Purpose:** Create new dataset with manual or CSV/Excel import
- **Key Features:**
  - Two creation modes: Manual Entry vs CSV/Excel Import
  - Dynamic column addition/removal
  - Column type selection (text, number, date)
  - CSV/Excel file upload and parsing
  - Auto-detection of columns from file
- **API Calls:** POST /api/datasets, POST /api/upload-csv/{id}

#### DatasetDetail.js
- **Purpose:** Main workspace for data visualization and analysis
- **Key Features:**
  - Data table with inline editing
  - Add/Edit/Delete rows
  - CSV/Excel import
  - 10 chart type visualizations
  - Chart download as PNG
  - AI prediction generation
  - Sorting and grouping
  - Statistical analysis
- **Components Used:** Recharts, html2canvas
- **API Calls:** Multiple endpoints for data operations

---

### 1.2 Components Module
**Location:** `/app/frontend/src/components/ui/`
**Purpose:** Reusable UI components (Shadcn/UI)

#### Available Components:
- **button.jsx:** Customizable button component
- **card.jsx:** Card container component
- **input.jsx:** Form input component
- **select.jsx:** Dropdown select component
- **table.jsx:** Data table component
- **toast.jsx:** Notification component
- **sonner.jsx:** Toast notification system

---

### 1.3 Hooks Module
**Location:** `/app/frontend/src/hooks/`

#### use-toast.js
- **Purpose:** Toast notification system
- **Usage:** Success/error messages throughout app
- **Features:** Auto-dismiss, variant types, positioning

---

### 1.4 Visualization Module
**Integrated in:** DatasetDetail.js
**Library:** Recharts

#### Supported Chart Types:
1. **Bar Chart:** Vertical bars for comparing values
2. **Horizontal Bar:** Horizontal orientation
3. **Stacked Bar:** Cumulative bars
4. **Line Chart:** Trend visualization over time
5. **Area Chart:** Filled area under line
6. **Scatter Plot:** Point distribution
7. **Radar Chart:** Multi-dimensional data
8. **Composed Chart:** Bar + Line combination
9. **Pie Chart:** Proportional distribution
10. **Histogram:** (Using stacked bar variant)

**Features:**
- Dynamic axis selection
- Color-coded chart types
- Responsive design
- Legend and tooltips
- Grid lines and labels

---

## 2. Backend Modules

### 2.1 Main Application Module
**Location:** `/app/backend/server.py`
**Framework:** FastAPI
**Port:** 8001

#### Core Components:

**FastAPI App Instance:**
- CORS middleware configuration
- API router with `/api` prefix
- Logging setup
- Database connection management

**Database Setup:**
- MongoDB connection via Motor (async)
- Database: test_database
- Collections: datasets, dataset_rows

---

### 2.2 Models Module
**Location:** Defined in server.py
**Framework:** Pydantic

#### DatasetCreate
- **Fields:** name, description, columns
- **Purpose:** Input validation for dataset creation

#### Dataset
- **Fields:** id, name, description, columns, created_at, row_count
- **Purpose:** Dataset representation with metadata

#### DatasetUpdate
- **Fields:** Optional name, description, columns
- **Purpose:** Partial dataset updates

#### DataRowCreate
- **Fields:** dataset_id, data (flexible dict)
- **Purpose:** Input validation for row creation

#### DataRow
- **Fields:** id, dataset_id, data, created_at
- **Purpose:** Individual data record

#### PredictionRequest
- **Fields:** dataset_id, column_name, prediction_points
- **Purpose:** AI prediction request parameters

---

### 2.3 API Routes Module
**Prefix:** /api
**Router:** FastAPI APIRouter

#### Dataset Endpoints:
```
POST   /api/datasets              - Create new dataset
GET    /api/datasets              - List all datasets
GET    /api/datasets/{id}         - Get dataset by ID
PUT    /api/datasets/{id}         - Update dataset
DELETE /api/datasets/{id}         - Delete dataset
```

#### Data Row Endpoints:
```
POST   /api/data-rows             - Create new data row
GET    /api/data-rows/{dataset_id} - Get all rows for dataset
PUT    /api/data-rows/{row_id}    - Update data row
DELETE /api/data-rows/{row_id}    - Delete data row
```

#### File Upload Endpoint:
```
POST   /api/upload-csv/{dataset_id} - Upload CSV/Excel file
```
**Supported Formats:** .csv, .xlsx, .xls
**Parser:** Pandas (read_csv, read_excel)
**Engines:** openpyxl (xlsx), xlrd (xls)

#### AI Prediction Endpoint:
```
POST   /api/predict               - Generate AI predictions
```
**AI Service:** OpenAI GPT-5.2
**Integration:** Emergent LLM Key
**Output:** JSON array of predicted values

---

### 2.4 File Parser Module
**Library:** Pandas
**Location:** Integrated in server.py

#### Functions:

**parse_csv():**
- Reads CSV files using pd.read_csv()
- Handles encoding issues
- Returns DataFrame

**parse_excel():**
- Reads Excel files (.xlsx with openpyxl, .xls with xlrd)
- Auto-detects sheet
- Returns DataFrame

**transform_data():**
- Maps DataFrame columns to dataset schema
- Handles missing values
- Type conversion
- Returns list of data rows

---

### 2.5 AI Service Module
**Library:** emergentintegrations
**Service:** OpenAI GPT-5.2
**Location:** /api/predict endpoint

#### LlmChat Configuration:
```python
chat = LlmChat(
    api_key=EMERGENT_LLM_KEY,
    session_id=f"predict-{dataset_id}",
    system_message="Data analysis expert"
).with_model("openai", "gpt-5.2")
```

#### Prediction Process:
1. Fetch historical data from MongoDB
2. Extract numeric values from selected column
3. Prepare AI prompt with data context
4. Call GPT-5.2 for prediction
5. Parse JSON response
6. Return predicted values (same count as historical data)

**Input:** Historical numeric data array
**Output:** Array of predicted future values
**Count:** Matches historical data count (10 rows → 10 predictions)

---

### 2.6 Statistics Module
**Location:** Frontend (DatasetDetail.js)
**Purpose:** Calculate statistical measures

#### Calculated Statistics:
1. **Count:** Total number of data points
2. **Sum:** Sum of all values
3. **Mean:** Average value (sum / count)
4. **Median:** Middle value when sorted
5. **Mode:** Most frequently occurring value
6. **Min:** Minimum value
7. **Max:** Maximum value

**Algorithm:**
- Filter numeric values
- Sort array
- Apply statistical formulas
- Return formatted results (2 decimal places)

---

## 3. Database Module

### 3.1 MongoDB Collections
**Database:** test_database

#### datasets Collection
**Purpose:** Store dataset metadata

**Schema:**
```json
{
  "id": "uuid-string",
  "name": "Dataset Name",
  "description": "Optional description",
  "columns": [
    {"name": "Column1", "type": "number"},
    {"name": "Column2", "type": "text"}
  ],
  "created_at": "ISO-8601 datetime",
  "row_count": 0
}
```

**Indexes:**
- id (unique)
- created_at

#### dataset_rows Collection
**Purpose:** Store actual data records

**Schema:**
```json
{
  "id": "uuid-string",
  "dataset_id": "parent-dataset-id",
  "data": {
    "Column1": "value1",
    "Column2": "value2",
    "ColumnN": "valueN"
  },
  "created_at": "ISO-8601 datetime"
}
```

**Indexes:**
- id (unique)
- dataset_id (for quick dataset queries)

---

## 4. Utility Modules

### 4.1 Sorting Module
**Location:** Frontend DatasetDetail.js

**Function:** getSortedRows()
- Accepts column name and order (asc/desc)
- Handles numeric and text sorting
- Returns sorted array

### 4.2 Grouping Module
**Location:** Frontend DatasetDetail.js

**Function:** getGroupedData()
- Groups rows by selected column
- Creates object with groups as keys
- Returns grouped structure

### 4.3 Chart Download Module
**Library:** html2canvas
**Location:** Frontend DatasetDetail.js

**Function:** handleDownloadChart()
- Captures chart DOM element
- Converts to canvas
- Exports as PNG image
- Auto-names file: {dataset}_{charttype}_chart.png

### 4.4 Validation Module
**Framework:** Pydantic (Backend)
**Location:** Model definitions

**Features:**
- Type validation
- Required field checking
- Custom validators
- Error messages

---

## 5. Integration Modules

### 5.1 Emergent LLM Integration
**Library:** emergentintegrations
**Purpose:** Universal AI API key
**Supports:** OpenAI, Anthropic, Gemini

**Configuration:**
```python
api_key = os.environ.get('EMERGENT_LLM_KEY')
chat = LlmChat(api_key=api_key).with_model("openai", "gpt-5.2")
```

### 5.2 File Upload Integration
**Libraries:** 
- Pandas (data parsing)
- openpyxl (Excel .xlsx)
- xlrd (Excel .xls)
- FastAPI UploadFile

**Process:**
1. Receive file via multipart/form-data
2. Detect file type by extension
3. Parse using appropriate library
4. Validate against dataset schema
5. Insert rows into MongoDB

---

## 6. Configuration Modules

### 6.1 Environment Configuration
**Files:** 
- /app/backend/.env
- /app/frontend/.env

**Backend Variables:**
- MONGO_URL: MongoDB connection string
- DB_NAME: Database name
- CORS_ORIGINS: Allowed origins
- EMERGENT_LLM_KEY: AI service key

**Frontend Variables:**
- REACT_APP_BACKEND_URL: Backend API URL
- WDS_SOCKET_PORT: Dev server port

### 6.2 Style Configuration
**Files:**
- tailwind.config.js: TailwindCSS settings
- App.css: Custom styles
- index.css: Global styles

**Custom Fonts:**
- Heading: Outfit
- Body: Manrope
- Code: JetBrains Mono

**Color Palette:**
- Primary: Emerald/Teal (#10B981, #14B8A6)
- Secondary: Orange/Red (#F97316, #EF4444)
- Accent: Violet (#7C3AED), Amber (#F59E0B)
- Charts: 10 unique colors for each type

---

## 7. Middleware Modules

### 7.1 CORS Middleware
**Purpose:** Cross-Origin Resource Sharing
**Configuration:**
- Allow credentials: True
- Allow origins: From CORS_ORIGINS env
- Allow methods: All
- Allow headers: All

### 7.2 Error Handling
**Location:** FastAPI exception handlers
**Features:**
- HTTPException for API errors
- Validation errors
- Database errors
- File upload errors
- Structured error responses

### 7.3 Logging Middleware
**Purpose:** Application monitoring
**Configuration:**
- Level: INFO
- Format: timestamp - name - level - message
- Output: Console and file logs
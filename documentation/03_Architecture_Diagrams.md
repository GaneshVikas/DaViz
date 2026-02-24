# Architecture Diagrams for DaViz

## 1. System Architecture (High-Level)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │    Mobile    │  │    Tablet    │          │
│  │   (Chrome,   │  │   Browser    │  │   Browser    │          │
│  │   Firefox)   │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Presentation Layer                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             React Frontend (Port 3000)                    │  │
│  │  • Pages: Landing, Dashboard, Dataset Detail, Create     │  │
│  │  • Components: Charts, Tables, Forms, Statistics         │  │
│  │  • State Management: React Hooks                         │  │
│  │  • Styling: TailwindCSS, Custom CSS                      │  │
│  │  • Charts: Recharts Library (10 types)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           FastAPI Backend (Port 8001)                     │  │
│  │  • API Router: /api endpoints                             │  │
│  │  • Controllers: Dataset, DataRow, Prediction              │  │
│  │  • Business Logic: CRUD, File Upload, Statistics          │  │
│  │  • File Parser: CSV/Excel (Pandas, openpyxl)             │  │
│  │  • AI Integration: OpenAI GPT-5.2 (Emergent LLM)         │  │
│  │  • Middleware: CORS, Error Handling                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │ MongoDB Protocol
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              MongoDB Database                             │  │
│  │  Collections:                                             │  │
│  │  • datasets (metadata, columns, schema)                   │  │
│  │  • dataset_rows (actual data records)                     │  │
│  │  Indexes: id, dataset_id                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              OpenAI GPT-5.2 API                           │  │
│  │  • Predictive Analytics                                   │  │
│  │  • Trend Analysis                                         │  │
│  │  • Future Value Forecasting                               │  │
│  │  Auth: Emergent LLM Key                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture (Detailed)

```
┌───────────────────────────────────────────────────────────────────┐
│                       Frontend Components                          │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Pages     │  │ Components  │  │   Hooks     │              │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤              │
│  │ Landing     │  │ ChartTypes  │  │ useState    │              │
│  │ Dashboard   │  │  • Bar      │  │ useEffect   │              │
│  │ Create      │  │  • Line     │  │ useRef      │              │
│  │ DatasetDtl  │  │  • Pie      │  │ useToast    │              │
│  └─────────────┘  │  • Area     │  └─────────────┘              │
│                   │  • Scatter  │                                │
│  ┌─────────────┐  │  • Radar    │  ┌─────────────┐              │
│  │  Utilities  │  │  • etc.     │  │   Styles    │              │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤              │
│  │ axios       │  │ DataTable   │  │ TailwindCSS │              │
│  │ html2canvas │  │ Statistics  │  │ App.css     │              │
│  │ recharts    │  │ SortBar     │  │ index.css   │              │
│  │ papaparse   │  │ GroupBar    │  └─────────────┘              │
│  └─────────────┘  │ AIPanel     │                                │
│                   └─────────────┘                                │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                       Backend Components                           │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Models    │  │   Routes    │  │  Services   │              │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤              │
│  │ Dataset     │  │ /datasets   │  │ FileParser  │              │
│  │ DataRow     │  │ /data-rows  │  │ AIService   │              │
│  │ Column      │  │ /upload-csv │  │ StatService │              │
│  │ Prediction  │  │ /predict    │  │ Validator   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Middleware  │  │  Database   │  │  External   │              │
│  ├─────────────┤  ├─────────────┤  ├─────────────┤              │
│  │ CORS        │  │ MongoDB     │  │ OpenAI API  │              │
│  │ ErrorHandle │  │ Motor       │  │ Emergent    │              │
│  │ Logging     │  │ AsyncIO     │  │ Integration │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└───────────────────────────────────────────────────────────────────┘
```

---

## 3. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Ingress Controller                         │    │
│  │  • Routes /api/* → Backend Service                      │    │
│  │  • Routes /* → Frontend Service                         │    │
│  │  • SSL Termination                                      │    │
│  └────────────────────────────────────────────────────────┘    │
│                    │                    │                        │
│                    ▼                    ▼                        │
│  ┌─────────────────────────┐  ┌─────────────────────────┐      │
│  │   Frontend Pod          │  │   Backend Pod           │      │
│  │   ┌─────────────────┐   │  │   ┌─────────────────┐   │      │
│  │   │  React App      │   │  │   │  FastAPI App    │   │      │
│  │   │  Port: 3000     │   │  │   │  Port: 8001     │   │      │
│  │   │  Node.js        │   │  │   │  Python 3.11    │   │      │
│  │   └─────────────────┘   │  │   └─────────────────┘   │      │
│  │   • Hot Reload          │  │   • Hot Reload          │      │
│  │   • Nginx Proxy         │  │   • Uvicorn Server      │      │
│  └─────────────────────────┘  └─────────────────────────┘      │
│                                          │                       │
│                                          │                       │
│                                          ▼                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              MongoDB Pod                              │      │
│  │  • Database: test_database                            │      │
│  │  • Collections: datasets, dataset_rows                │      │
│  │  • Persistent Volume                                  │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

                            │
                            │ HTTPS
                            ▼
            ┌───────────────────────────────┐
            │   External API Service        │
            │   OpenAI GPT-5.2             │
            │   (via Emergent LLM Key)     │
            └───────────────────────────────┘
```

---

## 4. Data Flow Architecture

```
┌──────────┐                    ┌──────────────┐
│  User    │◄──────────────────►│   Browser    │
└──────────┘   User Actions     └──────┬───────┘
                                       │
                                       │ HTTP Request
                                       ▼
                              ┌─────────────────┐
                              │  React Router   │
                              │  (Frontend)     │
                              └────────┬────────┘
                                       │
                                       │ Component Load
                                       ▼
                              ┌─────────────────┐
                              │   Page/Component│
                              │   Rendering     │
                              └────────┬────────┘
                                       │
                                       │ API Call (axios)
                                       ▼
                              ┌─────────────────┐
                              │  REST API       │
                              │  /api/*         │
                              └────────┬────────┘
                                       │
                                       │ Route to Handler
                                       ▼
                              ┌─────────────────┐
                              │  FastAPI        │
                              │  Endpoint       │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
         ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
         │   MongoDB    │   │ File Parser  │   │  AI Service  │
         │   Query      │   │  (Pandas)    │   │  (OpenAI)    │
         └──────┬───────┘   └──────┬───────┘   └──────┬───────┘
                │                  │                  │
                │ Data             │ Parsed Data      │ Predictions
                │                  │                  │
                └──────────────────┴──────────────────┘
                                   │
                                   │ Response
                                   ▼
                              ┌─────────────────┐
                              │  JSON Response  │
                              └────────┬────────┘
                                       │
                                       │ Render
                                       ▼
                              ┌─────────────────┐
                              │   UI Update     │
                              │   (Charts,      │
                              │    Tables)      │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │  User Sees      │
                              │  Results        │
                              └─────────────────┘
```

---

## 5. Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Security Layers                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Layer 1: Network Security                              │    │
│  │  • HTTPS/TLS Encryption                                 │    │
│  │  • CORS Policy (Configured Origins)                     │    │
│  │  • API Rate Limiting                                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Layer 2: Application Security                          │    │
│  │  • Input Validation (Pydantic Models)                   │    │
│  │  • File Type Validation (.csv, .xlsx, .xls only)        │    │
│  │  • SQL Injection Prevention (MongoDB NoSQL)             │    │
│  │  • XSS Protection (React Auto-escaping)                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Layer 3: Data Security                                 │    │
│  │  • Environment Variables for Secrets                    │    │
│  │  • API Key Encryption (Emergent LLM Key)                │    │
│  │  • Database Connection Security                          │    │
│  │  • ObjectId Exclusion (No _id in responses)             │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Layer 4: File Security                                 │    │
│  │  • File Size Limits                                     │    │
│  │  • Content Type Verification                            │    │
│  │  • Pandas Safe Parsing                                  │    │
│  │  • Temporary File Cleanup                               │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```
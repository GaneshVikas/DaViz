# DaViz - Product Requirements Document

## Overview
DaViz is a user-friendly, web-based data visualization and analytics platform designed to simplify data handling and interpretation through an intuitive and visually appealing interface. It enables users to store, manage, and visualize data without requiring prior knowledge of databases or programming.

## Tech Stack
- **Backend**: FastAPI (Python)
- **Frontend**: React.js with TailwindCSS + Shadcn UI
- **Database**: MongoDB
- **AI Integration**: GPT-5.2 via Emergent LLM Key
- **Data Visualization**: Recharts library
- **Image Export**: html2canvas

## Core Features

### 1. Data Management
- Create datasets manually or via CSV/Excel file upload
- Add, edit, delete rows within datasets
- Delete entire datasets from dashboard
- Support for multiple column types (text, number)

### 2. Data Visualization (10 Chart Types)
- Bar Chart
- Horizontal Bar Chart
- Stacked Bar Chart
- Line Chart
- Area Chart
- Scatter Plot
- Radar Chart
- Composed Chart (Bar + Line)
- Pie Chart

### 3. Data Operations Toolbar
- Sort data by any column (ascending/descending)
- Group data by any column with aggregation
- Calculate statistics: count, sum, mean, median, mode, min, max
- **Charts now update in real-time** based on sort/group selections

### 4. AI Predictions (GPT-5.2)
- Generate future value predictions based on historical data
- Separate prediction chart for forecasted values
- Shows number of predictions matching historical data points

### 5. AI Insights Dashboard Panel (IMPROVED - Dec 2025)
- Wider panel (440px) for better readability
- Displays: Row count, Column count, Current chart type with icons
- **Animated mini-charts**: Bar chart preview and trend line animations
- **Structured insights**: Key Patterns, Data Quality, Recommendations sections
- Color-coded insight cards with icons
- Visual animations for loading and content appearance
- Context-aware based on selected Y-axis column and chart type

### 6. Tutorial Chatbot (IMPROVED - Dec 2025)
- Floating chat button (bottom-right corner) with dataset indicator
- **Context-aware**: Automatically reads current dataset columns, row count, and sample data
- GPT-5.2 analyzes actual data patterns when answering questions
- Shows "Viewing: [dataset name]" in header when on dataset page
- Quick suggestion buttons tailored to current context
- Conversation history maintained within session
- No longer asks user to describe data - chatbot observes data directly

### 7. Chart Download
- Download any chart as PNG image
- Uses html2canvas for high-quality exports

### 8. Direct Database Connection (NEW - Dec 2025)
- Connect to external databases: MySQL, PostgreSQL, SQLite
- 3-step wizard: Connect → Select Table → Preview & Import
- Test connection before proceeding
- Browse and select tables from connected database
- Preview columns and sample data (first 10 rows)
- Import entire tables into DaViz datasets
- Automatic data type mapping (numbers detected automatically)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/datasets | Create new dataset |
| GET | /api/datasets | List all datasets |
| GET | /api/datasets/{id} | Get single dataset |
| DELETE | /api/datasets/{id} | Delete dataset |
| POST | /api/data-rows | Add row to dataset |
| GET | /api/data-rows/{dataset_id} | Get all rows |
| PUT | /api/data-rows/{row_id} | Update row |
| DELETE | /api/data-rows/{row_id} | Delete row |
| POST | /api/upload-csv/{dataset_id} | Import CSV/Excel |
| POST | /api/predict | Generate AI predictions |
| POST | /api/chat | Chatbot conversation |
| POST | /api/insights | Generate AI insights |
| POST | /api/database/test-connection | Test database connection |
| POST | /api/database/tables | List tables in database |
| POST | /api/database/table-info | Get table columns and preview |
| POST | /api/database/import | Import table into DaViz |

## File Structure
```
/app/
├── backend/
│   ├── server.py          # FastAPI app, all API endpoints
│   └── tests/             # Backend tests
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.js
│   │   │   ├── Dashboard.js
│   │   │   ├── CreateDataset.js
│   │   │   ├── DatabaseConnect.js  # Database connection (NEW)
│   │   │   └── DatasetDetail.js    # Main visualization page
│   │   └── components/
│   │       ├── Chatbot.js          # Tutorial chatbot
│   │       ├── InsightsPanel.js    # AI insights panel
│   │       └── ui/                 # Shadcn components
└── test_reports/
```

## Completed Work

### December 2025 (Session 2)
- ✅ Direct Database Connection feature (MySQL, PostgreSQL, SQLite)
- ✅ DatabaseConnect.js page with 3-step wizard
- ✅ Backend endpoints for database operations
- ✅ "Connect Database" button added to Dashboard

### December 2025 (Session 1)
- ✅ Charts follow sort/group operations in real-time
- ✅ AI Insights Dashboard Panel (wider, better formatting, animations)
- ✅ Tutorial Chatbot with dataset context awareness
- ✅ Testing completed: 100% pass rate (iteration_2.json)

### Previous Sessions
- ✅ Full application scaffolding (FastAPI + React)
- ✅ 10 chart types with Recharts
- ✅ AI predictions with GPT-5.2
- ✅ CSV/Excel file import
- ✅ Data operations toolbar (sort, group, statistics)
- ✅ Chart download as PNG
- ✅ Custom branding (logo, hero image, multi-color theme)
- ✅ Removed all Emergent branding

## Backlog / Future Tasks

### P1 - High Priority
- [ ] User authentication & multi-user support

### P2 - Medium Priority
- [ ] Real-time collaboration on datasets
- [ ] Advanced filtering/search within datasets
- [ ] Export datasets to JSON format
- [ ] Advanced chart customization (colors, labels, legends)
- [ ] Custom SQL query support for database imports

### P3 - Low Priority
- [ ] Dataset templates for common use cases
- [ ] Customizable dashboard layouts
- [ ] Scheduled data refresh from connected databases

## Known Issues
- Minor: Insights panel may overlap chart area on smaller viewports (LOW priority)

## Refactoring Notes
- Consider breaking down DatasetDetail.js (800+ lines) into smaller components:
  - DataOperationsToolbar.js
  - StatisticsPanel.js
  - ChartContainer.js
  - AIPredictionView.js

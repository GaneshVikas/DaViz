# Data Flow Diagrams (DFD) for DaViz

## Level 0 - Context Diagram

```
                    ┌──────────────────────┐
                    │                      │
     ┌──────────────│    External User     │──────────────┐
     │              │   (Student/Analyst)  │              │
     │              └──────────────────────┘              │
     │                                                    │
     │ Dataset Info                         Visualizations│
     │ CSV/Excel Files                      Statistics    │
     │ Analysis Requests                    Predictions   │
     │                                                    │
     ▼                                                    │
┌─────────────────────────────────────────────────────┐  │
│                                                     │  │
│              DaViz System                           │  │
│      (Data Visualization & Analysis)                │  │
│                                                     │  │
└─────────────────────────────────────────────────────┘  │
     │                                                    │
     │ Prediction Requests                                │
     │ Historical Data                                    │
     │                                                    │
     ▼                                                    │
┌──────────────────────┐                                 │
│                      │                                 │
│   OpenAI GPT-5.2     │─────────────────────────────────┘
│   (AI Service)       │        Predicted Values
│                      │
└──────────────────────┘
```

---

## Level 1 - Major Processes

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ Dataset Info
     ▼
┌─────────────────┐      Dataset Metadata    ┌──────────────┐
│   1.0           │───────────────────────────>│              │
│ Dataset         │                            │   MongoDB    │
│ Management      │<───────────────────────────│   Database   │
└─────────────────┘      Retrieved Data        │              │
     │                                          └──────────────┘
     │ Dataset ID                                     ▲
     ▼                                                │
┌─────────────────┐      Data Rows                   │
│   2.0           │───────────────────────────────────┘
│ Data            │                                   │
│ Operations      │<──────────────────────────────────┘
└─────────────────┘      CSV/Excel Files
     │
     │ Processed Data
     ▼
┌─────────────────┐
│   3.0           │
│ Visualization   │
│ Generation      │
└─────────────────┘
     │
     │ Data + Column
     ▼
┌─────────────────┐      Prediction Request   ┌──────────────┐
│   4.0           │───────────────────────────>│              │
│ AI Prediction   │                            │   OpenAI     │
│ Engine          │<───────────────────────────│   GPT-5.2    │
└─────────────────┘      Predicted Values      │              │
     │                                          └──────────────┘
     │ Results
     ▼
┌─────────────────┐
│   5.0           │
│ Statistical     │
│ Analysis        │
└─────────────────┘
     │
     │ Charts, Stats, Predictions
     ▼
┌──────────┐
│  User    │
└──────────┘
```

---

## Level 2 - Detailed Processes

### 2.1 Dataset Management Process

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ Create Request
     ▼
┌─────────────────┐      Validate          ┌──────────────┐
│   1.1           │─────────────────────────>│              │
│ Create Dataset  │                          │   Validator  │
│                 │<─────────────────────────│              │
└─────────────────┘      Valid Data         └──────────────┘
     │
     │ Dataset Schema
     ▼
┌─────────────────┐                         ┌──────────────┐
│   1.2           │─────────────────────────>│              │
│ Store Dataset   │      Write Operation    │   MongoDB    │
│                 │<─────────────────────────│              │
└─────────────────┘      Confirmation        └──────────────┘
     │
     │ Dataset ID
     ▼
┌─────────────────┐
│   1.3           │
│ Return Dataset  │
│ Details         │
└─────────────────┘
     │
     ▼
┌──────────┐
│  User    │
└──────────┘
```

### 2.2 Data Operations Process

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ Upload File
     ▼
┌─────────────────┐                         ┌──────────────┐
│   2.1           │─────────────────────────>│              │
│ Parse File      │      File Content       │ File Parser  │
│ (CSV/Excel)     │<─────────────────────────│ (Pandas)     │
└─────────────────┘      Parsed Rows        └──────────────┘
     │
     │ Row Data
     ▼
┌─────────────────┐
│   2.2           │
│ Validate &      │
│ Transform       │
└─────────────────┘
     │
     │ Clean Data
     ▼
┌─────────────────┐                         ┌──────────────┐
│   2.3           │─────────────────────────>│              │
│ Store Data      │      Insert Rows        │   MongoDB    │
│ Rows            │<─────────────────────────│              │
└─────────────────┘      Success             └──────────────┘
     │
     │ Confirmation
     ▼
┌──────────┐
│  User    │
└──────────┘
```

### 2.3 Visualization Generation Process

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ Chart Type + Axes
     ▼
┌─────────────────┐                         ┌──────────────┐
│   3.1           │─────────────────────────>│              │
│ Fetch Data      │      Query              │   MongoDB    │
│                 │<─────────────────────────│              │
└─────────────────┘      Data Rows          └──────────────┘
     │
     │ Raw Data
     ▼
┌─────────────────┐
│   3.2           │
│ Process &       │
│ Sort/Group      │
└─────────────────┘
     │
     │ Processed Data
     ▼
┌─────────────────┐
│   3.3           │
│ Generate Chart  │
│ (Recharts)      │
└─────────────────┘
     │
     │ Rendered Chart
     ▼
┌──────────┐
│  User    │
└──────────┘
```

### 2.4 AI Prediction Process

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ Predict Request
     ▼
┌─────────────────┐                         ┌──────────────┐
│   4.1           │─────────────────────────>│              │
│ Fetch           │      Query              │   MongoDB    │
│ Historical Data │<─────────────────────────│              │
└─────────────────┘      Data Rows          └──────────────┘
     │
     │ Numeric Values
     ▼
┌─────────────────┐
│   4.2           │
│ Prepare Prompt  │
│ & Context       │
└─────────────────┘
     │
     │ AI Prompt
     ▼
┌─────────────────┐                         ┌──────────────┐
│   4.3           │─────────────────────────>│              │
│ Call AI Service │      API Request        │   OpenAI     │
│                 │<─────────────────────────│   GPT-5.2    │
└─────────────────┘      Predictions        └──────────────┘
     │
     │ Predicted Values
     ▼
┌─────────────────┐
│   4.4           │
│ Parse & Format  │
│ Results         │
└─────────────────┘
     │
     │ Formatted Predictions
     ▼
┌──────────┐
│  User    │
└──────────┘
```

### 2.5 Statistical Analysis Process

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ Column Selection
     ▼
┌─────────────────┐                         ┌──────────────┐
│   5.1           │─────────────────────────>│              │
│ Extract Numeric │      Query              │   MongoDB    │
│ Values          │<─────────────────────────│              │
└─────────────────┘      Column Data        └──────────────┘
     │
     │ Numeric Array
     ▼
┌─────────────────┐
│   5.2           │
│ Calculate       │
│ Statistics      │
│ (Count, Sum,    │
│  Mean, Median,  │
│  Mode, Min, Max)│
└─────────────────┘
     │
     │ Statistical Results
     ▼
┌─────────────────┐
│   5.3           │
│ Format &        │
│ Display         │
└─────────────────┘
     │
     │ Formatted Stats
     ▼
┌──────────┐
│  User    │
└──────────┘
```
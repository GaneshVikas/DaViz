# UML Diagrams for DaViz

## 1. Use Case Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DaViz System                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │  • Create Dataset                                     │  │
│  │  • Import CSV/Excel                                   │  │
│  │  • Add/Edit/Delete Rows                               │  │
│  │  • View Visualizations                                │  │
│  │  • Download Charts                                    │  │
│  │  • Generate AI Predictions                            │  │
│  │  • Sort Data                                          │  │
│  │  • Group Data                                         │  │
│  │  • Calculate Statistics                               │  │
│  │  • Delete Dataset                                     │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
        ↑                                          ↑
        │                                          │
   [User/Student]                           [AI Service]
   [Business User]                          (GPT-5.2)
   [Analyst]
```

### Use Cases:

**Primary Actors:** End Users (Students, Business Analysts, Non-technical Users)
**Secondary Actors:** AI Service (OpenAI GPT-5.2)

**Use Cases:**
1. **Create Dataset**: User creates a new dataset with custom columns
2. **Import Data**: User uploads CSV or Excel files
3. **Manage Data**: Add, edit, or delete individual data rows
4. **Visualize Data**: View data in 10 different chart types
5. **Download Charts**: Export visualizations as PNG images
6. **AI Predictions**: Generate future predictions using AI
7. **Data Operations**: Sort, group, and analyze data
8. **Statistical Analysis**: Calculate mean, median, mode, min, max
9. **Dataset Management**: Delete entire datasets

---

## 2. Class Diagram

```
┌─────────────────────────┐
│      Dataset            │
├─────────────────────────┤
│ - id: String            │
│ - name: String          │
│ - description: String   │
│ - columns: Column[]     │
│ - created_at: DateTime  │
│ - row_count: Integer    │
├─────────────────────────┤
│ + create()              │
│ + update()              │
│ + delete()              │
│ + getById()             │
└─────────────────────────┘
         │ 1
         │ has
         │ *
         ▼
┌─────────────────────────┐
│      DataRow            │
├─────────────────────────┤
│ - id: String            │
│ - dataset_id: String    │
│ - data: Object          │
│ - created_at: DateTime  │
├─────────────────────────┤
│ + create()              │
│ + update()              │
│ + delete()              │
│ + getByDatasetId()      │
└─────────────────────────┘

┌─────────────────────────┐
│      Column             │
├─────────────────────────┤
│ - name: String          │
│ - type: String          │
├─────────────────────────┤
│ + validate()            │
└─────────────────────────┘

┌─────────────────────────┐
│   Visualization         │
├─────────────────────────┤
│ - type: ChartType       │
│ - xAxis: String         │
│ - yAxis: String         │
│ - data: DataRow[]       │
├─────────────────────────┤
│ + render()              │
│ + download()            │
│ + switchType()          │
└─────────────────────────┘

┌─────────────────────────┐
│    Prediction           │
├─────────────────────────┤
│ - dataset_id: String    │
│ - column_name: String   │
│ - predictions: Float[]  │
│ - historical_count: Int │
├─────────────────────────┤
│ + generate()            │
│ + visualize()           │
└─────────────────────────┘

┌─────────────────────────┐
│    Statistics           │
├─────────────────────────┤
│ - count: Integer        │
│ - sum: Float            │
│ - mean: Float           │
│ - median: Float         │
│ - mode: Float           │
│ - min: Float            │
│ - max: Float            │
├─────────────────────────┤
│ + calculate()           │
│ + display()             │
└─────────────────────────┘
```

---

## 3. Sequence Diagram - Create Dataset with CSV Import

```
User        Frontend      Backend       MongoDB      FileParser
 │              │            │             │              │
 │──Create──────>│            │             │              │
 │              │            │             │              │
 │              │──POST /datasets──>       │              │
 │              │            │             │              │
 │              │            │──Insert─────>│              │
 │              │            │<─Success────│              │
 │              │<─Dataset Created──        │              │
 │              │            │             │              │
 │──Upload CSV──>│            │             │              │
 │              │            │             │              │
 │              │──POST /upload-csv/{id}──>│              │
 │              │            │             │              │
 │              │            │──────────────────Parse─────>│
 │              │            │<─────────────Parsed Data────│
 │              │            │             │              │
 │              │            │──Insert Rows────>          │
 │              │            │<─Success────│              │
 │              │<─Upload Success──        │              │
 │<─Display─────│            │             │              │
```

---

## 4. Sequence Diagram - AI Prediction Generation

```
User      Frontend    Backend    MongoDB    OpenAI GPT-5.2
 │            │          │          │              │
 │──Click AI──>│          │          │              │
 │  Predict    │          │          │              │
 │            │          │          │              │
 │            │──POST /predict──>   │              │
 │            │          │          │              │
 │            │          │──Get Rows────>          │
 │            │          │<─Data────│              │
 │            │          │          │              │
 │            │          │──────────────Generate────>│
 │            │          │<─────────────Predictions──│
 │            │          │          │              │
 │            │<─Predictions──       │              │
 │            │          │          │              │
 │<─Display───│          │          │              │
 │  Chart     │          │          │              │
```

---

## 5. Activity Diagram - Data Visualization Workflow

```
     [Start]
        │
        ▼
  ┌─────────────┐
  │ Select      │
  │ Dataset     │
  └─────────────┘
        │
        ▼
  ┌─────────────┐
  │ View Data   │
  │ Table       │
  └─────────────┘
        │
     ┌──┴──┐
     │     │
     ▼     ▼
┌────────┐ ┌────────┐
│ Sort   │ │ Group  │
│ Data   │ │ Data   │
└────────┘ └────────┘
     │     │
     └──┬──┘
        ▼
  ┌─────────────┐
  │ Select      │
  │ Chart Type  │
  └─────────────┘
        │
        ▼
  ┌─────────────┐
  │ Configure   │
  │ Axes        │
  └─────────────┘
        │
        ▼
  ┌─────────────┐
  │ View        │
  │ Visualization│
  └─────────────┘
        │
     ┌──┴──┐
     │     │
     ▼     ▼
┌────────┐ ┌────────┐
│Download│ │Generate│
│Chart   │ │AI Pred │
└────────┘ └────────┘
     │     │
     └──┬──┘
        ▼
     [End]
```

---

## 6. State Diagram - Dataset Lifecycle

```
     [Initial]
        │
        ▼
   ┌─────────┐
   │ Created │
   └─────────┘
        │
        ▼
   ┌─────────┐
   │  Empty  │◄─────┐
   └─────────┘      │
        │           │
        │ Add Data  │
        ▼           │
   ┌─────────┐      │
   │Populated│      │
   └─────────┘      │
        │           │
     ┌──┴──┐        │
     │     │        │
     ▼     ▼        │
┌────────┐ ┌────────┐
│Visualiz│ │Analyzed│
│  ing   │ │        │
└────────┘ └────────┘
     │     │
     └──┬──┘
        │
        ▼
   ┌─────────┐
   │ Deleted │
   └─────────┘
        │
        ▼
     [End]
```
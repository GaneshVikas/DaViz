# Technology Stack for DaViz

## Frontend Technologies

### Core Framework
- **React 18.x:** Component-based UI library
- **React Router:** Client-side routing
- **React Hooks:** State management (useState, useEffect, useRef)

### UI Libraries
- **TailwindCSS 3.x:** Utility-first CSS framework
- **Shadcn/UI:** Pre-built accessible components
- **Lucide React:** Icon library
- **Recharts:** Chart visualization library (10 chart types)

### Data Handling
- **Axios:** HTTP client for API calls
- **PapaParse:** CSV parsing
- **xlsx:** Excel file parsing

### Utilities
- **html2canvas:** Chart image export
- **Sonner:** Toast notifications

---

## Backend Technologies

### Core Framework
- **FastAPI 0.104+:** Modern Python web framework
- **Python 3.11+:** Programming language
- **Uvicorn:** ASGI server
- **Pydantic 2.x:** Data validation

### Database
- **MongoDB 6.x:** NoSQL database
- **Motor:** Async MongoDB driver

### Data Processing
- **Pandas 2.x:** Data analysis and manipulation
- **openpyxl:** Excel .xlsx file handling
- **xlrd:** Excel .xls file handling

### AI Integration
- **emergentintegrations:** Universal LLM library
- **OpenAI GPT-5.2:** AI prediction model

### Utilities
- **python-dotenv:** Environment variables
- **python-multipart:** File upload handling

---

## DevOps & Deployment

### Containerization
- **Docker:** Container platform
- **Kubernetes:** Container orchestration

### Process Management
- **Supervisor:** Service management
- **Hot Reload:** Development productivity

### Web Server
- **Nginx:** Reverse proxy (production)
- **Kubernetes Ingress:** Traffic routing

---

## Development Tools

### Version Control
- **Git:** Source code management

### Package Managers
- **Yarn:** Frontend dependencies
- **pip:** Backend dependencies

### Build Tools
- **Webpack:** Module bundler (via Create React App)
- **Babel:** JavaScript transpiler

---

## Architecture Patterns

### Frontend
- **Component-Based Architecture**
- **Hooks Pattern** for state management
- **Container/Presentational** component pattern

### Backend
- **REST API** architecture
- **MVC Pattern** (Model-View-Controller)
- **Repository Pattern** for database access
- **Async/Await** for non-blocking operations

### Database
- **Document-Oriented** database model
- **Collection-Based** data organization
- **NoSQL** flexible schema

---

## Security

- **CORS:** Cross-origin protection
- **HTTPS/TLS:** Encrypted communication
- **Environment Variables:** Secret management
- **Input Validation:** Pydantic models
- **File Type Validation:** Safe file uploads

---

## Performance Optimization

- **Async I/O:** Non-blocking operations
- **Connection Pooling:** Database efficiency
- **Code Splitting:** Lazy loading
- **Memoization:** React optimization
- **Indexing:** Database query optimization
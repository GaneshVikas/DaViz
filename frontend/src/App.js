import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import CreateDataset from "./pages/CreateDataset";
import DatasetDetail from "./pages/DatasetDetail";
import DatabaseConnect from "./pages/DatabaseConnect";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-dataset" element={<CreateDataset />} />
          <Route path="/connect-database" element={<DatabaseConnect />} />
          <Route path="/dataset/:id" element={<DatasetDetail />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;

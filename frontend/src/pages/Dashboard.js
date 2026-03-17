import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Database, TrendingUp, BarChart3, Trash2, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await axios.get(`${API}/datasets`);
      setDatasets(response.data);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDataset = async (e, datasetId, datasetName) => {
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete "${datasetName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.delete(`${API}/datasets/${datasetId}`);
      toast({
        title: 'Success',
        description: 'Dataset deleted successfully'
      });
      fetchDatasets();
    } catch (error) {
      console.error('Error deleting dataset:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete dataset',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 cursor-pointer"
              data-testid="logo-link"
            >
              <img 
                src="https://customer-assets.emergentagent.com/job_insight-hub-233/artifacts/mg1m3zuv_WhatsApp%20Image%202026-01-25%20at%201.31.18%20PM.jpeg" 
                alt="DaViz Logo" 
                className="w-12 h-12 object-contain"
              />
              <h1 className="text-2xl font-bold font-heading text-slate-900">DaViz</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/connect-database')}
                data-testid="connect-database-btn"
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 rounded-full px-5 py-2.5 font-semibold shadow-lg shadow-indigo-500/20 transition-transform hover:-translate-y-0.5 active:scale-95 flex items-center space-x-2"
              >
                <Server className="w-4 h-4" strokeWidth={2} />
                <span>Connect Database</span>
              </button>
              <button
                onClick={() => navigate('/create-dataset')}
                data-testid="create-dataset-btn"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 rounded-full px-6 py-2.5 font-semibold shadow-lg shadow-emerald-500/20 transition-transform hover:-translate-y-0.5 active:scale-95 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" strokeWidth={2} />
                <span>New Dataset</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-bold font-heading text-slate-900 mb-2">Your Datasets</h2>
          <p className="text-slate-600">Manage, visualize, and analyze your data</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20" data-testid="loading-state">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-600 border-t-transparent"></div>
          </div>
        ) : datasets.length === 0 ? (
          <div className="text-center py-20" data-testid="empty-state">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Database className="w-12 h-12 text-amber-600" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold font-heading text-slate-900 mb-3">No datasets yet</h3>
            <p className="text-slate-600 mb-8">Create your first dataset to get started with data visualization</p>
            <button
              onClick={() => navigate('/create-dataset')}
              data-testid="create-first-dataset-btn"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 rounded-full px-8 py-3 font-semibold shadow-lg shadow-emerald-500/20 transition-transform hover:-translate-y-0.5 active:scale-95 inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" strokeWidth={2} />
              <span>Create Dataset</span>
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="datasets-grid">
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-lg hover:border-emerald-200 transition-all group relative"
                data-testid={`dataset-card-${dataset.id}`}
              >
                <button
                  onClick={(e) => handleDeleteDataset(e, dataset.id, dataset.name)}
                  data-testid={`delete-dataset-${dataset.id}`}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                  title="Delete dataset"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                </button>
                
                <div 
                  onClick={() => navigate(`/dataset/${dataset.id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Database className="w-6 h-6 text-emerald-600" strokeWidth={2} />
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                      <TrendingUp className="w-4 h-4" strokeWidth={2} />
                      <span>{dataset.row_count} rows</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold font-heading text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors" data-testid={`dataset-name-${dataset.id}`}>
                    {dataset.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {dataset.description || 'No description provided'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{dataset.columns?.length || 0} columns</span>
                    <span>{new Date(dataset.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
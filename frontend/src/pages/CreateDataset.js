import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CreateDataset = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [columns, setColumns] = useState([{ name: 'Column 1', type: 'text' }]);
  const [loading, setLoading] = useState(false);

  const addColumn = () => {
    setColumns([...columns, { name: `Column ${columns.length + 1}`, type: 'text' }]);
  };

  const removeColumn = (index) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  const updateColumn = (index, field, value) => {
    const updated = [...columns];
    updated[index][field] = value;
    setColumns(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a dataset name',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/datasets`, {
        name: name.trim(),
        description: description.trim(),
        columns
      });
      toast({
        title: 'Success',
        description: 'Dataset created successfully'
      });
      navigate(`/dataset/${response.data.id}`);
    } catch (error) {
      console.error('Error creating dataset:', error);
      toast({
        title: 'Error',
        description: 'Failed to create dataset',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            data-testid="back-to-dashboard-btn"
            className="flex items-center space-x-2 text-slate-600 hover:text-violet-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-4xl font-bold font-heading text-slate-900 mb-2">Create New Dataset</h2>
          <p className="text-slate-600">Define your dataset structure and start collecting data</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <h3 className="text-xl font-bold font-heading text-slate-900 mb-6">Basic Information</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="dataset-name">
                  Dataset Name
                </label>
                <input
                  id="dataset-name"
                  data-testid="dataset-name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 rounded-lg h-12 px-4 text-slate-900 placeholder:text-slate-400 transition-all"
                  placeholder="e.g., Sales Data 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="dataset-description">
                  Description (Optional)
                </label>
                <textarea
                  id="dataset-description"
                  data-testid="dataset-description-input"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 rounded-lg px-4 py-3 text-slate-900 placeholder:text-slate-400 transition-all"
                  placeholder="Brief description of your dataset"
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-heading text-slate-900">Columns</h3>
              <button
                type="button"
                onClick={addColumn}
                data-testid="add-column-btn"
                className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg px-4 py-2 font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>Add Column</span>
              </button>
            </div>

            <div className="space-y-4">
              {columns.map((column, index) => (
                <div key={index} className="flex items-center space-x-4" data-testid={`column-row-${index}`}>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) => updateColumn(index, 'name', e.target.value)}
                      data-testid={`column-name-input-${index}`}
                      className="w-full bg-white border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 rounded-lg h-12 px-4 text-slate-900 placeholder:text-slate-400 transition-all"
                      placeholder="Column name"
                    />
                  </div>
                  <div className="w-40">
                    <select
                      value={column.type}
                      onChange={(e) => updateColumn(index, 'type', e.target.value)}
                      data-testid={`column-type-select-${index}`}
                      className="w-full bg-white border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 rounded-lg h-12 px-4 text-slate-900 transition-all"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeColumn(index)}
                    disabled={columns.length === 1}
                    data-testid={`remove-column-btn-${index}`}
                    className="text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              data-testid="cancel-btn"
              className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-full px-8 py-3 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              data-testid="create-dataset-submit-btn"
              className="bg-violet-600 text-white hover:bg-violet-700 rounded-full px-8 py-3 font-semibold shadow-lg shadow-violet-500/20 transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Dataset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDataset;
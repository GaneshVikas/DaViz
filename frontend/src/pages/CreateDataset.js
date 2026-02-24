import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, Upload, X } from 'lucide-react';
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
  const [csvFile, setCsvFile] = useState(null);
  const [creationMode, setCreationMode] = useState('manual'); // 'manual' or 'csv'

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFile(file);
    
    // Parse CSV to extract columns
    try {
      const text = await file.text();
      const lines = text.split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim());
        const detectedColumns = headers.map(header => ({
          name: header,
          type: 'text'
        }));
        setColumns(detectedColumns);
        toast({
          title: 'CSV Detected',
          description: `Found ${detectedColumns.length} columns`
        });
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
    }
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

      // If CSV file is provided, upload it
      if (csvFile) {
        const formData = new FormData();
        formData.append('file', csvFile);
        
        try {
          await axios.post(`${API}/upload-csv/${response.data.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          toast({
            title: 'Success',
            description: 'Dataset created and CSV data imported'
          });
        } catch (uploadError) {
          console.error('Error uploading CSV:', uploadError);
          toast({
            title: 'Partial Success',
            description: 'Dataset created but CSV upload failed',
            variant: 'destructive'
          });
        }
      } else {
        toast({
          title: 'Success',
          description: 'Dataset created successfully'
        });
      }
      
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

        <div className="mb-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-bold font-heading text-slate-900 mb-4">How would you like to create your dataset?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setCreationMode('manual');
                setCsvFile(null);
              }}
              data-testid="manual-mode-btn"
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                creationMode === 'manual'
                  ? 'border-violet-600 bg-violet-50'
                  : 'border-slate-200 hover:border-violet-300'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  creationMode === 'manual' ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-slate-100'
                }`}>
                  <Plus className={`w-6 h-6 ${creationMode === 'manual' ? 'text-white' : 'text-slate-600'}`} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Manual Entry</h4>
                  <p className="text-sm text-slate-600">Define columns manually and add data later</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCreationMode('csv')}
              data-testid="csv-mode-btn"
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                creationMode === 'csv'
                  ? 'border-amber-600 bg-amber-50'
                  : 'border-slate-200 hover:border-amber-300'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  creationMode === 'csv' ? 'bg-gradient-to-br from-amber-500 to-yellow-500' : 'bg-slate-100'
                }`}>
                  <Upload className={`w-6 h-6 ${creationMode === 'csv' ? 'text-white' : 'text-slate-600'}`} strokeWidth={2} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Import from CSV/Excel</h4>
                  <p className="text-sm text-slate-600">Upload a CSV or Excel file to auto-detect columns</p>
                </div>
              </div>
            </button>
          </div>
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

          {creationMode === 'csv' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <h3 className="text-xl font-bold font-heading text-slate-900 mb-6">Upload CSV or Excel File</h3>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-violet-400 transition-colors">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" strokeWidth={1.5} />
                <label className="cursor-pointer">
                  <span className="text-slate-700 font-medium">Click to upload CSV or Excel file</span>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="hidden"
                    data-testid="csv-upload-input"
                  />
                </label>
                <p className="text-sm text-slate-500 mt-2">CSV, XLSX or XLS files supported</p>
                {csvFile && (
                  <div className="mt-4 inline-flex items-center space-x-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-lg">
                    <span className="text-sm font-medium">{csvFile.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCsvFile(null);
                        setColumns([{ name: 'Column 1', type: 'text' }]);
                      }}
                      className="text-violet-600 hover:text-violet-800"
                    >
                      <X className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-heading text-slate-900">Columns</h3>
              {creationMode === 'manual' && (
                <button
                  type="button"
                  onClick={addColumn}
                  data-testid="add-column-btn"
                  className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg px-4 py-2 font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                  <span>Add Column</span>
                </button>
              )}
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
                      disabled={creationMode === 'csv' && csvFile}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-lg h-12 px-4 text-slate-900 placeholder:text-slate-400 transition-all disabled:bg-slate-50 disabled:text-slate-600"
                      placeholder="Column name"
                    />
                  </div>
                  <div className="w-40">
                    <select
                      value={column.type}
                      onChange={(e) => updateColumn(index, 'type', e.target.value)}
                      data-testid={`column-type-select-${index}`}
                      className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-lg h-12 px-4 text-slate-900 transition-all"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                  {creationMode === 'manual' && (
                    <button
                      type="button"
                      onClick={() => removeColumn(index)}
                      disabled={columns.length === 1}
                      data-testid={`remove-column-btn-${index}`}
                      className="text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" strokeWidth={2} />
                    </button>
                  )}
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
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 rounded-full px-8 py-3 font-semibold shadow-lg shadow-emerald-500/20 transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
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
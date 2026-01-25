import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Upload, BarChart2, LineChart, PieChart, Activity, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart,
  Bar,
  LineChart as RechartsLine,
  Line,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CHART_COLORS = ['#7C3AED', '#F97316', '#06B6D4', '#EC4899', '#84CC16'];

const DatasetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [dataset, setDataset] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRow, setEditingRow] = useState(null);
  const [newRowData, setNewRowData] = useState({});
  const [showAddRow, setShowAddRow] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  
  const [chartType, setChartType] = useState('bar');
  const [xAxisColumn, setXAxisColumn] = useState('');
  const [yAxisColumn, setYAxisColumn] = useState('');
  
  const [showPrediction, setShowPrediction] = useState(false);
  const [predictionColumn, setPredictionColumn] = useState('');
  const [predictions, setPredictions] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  useEffect(() => {
    fetchDataset();
    fetchRows();
  }, [id]);

  useEffect(() => {
    if (dataset && dataset.columns.length > 0) {
      setXAxisColumn(dataset.columns[0].name);
      const numericCol = dataset.columns.find(col => col.type === 'number');
      if (numericCol) {
        setYAxisColumn(numericCol.name);
        setPredictionColumn(numericCol.name);
      } else {
        setYAxisColumn(dataset.columns[0].name);
      }
    }
  }, [dataset]);

  const fetchDataset = async () => {
    try {
      const response = await axios.get(`${API}/datasets/${id}`);
      setDataset(response.data);
    } catch (error) {
      console.error('Error fetching dataset:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dataset',
        variant: 'destructive'
      });
    }
  };

  const fetchRows = async () => {
    try {
      const response = await axios.get(`${API}/data-rows/${id}`);
      setRows(response.data);
    } catch (error) {
      console.error('Error fetching rows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = async () => {
    try {
      await axios.post(`${API}/data-rows`, {
        dataset_id: id,
        data: newRowData
      });
      toast({
        title: 'Success',
        description: 'Row added successfully'
      });
      setNewRowData({});
      setShowAddRow(false);
      fetchRows();
    } catch (error) {
      console.error('Error adding row:', error);
      toast({
        title: 'Error',
        description: 'Failed to add row',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateRow = async (rowId) => {
    try {
      await axios.put(`${API}/data-rows/${rowId}`, editingRow.data);
      toast({
        title: 'Success',
        description: 'Row updated successfully'
      });
      setEditingRow(null);
      fetchRows();
    } catch (error) {
      console.error('Error updating row:', error);
      toast({
        title: 'Error',
        description: 'Failed to update row',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteRow = async (rowId) => {
    if (!window.confirm('Are you sure you want to delete this row?')) return;
    
    try {
      await axios.delete(`${API}/data-rows/${rowId}`);
      toast({
        title: 'Success',
        description: 'Row deleted successfully'
      });
      fetchRows();
    } catch (error) {
      console.error('Error deleting row:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete row',
        variant: 'destructive'
      });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingFile(true);
    try {
      const response = await axios.post(`${API}/upload-csv/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast({
        title: 'Success',
        description: `Imported ${response.data.rows_created} rows`
      });
      fetchRows();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to upload file',
        variant: 'destructive'
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handlePredict = async () => {
    if (!predictionColumn) {
      toast({
        title: 'Error',
        description: 'Please select a column for prediction',
        variant: 'destructive'
      });
      return;
    }

    setLoadingPrediction(true);
    try {
      const response = await axios.post(`${API}/predict`, {
        dataset_id: id,
        column_name: predictionColumn,
        prediction_points: 5
      });
      setPredictions(response.data);
      toast({
        title: 'Success',
        description: 'Predictions generated successfully'
      });
    } catch (error) {
      console.error('Error generating predictions:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to generate predictions',
        variant: 'destructive'
      });
    } finally {
      setLoadingPrediction(false);
    }
  };

  const getChartData = () => {
    return rows.map(row => ({
      [xAxisColumn]: row.data[xAxisColumn] || '',
      [yAxisColumn]: parseFloat(row.data[yAxisColumn]) || 0
    }));
  };

  const getPieChartData = () => {
    const groupedData = {};
    rows.forEach(row => {
      const key = row.data[xAxisColumn] || 'Unknown';
      const value = parseFloat(row.data[yAxisColumn]) || 0;
      groupedData[key] = (groupedData[key] || 0) + value;
    });
    return Object.entries(groupedData).map(([name, value]) => ({ name, value }));
  };

  const getPredictionChartData = () => {
    if (!predictions) return [];
    
    const historicalData = rows.map((row, index) => ({
      index: index + 1,
      value: parseFloat(row.data[predictionColumn]) || 0,
      type: 'Historical'
    }));
    
    const predictedData = predictions.predictions.map((val, index) => ({
      index: rows.length + index + 1,
      value: val,
      type: 'Predicted'
    }));
    
    return [...historicalData, ...predictedData];
  };

  const renderChart = () => {
    if (rows.length === 0) return null;

    const data = chartType === 'pie' ? getPieChartData() : getChartData();

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={xAxisColumn} stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontFamily: 'Manrope' }} />
              <Bar dataKey={yAxisColumn} fill="#7C3AED" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLine data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={xAxisColumn} stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontFamily: 'Manrope' }} />
              <Line type="monotone" dataKey={yAxisColumn} stroke="#7C3AED" strokeWidth={3} dot={{ fill: '#7C3AED', r: 4 }} />
            </RechartsLine>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsPie>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#7C3AED"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
            </RechartsPie>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  if (loading || !dataset) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-600 border-t-transparent"></div>
      </div>
    );
  }

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div>
          <h2 className="text-4xl font-bold font-heading text-slate-900 mb-2" data-testid="dataset-title">{dataset.name}</h2>
          <p className="text-slate-600">{dataset.description || 'No description'}</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setShowAddRow(true)}
            data-testid="add-row-btn"
            className="bg-violet-600 text-white hover:bg-violet-700 rounded-full px-6 py-2.5 font-semibold shadow-lg shadow-violet-500/20 transition-transform hover:-translate-y-0.5 active:scale-95 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" strokeWidth={2} />
            <span>Add Row</span>
          </button>

          <label className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 rounded-full px-6 py-2.5 font-medium transition-colors cursor-pointer flex items-center space-x-2">
            <Upload className="w-5 h-5" strokeWidth={2} />
            <span>{uploadingFile ? 'Uploading...' : 'Upload CSV'}</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              data-testid="upload-csv-input"
              disabled={uploadingFile}
            />
          </label>

          <button
            onClick={() => setShowPrediction(!showPrediction)}
            data-testid="ai-prediction-btn"
            className="bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:from-violet-700 hover:to-pink-700 rounded-full px-6 py-2.5 font-semibold shadow-lg transition-transform hover:-translate-y-0.5 active:scale-95 flex items-center space-x-2"
          >
            <Sparkles className="w-5 h-5" strokeWidth={2} />
            <span>AI Prediction</span>
          </button>
        </div>

        {showPrediction && (
          <div className="bg-white/80 backdrop-blur-lg border border-white/50 shadow-xl rounded-2xl p-8" data-testid="prediction-panel">
            <h3 className="text-2xl font-bold font-heading text-slate-900 mb-6">AI-Powered Predictions</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Column for Prediction</label>
                <select
                  value={predictionColumn}
                  onChange={(e) => setPredictionColumn(e.target.value)}
                  data-testid="prediction-column-select"
                  className="w-full max-w-md bg-white border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 rounded-lg h-12 px-4 text-slate-900 transition-all"
                >
                  {dataset.columns.map(col => (
                    <option key={col.name} value={col.name}>{col.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handlePredict}
                disabled={loadingPrediction}
                data-testid="generate-prediction-btn"
                className="bg-violet-600 text-white hover:bg-violet-700 rounded-full px-8 py-3 font-semibold shadow-lg shadow-violet-500/20 transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingPrediction ? 'Generating...' : 'Generate Predictions'}
              </button>

              {predictions && (
                <div className="mt-8" data-testid="prediction-results">
                  <h4 className="text-lg font-bold font-heading text-slate-900 mb-4">Prediction Results</h4>
                  <div className="bg-slate-50 rounded-xl p-6 mb-6">
                    <p className="text-sm text-slate-600 mb-2">Predicted future values:</p>
                    <div className="flex flex-wrap gap-3">
                      {predictions.predictions.map((val, idx) => (
                        <div key={idx} className="bg-white rounded-lg px-4 py-2 border border-violet-200">
                          <span className="text-xs text-slate-500">Point {idx + 1}:</span>
                          <span className="ml-2 text-lg font-bold text-violet-600">{val.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <ResponsiveContainer width="100%" height={400}>
                    <RechartsLine data={getPredictionChartData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="index" stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
                      <YAxis stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontFamily: 'Manrope' }} />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#7C3AED" 
                        strokeWidth={3} 
                        dot={(props) => {
                          const { cx, cy, payload } = props;
                          return (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={4}
                              fill={payload.type === 'Predicted' ? '#EC4899' : '#7C3AED'}
                            />
                          );
                        }}
                      />
                    </RechartsLine>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold font-heading text-slate-900">Visualizations</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setChartType('bar')}
                data-testid="chart-type-bar"
                className={`p-2 rounded-lg transition-colors ${chartType === 'bar' ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <BarChart2 className="w-5 h-5" strokeWidth={2} />
              </button>
              <button
                onClick={() => setChartType('line')}
                data-testid="chart-type-line"
                className={`p-2 rounded-lg transition-colors ${chartType === 'line' ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LineChart className="w-5 h-5" strokeWidth={2} />
              </button>
              <button
                onClick={() => setChartType('pie')}
                data-testid="chart-type-pie"
                className={`p-2 rounded-lg transition-colors ${chartType === 'pie' ? 'bg-violet-100 text-violet-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <PieChart className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          {rows.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">X-Axis</label>
                  <select
                    value={xAxisColumn}
                    onChange={(e) => setXAxisColumn(e.target.value)}
                    data-testid="x-axis-select"
                    className="bg-white border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 rounded-lg h-10 px-4 text-slate-900 transition-all"
                  >
                    {dataset.columns.map(col => (
                      <option key={col.name} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Y-Axis</label>
                  <select
                    value={yAxisColumn}
                    onChange={(e) => setYAxisColumn(e.target.value)}
                    data-testid="y-axis-select"
                    className="bg-white border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 rounded-lg h-10 px-4 text-slate-900 transition-all"
                  >
                    {dataset.columns.map(col => (
                      <option key={col.name} value={col.name}>{col.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div data-testid="chart-container">
                {renderChart()}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" strokeWidth={1.5} />
              <p>Add data to see visualizations</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <h3 className="text-2xl font-bold font-heading text-slate-900 mb-6">Data Table</h3>
          
          {showAddRow && (
            <div className="mb-6 p-6 bg-slate-50 rounded-xl border border-slate-200" data-testid="add-row-form">
              <h4 className="text-lg font-bold font-heading text-slate-900 mb-4">Add New Row</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {dataset.columns.map(col => (
                  <div key={col.name}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{col.name}</label>
                    <input
                      type={col.type === 'number' ? 'number' : 'text'}
                      value={newRowData[col.name] || ''}
                      onChange={(e) => setNewRowData({ ...newRowData, [col.name]: e.target.value })}
                      data-testid={`new-row-input-${col.name}`}
                      className="w-full bg-white border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-100 rounded-lg h-10 px-4 text-slate-900 placeholder:text-slate-400 transition-all"
                    />
                  </div>
                ))}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddRow}
                  data-testid="save-new-row-btn"
                  className="bg-violet-600 text-white hover:bg-violet-700 rounded-lg px-4 py-2 font-medium transition-colors flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" strokeWidth={2} />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddRow(false);
                    setNewRowData({});
                  }}
                  data-testid="cancel-new-row-btn"
                  className="bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg px-4 py-2 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  {dataset.columns.map(col => (
                    <th key={col.name} className="text-left py-3 px-4 text-sm font-bold text-slate-900 font-heading">
                      {col.name}
                    </th>
                  ))}
                  <th className="text-right py-3 px-4 text-sm font-bold text-slate-900 font-heading">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={dataset.columns.length + 1} className="text-center py-12 text-slate-500">
                      No data yet. Add your first row or upload a CSV file.
                    </td>
                  </tr>
                ) : (
                  rows.map(row => (
                    <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors" data-testid={`data-row-${row.id}`}>
                      {dataset.columns.map(col => (
                        <td key={col.name} className="py-3 px-4 text-sm text-slate-700">
                          {editingRow && editingRow.id === row.id ? (
                            <input
                              type={col.type === 'number' ? 'number' : 'text'}
                              value={editingRow.data[col.name] || ''}
                              onChange={(e) => setEditingRow({
                                ...editingRow,
                                data: { ...editingRow.data, [col.name]: e.target.value }
                              })}
                              data-testid={`edit-input-${col.name}`}
                              className="w-full bg-white border border-slate-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-100 rounded px-2 py-1 text-sm"
                            />
                          ) : (
                            row.data[col.name] || '-'
                          )}
                        </td>
                      ))}
                      <td className="py-3 px-4 text-right">
                        {editingRow && editingRow.id === row.id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleUpdateRow(row.id)}
                              data-testid={`save-row-btn-${row.id}`}
                              className="text-green-600 hover:text-green-700 transition-colors"
                            >
                              <Save className="w-4 h-4" strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => setEditingRow(null)}
                              data-testid={`cancel-edit-btn-${row.id}`}
                              className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <X className="w-4 h-4" strokeWidth={2} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingRow(row)}
                              data-testid={`edit-row-btn-${row.id}`}
                              className="text-violet-600 hover:text-violet-700 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => handleDeleteRow(row.id)}
                              data-testid={`delete-row-btn-${row.id}`}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={2} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetDetail;

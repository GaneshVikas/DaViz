import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Upload, BarChart2, LineChart, PieChart, Activity, Sparkles, TrendingUp, CircleDot, Radar as RadarIcon, BarChart3, BarChart4, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
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
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
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
  const [predictions, setPredictions] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  
  const chartRef = useRef(null);

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
    if (!yAxisColumn) {
      toast({
        title: 'Error',
        description: 'Please select a numeric column for Y-axis',
        variant: 'destructive'
      });
      return;
    }

    setLoadingPrediction(true);
    try {
      const response = await axios.post(`${API}/predict`, {
        dataset_id: id,
        column_name: yAxisColumn,
        prediction_points: 5
      });
      setPredictions(response.data);
      setShowPrediction(true);
      toast({
        title: 'Predictions Generated',
        description: `Successfully predicted ${response.data.predictions.length} future values`
      });
    } catch (error) {
      console.error('Error generating predictions:', error);
      toast({
        title: 'Prediction Failed',
        description: error.response?.data?.detail || 'Failed to generate predictions',
        variant: 'destructive'
      });
    } finally {
      setLoadingPrediction(false);
    }
  };

  const handleDownloadChart = async () => {
    if (!chartRef.current) return;
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = `${dataset.name}_${chartType}_chart.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({
        title: 'Success',
        description: 'Chart downloaded successfully'
      });
    } catch (error) {
      console.error('Error downloading chart:', error);
      toast({
        title: 'Error',
        description: 'Failed to download chart',
        variant: 'destructive'
      });
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
    
    // Combine all historical data with predictions
    const allData = [
      ...rows.map((row, idx) => ({
        index: idx + 1,
        [xAxisColumn]: row.data[xAxisColumn] || `Point ${idx + 1}`,
        [yAxisColumn]: parseFloat(row.data[yAxisColumn]) || 0,
        type: 'Historical'
      })),
      ...predictions.predictions.map((val, idx) => ({
        index: rows.length + idx + 1,
        [xAxisColumn]: `Forecast ${idx + 1}`,
        [yAxisColumn]: val,
        type: 'Predicted'
      }))
    ];
    
    return allData;
  };

  const renderPredictionChart = () => {
    if (!predictions || rows.length === 0) return null;

    const data = getPredictionChartData();

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="index" stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} label={{ value: 'Data Points', position: 'insideBottom', offset: -5 }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontFamily: 'Manrope' }} />
              <Bar dataKey={yAxisColumn} radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.type === 'Predicted' ? '#EF4444' : '#10B981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'horizontal-bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <YAxis type="category" dataKey="index" stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontFamily: 'Manrope' }} />
              <Bar dataKey={yAxisColumn} radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.type === 'Predicted' ? '#EF4444' : '#F59E0B'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'stacked-bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="index" stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontFamily: 'Manrope' }} />
              <Bar dataKey={yAxisColumn} radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.type === 'Predicted' ? '#EF4444' : '#10B981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLine data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="index" stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} label={{ value: 'Data Points', position: 'insideBottom', offset: -5 }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontFamily: 'Manrope' }} />
              <Line 
                type="monotone" 
                dataKey={yAxisColumn} 
                stroke="#3B82F6" 
                strokeWidth={3} 
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={payload.type === 'Predicted' ? '#EF4444' : '#3B82F6'}
                      stroke={payload.type === 'Predicted' ? '#DC2626' : '#2563EB'}
                      strokeWidth={2}
                    />
                  );
                }}
              />
            </RechartsLine>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorAreaPred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="index" stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontFamily: 'Manrope' }} />
              <Area type="monotone" dataKey={yAxisColumn} stroke="#8B5CF6" fillOpacity={1} fill="url(#colorAreaPred)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="index" stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <YAxis dataKey={yAxisColumn} stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} cursor={{ strokeDasharray: '3 3' }} />
              <Legend wrapperStyle={{ fontFamily: 'Manrope' }} />
              <Scatter name="Historical" data={data.filter(d => d.type === 'Historical')} fill="#14B8A6" />
              <Scatter name="Predicted" data={data.filter(d => d.type === 'Predicted')} fill="#EF4444" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="index" stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontFamily: 'Manrope' }} />
              <Bar dataKey={yAxisColumn} fill="#06B6D4" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.type === 'Predicted' ? '#EF4444' : '#06B6D4'} />
                ))}
              </Bar>
              <Line type="monotone" dataKey={yAxisColumn} stroke="#F97316" strokeWidth={2} dot={{ fill: '#F97316', r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        );
      default:
        return renderChart();
    }
  };
    if (rows.length === 0) return null;

    const data = (chartType === 'pie' || chartType === 'radar') ? getPieChartData() : getChartData();

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
              <Bar dataKey={yAxisColumn} fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'horizontal-bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <YAxis type="category" dataKey={xAxisColumn} stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontFamily: 'Manrope' }} />
              <Bar dataKey={yAxisColumn} fill="#F59E0B" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'stacked-bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={xAxisColumn} stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontFamily: 'Manrope' }} />
              <Bar dataKey={yAxisColumn} stackId="a" fill="#10B981" radius={[8, 8, 0, 0]} />
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
              <Line 
                type="monotone" 
                dataKey={yAxisColumn} 
                stroke="#3B82F6" 
                strokeWidth={3} 
                dot={{ fill: '#3B82F6', r: 4 }}
              />
            </RechartsLine>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={xAxisColumn} stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontFamily: 'Manrope' }} />
              <Area type="monotone" dataKey={yAxisColumn} stroke="#8B5CF6" fillOpacity={1} fill="url(#colorArea)" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={xAxisColumn} stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <YAxis dataKey={yAxisColumn} stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} cursor={{ strokeDasharray: '3 3' }} />
              <Legend wrapperStyle={{ fontFamily: 'Manrope' }} />
              <Scatter name={yAxisColumn} data={data} fill="#14B8A6" />
            </ScatterChart>
          </ResponsiveContainer>
        );
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={data}>
              <PolarGrid stroke="#E2E8F0" />
              <PolarAngleAxis dataKey="name" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <PolarRadiusAxis style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Radar name={yAxisColumn} dataKey="value" stroke="#6366F1" fill="#6366F1" fillOpacity={0.6} />
            </RadarChart>
          </ResponsiveContainer>
        );
      case 'composed':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey={xAxisColumn} stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px', fontFamily: 'Manrope' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontFamily: 'Manrope' }} />
              <Bar dataKey={yAxisColumn} fill="#06B6D4" radius={[8, 8, 0, 0]} />
              <Line type="monotone" dataKey={yAxisColumn} stroke="#F97316" strokeWidth={3} dot={{ fill: '#F97316', r: 4 }} />
            </ComposedChart>
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
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 rounded-full px-6 py-2.5 font-semibold shadow-lg shadow-emerald-500/20 transition-transform hover:-translate-y-0.5 active:scale-95 flex items-center space-x-2"
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

          {!predictions ? (
            <button
              onClick={handlePredict}
              disabled={loadingPrediction || rows.length < 3}
              data-testid="ai-prediction-btn"
              className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white hover:from-orange-600 hover:via-red-600 hover:to-pink-600 rounded-full px-6 py-2.5 font-semibold shadow-lg shadow-orange-500/20 transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              title={rows.length < 3 ? `Need at least 3 rows for predictions (current: ${rows.length})` : ''}
            >
              <Sparkles className="w-5 h-5" strokeWidth={2} />
              <span>{loadingPrediction ? 'Analyzing...' : 'Generate AI Predictions'}</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setPredictions(null);
                setShowPrediction(false);
              }}
              data-testid="clear-predictions-btn"
              className="bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-full px-6 py-2.5 font-medium transition-colors flex items-center space-x-2"
            >
              <X className="w-5 h-5" strokeWidth={2} />
              <span>Clear Predictions</span>
            </button>
          )}
        </div>

        {showPrediction && predictions && (
          <div className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 rounded-2xl border-2 border-orange-200 shadow-lg p-8" data-testid="prediction-panel">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold font-heading text-slate-900">AI Predictions</h3>
                  <p className="text-sm text-slate-600">Future forecast for <span className="font-semibold text-orange-600">{yAxisColumn}</span></p>
                </div>
              </div>
              <button
                onClick={() => {
                  setPredictions(null);
                  setShowPrediction(false);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
            
            <div className="grid md:grid-cols-5 gap-4 mb-6">
              {predictions.predictions.map((val, idx) => (
                <div key={idx} className="bg-white rounded-xl p-4 border-2 border-red-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-xs text-slate-500 font-medium mb-1">Period {idx + 1}</p>
                  <p className="text-2xl font-bold text-red-600">{val.toFixed(2)}</p>
                  <div className="mt-2 w-full bg-red-100 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-red-600 h-full rounded-full" 
                      style={{ width: `${(val / Math.max(...predictions.predictions)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border-2 border-orange-200 p-6 mb-6">
              <h4 className="text-lg font-bold font-heading text-slate-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-orange-600" strokeWidth={2} />
                <span>Complete Forecast Visualization</span>
              </h4>
              <div className="bg-slate-50 rounded-lg p-4" data-testid="prediction-chart-container">
                {renderPredictionChart()}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded bg-emerald-600"></div>
                    <span className="text-slate-600">Historical Data ({predictions.historical_count} points)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded bg-red-600"></div>
                    <span className="text-slate-600">AI Predictions ({predictions.predictions.length} points)</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Powered by GPT-5.2</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-start justify-between mb-6 gap-4">
            <h3 className="text-2xl font-bold font-heading text-slate-900">Visualizations</h3>
            <div className="flex items-center gap-3">
              <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setChartType('bar')}
                data-testid="chart-type-bar"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${chartType === 'bar' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                title="Bar Chart"
              >
                <BarChart2 className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-medium">Bar</span>
              </button>
              <button
                onClick={() => setChartType('horizontal-bar')}
                data-testid="chart-type-horizontal-bar"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${chartType === 'horizontal-bar' ? 'bg-teal-100 text-teal-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                title="Horizontal Bar"
              >
                <BarChart3 className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-medium">H-Bar</span>
              </button>
              <button
                onClick={() => setChartType('stacked-bar')}
                data-testid="chart-type-stacked-bar"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${chartType === 'stacked-bar' ? 'bg-amber-100 text-amber-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                title="Stacked Bar"
              >
                <BarChart4 className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-medium">Stacked</span>
              </button>
              <button
                onClick={() => setChartType('line')}
                data-testid="chart-type-line"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${chartType === 'line' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                title="Line Chart"
              >
                <LineChart className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-medium">Line</span>
              </button>
              <button
                onClick={() => setChartType('area')}
                data-testid="chart-type-area"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${chartType === 'area' ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                title="Area Chart"
              >
                <TrendingUp className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-medium">Area</span>
              </button>
              <button
                onClick={() => setChartType('scatter')}
                data-testid="chart-type-scatter"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${chartType === 'scatter' ? 'bg-pink-100 text-pink-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                title="Scatter Plot"
              >
                <CircleDot className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-medium">Scatter</span>
              </button>
              <button
                onClick={() => setChartType('radar')}
                data-testid="chart-type-radar"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${chartType === 'radar' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                title="Radar Chart"
              >
                <RadarIcon className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-medium">Radar</span>
              </button>
              <button
                onClick={() => setChartType('composed')}
                data-testid="chart-type-composed"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${chartType === 'composed' ? 'bg-cyan-100 text-cyan-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                title="Composed Chart"
              >
                <Activity className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-medium">Composed</span>
              </button>
              <button
                onClick={() => setChartType('pie')}
                data-testid="chart-type-pie"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${chartType === 'pie' ? 'bg-rose-100 text-rose-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                title="Pie Chart"
              >
                <PieChart className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-medium">Pie</span>
              </button>
            </div>
            <button
              onClick={handleDownloadChart}
              data-testid="download-chart-btn"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 rounded-lg px-4 py-2 font-medium shadow-md transition-all hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" strokeWidth={2} />
              <span className="text-sm">Download</span>
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
              <div data-testid="chart-container" ref={chartRef} className="bg-white p-4 rounded-lg">
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

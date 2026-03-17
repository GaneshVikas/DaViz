import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Database, Server, Key, User, Hash, CheckCircle2, XCircle, Table2, Loader2, Download, Eye, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const DatabaseConnect = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Connection form state
  const [dbType, setDbType] = useState('mysql');
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('');
  const [database, setDatabase] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // UI state
  const [step, setStep] = useState(1); // 1: Connect, 2: Select Table, 3: Preview & Import
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // null, 'success', 'error'
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableInfo, setTableInfo] = useState(null);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingTableInfo, setLoadingTableInfo] = useState(false);
  const [importing, setImporting] = useState(false);
  const [datasetName, setDatasetName] = useState('');

  const getConnectionParams = () => ({
    db_type: dbType,
    host: host || 'localhost',
    port: port ? parseInt(port) : null,
    database,
    username: username || null,
    password: password || null
  });

  const handleTestConnection = async () => {
    if (!database) {
      toast({ title: 'Error', description: 'Database name is required', variant: 'destructive' });
      return;
    }
    
    setTesting(true);
    setConnectionStatus(null);
    
    try {
      await axios.post(`${API}/database/test-connection`, getConnectionParams());
      setConnectionStatus('success');
      toast({ title: 'Success', description: 'Connection successful!' });
    } catch (error) {
      setConnectionStatus('error');
      toast({ 
        title: 'Connection Failed', 
        description: error.response?.data?.detail || 'Could not connect to database',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleLoadTables = async () => {
    setLoadingTables(true);
    try {
      const response = await axios.post(`${API}/database/tables`, getConnectionParams());
      setTables(response.data.tables);
      setStep(2);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.detail || 'Failed to load tables',
        variant: 'destructive'
      });
    } finally {
      setLoadingTables(false);
    }
  };

  const handleSelectTable = async (tableName) => {
    setSelectedTable(tableName);
    setLoadingTableInfo(true);
    setDatasetName(tableName);
    
    try {
      const response = await axios.post(`${API}/database/table-info`, {
        ...getConnectionParams(),
        table_name: tableName
      });
      setTableInfo(response.data);
      setStep(3);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error.response?.data?.detail || 'Failed to load table info',
        variant: 'destructive'
      });
    } finally {
      setLoadingTableInfo(false);
    }
  };

  const handleImport = async () => {
    if (!datasetName.trim()) {
      toast({ title: 'Error', description: 'Dataset name is required', variant: 'destructive' });
      return;
    }
    
    setImporting(true);
    try {
      const response = await axios.post(`${API}/database/import`, {
        ...getConnectionParams(),
        table_name: selectedTable,
        dataset_name: datasetName
      });
      
      toast({ 
        title: 'Import Successful!', 
        description: `Imported ${response.data.rows_imported} rows into "${response.data.dataset_name}"`
      });
      
      // Navigate to the new dataset
      navigate(`/dataset/${response.data.dataset_id}`);
    } catch (error) {
      toast({ 
        title: 'Import Failed', 
        description: error.response?.data?.detail || 'Failed to import data',
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  const dbTypes = [
    { value: 'mysql', label: 'MySQL', icon: '🐬', defaultPort: 3306 },
    { value: 'postgresql', label: 'PostgreSQL', icon: '🐘', defaultPort: 5432 },
    { value: 'sqlite', label: 'SQLite', icon: '📁', defaultPort: null }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            data-testid="back-to-dashboard-btn"
            className="flex items-center space-x-2 text-slate-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" strokeWidth={2} />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
            <Database className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Connect to Database</h1>
          <p className="text-slate-600">Import data directly from MySQL, PostgreSQL, or SQLite databases</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center space-x-4">
            {[
              { num: 1, label: 'Connect' },
              { num: 2, label: 'Select Table' },
              { num: 3, label: 'Import' }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className={`flex items-center space-x-2 ${step >= s.num ? 'text-indigo-600' : 'text-slate-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= s.num ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
                  </div>
                  <span className="font-medium text-sm">{s.label}</span>
                </div>
                {idx < 2 && <div className={`w-12 h-0.5 ${step > s.num ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Connection Form */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Server className="w-5 h-5 text-indigo-600" />
              Database Connection
            </h2>

            {/* Database Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Database Type</label>
              <div className="grid grid-cols-3 gap-3">
                {dbTypes.map(db => (
                  <button
                    key={db.value}
                    onClick={() => {
                      setDbType(db.value);
                      setPort(db.defaultPort ? String(db.defaultPort) : '');
                      setConnectionStatus(null);
                    }}
                    data-testid={`db-type-${db.value}`}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      dbType === db.value 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{db.icon}</span>
                    <span className={`font-medium ${dbType === db.value ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {db.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Connection Fields */}
            <div className="space-y-4">
              {dbType !== 'sqlite' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <Server className="w-4 h-4 inline mr-1" />
                      Host
                    </label>
                    <input
                      type="text"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="localhost"
                      data-testid="db-host-input"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <Hash className="w-4 h-4 inline mr-1" />
                      Port
                    </label>
                    <input
                      type="text"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder={dbType === 'mysql' ? '3306' : '5432'}
                      data-testid="db-port-input"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <Database className="w-4 h-4 inline mr-1" />
                  {dbType === 'sqlite' ? 'Database File Path' : 'Database Name'} *
                </label>
                <input
                  type="text"
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  placeholder={dbType === 'sqlite' ? '/path/to/database.db' : 'my_database'}
                  data-testid="db-name-input"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {dbType !== 'sqlite' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <User className="w-4 h-4 inline mr-1" />
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="root"
                      data-testid="db-username-input"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      <Key className="w-4 h-4 inline mr-1" />
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      data-testid="db-password-input"
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Connection Status */}
            {connectionStatus && (
              <div className={`mt-6 p-4 rounded-lg flex items-center gap-3 ${
                connectionStatus === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {connectionStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Connection successful!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Connection failed. Check your credentials.</span>
                  </>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={handleTestConnection}
                disabled={testing || !database}
                data-testid="test-connection-btn"
                className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Server className="w-4 h-4" />}
                Test Connection
              </button>
              
              <button
                onClick={handleLoadTables}
                disabled={connectionStatus !== 'success' || loadingTables}
                data-testid="load-tables-btn"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-500/30"
              >
                {loadingTables ? <Loader2 className="w-4 h-4 animate-spin" /> : <Table2 className="w-4 h-4" />}
                Load Tables
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Select Table */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Table2 className="w-5 h-5 text-indigo-600" />
                Select a Table
              </h2>
              <button
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-700 text-sm font-medium"
              >
                ← Back to connection
              </button>
            </div>

            {tables.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tables found in this database</p>
              </div>
            ) : (
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {tables.map(table => (
                  <button
                    key={table}
                    onClick={() => handleSelectTable(table)}
                    disabled={loadingTableInfo && selectedTable === table}
                    data-testid={`table-${table}`}
                    className="p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <Table2 className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                      <span className="font-medium text-slate-700 group-hover:text-indigo-700">{table}</span>
                    </div>
                    {loadingTableInfo && selectedTable === table ? (
                      <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                    ) : (
                      <Eye className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Preview & Import */}
        {step === 3 && tableInfo && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                Preview: {selectedTable}
              </h2>
              <button
                onClick={() => setStep(2)}
                className="text-slate-500 hover:text-slate-700 text-sm font-medium"
              >
                ← Select different table
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-indigo-600">{tableInfo.total_rows}</p>
                <p className="text-sm text-indigo-600/70">Total Rows</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{tableInfo.columns.length}</p>
                <p className="text-sm text-emerald-600/70">Columns</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{dbType.toUpperCase()}</p>
                <p className="text-sm text-amber-600/70">Database Type</p>
              </div>
            </div>

            {/* Columns */}
            <div className="mb-6">
              <h3 className="font-semibold text-slate-700 mb-3">Columns</h3>
              <div className="flex flex-wrap gap-2">
                {tableInfo.columns.map(col => (
                  <span key={col.name} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-sm">
                    <span className="font-medium">{col.name}</span>
                    <span className="text-slate-400 ml-1">({col.type})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Preview Table */}
            <div className="mb-6">
              <h3 className="font-semibold text-slate-700 mb-3">Data Preview (first 10 rows)</h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {tableInfo.columns.map(col => (
                        <th key={col.name} className="px-4 py-3 text-left font-semibold text-slate-700 border-b">
                          {col.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableInfo.preview.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                        {tableInfo.columns.map(col => (
                          <td key={col.name} className="px-4 py-2.5 text-slate-600">
                            {row[col.name] !== null ? String(row[col.name]).substring(0, 50) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dataset Name */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Dataset Name</label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                placeholder="Enter a name for your dataset"
                data-testid="dataset-name-input"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Import Button */}
            <button
              onClick={handleImport}
              disabled={importing || !datasetName.trim()}
              data-testid="import-btn"
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
            >
              {importing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Importing {tableInfo.total_rows} rows...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Import {tableInfo.total_rows} rows to DaViz
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseConnect;

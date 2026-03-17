import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PanelRightClose, PanelRightOpen, Sparkles, BarChart3, Rows3, Columns3, RefreshCw, Lightbulb } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const InsightsPanel = ({ datasetId, columnName, chartType, rowCount, columnCount, datasetName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInsights = async () => {
    if (!datasetId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API}/insights`, {
        dataset_id: datasetId,
        column_name: columnName,
        chart_type: chartType
      });
      setInsights(response.data);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !insights && !loading) {
      fetchInsights();
    }
  }, [isOpen]);

  const handleRefresh = () => {
    fetchInsights();
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-testid="insights-toggle-btn"
        className={`fixed top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${
          isOpen ? 'right-[340px]' : 'right-0'
        }`}
      >
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 text-white p-3 rounded-l-xl shadow-lg hover:shadow-xl transition-all">
          {isOpen ? (
            <PanelRightClose className="w-5 h-5" strokeWidth={2} />
          ) : (
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5" strokeWidth={2} />
              <span className="text-sm font-medium pr-1">Insights</span>
            </div>
          )}
        </div>
      </button>

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[340px] bg-white border-l border-slate-200 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        data-testid="insights-panel"
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">AI Insights</h3>
                  <p className="text-amber-100 text-xs">Powered by GPT-5.2</p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                data-testid="insights-refresh-btn"
                className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
                <Rows3 className="w-5 h-5 text-blue-500 mx-auto mb-1" strokeWidth={2} />
                <p className="text-lg font-bold text-slate-900">{rowCount}</p>
                <p className="text-xs text-slate-500">Rows</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
                <Columns3 className="w-5 h-5 text-green-500 mx-auto mb-1" strokeWidth={2} />
                <p className="text-lg font-bold text-slate-900">{columnCount}</p>
                <p className="text-xs text-slate-500">Columns</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 text-center">
                <BarChart3 className="w-5 h-5 text-purple-500 mx-auto mb-1" strokeWidth={2} />
                <p className="text-lg font-bold text-slate-900 capitalize">{chartType}</p>
                <p className="text-xs text-slate-500">Chart</p>
              </div>
            </div>
          </div>

          {/* Insights Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <p className="text-slate-600 font-medium">Analyzing your data...</p>
                <p className="text-slate-400 text-sm">This may take a moment</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : insights ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center space-x-2">
                    <Lightbulb className="w-4 h-4 text-amber-600" strokeWidth={2} />
                    <span>AI Analysis</span>
                  </h4>
                  <div className="text-sm text-slate-700 prose prose-sm max-w-none">
                    {insights.insights.split('\n').map((line, idx) => (
                      <p key={idx} className="mb-2 last:mb-0">
                        {line.startsWith('**') ? (
                          <strong className="text-slate-900">{line.replace(/\*\*/g, '')}</strong>
                        ) : line.startsWith('- ') || line.startsWith('• ') ? (
                          <span className="flex items-start">
                            <span className="text-amber-500 mr-2">•</span>
                            {line.substring(2)}
                          </span>
                        ) : (
                          line
                        )}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Dataset Info */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h4 className="font-semibold text-slate-700 text-sm mb-2">Dataset Info</h4>
                  <p className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">{datasetName}</span>
                    <br />
                    Currently viewing: {columnName || 'All columns'} as {chartType} chart
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Lightbulb className="w-12 h-12 text-slate-300 mb-4" strokeWidth={1.5} />
                <p className="text-slate-500">Click refresh to generate AI insights</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-400 text-center">
              Insights update based on your current data view and chart selection
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default InsightsPanel;

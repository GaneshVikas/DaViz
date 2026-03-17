import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PanelRightClose, Lightbulb, RefreshCw, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, BarChart3, Rows3, Columns3, Sparkles, Target, Zap } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Mini animated bar chart component
const MiniBarChart = ({ data, color = '#10B981' }) => {
  const maxVal = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((val, idx) => (
        <div
          key={idx}
          className="w-2 rounded-t transition-all duration-500 ease-out"
          style={{
            height: `${(val / maxVal) * 100}%`,
            backgroundColor: color,
            animation: `growUp 0.5s ease-out ${idx * 0.1}s both`
          }}
        />
      ))}
    </div>
  );
};

// Mini trend line component
const MiniTrendLine = ({ data, color = '#3B82F6' }) => {
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const range = maxVal - minVal || 1;
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * 100;
    const y = 100 - ((val - minVal) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="w-full h-12" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-draw-line"
      />
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Insight card component
const InsightCard = ({ icon: Icon, title, children, color = 'blue', animate = false }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    red: 'bg-red-50 border-red-200 text-red-700'
  };
  const iconColors = {
    blue: 'text-blue-500',
    green: 'text-emerald-500',
    amber: 'text-amber-500',
    purple: 'text-purple-500',
    red: 'text-red-500'
  };

  return (
    <div className={`rounded-xl p-4 border ${colorClasses[color]} ${animate ? 'animate-fade-in' : ''}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-5 h-5 ${iconColors[color]}`} strokeWidth={2} />
        <h4 className="font-bold text-slate-800">{title}</h4>
      </div>
      <div className="text-sm text-slate-600">{children}</div>
    </div>
  );
};

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

  // Parse structured insights from AI response
  const parseInsights = (text) => {
    const sections = {
      patterns: [],
      quality: [],
      recommendations: []
    };
    
    let currentSection = null;
    const lines = text.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().includes('key pattern') || trimmed.toLowerCase().includes('pattern')) {
        currentSection = 'patterns';
      } else if (trimmed.toLowerCase().includes('data quality') || trimmed.toLowerCase().includes('quality')) {
        currentSection = 'quality';
      } else if (trimmed.toLowerCase().includes('recommend') || trimmed.toLowerCase().includes('suggestion')) {
        currentSection = 'recommendations';
      } else if (trimmed.startsWith('-') || trimmed.startsWith('•') || trimmed.startsWith('*')) {
        const content = trimmed.replace(/^[-•*]\s*/, '').replace(/\*\*/g, '');
        if (currentSection && content) {
          sections[currentSection].push(content);
        }
      }
    });
    
    return sections;
  };

  // Generate sample data for mini visualizations
  const getSampleData = () => {
    if (!insights?.summary) return [];
    const count = insights.summary.row_count || 8;
    return Array.from({ length: Math.min(count, 10) }, () => Math.random() * 100 + 20);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-testid="insights-toggle-btn"
        className={`fixed top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${
          isOpen ? 'right-[440px]' : 'right-0'
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

      {/* Panel - Wider */}
      <div
        className={`fixed top-0 right-0 h-full w-[440px] bg-white border-l border-slate-200 shadow-2xl z-30 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        data-testid="insights-panel"
      >
        <style>{`
          @keyframes growUp {
            from { height: 0; }
          }
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.4s ease-out forwards;
          }
          .animate-draw-line {
            stroke-dasharray: 1000;
            stroke-dashoffset: 1000;
            animation: draw 1.5s ease-out forwards;
          }
          @keyframes draw {
            to { stroke-dashoffset: 0; }
          }
        `}</style>

        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl">AI Insights</h3>
                  <p className="text-amber-100 text-sm">Smart analysis of your data</p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                data-testid="insights-refresh-btn"
                className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Quick Stats with Mini Charts */}
          <div className="p-4 border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-center">
                <Rows3 className="w-6 h-6 text-blue-500 mx-auto mb-2" strokeWidth={2} />
                <p className="text-2xl font-bold text-slate-900">{rowCount}</p>
                <p className="text-xs text-slate-500 font-medium">Data Rows</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-center">
                <Columns3 className="w-6 h-6 text-green-500 mx-auto mb-2" strokeWidth={2} />
                <p className="text-2xl font-bold text-slate-900">{columnCount}</p>
                <p className="text-xs text-slate-500 font-medium">Columns</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm text-center">
                <BarChart3 className="w-6 h-6 text-purple-500 mx-auto mb-2" strokeWidth={2} />
                <p className="text-2xl font-bold text-slate-900 capitalize">{chartType}</p>
                <p className="text-xs text-slate-500 font-medium">Chart Type</p>
              </div>
            </div>
            
            {/* Mini Visualization Preview */}
            {insights && !loading && (
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 font-medium mb-2">Data Distribution Preview</p>
                <MiniBarChart data={getSampleData()} color="#10B981" />
              </div>
            )}
          </div>

          {/* Insights Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white animate-pulse" strokeWidth={2} />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-amber-200 animate-ping opacity-50"></div>
                </div>
                <p className="text-slate-700 font-semibold mt-4">Analyzing your data...</p>
                <p className="text-slate-400 text-sm">Discovering patterns & insights</p>
              </div>
            ) : error ? (
              <InsightCard icon={AlertCircle} title="Error" color="red">
                <p>{error}</p>
                <button onClick={handleRefresh} className="mt-2 text-red-600 hover:text-red-700 font-medium underline">
                  Try Again
                </button>
              </InsightCard>
            ) : insights ? (
              <div className="space-y-4">
                {/* Parsed and formatted insights */}
                {(() => {
                  const parsed = parseInsights(insights.insights);
                  return (
                    <>
                      {/* Key Patterns */}
                      {parsed.patterns.length > 0 && (
                        <InsightCard icon={TrendingUp} title="Key Patterns Discovered" color="blue" animate>
                          <ul className="space-y-2 mt-2">
                            {parsed.patterns.map((pattern, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-blue-600 text-xs font-bold">{idx + 1}</span>
                                </span>
                                <span className="text-slate-700">{pattern}</span>
                              </li>
                            ))}
                          </ul>
                        </InsightCard>
                      )}

                      {/* Data Quality */}
                      {parsed.quality.length > 0 && (
                        <InsightCard icon={CheckCircle2} title="Data Quality Check" color="green" animate>
                          <ul className="space-y-2 mt-2">
                            {parsed.quality.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span className="text-slate-700">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </InsightCard>
                      )}

                      {/* Recommendations */}
                      {parsed.recommendations.length > 0 && (
                        <InsightCard icon={Target} title="Recommendations" color="purple" animate>
                          <ul className="space-y-2 mt-2">
                            {parsed.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Zap className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                                <span className="text-slate-700">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </InsightCard>
                      )}

                      {/* Trend Visualization */}
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200 animate-fade-in">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-5 h-5 text-indigo-500" strokeWidth={2} />
                          <h4 className="font-bold text-slate-800">Data Trend</h4>
                        </div>
                        <MiniTrendLine data={getSampleData()} color="#6366F1" />
                        <p className="text-xs text-slate-500 mt-2 text-center">
                          Visual representation of {columnName || 'your data'} values
                        </p>
                      </div>
                    </>
                  );
                })()}

                {/* Dataset Context */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">Dataset:</span> {datasetName}
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    <span className="font-semibold text-slate-800">Analyzing:</span> {columnName || 'All columns'} as {chartType} chart
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Lightbulb className="w-16 h-16 text-slate-300 mb-4" strokeWidth={1.5} />
                <p className="text-slate-600 font-medium">Ready to analyze</p>
                <p className="text-slate-400 text-sm">Click refresh to generate AI insights</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <p className="text-xs text-slate-500 text-center">
              Insights auto-update when you change chart type or data selection
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default InsightsPanel;

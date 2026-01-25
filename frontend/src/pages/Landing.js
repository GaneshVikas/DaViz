import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Upload, Sparkles } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <div className="noise-texture min-h-screen">
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-8 h-8 text-violet-600" strokeWidth={2} />
                <h1 className="text-2xl font-bold font-heading text-slate-900">DaViz</h1>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                data-testid="get-started-nav-btn"
                className="bg-violet-600 text-white hover:bg-violet-700 rounded-full px-6 py-2.5 font-semibold shadow-lg shadow-violet-500/20 transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>

        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
            <div className="grid lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-2 space-y-8 animate-fadeIn">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-slate-900 tracking-tight leading-tight">
                  Data Visualization Made
                  <span className="text-violet-600"> Simple</span>
                </h1>
                <p className="text-base text-slate-600 font-body leading-relaxed">
                  Transform your data into beautiful, insightful visualizations without any coding. 
                  Create datasets, generate charts, and unlock AI-powered predictions in minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    data-testid="get-started-hero-btn"
                    className="bg-violet-600 text-white hover:bg-violet-700 rounded-full px-8 py-4 font-semibold shadow-lg shadow-violet-500/20 transition-transform hover:-translate-y-0.5 active:scale-95"
                  >
                    Start Creating
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    data-testid="view-demo-btn"
                    className="bg-white text-slate-900 border-2 border-slate-200 hover:bg-slate-50 rounded-full px-8 py-4 font-medium transition-colors active:scale-95"
                  >
                    View Demo
                  </button>
                </div>
              </div>

              <div className="lg:col-span-3 relative animate-fadeIn" style={{animationDelay: '0.2s'}}>
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1633419461186-7d40a38105ec?crop=entropy&cs=srgb&fm=jpg&q=85"
                    alt="Data Visualization"
                    className="rounded-2xl shadow-2xl w-full"
                  />
                  <div className="absolute -bottom-6 -left-6 bg-white/80 backdrop-blur-lg border border-white/50 shadow-xl rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-violet-600" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Active Datasets</p>
                        <p className="text-2xl font-bold text-slate-900">24+</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold font-heading text-slate-900 mb-4">Powerful Features</h2>
              <p className="text-base text-slate-600">Everything you need to visualize and analyze your data</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 hover:shadow-md hover:border-violet-100 transition-all">
                <div className="w-14 h-14 bg-violet-100 rounded-xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-7 h-7 text-violet-600" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold font-heading text-slate-900 mb-3">Dynamic Datasets</h3>
                <p className="text-slate-600 leading-relaxed">
                  Create and manage datasets with ease. Add rows and columns dynamically, edit data in real-time.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 hover:shadow-md hover:border-violet-100 transition-all">
                <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <Upload className="w-7 h-7 text-orange-600" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold font-heading text-slate-900 mb-3">CSV Import</h3>
                <p className="text-slate-600 leading-relaxed">
                  Upload CSV or Excel files instantly. Automatic parsing and data mapping for quick setup.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 hover:shadow-md hover:border-violet-100 transition-all">
                <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-6">
                  <Sparkles className="w-7 h-7 text-pink-600" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold font-heading text-slate-900 mb-3">AI Predictions</h3>
                <p className="text-slate-600 leading-relaxed">
                  Leverage AI to predict future trends based on historical data patterns. Powered by GPT-5.2.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 mb-6">
              Ready to visualize your data?
            </h2>
            <p className="text-base text-slate-600 mb-8">
              Join thousands who trust DaViz for their data visualization needs.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              data-testid="cta-get-started-btn"
              className="bg-violet-600 text-white hover:bg-violet-700 rounded-full px-10 py-4 font-semibold text-lg shadow-lg shadow-violet-500/20 transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              Get Started Free
            </button>
          </div>
        </section>

        <footer className="bg-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <BarChart3 className="w-6 h-6 text-violet-400" strokeWidth={2} />
                <span className="text-lg font-bold font-heading">DaViz</span>
              </div>
              <p className="text-slate-400 text-sm">
                © 2025 DaViz. Making data visualization simple.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
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
              <div className="flex items-center space-x-3">
                <img 
                  src="https://customer-assets.emergentagent.com/job_insight-hub-233/artifacts/mg1m3zuv_WhatsApp%20Image%202026-01-25%20at%201.31.18%20PM.jpeg" 
                  alt="DaViz Logo" 
                  className="w-10 h-10 object-contain"
                />
                <h1 className="text-2xl font-bold font-heading text-slate-900">DaViz</h1>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                data-testid="get-started-nav-btn"
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 rounded-full px-6 py-2.5 font-semibold shadow-lg shadow-orange-500/20 transition-transform hover:-translate-y-0.5 active:scale-95"
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
                  <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent"> Simple</span>
                </h1>
                <p className="text-base text-slate-600 font-body leading-relaxed">
                  Transform your data into beautiful, insightful visualizations without any coding. 
                  Create datasets, generate charts, and unlock AI-powered predictions in minutes.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    data-testid="get-started-hero-btn"
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 rounded-full px-8 py-4 font-semibold shadow-lg shadow-orange-500/20 transition-transform hover:-translate-y-0.5 active:scale-95"
                  >
                    Start Creating
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    data-testid="view-demo-btn"
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 rounded-full px-8 py-4 font-semibold shadow-lg shadow-emerald-500/20 transition-transform hover:-translate-y-0.5 active:scale-95"
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
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-amber-600" strokeWidth={2} />
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
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 hover:shadow-lg hover:border-emerald-200 transition-all group">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-7 h-7 text-emerald-600" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold font-heading text-slate-900 mb-3">Dynamic Datasets</h3>
                <p className="text-slate-600 leading-relaxed">
                  Create and manage datasets with ease. Add rows and columns dynamically, edit data in real-time.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 hover:shadow-lg hover:border-amber-200 transition-all group">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7 text-amber-600" strokeWidth={2} />
                </div>
                <h3 className="text-xl font-bold font-heading text-slate-900 mb-3">CSV Import</h3>
                <p className="text-slate-600 leading-relaxed">
                  Upload CSV or Excel files instantly. Automatic parsing and data mapping for quick setup.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 hover:shadow-lg hover:border-orange-200 transition-all group">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7 text-orange-600" strokeWidth={2} />
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
              className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white hover:from-orange-600 hover:via-red-600 hover:to-pink-600 rounded-full px-10 py-4 font-semibold text-lg shadow-lg shadow-orange-500/20 transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              Get Started Free
            </button>
          </div>
        </section>

        <footer className="bg-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <img 
                  src="https://customer-assets.emergentagent.com/job_insight-hub-233/artifacts/mg1m3zuv_WhatsApp%20Image%202026-01-25%20at%201.31.18%20PM.jpeg" 
                  alt="DaViz Logo" 
                  className="w-8 h-8 object-contain"
                />
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
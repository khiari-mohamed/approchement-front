import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export function LearningDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [weights, setWeights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadWeights();
  }, []);

  const loadStats = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/learning/stats`);
      const data = await response.json();
      setStats(data.data);
    } catch (error) {
      console.error('Failed to load learning stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeights = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/learning/weights`);
      const data = await response.json();
      setWeights(data.data);
    } catch (error) {
      console.error('Failed to load weights:', error);
    }
  };

  const resetLearning = async () => {
    if (!confirm('Reset all learned weights? This cannot be undone.')) return;
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      await fetch(`${baseUrl}/learning/reset`, { method: 'POST' });
      loadStats();
      loadWeights();
      alert('Learning weights reset successfully!');
    } catch (error) {
      console.error('Failed to reset learning:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8 text-white">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">🧠 AI Learning Dashboard</h2>
            <p className="text-sm text-white/70">Backpropagation-inspired adaptive matching</p>
          </div>
        </div>
        <button
          onClick={resetLearning}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Reset Learning
        </button>
      </div>

      {/* Overall Performance */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Overall Performance</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">{stats?.accuracy || '0'}%</div>
            <div className="text-sm text-white/70">Match Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">{stats?.totalPatterns || 0}</div>
            <div className="text-sm text-white/70">Learning Patterns</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400">
              {stats?.layerPerformance?.length || 0}
            </div>
            <div className="text-sm text-white/70">Active Layers</div>
          </div>
        </div>
      </div>

      {/* Layer Performance */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Layer Performance (6-Layer System)</h3>
        <div className="space-y-4">
          {stats?.layerPerformance?.map((layer: any) => (
            <div key={layer.layer} className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  layer.accuracy >= 70 ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {layer.layer.toUpperCase()}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-sm font-medium text-white">{layer.accuracy}% accurate</div>
                    <div className="text-xs text-white/50">
                      ({layer.correct}/{layer.total} correct)
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${layer.accuracy}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-purple-400 ml-4">
                Weight: {(weights?.layerWeights?.[layer.layer] * 100).toFixed(0)}%
              </div>
            </div>
          )) || (
            <div className="text-center text-white/50 py-8">
              No layer performance data yet. Run a reconciliation to start learning.
            </div>
          )}
        </div>
      </div>

      {/* Feature Weights */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Feature Importance (Learned Weights)</h3>
        <div className="space-y-3">
          {weights?.featureWeights && Object.entries(weights.featureWeights).map(([feature, weight]: [string, any]) => (
            <div key={feature} className="flex items-center justify-between">
              <span className="text-sm font-medium text-white capitalize">{feature}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 bg-white/10 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${weight * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-white w-12 text-right">
                  {(weight * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          )) || (
            <div className="text-center text-white/50 py-4">
              Loading feature weights...
            </div>
          )}
        </div>
      </div>

      {/* Backpropagation Metrics */}
      {stats?.backpropagation && (
        <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">⚡ Backpropagation Algorithm</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/20 p-4 rounded-lg">
              <div className="text-sm text-white/70 mb-1">Learning Rate (α)</div>
              <div className="text-2xl font-bold text-purple-300">{stats.backpropagation.learningRate}</div>
            </div>
            <div className="bg-black/20 p-4 rounded-lg">
              <div className="text-sm text-white/70 mb-1">Momentum (β)</div>
              <div className="text-2xl font-bold text-blue-300">{stats.backpropagation.momentum}</div>
            </div>
            <div className="bg-black/20 p-4 rounded-lg">
              <div className="text-sm text-white/70 mb-1">Total Iterations</div>
              <div className="text-2xl font-bold text-green-300">{stats.backpropagation.totalIterations}</div>
            </div>
            <div className="bg-black/20 p-4 rounded-lg">
              <div className="text-sm text-white/70 mb-1">Recent Accuracy</div>
              <div className="text-2xl font-bold text-yellow-300">{stats.backpropagation.recentAccuracy}%</div>
            </div>
          </div>
          
          {stats.backpropagation.weightAdjustments && (
            <div className="mt-4 bg-black/20 p-4 rounded-lg">
              <div className="text-sm font-semibold text-white mb-2">Weight Changes (Since First Learning)</div>
              <div className="grid grid-cols-5 gap-2 text-xs">
                {Object.entries(stats.backpropagation.weightAdjustments).map(([layer, change]: [string, any]) => (
                  <div key={layer} className="text-center">
                    <div className="text-white/70 capitalize">{layer}</div>
                    <div className={`font-bold ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {change}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* How It Works */}
      <div className="bg-purple-500/10 border border-purple-500/30 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-purple-300 mb-3">🧠 How AI Learning Works</h3>
        <div className="text-sm text-white/80 space-y-2">
          <p>
            <strong className="text-purple-300">Backpropagation-Inspired Learning:</strong> When you validate or reject a match, 
            the system adjusts its internal weights using gradient descent.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-white/70">
            <li><strong>Layer Weights:</strong> Adjusts trust in Backend Logic, DeepSeek AI, Claude AI, Regex, and Historical patterns</li>
            <li><strong>Feature Weights:</strong> Learns which features (amount, date, description) matter most</li>
            <li><strong>Pattern Storage:</strong> Remembers successful matching patterns for future use</li>
            <li><strong>Continuous Improvement:</strong> Gets smarter with every reconciliation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LearningDashboard;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import { NetworkPacket, SecurityAlert } from '../types';
import { AIAnomalyDetector } from '../services/aiDetection';

interface AIInsightsPanelProps {
  packets: NetworkPacket[];
  alerts: SecurityAlert[];
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ packets, alerts }) => {
  const [insights, setInsights] = useState<string>('');
  const [insightBuffer, setInsightBuffer] = useState<string>('');
  const [lastInsightTime, setLastInsightTime] = useState<number>(Date.now());
  const [aiAlerts, setAiAlerts] = useState<SecurityAlert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detector] = useState(() => new AIAnomalyDetector());

  useEffect(() => {
    const analyzeTraffic = async () => {
      if (packets.length === 0) return;

      setIsAnalyzing(true);
      try {
        // Fetch AI alerts
        const newAiAlerts = await detector.analyzePackets(packets.slice(-10));
        setAiAlerts(prev => [...newAiAlerts, ...prev].slice(0, 5));

        // Fetch AI insight
        const newInsights = await detector.getAIInsights(packets, alerts);

        const now = Date.now();
        const MIN_DISPLAY_TIME = 30000; 

        const isMeaningful = newInsights && !newInsights.toLowerCase().includes('no significant');
        const isNew = newInsights !== insightBuffer;

        if ((now - lastInsightTime >= MIN_DISPLAY_TIME) && isMeaningful && isNew) {
          setInsights(newInsights);
          setInsightBuffer(newInsights);
          setLastInsightTime(now);
        }
      } catch (error) {
        console.error('AI Analysis Error:', error);
        setInsights('AI analysis temporarily unavailable');
      } finally {
        setIsAnalyzing(false);
      }
    };

    const interval = setInterval(analyzeTraffic, 10000); 
    analyzeTraffic(); // Initial run
    return () => clearInterval(interval);
  }, [packets, alerts, detector, insightBuffer, lastInsightTime]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-red-400';
    if (confidence >= 0.6) return 'text-orange-400';
    return 'text-yellow-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-6">

      {/* AI-Detected Anomalies */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm p-4 sm:p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-white">AI-Detected Anomalies</h3>
            <p className="text-sm text-slate-400">Machine learning threat detection</p>
          </div>
        </div>

        <div className="space-y-4 max-h-64 overflow-y-auto">
          {aiAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900/50 rounded-lg p-4 border border-slate-600/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-red-500/20 rounded">
                    <Zap className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-sm truncate">
                      {alert.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {alert.details?.aiConfidence && (
                  <div className="text-right">
                    <div className={`text-xs font-medium ${getConfidenceColor(alert.details.aiConfidence)}`}>
                      {getConfidenceLabel(alert.details.aiConfidence)} Confidence
                    </div>
                    <div className="text-xs text-slate-500">
                      {(alert.details.aiConfidence * 100).toFixed(0)}%
                    </div>
                  </div>
                )}
              </div>

              <p className="text-sm text-slate-300 mb-3">
                {alert.description}
              </p>

              <div className="flex flex-wrap gap-1 sm:gap-2">
                {alert.involvedIps.slice(0, 3).map((ip, index) => (
                  <span
                    key={index}
                    className="inline-flex px-1.5 sm:px-2 py-1 text-xs font-mono bg-slate-800/50 text-slate-300 rounded border border-slate-600/50"
                  >
                    {ip}
                  </span>
                ))}
                {alert.involvedIps.length > 3 && (
                  <span className="inline-flex px-2 py-1 text-xs text-slate-400 rounded">
                    +{alert.involvedIps.length - 3} more
                  </span>
                )}
              </div>
            </motion.div>
          ))}

          {aiAlerts.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No AI anomalies detected.</p>
              <p className="text-sm">Network patterns appear normal.</p>
            </div>
          )}
        </div>
      </motion.div>

      
      {/* AI Network Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white">AI Network Insights</h3>
              <p className="text-sm text-slate-400">Intelligent traffic analysis</p>
            </div>
          </div>

          {isAnalyzing && (
            <div className="flex items-center space-x-2 text-purple-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Analyzing...</span>
            </div>
          )}
        </div>

        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600/30">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Current Analysis</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                {insights || 'Initializing AI analysis...'}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Last updated: {new Date(lastInsightTime).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      
    </div>
  );
};

export default AIInsightsPanel;

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Brain, Zap, TrendingUp, AlertCircle, Sparkles, Shield } from 'lucide-react';
import { SecurityAlert } from '../types';
import { AIAnomalyDetector } from '../services/aiDetection';
import { useWebSocket } from '../hooks/useWebSocket';

const AIAnalysisPage: React.FC = () => {
  const WS_URL = import.meta.env.VITE_WS_URL;
  const { packets, alerts, connected } = useWebSocket(WS_URL);

  const [displayedInsight, setDisplayedInsight] = useState<string>('Waiting for AI analysis...');
  const [aiAlerts, setAiAlerts] = useState<SecurityAlert[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [detector] = useState(() => new AIAnomalyDetector());

  useEffect(() => {
    let insightTimeout: NodeJS.Timeout;

    const analyzeTraffic = async () => {
      const now = Date.now();

      if (now - lastAnalysisTime < 30000 || packets.length === 0) return;

      setIsAnalyzing(true);
      setLastAnalysisTime(now);

      try {
        const newAiAlerts = await detector.analyzePackets(packets.slice(0, 10));
        setAiAlerts(prev => [...newAiAlerts, ...prev].slice(0, 10));

        const newInsights = await detector.getAIInsights(packets, alerts);

        setDisplayedInsight(newInsights);

        clearTimeout(insightTimeout);
        insightTimeout = setTimeout(() => {
          setDisplayedInsight(newInsights);
        }, 20000);
      } catch (err) {
        console.error(err);
        setDisplayedInsight('AI analysis temporarily unavailable.');
      } finally {
        setIsAnalyzing(false);
      }
    };

    const interval = setInterval(analyzeTraffic, 5000);
    analyzeTraffic();

    return () => {
      clearInterval(interval);
      clearTimeout(insightTimeout);
    };
  }, [packets, alerts, detector]);

  const getConfidenceColor = (confidence: number) =>
    confidence >= 0.8 ? 'text-red-400' : confidence >= 0.6 ? 'text-orange-400' : 'text-yellow-400';

  const getConfidenceLabel = (confidence: number) =>
    confidence >= 0.8 ? 'High' : confidence >= 0.6 ? 'Medium' : 'Low';

  const formatAlertType = (type: string) =>
    type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const handleCopy = () => {
    navigator.clipboard.writeText(displayedInsight).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section className="py-20 bg-slate-900 min-h-screen">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">AI Network Analysis</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Advanced machine learning insights and intelligent threat detection for your network
          </p>
          <p className="text-yellow-400 max-w-2xl mx-auto text-sm italic text-center">
            ⚠️ AI analysis runs every 20 seconds due to free API limitations. Please be patient — results will update automatically.
          </p>
          <div className="mt-2 flex items-center justify-center space-x-3 p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm border border-slate-700/50 max-w-md mx-auto">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className="text-slate-300">
              {connected ? 'Connected to WebSocket' : 'Simulating Data (WebSocket Disconnected)'}
            </span>
          </div>

        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">

          {/* Anomalies */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
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

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {aiAlerts.map(alert => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-slate-900/50 rounded-lg p-4 border border-slate-600/30"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-1.5 bg-red-500/20 rounded">
                        <Zap className="w-4 h-4 text-red-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm truncate">{formatAlertType(alert.type)}</h4>
                        <p className="text-xs text-slate-400">{new Date(alert.timestamp).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    {alert.details?.aiConfidence && (
                      <div className="text-right">
                        <div className={`text-xs font-medium ${getConfidenceColor(alert.details.aiConfidence)}`}>
                          {getConfidenceLabel(alert.details.aiConfidence)} Confidence
                        </div>
                        <div className="text-xs text-slate-500">{(alert.details.aiConfidence * 100).toFixed(0)}%</div>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-slate-300 mb-3">{alert.description}</p>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {alert.involvedIps.slice(0, 3).map((ip, i) => (
                      <span
                        key={i}
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
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Waiting for AI response</p>
                  <p className="text-sm">.......</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Insights */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm p-4 sm:p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                  <Brain className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">AI Network Insights</h3>
                  <p className="text-sm text-slate-400">
                    Intelligent traffic analysis <span className="text-xs text-yellow-400">(This data refreshes every 20 sec)</span>
                  </p>

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
              <div className="flex items-start space-x-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-white font-medium">Current Analysis</h4>
                    <button
                      onClick={handleCopy}
                      className="text-xs px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition-all"
                    >
                      {copied ? 'Copied!' : 'Copy Insight'}
                    </button>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    <ReactMarkdown>{displayedInsight}</ReactMarkdown>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>


        </div>
      </div>
    </section>
  );
};

export default AIAnalysisPage;

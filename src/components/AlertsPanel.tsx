import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, Zap, Eye, AlertCircle } from 'lucide-react';
import { SecurityAlert } from '../types';

interface AlertsPanelProps {
  alerts: SecurityAlert[];
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts }) => {
  const getAlertIcon = (type: string) => {
    const icons = {
      ARP_SPOOFING: Shield,
      SYN_FLOOD: Zap,
      PORT_SCAN: Eye,
      DNS_POISONING: AlertCircle,
      SUSPICIOUS_TRAFFIC: AlertTriangle
    };
    return icons[type as keyof typeof icons] || AlertTriangle;
  };

  const getAlertColor = (severity: string) => {
    const colors = {
      low: 'border-l-yellow-400 bg-yellow-500/10 text-yellow-400',
      medium: 'border-l-orange-400 bg-orange-500/10 text-orange-400',
      high: 'border-l-red-400 bg-red-500/10 text-red-400',
      critical: 'border-l-red-600 bg-red-600/20 text-red-300'
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  const getSeverityBadge = (severity: string) => {
    const badges = {
      low: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      medium: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      high: 'bg-red-500/20 text-red-400 border-red-500/50',
      critical: 'bg-red-600/20 text-red-300 border-red-600/50'
    };
    return badges[severity as keyof typeof badges] || badges.medium;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatAlertType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
      <div className="p-6 border-b border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-2">Security Alerts</h3>
        <p className="text-slate-400">Real-time threat detection and suspicious activity</p>
      </div>

      <div className="p-3 sm:p-6 space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {alerts.map((alert) => {
            const IconComponent = getAlertIcon(alert.type);
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.severity)} backdrop-blur-sm`}
              >
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-slate-900/50">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-1 sm:space-y-0">
                      <h4 className="text-sm font-medium text-white truncate">
                        {formatAlertType(alert.type)}
                      </h4>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getSeverityBadge(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatTimestamp(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">
                      {alert.description}
                    </p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {alert.involvedIps.map((ip, index) => (
                        <span
                          key={index}
                          className="inline-flex px-1.5 sm:px-2 py-1 text-xs font-mono bg-slate-800/50 text-slate-300 rounded border border-slate-600/50"
                        >
                          {ip}
                        </span>
                      ))}
                      {alert.involvedMacs && alert.involvedMacs.map((mac, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-mono bg-slate-900/50 text-slate-300 rounded border border-slate-600/50"
                        >
                          {mac}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {alerts.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No security alerts detected.</p>
            <p className="text-sm">Your network is secure.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
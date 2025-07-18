import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Wifi, Shield, Zap } from 'lucide-react';
import PacketTable from './PacketTable';
import AlertsPanel from './AlertsPanel';
import FilterPanel from './FilterPanel';
import { useWebSocket } from '../hooks/useWebSocket';
import { FilterOptions } from '../types';

const LiveDashboard: React.FC = () => {
  const WS_URL = import.meta.env.VITE_WS_URL;
  const { connected, packets, allPackets, alerts, stats } = useWebSocket(WS_URL);
  const [filters, setFilters] = React.useState<FilterOptions>({
    protocol: '',
    sourceIp: '',
    destinationIp: '',
    timeRange: 'All Time'
  });

  // Filter packets based on current filters
  const filteredPackets = React.useMemo(() => {
    return packets.filter(packet => {
      if (filters.protocol && packet.protocol !== filters.protocol) return false;
      if (filters.sourceIp && !packet.sourceIp.includes(filters.sourceIp)) return false;
      if (filters.destinationIp && !packet.destinationIp.includes(filters.destinationIp)) return false;

      // Time range filtering
      if (filters.timeRange !== 'All Time') {
        const packetTime = new Date(packet.timestamp);
        const now = new Date();
        const diffMinutes = (now.getTime() - packetTime.getTime()) / (1000 * 60);

        switch (filters.timeRange) {
          case 'Last 5 min':
            if (diffMinutes > 5) return false;
            break;
          case 'Last 15 min':
            if (diffMinutes > 15) return false;
            break;
          case 'Last 1 hour':
            if (diffMinutes > 60) return false;
            break;
        }
      }

      return true;
    });
  }, [packets, filters]);


  const handleExport = () => {
    const dataToExport = {
      packets: filteredPackets,
      alerts,
      stats,
      exportTime: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kspectra-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestart = () => {
    window.location.reload();
  };

  const statsCards = [
    {
      icon: Activity,
      label: 'Total Packets',
      value: stats.totalPackets.toLocaleString(),
      color: 'text-blue-400'
    },
    {
      icon: Zap,
      label: 'Packets/Sec',
      value: stats.packetsPerSecond.toLocaleString(),
      color: 'text-green-400'
    },
    {
      icon: Shield,
      label: 'Total Alerts',
      value: stats.totalAlerts.toLocaleString(),
      color: 'text-red-400'
    },
    {
      icon: Wifi,
      label: 'Active Connections',
      value: stats.activeConnections.toLocaleString(),
      color: 'text-purple-400'
    }
  ];

  return (
    <section id="dashboard" className="py-20 bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Live Network Dashboard
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Real-time monitoring and analysis of your network traffic with intelligent threat detection
          </p>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-3 p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm border border-slate-700/50 max-w-md mx-auto">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className="text-slate-300">
              {connected ? 'Connected to WebSocket' : 'Simulating Data (WebSocket Disconnected)'}
            </span>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6 hover:bg-slate-800/70 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-slate-900/50 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onExport={handleExport}
          onRestart={handleRestart}
          totalPackets={allPackets.length}
          filteredCount={filteredPackets.length}
        />

        {/* Main Dashboard Content - All panels below filters */}
        <div className="space-y-8">
          {/* Two-column layout for main panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Live Traffic Stream */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              id="live-traffic"
            >
              <PacketTable packets={filteredPackets} />
            </motion.div>

            {/* Security Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              id="alerts"
            >
              <AlertsPanel alerts={alerts} />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveDashboard;
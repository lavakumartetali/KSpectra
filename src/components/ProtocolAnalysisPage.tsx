import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useWebSocket } from '../hooks/useWebSocket';
import { NetworkStats } from '../types';

const ProtocolAnalysisPage: React.FC = () => {
  const WS_URL = import.meta.env.VITE_WS_URL;
  const { stats: incomingStats, connected } = useWebSocket(WS_URL);
  const [liveStats, setLiveStats] = useState<NetworkStats>({
    totalPackets: 1,
    packetsPerSecond: 0,
    totalAlerts: 0,
    activeConnections: 0,
    protocolDistribution: {},
    topSourceIps: [],
    topDestinationIps: [],
  });

  const pendingStatsRef = useRef<NetworkStats | null>(null);

  // Buffer incoming stats
  useEffect(() => {
    if (incomingStats) {
      pendingStatsRef.current = incomingStats;
    }
  }, [incomingStats]);

  // Update charts every 5s with merged data
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingStatsRef.current) {
        setLiveStats((prev) => {
          const newStats = pendingStatsRef.current!;
          pendingStatsRef.current = null;

          const mergedProtocol = { ...prev.protocolDistribution };
          for (const [protocol, count] of Object.entries(newStats.protocolDistribution)) {
            mergedProtocol[protocol] = (mergedProtocol[protocol] || 0) + count;
          }

          const ipCountMap: Record<string, number> = {};
          [...prev.topSourceIps, ...newStats.topSourceIps].forEach(({ ip, count }) => {
            ipCountMap[ip] = (ipCountMap[ip] || 0) + count;
          });

          const mergedTopSourceIps = Object.entries(ipCountMap)
            .map(([ip, count]) => ({ ip, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

          return {
            ...prev,
            totalPackets: prev.totalPackets + newStats.totalPackets,
            totalAlerts: prev.totalAlerts + newStats.totalAlerts,
            packetsPerSecond: newStats.packetsPerSecond,
            activeConnections: newStats.activeConnections,
            protocolDistribution: mergedProtocol,
            topSourceIps: mergedTopSourceIps,
            topDestinationIps: newStats.topDestinationIps,
          };
        });
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const totalProtocolPackets = Object.values(liveStats.protocolDistribution).reduce(
    (sum, count) => sum + count,
    0
  );

  const protocolData = Object.entries(liveStats.protocolDistribution || {})
    .map(([protocol, count]) => ({
      name: protocol,
      value: count,
      percentage: ((count / Math.max(totalProtocolPackets, 1)) * 100).toFixed(1),
    }))
    .filter((item) => item.value > 0);


  const protocolColors: Record<string, string> = {
    HTTP: '#10B981',
    HTTPS: '#059669',
    TCP: '#3B82F6',
    UDP: '#8B5CF6',
    DNS: '#F59E0B',
    ARP: '#EF4444',
    ICMP: '#F97316',
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600/50 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name || data.ip}</p>
          <p className="text-slate-300 text-sm">{`Count: ${data.value || data.count}`}</p>
          {data.percentage && (
            <p className="text-slate-300 text-sm">{`Percentage: ${data.percentage}%`}</p>
          )}
        </div>
      );
    }
    return null;
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
          <h2 className="text-4xl font-bold text-white mb-4">Protocol & Traffic Analysis</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Detailed breakdown of network protocols and source IP activity
          </p>

          <div className="mt-2 flex items-center justify-center space-x-3 p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm border border-slate-700/50 max-w-md mx-auto">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className="text-slate-300">
              {connected ? 'Connected to WebSocket' : 'Simulating Data (WebSocket Disconnected)'}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Protocol Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm p-4 sm:p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <PieChartIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Protocol Distribution</h3>
                <p className="text-sm text-slate-400">Traffic breakdown by protocol</p>
              </div>
            </div>

            <div className="h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={protocolData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {protocolData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={protocolColors[entry.name] || '#6B7280'}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {protocolData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: protocolColors[entry.name] || '#6B7280' }}
                  ></div>
                  <span className="text-sm text-slate-300">{entry.name}</span>
                  <span className="text-xs text-slate-500">({entry.percentage}%)</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Source IPs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm p-4 sm:p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Top Source IPs</h3>
                <p className="text-sm text-slate-400">Most active source addresses</p>
              </div>
            </div>

            <div className="h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={liveStats.topSourceIps} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="ip"
                    stroke="#9CA3AF"
                    fontSize={12}
                    width={120}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    wrapperStyle={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      boxShadow: 'none',
                      pointerEvents: 'none',
                    }}
                    cursor={{ fill: 'transparent' }}
                  />

                  <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 space-y-2 max-h-32 overflow-y-auto">
              {liveStats.topSourceIps.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg"
                >
                  <span className="text-sm font-mono text-slate-300">{item.ip}</span>
                  <span className="text-sm text-green-400 font-medium">{item.count} packets</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProtocolAnalysisPage;

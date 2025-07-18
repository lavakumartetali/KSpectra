import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { ChartData } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';

const TrafficTrendsPage: React.FC = () => {
  const WS_URL = import.meta.env.VITE_WS_URL;
  const { stats, alerts, connected  } = useWebSocket(WS_URL);

  const [chartData, setChartData] = React.useState<ChartData[]>([]);

  // Live chart data update on WebSocket changes
  React.useEffect(() => {
    const now = new Date();
    const newPoint: ChartData = {
      timestamp: now.toISOString(),
      packets: stats.packetsPerSecond,
      alerts: alerts.length,
    };

    setChartData(prev => {
      const updated = [...prev, newPoint];
      return updated.slice(-20); // Keep last 20 data points
    });
  }, [stats.packetsPerSecond, alerts.length]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600/50 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 text-sm">{`Time: ${new Date(label).toLocaleTimeString()}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.value}`}
            </p>
          ))}
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
          <h2 className="text-4xl font-bold text-white mb-4">
            Traffic Trends Analysis
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Real-time visualization of network packet flow and security alerts over time
          </p>

          <div className="mt-2 flex items-center justify-center space-x-3 p-4 bg-slate-800/50 rounded-lg backdrop-blur-sm border border-slate-700/50 max-w-md mx-auto">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`}></div>
            <span className="text-slate-300">
              {connected ? 'Connected to WebSocket' : 'Simulating Data (WebSocket Disconnected)'}
            </span>
          </div>
        </motion.div>

        <div className="space-y-8">
          {/* Area Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm p-4 sm:p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Real-time Traffic Flow</h3>
                <p className="text-sm text-slate-400">Packets per second and security alerts</p>
              </div>
            </div>

            <div className="h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="packetsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="alertsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="timestamp"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="packets"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#packetsGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="alerts"
                    stroke="#EF4444"
                    fillOpacity={1}
                    fill="url(#alertsGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bar Chart (replaces Line Chart) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm p-4 sm:p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Traffic & Alert Comparison</h3>
                <p className="text-sm text-slate-400">Bar chart view of recent activity</p>
              </div>
            </div>

            <div className="h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="timestamp"
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
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
                  <Bar dataKey="packets" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="alerts" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrafficTrendsPage;

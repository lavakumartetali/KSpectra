import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { ChartData, NetworkStats } from '../types';

interface ChartsPanelProps {
  chartData: ChartData[];
  stats: NetworkStats;
}

const ChartsPanel: React.FC<ChartsPanelProps> = ({ chartData, stats }) => {
  // Prepare protocol distribution data for pie chart
  const protocolData = Object.entries(stats.protocolDistribution || {}).map(([protocol, count]) => ({
    name: protocol,
    value: count,
    percentage: ((count / stats.totalPackets) * 100).toFixed(1)
  })).filter(item => item.value > 0);

  // Colors for different protocols
  const protocolColors = {
    HTTP: '#10B981',
    HTTPS: '#059669',
    TCP: '#3B82F6',
    UDP: '#8B5CF6',
    DNS: '#F59E0B',
    ARP: '#EF4444',
    ICMP: '#F97316'
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600/50 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 text-sm">{`Time: ${label}`}</p>
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
    <div className="space-y-6">
      {/* Traffic Trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Traffic Trends</h3>
            <p className="text-sm text-slate-400">Real-time packet flow and alerts</p>
          </div>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="packetsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="alertsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Protocol Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6"
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
          
          {protocolData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={protocolData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {protocolData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={protocolColors[entry.name as keyof typeof protocolColors] || '#6B7280'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-600/50 rounded-lg p-3 shadow-lg">
                            <p className="text-white font-medium">{data.name}</p>
                            <p className="text-slate-300 text-sm">{`Count: ${data.value}`}</p>
                            <p className="text-slate-300 text-sm">{`Percentage: ${data.percentage}%`}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <PieChartIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No protocol data available</p>
                <p className="text-sm">Waiting for network traffic...</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Top Source IPs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm p-6"
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
          
          {stats.topSourceIps && stats.topSourceIps.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topSourceIps} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="ip" 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    fill="#10B981"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No source IP data available</p>
                <p className="text-sm">Waiting for network traffic...</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ChartsPanel;
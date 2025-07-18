import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NetworkPacket } from '../types';

interface PacketTableProps {
  packets: NetworkPacket[];
}

const PacketTable: React.FC<PacketTableProps> = ({ packets }) => {
  const getProtocolColor = (protocol: string) => {
    const colors = {
      HTTP: 'bg-green-500/20 text-green-400 border-green-500/50',
      HTTPS: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      TCP: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      UDP: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      DNS: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
      ARP: 'bg-red-500/20 text-red-400 border-red-500/50',
      ICMP: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    };
    return colors[protocol as keyof typeof colors] || 'bg-slate-500/20 text-slate-400 border-slate-500/50';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatSize = (size: number) => {
    return size < 1024 ? `${size}B` : `${(size / 1024).toFixed(1)}KB`;
  };

  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
      <div className="p-6 border-b border-slate-700/50">
        <h3 className="text-xl font-semibold text-white mb-2">Live Traffic Stream</h3>
        <p className="text-slate-400">Real-time network packets (latest 50)</p>
      </div>

      <div className="overflow-hidden max-h-96">
        <div className="overflow-x-auto min-w-full">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full min-w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Source IP
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Destination IP
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Protocol
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Port
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              <AnimatePresence>
                {packets.map((packet) => (
                  <motion.tr
                    key={packet.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-slate-300">
                      {formatTimestamp(packet.timestamp)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-mono text-slate-300">
                      {packet.sourceIp}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-mono text-slate-300">
                      {packet.destinationIp}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getProtocolColor(packet.protocol)}`}>
                        {packet.protocol}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-slate-300">
                      {formatSize(packet.size)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-slate-300">
                      {packet.port || '-'}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {packets.length === 0 && (
        <div className="p-8 text-center text-slate-400">
          <p>No packets captured yet. Waiting for network traffic...</p>
        </div>
      )}
    </div>
  );
};

export default PacketTable;
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { NetworkPacket, SecurityAlert, NetworkStats } from '../types';

export const useWebSocket = (url?: string) => {
  const [connected, setConnected] = useState(false);
  const [packets, setPackets] = useState<NetworkPacket[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [stats, setStats] = useState<NetworkStats>({
    totalPackets: 1,
    packetsPerSecond: 0,
    totalAlerts: 0,
    activeConnections: 0,
    protocolDistribution: {},
    topSourceIps: [],
    topDestinationIps: []
  });
  const socketRef = useRef<Socket | null>(null);
  const [allPackets, setAllPackets] = useState<NetworkPacket[]>([]);

  useEffect(() => {
    if (url) {
      socketRef.current = io(url, {
        transports: ['websocket'],
        upgrade: false
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        setConnected(true);
        console.log('Connected to WebSocket server');
      });

      socket.on('disconnect', () => {
        setConnected(false);
        console.log('Disconnected from WebSocket server');
      });

      socket.on('packet', (packet: NetworkPacket) => {
        setPackets(prev => [packet, ...prev.slice(0, 49)]);
        setAllPackets(prev => [packet, ...prev]);
      });

      socket.on('alert', (alert: SecurityAlert) => {
        setAlerts(prev => [alert, ...prev.slice(0, 19)]);
      });

      socket.on('stats', (newStats: NetworkStats) => {
        console.log('Incoming Stats:', newStats);
        setStats(prev => {
          const mergedProtocolDistribution: Record<string, number> = { ...prev.protocolDistribution };
          for (const [protocol, count] of Object.entries(newStats.protocolDistribution || {})) {
            mergedProtocolDistribution[protocol] = (mergedProtocolDistribution[protocol] || 0) + count;
          }

          const sourceIpMap: Record<string, number> = {};
          [...(prev.topSourceIps || []), ...(newStats.topSourceIps || [])].forEach(({ ip, count }) => {
            sourceIpMap[ip] = (sourceIpMap[ip] || 0) + count;
          });
          const mergedTopSourceIps = Object.entries(sourceIpMap)
            .map(([ip, count]) => ({ ip, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

          const destinationIpMap: Record<string, number> = {};
          [...(prev.topDestinationIps || []), ...(newStats.topDestinationIps || [])].forEach(({ ip, count }) => {
            destinationIpMap[ip] = (destinationIpMap[ip] || 0) + count;
          });
          const mergedTopDestinationIps = Object.entries(destinationIpMap)
            .map(([ip, count]) => ({ ip, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

          return {
            ...prev,
            totalPackets: prev.totalPackets + (newStats.totalPackets || 0),
            packetsPerSecond: newStats.packetsPerSecond || prev.packetsPerSecond,
            totalAlerts: prev.totalAlerts + (newStats.totalAlerts || 0),
            activeConnections: newStats.activeConnections || prev.activeConnections,
            protocolDistribution: mergedProtocolDistribution,
            topSourceIps: mergedTopSourceIps,
            topDestinationIps: mergedTopDestinationIps,
          };
        });
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [url]);


  useEffect(() => {
    if (allPackets.length > 0) {
      const protocolCounts = allPackets.reduce((acc, packet) => {
        acc[packet.protocol] = (acc[packet.protocol] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const sourceCounts = allPackets.reduce((acc, packet) => {
        acc[packet.sourceIp] = (acc[packet.sourceIp] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const destCounts = allPackets.reduce((acc, packet) => {
        acc[packet.destinationIp] = (acc[packet.destinationIp] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topSourceIps = Object.entries(sourceCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count }));

      const topDestinationIps = Object.entries(destCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([ip, count]) => ({ ip, count }));

      setStats(prev => ({
        ...prev,
        protocolDistribution: protocolCounts,
        topSourceIps,
        topDestinationIps
      }));
    }
  }, [allPackets]);

  return {
    connected,
    packets,
    allPackets,
    alerts,
    stats,
    socket: socketRef.current
  };
};

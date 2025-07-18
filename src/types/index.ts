export interface NetworkPacket {
  id: string;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  protocol: string;
  size: number;
  port?: number;
}

export interface SecurityAlert {
  id: string;
  type: 'ARP_SPOOFING' | 'SYN_FLOOD' | 'PORT_SCAN' | 'DNS_POISONING' | 'SUSPICIOUS_TRAFFIC';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  description: string;
  involvedIps: string[];
  involvedMacs?: string[];
  details: Record<string, any>;
}

export interface NetworkStats {
  totalPackets: number;
  packetsPerSecond: number;
  totalAlerts: number;
  activeConnections: number;
  protocolDistribution: { [key: string]: number };
  topSourceIps: { ip: string; count: number }[];
  topDestinationIps: { ip: string; count: number }[];
}

export interface FilterOptions {
  protocol: string;
  sourceIp: string;
  destinationIp: string;
  timeRange: string;
}

export interface ChartData {
  timestamp: string;
  packets: number;
  alerts: number;
}


export interface NetworkStats {
  totalPackets: number;
  packetsPerSecond: number;
  totalAlerts: number;
  activeConnections: number;
  protocolDistribution: { [key: string]: number };
  topSourceIps: { ip: string; count: number }[];
  topDestinationIps: { ip: string; count: number }[];
}


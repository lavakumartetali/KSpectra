import { NetworkPacket, SecurityAlert } from '../types';

export class AIAnomalyDetector {
  private packetHistory: NetworkPacket[] = [];
  private aiAvailable: boolean = true;

  private lastPromptHash: string = '';
  private lastCallTimestamp = 0;
  private backoffUntil = 0;

  async analyzePackets(packets: NetworkPacket[]): Promise<SecurityAlert[]> {
    this.packetHistory = [...this.packetHistory, ...packets].slice(-100);
    return this.aiAvailable ? this.simulateAIDetection(packets) : [];
  }

  private simulateAIDetection(packets: NetworkPacket[]): SecurityAlert[] {
    const alerts: SecurityAlert[] = [];
    const recentPackets = packets.slice(-10);

    const protocolCounts = recentPackets.reduce((acc, packet) => {
      acc[packet.protocol] = (acc[packet.protocol] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (protocolCounts['ARP'] && protocolCounts['ARP'] > 3) {
      alerts.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'ARP_SPOOFING',
        severity: 'high',
        timestamp: new Date().toISOString(),
        description: 'AI detected unusual ARP traffic pattern suggesting potential spoofing attack',
        involvedIps: recentPackets.filter(p => p.protocol === 'ARP').map(p => p.sourceIp),
        details: { aiConfidence: 0.87, pattern: 'excessive_arp_requests' }
      });
    }

    const uniquePorts = new Set(recentPackets.filter(p => p.port).map(p => p.port));
    if (uniquePorts.size > 5) {
      alerts.push({
        id: Math.random().toString(36).substr(2, 9),
        type: 'PORT_SCAN',
        severity: 'medium',
        timestamp: new Date().toISOString(),
        description: 'AI identified potential port scanning behavior from multiple source IPs',
        involvedIps: [...new Set(recentPackets.map(p => p.sourceIp))],
        details: { aiConfidence: 0.73, portsScanned: uniquePorts.size }
      });
    }

    return alerts;
  }

  async getAIInsights(packets: NetworkPacket[], alerts: SecurityAlert[]): Promise<string> {
    const now = Date.now();

    // Skip if still backing off
    if (now < this.backoffUntil) {
      console.warn('🕒 Backoff active. Skipping AI call.');
      return 'AI temporarily paused due to rate limiting.';
    }

    // Throttle: Minimum 15s between calls
    if (now - this.lastCallTimestamp < 15000) {
      return 'Waiting to avoid frequent AI requests...';
    }

    const packetSummary = packets.slice(-20).map(p => (
      `Time: ${p.timestamp}, Src: ${p.sourceIp}, Dest: ${p.destinationIp}, Protocol: ${p.protocol}, Port: ${p.port}`
    )).join('\n');

    const alertSummary = alerts.map(a => (
      `Alert: ${a.type}, Severity: ${a.severity}, IPs: ${a.involvedIps.join(', ')}`
    )).join('\n');

    const prompt = `
You are a network security expert. Analyze the following network traffic and alerts for insights.

Recent Network Packets:
${packetSummary}

Recent Alerts:
${alertSummary}

Provide a concise summary of any patterns, threats, or anomalies you observe. If all looks normal, say so.
    `.trim();

    // Skip if prompt hasn't changed
    const promptHash = this.hashString(prompt);
    if (promptHash === this.lastPromptHash) {
      return 'No significant network changes detected.';
    }

    this.lastPromptHash = promptHash;
    this.lastCallTimestamp = now;

    return await this.callAIAPI(prompt);
  }

  private async callAIAPI(prompt: string): Promise<string> {
    try {
      const WS_URL = import.meta.env.VITE_WS_URL;
      const res = await fetch(`${WS_URL}/api/ai-insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (!res.ok) {
        if (res.status === 429) {
          console.warn('🚫 Rate limit hit. Backing off for 60s.');
          this.backoffUntil = Date.now() + 60000; // 60 seconds
          return '⚠️ AI temporarily paused due to rate limiting.';
        }
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      this.aiAvailable = true;
      return data.message || 'No insights available.';
    } catch (error) {
      console.error('AI API Error:', error);
      this.aiAvailable = false;
      return 'Error contacting AI API.';
    }
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString();
  }

  isAIAvailable(): boolean {
    return this.aiAvailable;
  }
}

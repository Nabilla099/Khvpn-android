export type TunnelMode = 'ssh-slowdns' | 'ssh-direct' | 'slowdns-only';

export type SlowDnsProtocol = 'slipstream' | 'dnstt';
export type DnsTransport = 'udp' | 'dot' | 'doh';

export type ConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting';

export interface HostProfile {
  id: string;
  name: string;
  region: string;
  mode: TunnelMode;
  sshHost: string;
  sshPort: number;
  username: string;
  password: string;
  nameserver: string;
  dnsResolver: string;
  publicKey: string;
  lastLatencyMs: number | null;
  notes?: string;
  protocol?: SlowDnsProtocol;
  transport?: DnsTransport;
}

export type OptimizationPreset = 'ringan' | 'stabil' | 'responsif' | 'kustom';

export interface OptimizationConfig {
  preset: OptimizationPreset;
  keepAliveSec: 0 | 15 | 30 | 60;
  tcpNoDelay: boolean;
  tcpFastOpen: boolean;
  mtu: 1280 | 1380 | 1420 | 1500;
  dnsCache: boolean;
  zlibCompression: boolean;
  bufferKb: 32 | 64 | 128;
}

export interface AutoReconnectConfig {
  enabled: boolean;
  detectProviderSwitch: boolean;
  delaySec: 1 | 3 | 5;
  maxRetries: 5 | 10 | 0;
  flushDnsOnSwitch: boolean;
  fallbackResolvers: string[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export interface NetworkProbeResult {
  rttMs: number;
  jitterMs: number;
  stabilityScore: string;
  measuredAt: string;
  effectiveType: string;
  online: boolean;
}

export type ActiveTab = 'koneksi' | 'host' | 'optimasi' | 'reconnect';

import {
  AutoReconnectConfig,
  HostProfile,
  OptimizationConfig,
  OptimizationPreset,
} from '../types/vpn';

export const DEFAULT_HOSTS: HostProfile[] = [
  {
    id: 'sg-slowdns-01',
    name: 'SG Singapore SlowDNS-01',
    region: 'Singapura',
    mode: 'ssh-slowdns',
    sshHost: 'sg1.khvpn-node.net',
    sshPort: 22,
    username: 'khvpn_sg01',
    password: '••••••••••',
    nameserver: 'ns1.sg1.khvpn-dns.net',
    dnsResolver: '1.1.1.1:53',
    publicKey: '8a4f2c91d0e5b73a61f8492c3e0d7b5a19f4c8e2706b3d51a8c2e4f091d7b3a6',
    lastLatencyMs: 38,
    notes: 'Rute utama UDP 53 untuk trafik stabil dan hemat baterai.',
  },
  {
    id: 'id-jkt-tunnel',
    name: 'ID Jakarta LowPing Tunnel',
    region: 'Indonesia',
    mode: 'ssh-slowdns',
    sshHost: 'jkt.khvpn-node.net',
    sshPort: 443,
    username: 'khvpn_jkt',
    password: '••••••••••',
    nameserver: 'ns.jkt.khvpn-dns.net',
    dnsResolver: '8.8.8.8:53',
    publicKey: '4c19e7b2a508f3d6e19c4b7a82d5f03e6b91c4d7a2f8e5013c6b9d4a7e2f8015',
    lastLatencyMs: 21,
    notes: 'Latensi lokal terendah dengan fallback resolver Google DNS.',
  },
  {
    id: 'jp-tokyo-edge',
    name: 'JP Tokyo Edge SlowDNS',
    region: 'Jepang',
    mode: 'slowdns-only',
    sshHost: 'jp1.khvpn-node.net',
    sshPort: 22,
    username: 'khvpn_jp',
    password: '••••••••••',
    nameserver: 'dns.jp1.khvpn-dns.net',
    dnsResolver: '9.9.9.9:53',
    publicKey: '7f2e8a14c6b903d5e81a4f7c2b90d6e3a51f8c4b72e90d3a6f1c8e5b24d7a903',
    lastLatencyMs: 68,
    notes: 'Mode SlowDNS murni untuk jaringan dengan pembatasan port TCP.',
  },
  {
    id: 'sg-direct-fast',
    name: 'SG Direct Port 443',
    region: 'Singapura',
    mode: 'ssh-direct',
    sshHost: 'direct-sg.khvpn-node.net',
    sshPort: 443,
    username: 'khvpn_fast',
    password: '••••••••••',
    nameserver: 'ns1.sg1.khvpn-dns.net',
    dnsResolver: '1.1.1.1:53',
    publicKey: '2d8c5a90e1f4b736c8a2d5e9f1b47036a8c2d5e9f1b47036c8a2d5e9f1b47036',
    lastLatencyMs: 31,
    notes: 'Koneksi SSH langsung tanpa enkapsulasi DNS saat jaringan terbuka.',
  },
];

export const OPTIMIZATION_PRESETS: Record<
  Exclude<OptimizationPreset, 'kustom'>,
  Omit<OptimizationConfig, 'preset'>
> = {
  ringan: {
    keepAliveSec: 60,
    tcpNoDelay: false,
    tcpFastOpen: false,
    mtu: 1420,
    dnsCache: true,
    zlibCompression: false,
    bufferKb: 32,
  },
  stabil: {
    keepAliveSec: 15,
    tcpNoDelay: true,
    tcpFastOpen: true,
    mtu: 1380,
    dnsCache: true,
    zlibCompression: true,
    bufferKb: 64,
  },
  responsif: {
    keepAliveSec: 15,
    tcpNoDelay: true,
    tcpFastOpen: true,
    mtu: 1280,
    dnsCache: true,
    zlibCompression: false,
    bufferKb: 128,
  },
};

export const DEFAULT_OPTIMIZATION: OptimizationConfig = {
  preset: 'stabil',
  ...OPTIMIZATION_PRESETS.stabil,
};

export const DEFAULT_AUTO_RECONNECT: AutoReconnectConfig = {
  enabled: true,
  detectProviderSwitch: true,
  delaySec: 3,
  maxRetries: 10,
  flushDnsOnSwitch: true,
  fallbackResolvers: ['1.1.1.1:53', '8.8.8.8:53', '9.9.9.9:53'],
};

export const PROVIDER_SCENARIOS = [
  { id: 'wifi-to-4g', label: 'Wi-Fi Kantor ke Seluler 4G', from: 'Wi-Fi', to: 'Seluler 4G' },
  { id: '4g-to-wifi', label: 'Seluler 4G ke Wi-Fi Rumah', from: 'Seluler 4G', to: 'Wi-Fi' },
  { id: 'sim1-to-sim2', label: 'Provider A ke Provider B (Dual-SIM)', from: 'SIM 1', to: 'SIM 2' },
];

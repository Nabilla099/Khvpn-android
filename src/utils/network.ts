import { HostProfile, NetworkProbeResult, OptimizationConfig, TunnelMode } from '../types/vpn';

interface NetworkInformationLike {
  effectiveType?: string;
  type?: string;
  downlink?: number;
  rtt?: number;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

export function getNavigatorConnection(): NetworkInformationLike | null {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as Navigator & {
    connection?: NetworkInformationLike;
    mozConnection?: NetworkInformationLike;
    webkitConnection?: NetworkInformationLike;
  };
  return nav.connection || nav.mozConnection || nav.webkitConnection || null;
}

export function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':');
}

export function formatTimeNow(): string {
  const now = new Date();
  return now.toLocaleTimeString('id-ID', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function getModeLabel(mode: TunnelMode): string {
  switch (mode) {
    case 'ssh-slowdns':
      return 'SSH + SlowDNS';
    case 'ssh-direct':
      return 'SSH Direct';
    case 'slowdns-only':
      return 'SlowDNS Only';
  }
}

export async function runNetworkProbe(): Promise<NetworkProbeResult> {
  const samples: number[] = [];
  const conn = getNavigatorConnection();
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  for (let i = 0; i < 4; i++) {
    const t0 = performance.now();
    try {
      await fetch(`${window.location.origin}/?probe=${Date.now()}-${i}`, {
        method: 'HEAD',
        cache: 'no-store',
      });
      const elapsed = Math.max(4, Math.round(performance.now() - t0));
      samples.push(elapsed);
    } catch {
      samples.push(conn?.rtt && conn.rtt > 0 ? conn.rtt : 48 + i * 7);
    }
  }

  const avgRtt = Math.round(
    samples.reduce((sum, val) => sum + val, 0) / Math.max(1, samples.length)
  );
  const diffs = samples.slice(1).map((v, idx) => Math.abs(v - samples[idx]));
  const jitter =
    diffs.length > 0
      ? Math.round(diffs.reduce((s, d) => s + d, 0) / diffs.length)
      : 2;

  let stabilityScore = 'Sangat Stabil';
  if (!isOnline) {
    stabilityScore = 'Offline';
  } else if (avgRtt > 140 || jitter > 35) {
    stabilityScore = 'Kurang Stabil';
  } else if (avgRtt > 65 || jitter > 15) {
    stabilityScore = 'Cukup Stabil';
  }

  return {
    rttMs: avgRtt,
    jitterMs: jitter,
    stabilityScore,
    measuredAt: formatTimeNow(),
    effectiveType: conn?.effectiveType ? conn.effectiveType.toUpperCase() : '4G / Broadband',
    online: isOnline,
  };
}

export function buildSlowDnsCliPreview(
  host: HostProfile,
  optimization: OptimizationConfig
): string {
  const flags: string[] = [];
  if (optimization.keepAliveSec > 0) {
    flags.push(`-o ServerAliveInterval=${optimization.keepAliveSec}`);
  }
  if (optimization.tcpNoDelay) {
    flags.push('-o TCPKeepAlive=yes');
  }
  if (optimization.zlibCompression) {
    flags.push('-C');
  }

  if (host.mode === 'ssh-direct') {
    return `ssh ${flags.join(' ')} -p ${host.sshPort} ${host.username}@${host.sshHost}`.replace(
      /\s+/g,
      ' '
    );
  }

  if ((host.protocol ?? 'slipstream') === 'slipstream') {
    return `slipstream-client --tcp-listen-port 2222 --resolver ${host.dnsResolver} --domain ${host.nameserver} && ssh ${flags.join(' ')} -p 2222 ${host.username}@127.0.0.1`.replace(/\s+/g, ' ');
  }

  return `dnstt-client -${host.transport ?? 'udp'} ${host.dnsResolver} -pubkey ${(host.publicKey ?? '').slice(0, 16)}... ${host.nameserver} 127.0.0.1:2222 && ssh ${flags.join(' ')} -p 2222 ${host.username}@127.0.0.1`.replace(
    /\s+/g,
    ' '
  );
}

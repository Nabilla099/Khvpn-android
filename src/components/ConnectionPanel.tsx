import {
  Activity,
  ArrowRightLeft,
  CheckCircle2,
  Copy,
  Power,
  RefreshCw,
  ShieldCheck,
  Trash2,
  WifiOff,
} from 'lucide-react';
import { useState } from 'react';
import {
  AutoReconnectConfig,
  ConnectionStatus,
  HostProfile,
  LogEntry,
  NetworkProbeResult,
  OptimizationConfig,
} from '../types/vpn';
import {
  buildSlowDnsCliPreview,
  formatDuration,
  getModeLabel,
} from '../utils/network';

interface ConnectionPanelProps {
  status: ConnectionStatus;
  hosts: HostProfile[];
  activeHost: HostProfile;
  onSelectHost: (id: string) => void;
  onToggleConnect: () => void;
  sessionSeconds: number;
  currentProvider: string;
  browserOnline: boolean;
  optimization: OptimizationConfig;
  autoReconnect: AutoReconnectConfig;
  onToggleAutoReconnect: () => void;
  onSimulateProviderSwitch: () => void;
  onProbeLatency: () => void;
  probing: boolean;
  probeResult: NetworkProbeResult | null;
  logs: LogEntry[];
  onClearLogs: () => void;
  onGoToHosts: () => void;
}

export function ConnectionPanel({
  status,
  hosts,
  activeHost,
  onSelectHost,
  onToggleConnect,
  sessionSeconds,
  currentProvider,
  browserOnline,
  optimization,
  autoReconnect,
  onToggleAutoReconnect,
  onSimulateProviderSwitch,
  onProbeLatency,
  probing,
  probeResult,
  logs,
  onClearLogs,
  onGoToHosts,
}: ConnectionPanelProps) {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedLog, setCopiedLog] = useState(false);

  const isConnected = status === 'connected';
  const isBusy = status === 'connecting' || status === 'reconnecting';

  const statusConfig = {
    disconnected: {
      label: 'Terputus',
      bg: 'bg-[#eceae2]',
      text: 'text-[#111111]',
      icon: WifiOff,
    },
    connecting: {
      label: 'Menghubungkan Tunnel...',
      bg: 'bg-[#fde047]',
      text: 'text-[#111111]',
      icon: RefreshCw,
    },
    reconnecting: {
      label: 'Auto-Reconnect Aktif...',
      bg: 'bg-[#fed7aa]',
      text: 'text-[#111111]',
      icon: ArrowRightLeft,
    },
    connected: {
      label: 'Terhubung & Stabil',
      bg: 'bg-[#b8f25a]',
      text: 'text-[#111111]',
      icon: ShieldCheck,
    },
  }[status];

  const StatusIcon = statusConfig.icon;
  const cliPreview = buildSlowDnsCliPreview(activeHost, optimization);

  const handleCopyCommand = async () => {
    try {
      await navigator.clipboard.writeText(cliPreview);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 1800);
    } catch {
      // Clipboard fallback ignored if blocked
    }
  };

  const handleCopyLogs = async () => {
    try {
      const text = logs
        .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`)
        .join('\n');
      await navigator.clipboard.writeText(text);
      setCopiedLog(true);
      setTimeout(() => setCopiedLog(false), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro & Deskripsi Aplikasi */}
      <section className="flex flex-col justify-between gap-4 border-b-2 border-[#111111] pb-5 md:flex-row md:items-end">
        <div className="max-w-2xl space-y-1.5">
          <h1
            className="font-display text-3xl font-extrabold tracking-tight text-[#111111] sm:text-4xl"
            style={{ textWrap: 'balance' }}
          >
            Kh vpn — Tunnel SSH &amp; SlowDNS Ringan
          </h1>
          <p className="text-sm leading-relaxed text-[#4b4b46] sm:text-base">
            Klien terowongan SSH dan SlowDNS bergaya neo-brutalis minimalis yang dirancang ringan tanpa tema gelap, dilengkapi optimasi performa TCP/DNS agar responsif serta auto-reconnect otomatis saat berpindah provider internet.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#4b4b46] shrink-0">
          <span>Jaringan: {currentProvider}</span>
          <span aria-hidden="true">·</span>
          <span>{browserOnline ? 'Perangkat Online' : 'Perangkat Offline'}</span>
        </div>
      </section>

      {/* Focal Anchor: Panel Kontrol Utama */}
      <section className="nb-card p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`inline-flex items-center gap-2 border-2 border-[#111111] px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${statusConfig.bg} ${statusConfig.text}`}
              >
                <StatusIcon className="h-4 w-4 shrink-0" />
                <span>{statusConfig.label}</span>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-[#4b4b46]">
                <span>Mode: {getModeLabel(activeHost.mode)}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">
                  Durasi: {formatDuration(sessionSeconds)}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="active-host-select"
                  className="mb-1.5 block text-xs font-bold text-[#111111]"
                >
                  Pilih Host SSH &amp; SlowDNS
                </label>
                <div className="flex gap-2">
                  <select
                    id="active-host-select"
                    value={activeHost.id}
                    onChange={(e) => onSelectHost(e.target.value)}
                    disabled={isConnected || isBusy}
                    className="nb-input w-full px-3 py-2.5 text-sm font-semibold text-[#111111] disabled:cursor-not-allowed disabled:bg-[#eceae2] disabled:opacity-75"
                  >
                    {hosts.map((host) => (
                      <option key={host.id} value={host.id}>
                        {host.name} ({host.region})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={onGoToHosts}
                    className="nb-btn bg-white px-3 py-2 text-xs font-bold text-[#111111] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Kelola
                  </button>
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <div className="border-2 border-[#111111] bg-[#f6f5f0] px-3.5 py-2.5">
                  <div className="text-xs font-bold text-[#4b4b46]">
                    Endpoint Aktif
                  </div>
                  <div className="mt-0.5 truncate font-mono text-sm font-semibold text-[#111111]">
                    {activeHost.sshHost}:{activeHost.sshPort}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Primary Action Block */}
          <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col lg:w-64 shrink-0">
            <button
              type="button"
              onClick={onToggleConnect}
              className={`nb-btn flex w-full items-center justify-center gap-2.5 px-5 py-3.5 text-sm font-extrabold whitespace-nowrap cursor-pointer ${
                isConnected
                  ? 'bg-[#111111] text-white hover:bg-[#27272a]'
                  : isBusy
                    ? 'bg-[#fde047] text-[#111111]'
                    : 'bg-[#b8f25a] text-[#111111] hover:bg-[#a5e63f]'
              }`}
            >
              <Power className="h-4 w-4 shrink-0" />
              <span>
                {isConnected
                  ? 'Putuskan Koneksi'
                  : isBusy
                    ? 'Batalkan Proses'
                    : 'Hubungkan Koneksi'}
              </span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={onProbeLatency}
                disabled={probing}
                className="nb-btn flex items-center justify-center gap-1.5 bg-white px-3 py-2.5 text-xs font-bold text-[#111111] whitespace-nowrap cursor-pointer disabled:opacity-60"
              >
                <Activity className="h-3.5 w-3.5 shrink-0" />
                <span>{probing ? 'Mengukur...' : 'Uji Ping'}</span>
              </button>

              <button
                type="button"
                onClick={onSimulateProviderSwitch}
                className="nb-btn flex items-center justify-center gap-1.5 bg-white px-3 py-2.5 text-xs font-bold text-[#111111] whitespace-nowrap cursor-pointer"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 shrink-0" />
                <span>Uji Pindah ISP</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hairline Metric Strip (No nested cards) */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t-2 border-[#111111] pt-5 sm:grid-cols-4">
          <div>
            <div className="text-xs font-semibold text-[#4b4b46]">
              Nameserver SlowDNS
            </div>
            <div className="mt-1 truncate font-mono text-sm font-bold text-[#111111]">
              {activeHost.mode === 'ssh-direct'
                ? 'Bypass (Direct)'
                : activeHost.nameserver}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#4b4b46]">
              DNS Resolver
            </div>
            <div className="mt-1 truncate font-mono text-sm font-bold text-[#111111]">
              {activeHost.dnsResolver}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#4b4b46]">
              Latensi &amp; Jitter
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-[#111111]">
              {probeResult
                ? `${probeResult.rttMs} ms · ±${probeResult.jitterMs} ms`
                : activeHost.lastLatencyMs !== null
                  ? `${activeHost.lastLatencyMs} ms (Terakhir)`
                  : 'Belum diukur'}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[#4b4b46]">
              Optimasi &amp; Proteksi
            </div>
            <div className="mt-1 text-sm font-bold text-[#111111]">
              {optimization.preset.charAt(0).toUpperCase() +
                optimization.preset.slice(1)}{' '}
              · {autoReconnect.enabled ? 'Auto-Reconnect ON' : 'Manual'}
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Row: Perintah Tunnel & Log Aktivitas */}
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="nb-card flex flex-col justify-between p-5 lg:col-span-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-[#111111]">
                Konfigurasi Aktif &amp; Proteksi ISP
              </h2>
              <button
                type="button"
                onClick={handleCopyCommand}
                className="inline-flex items-center gap-1.5 border-2 border-[#111111] bg-[#f6f5f0] px-2.5 py-1 text-xs font-bold text-[#111111] cursor-pointer hover:bg-[#eceae2]"
              >
                {copiedCmd ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#16a34a]" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin Perintah</span>
                  </>
                )}
              </button>
            </div>

            <div className="border-2 border-[#111111] bg-[#f6f5f0] p-3 font-mono text-xs leading-relaxed text-[#111111] break-all">
              {cliPreview}
            </div>

            <div className="space-y-2.5 border-t border-neutral-200 pt-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-[#111111]">
                    Auto-Reconnect Saat Pindah Provider
                  </div>
                  <div className="text-xs text-[#4b4b46]">
                    Jeda {autoReconnect.delaySec} dtk ·{' '}
                    {autoReconnect.flushDnsOnSwitch
                      ? 'Flush DNS otomatis'
                      : 'Tanpa flush DNS'}
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoReconnect.enabled}
                  onClick={onToggleAutoReconnect}
                  className={`nb-btn px-3 py-1.5 text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer ${
                    autoReconnect.enabled
                      ? 'bg-[#b8f25a] text-[#111111]'
                      : 'bg-[#eceae2] text-[#4b4b46]'
                  }`}
                >
                  {autoReconnect.enabled ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-neutral-200 pt-2.5">
                <div>
                  <div className="font-semibold text-[#111111]">
                    Parameter Performa Aktif
                  </div>
                  <div className="text-xs text-[#4b4b46]">
                    MTU {optimization.mtu} · Keep-Alive{' '}
                    {optimization.keepAliveSec === 0
                      ? 'Off'
                      : `${optimization.keepAliveSec}s`}{' '}
                    · Buffer {optimization.bufferKb} KB
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-[#16a34a]">
                  {optimization.tcpNoDelay ? 'NoDelay ON' : 'Standard'}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="nb-card flex flex-col p-5 lg:col-span-7">
          <div className="flex items-center justify-between gap-3 border-b-2 border-[#111111] pb-3">
            <div>
              <h2 className="font-display text-lg font-bold text-[#111111]">
                Log Sesi &amp; Perpindahan Jaringan
              </h2>
              <p className="text-xs text-[#4b4b46]">
                Catatan handshake SlowDNS, optimasi paket, dan deteksi ganti ISP
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyLogs}
                className="inline-flex items-center gap-1 border-2 border-[#111111] bg-white px-2.5 py-1 text-xs font-bold text-[#111111] cursor-pointer hover:bg-[#f6f5f0]"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copiedLog ? 'Tersalin' : 'Salin'}</span>
              </button>
              <button
                type="button"
                onClick={onClearLogs}
                className="inline-flex items-center gap-1 border-2 border-[#111111] bg-white px-2.5 py-1 text-xs font-bold text-[#111111] cursor-pointer hover:bg-[#f6f5f0]"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Bersihkan</span>
              </button>
            </div>
          </div>

          <div
            aria-live="polite"
            className="mt-3 max-h-60 min-h-48 overflow-y-auto border-2 border-[#111111] bg-[#f6f5f0] p-3 font-mono text-xs space-y-1.5"
          >
            {logs.length === 0 ? (
              <div className="py-12 text-center text-[#4b4b46]">
                Belum ada aktivitas sesi. Klik Hubungkan Koneksi untuk memulai tunnel.
              </div>
            ) : (
              logs.map((entry) => {
                const levelTag =
                  entry.level === 'success'
                    ? 'text-[#16a34a]'
                    : entry.level === 'warn'
                      ? 'text-[#d97706]'
                      : entry.level === 'error'
                        ? 'text-[#dc2626]'
                        : 'text-[#1d4ed8]';
                return (
                  <div
                    key={entry.id}
                    className="flex items-start gap-2.5 leading-relaxed"
                  >
                    <span className="shrink-0 text-[#5a5a54]">
                      {entry.timestamp}
                    </span>
                    <span className={`shrink-0 font-bold uppercase ${levelTag}`}>
                      [{entry.level}]
                    </span>
                    <span className="text-[#111111] break-words">
                      {entry.message}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
